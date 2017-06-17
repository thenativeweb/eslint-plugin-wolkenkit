'use strict';

const _ = require('lodash');

const ast = require('../ast'),
      file = require('../file'),
      recommended = require('../recommended.json');

const meta = {
  docs: {
    description: `list-fields enforces that 'fields' is an object.`,
    category: 'wolkenkit',
    recommended: Boolean(recommended['wolkenkit/list-fields'])
  },
  schema: []
};

const create = function (context) {
  if (!file.isDescendant(context.getFilename(), 'readModel/lists')) {
    return {};
  }

  const state = {
    isExports: false,
    fields: null
  };

  return {
    ExpressionStatement (node) {
      const isExports = ast.node.isModuleExports(node) || ast.node.isExports(node);

      if (!isExports) {
        return;
      }

      const isExported = _.find(node.expression.right.properties, property => property.key.name === 'fields');

      state.isExported = isExported;
    },
    VariableDeclaration (node) {
      const fieldsDeclarator = ast.declarations.findByName(node.declarations, 'fields');

      if (fieldsDeclarator) {
        state.fields = {
          declarator: fieldsDeclarator,
          name: fieldsDeclarator.id.name,
          node
        };
      }
    },
    onCodePathEnd (codePath) {
      if (!ast.codePath.isRoot(codePath)) {
        return;
      }

      if (!state.isExported) {
        return;
      }

      const sourceCode = context.getSourceCode();

      if (state.fields) {
        const declarator = state.fields.declarator,
              token = sourceCode.getTokenByRangeStart(declarator.start);

        if (declarator.init.type !== 'ObjectExpression') {
          context.report({
            node: state.fields.node,
            message: `Expected 'fields' to be an object.`,
            loc: token.loc
          });
        }
      }
    }
  };
};

module.exports = { meta, create };
