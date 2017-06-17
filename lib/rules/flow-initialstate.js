'use strict';

const _ = require('lodash');

const ast = require('../ast'),
      file = require('../file'),
      recommended = require('../recommended.json');

const meta = {
  docs: {
    description: `flow-initialstate enforces that 'initialState' is an object.`,
    category: 'wolkenkit',
    recommended: Boolean(recommended['wolkenkit/flow-initialstate'])
  },
  schema: []
};

const create = function (context) {
  if (!file.isDescendant(context.getFilename(), 'flows')) {
    return {};
  }

  const state = {
    isExports: false,
    initialState: null
  };

  return {
    ExpressionStatement (node) {
      const isExports = ast.node.isModuleExports(node) || ast.node.isExports(node);

      if (!isExports) {
        return;
      }

      const isExported = _.find(node.expression.right.properties, property => property.key.name === 'initialState');

      state.isExported = isExported;
    },
    VariableDeclaration (node) {
      const whenDeclarator = ast.declarations.findByName(node.declarations, 'initialState');

      if (whenDeclarator) {
        state.initialState = {
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

      if (state.initialState) {
        const declarator = state.initialState.declarator,
              token = sourceCode.getTokenByRangeStart(declarator.start);

        if (declarator.init.type !== 'ObjectExpression') {
          context.report({
            node: state.initialState.node,
            message: `Expected 'initialState' to be an object.`,
            loc: token.loc
          });
        }
      }
    }
  };
};

module.exports = { meta, create };
