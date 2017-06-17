'use strict';

const _ = require('lodash');

const ast = require('../ast'),
      file = require('../file'),
      recommended = require('../recommended.json');

const meta = {
  docs: {
    description: `aggregate-events enforces that 'events' is an object.`,
    category: 'wolkenkit',
    recommended: Boolean(recommended['wolkenkit/aggregate-events'])
  },
  schema: []
};

const create = function (context) {
  if (!file.isDescendant(context.getFilename(), 'writeModel')) {
    return {};
  }

  const state = {
    isExports: false,
    events: null
  };

  return {
    ExpressionStatement (node) {
      const isExports = ast.node.isModuleExports(node) || ast.node.isExports(node);

      if (!isExports) {
        return;
      }

      const isExported = _.find(node.expression.right.properties, property => property.key.name === 'events');

      state.isExported = isExported;
    },
    VariableDeclaration (node) {
      const eventsDeclarator = ast.declarations.findByName(node.declarations, 'events');

      if (eventsDeclarator) {
        state.events = {
          declarator: eventsDeclarator,
          name: eventsDeclarator.id.name,
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

      if (state.events) {
        const declarator = state.events.declarator,
              token = sourceCode.getTokenByRangeStart(declarator.start);

        if (declarator.init.type !== 'ObjectExpression') {
          context.report({
            node: state.events.node,
            message: `Expected 'events' to be an object.`,
            loc: token.loc
          });
        }
      }
    }
  };
};

module.exports = { meta, create };
