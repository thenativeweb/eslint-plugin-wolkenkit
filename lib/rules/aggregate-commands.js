'use strict';

const _ = require('lodash');

const ast = require('../ast'),
      file = require('../file'),
      recommended = require('../recommended.json');

const meta = {
  docs: {
    description: `aggregate-commands enforces that 'commands' is an object.`,
    category: 'wolkenkit',
    recommended: Boolean(recommended['wolkenkit/aggregate-commands'])
  },
  schema: []
};

const create = function (context) {
  if (!file.isDescendant(context.getFilename(), 'writeModel')) {
    return {};
  }

  const state = {
    isExports: false,
    commands: null
  };

  return {
    ExpressionStatement (node) {
      const isExports = ast.node.isModuleExports(node) || ast.node.isExports(node);

      if (!isExports) {
        return;
      }

      const isExported = _.find(node.expression.right.properties, property => property.key.name === 'commands');

      state.isExported = isExported;
    },
    VariableDeclaration (node) {
      const commandsDeclarator = ast.declarations.findByName(node.declarations, 'commands');

      if (commandsDeclarator) {
        state.commands = {
          declarator: commandsDeclarator,
          name: commandsDeclarator.id.name,
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

      if (state.commands) {
        const declarator = state.commands.declarator,
              token = sourceCode.getTokenByRangeStart(declarator.start);

        if (declarator.init.type !== 'ObjectExpression') {
          context.report({
            node: state.commands.node,
            message: `Expected 'commands' to be an object.`,
            loc: token.loc
          });
        }
      }
    }
  };
};

module.exports = { meta, create };
