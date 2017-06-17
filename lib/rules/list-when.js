'use strict';

const _ = require('lodash');

const ast = require('../ast'),
      file = require('../file'),
      recommended = require('../recommended.json');

const meta = {
  docs: {
    description: `list-when enforces that 'when' is an object.`,
    category: 'wolkenkit',
    recommended: Boolean(recommended['wolkenkit/list-when'])
  },
  schema: []
};

const create = function (context) {
  if (!file.isDescendant(context.getFilename(), 'readModel/lists')) {
    return {};
  }

  const state = {
    isExports: false,
    when: null
  };

  return {
    ExpressionStatement (node) {
      const isExports = ast.node.isModuleExports(node) || ast.node.isExports(node);

      if (!isExports) {
        return;
      }

      const isExported = _.find(node.expression.right.properties, property => property.key.name === 'when');

      state.isExported = isExported;
    },
    VariableDeclaration (node) {
      const whenDeclarator = ast.declarations.findByName(node.declarations, 'when');

      if (whenDeclarator) {
        state.when = {
          declarator: whenDeclarator,
          name: whenDeclarator.id.name,
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

      if (state.when) {
        const declarator = state.when.declarator,
              token = sourceCode.getTokenByRangeStart(declarator.start);

        if (declarator.init.type !== 'ObjectExpression') {
          context.report({
            node: state.when.node,
            message: `Expected 'when' to be an object.`,
            loc: token.loc
          });
        }
      }
    }
  };
};

module.exports = { meta, create };
