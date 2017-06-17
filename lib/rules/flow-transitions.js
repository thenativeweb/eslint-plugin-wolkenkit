'use strict';

const _ = require('lodash');

const ast = require('../ast'),
      file = require('../file'),
      recommended = require('../recommended.json');

const meta = {
  docs: {
    description: `flow-transitions enforces that 'transitions' is an object and contains objects.`,
    category: 'wolkenkit',
    recommended: Boolean(recommended['wolkenkit/flow-transitions'])
  },
  schema: []
};

const create = function (context) {
  if (!file.isDescendant(context.getFilename(), 'flows')) {
    return {};
  }

  const state = {
    isExports: false,
    transitions: null
  };

  return {
    ExpressionStatement (node) {
      const isExports = ast.node.isModuleExports(node) || ast.node.isExports(node);

      if (!isExports) {
        return;
      }

      const isExported = _.find(node.expression.right.properties, property => property.key.name === 'transitions');

      state.isExported = isExported;
    },
    VariableDeclaration (node) {
      const whenDeclarator = ast.declarations.findByName(node.declarations, 'transitions');

      if (whenDeclarator) {
        state.transitions = {
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

      if (state.transitions) {
        const declarator = state.transitions.declarator,
              token = sourceCode.getTokenByRangeStart(declarator.start);

        if (declarator.init.type !== 'ObjectExpression') {
          context.report({
            node: state.transitions.node,
            message: `Expected 'transitions' to be an object.`,
            loc: token.loc
          });

          return;
        }

        declarator.init.properties.forEach(property => {
          const tokenProperty = sourceCode.getTokenByRangeStart(property.key.start);

          if (property.value.type !== 'ObjectExpression') {
            context.report({
              node: state.transitions.node,
              message: `Expected '${property.key.name}' to be an object.`,
              loc: tokenProperty.loc
            });
          }
        });
      }
    }
  };
};

module.exports = { meta, create };
