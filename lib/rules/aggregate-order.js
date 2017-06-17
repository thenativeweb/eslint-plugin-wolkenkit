'use strict';

const ast = require('../ast'),
      file = require('../file'),
      recommended = require('../recommended.json');

const { aggregate } = require('../definitions');

const meta = {
  docs: {
    description: `aggregate-order enforces the order of 'initialState', 'commands', and 'events'.`,
    category: 'wolkenkit',
    recommended: Boolean(recommended['wolkenkit/aggregate-order'])
  },
  schema: []
};

const create = function (context) {
  if (!file.isDescendant(context.getFilename(), 'writeModel')) {
    return {};
  }

  const state = {
    exports: null,
    identifierOrder: []
  };

  return {
    ExpressionStatement (node) {
      const isExports = ast.node.isModuleExports(node) || ast.node.isExports(node);

      if (!isExports) {
        return;
      }

      state.exports = {
        node,
        name: node.expression.right.name || '',
        properties: node.expression.right.properties || [],
        type: node.expression.right.type
      };
    },
    VariableDeclaration (node) {
      node.declarations.forEach(declarator => {
        if (aggregate.propertyNames.includes(declarator.id.name)) {
          state.identifierOrder.push(declarator);
        }
      });
    },
    onCodePathEnd (codePath, root) {
      if (!ast.codePath.isRoot(codePath)) {
        return;
      }

      const sourceCode = context.getSourceCode();

      if (state.exports) {
        const properties = state.exports.properties;

        // check property positions only if all properties are present
        if (properties.length === aggregate.propertyNames.length) {
          properties.forEach((property, indexActual) => {
            const name = property.key.name;
            const indexDesired = aggregate.propertyNames.indexOf(name);

            if (indexActual !== indexDesired) {
              const position = indexActual < indexDesired ? 'after' : 'before',
                    token = sourceCode.getTokenByRangeStart(property.key.start);
              const nameCompared = position === 'after' ? aggregate.propertyNames[indexDesired - 1] : aggregate.propertyNames[indexDesired + 1];

              context.report({
                node: root,
                message: `Expected '${name}' to be placed ${position} '${nameCompared}'.`,
                loc: token.loc
              });
            }
          });
        }
      }

      // check identifier positions only if all identifiers are present
      if (state.identifierOrder.length === aggregate.propertyNames.length) {
        state.identifierOrder.forEach((identifier, indexActual) => {
          const name = identifier.id.name;
          const indexDesired = aggregate.propertyNames.indexOf(name);

          if (indexActual !== indexDesired) {
            const position = indexActual < indexDesired ? 'after' : 'before',
                  token = sourceCode.getTokenByRangeStart(identifier.id.start);
            const nameCompared = position === 'after' ? aggregate.propertyNames[indexDesired - 1] : aggregate.propertyNames[indexDesired + 1];

            context.report({
              node: root,
              message: `Expected '${name}' to be placed ${position} '${nameCompared}'.`,
              loc: token.loc
            });
          }
        });
      }
    }
  };
};

module.exports = { meta, create };
