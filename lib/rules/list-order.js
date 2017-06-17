'use strict';

const ast = require('../ast'),
      file = require('../file'),
      recommended = require('../recommended.json');

const { list } = require('../definitions');

const meta = {
  docs: {
    description: `list-order enforces the order of 'fields' and 'when'.`,
    category: 'wolkenkit',
    recommended: Boolean(recommended['wolkenkit/list-order'])
  },
  schema: []
};

const create = function (context) {
  if (!file.isDescendant(context.getFilename(), 'readModel/lists')) {
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
        if (list.propertyNames.includes(declarator.id.name)) {
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
        if (properties.length === list.propertyNames.length) {
          properties.forEach((property, indexActual) => {
            const name = property.key.name;
            const indexDesired = list.propertyNames.indexOf(name);

            if (indexActual !== indexDesired) {
              const position = indexActual < indexDesired ? 'after' : 'before',
                    token = sourceCode.getTokenByRangeStart(property.key.start);
              const nameCompared = position === 'after' ? list.propertyNames[indexDesired - 1] : list.propertyNames[indexDesired + 1];

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
      if (state.identifierOrder.length === list.propertyNames.length) {
        state.identifierOrder.forEach((identifier, indexActual) => {
          const name = identifier.id.name;
          const indexDesired = list.propertyNames.indexOf(name);

          if (indexActual !== indexDesired) {
            const position = indexActual < indexDesired ? 'after' : 'before',
                  token = sourceCode.getTokenByRangeStart(identifier.id.start);
            const nameCompared = position === 'after' ? list.propertyNames[indexDesired - 1] : list.propertyNames[indexDesired + 1];

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
