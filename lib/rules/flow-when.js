'use strict';

const _ = require('lodash');

const ast = require('../ast'),
      file = require('../file'),
      recommended = require('../recommended.json');

const { flow } = require('../definitions');

const meta = {
  docs: {
    description: `flow-when enforces that 'when' is an object and contains objects.`,
    category: 'wolkenkit',
    recommended: Boolean(recommended['wolkenkit/flow-when'])
  },
  schema: []
};

const create = function (context) {
  if (!file.isDescendant(context.getFilename(), 'flows')) {
    return {};
  }

  const state = {
    identifier: [],
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

      node.declarations.forEach(declarator => {
        if (flow.propertyNames.stateful.includes(declarator.id.name)) {
          state.identifier.push(declarator);
        }
      });
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

          return;
        }

        if (state.identifier.length > 1) {
          declarator.init.properties.forEach(property => {
            const tokenProperty = sourceCode.getTokenByRangeStart(property.key.start);

            if (property.value.type !== 'ObjectExpression') {
              context.report({
                node: state.when.node,
                message: `Expected '${property.key.name}' to be an object.`,
                loc: tokenProperty.loc
              });
            }
          });
        }
      }
    }
  };
};

module.exports = { meta, create };
