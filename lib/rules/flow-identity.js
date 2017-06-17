'use strict';

const _ = require('lodash');

const ast = require('../ast'),
      file = require('../file'),
      recommended = require('../recommended.json');

const meta = {
  docs: {
    description: `flow-identity enforces that 'identity' is an object.`,
    category: 'wolkenkit',
    recommended: Boolean(recommended['wolkenkit/flow-identity'])
  },
  schema: []
};

const create = function (context) {
  if (!file.isDescendant(context.getFilename(), 'flows')) {
    return {};
  }

  const state = {
    isExports: false,
    identity: null
  };

  return {
    ExpressionStatement (node) {
      const isExports = ast.node.isModuleExports(node) || ast.node.isExports(node);

      if (!isExports) {
        return;
      }

      const isExported = _.find(node.expression.right.properties, property => property.key.name === 'identity');

      state.isExported = isExported;
    },
    VariableDeclaration (node) {
      const whenDeclarator = ast.declarations.findByName(node.declarations, 'identity');

      if (whenDeclarator) {
        state.identity = {
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

      if (state.identity) {
        const declarator = state.identity.declarator,
              token = sourceCode.getTokenByRangeStart(declarator.start);

        if (declarator.init.type !== 'ObjectExpression') {
          context.report({
            node: state.identity.node,
            message: `Expected 'identity' to be an object.`,
            loc: token.loc
          });
        }
      }
    }
  };
};

module.exports = { meta, create };
