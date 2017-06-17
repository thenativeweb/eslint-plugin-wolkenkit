'use strict';

const ast = require('../ast'),
      file = require('../file'),
      recommended = require('../recommended.json');

const { flow } = require('../definitions');

const meta = {
  docs: {
    description: `flow-exports enforces that flows export 'when' if stateless and 'identity', 'initialState', 'transitions' and 'when' if stateful.`,
    category: 'wolkenkit',
    recommended: Boolean(recommended['wolkenkit/flow-exports'])
  },
  schema: []
};

const allPropertyNames = flow.propertyNames.stateful;

const create = function (context) {
  if (!file.isDescendant(context.getFilename(), 'flows')) {
    return {};
  }

  const state = {
    exports: null,
    identifier: []
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
        if (allPropertyNames.includes(declarator.id.name)) {
          state.identifier.push(declarator);
        }
      });
    },

    onCodePathEnd (codePath, root) {
      if (!ast.codePath.isRoot(codePath)) {
        return;
      }

      const defaultMessage = `Expected module to export a flow.`;

      if (!state.exports) {
        return context.report({
          node: root,
          message: defaultMessage
        });
      }

      const node = state.exports.node,
            properties = state.exports.properties,
            sourceCode = context.getSourceCode();

      let allowedPropertyNames = flow.propertyNames.stateless;

      const loc = ast.node.getLocationOfExports(sourceCode, node);

      if (!ast.type.isObject(node.expression.right) || properties.length === 0) {
        return context.report({
          node,
          message: defaultMessage,
          loc
        });
      }

      if (state.identifier.length > 1) {
        allowedPropertyNames = flow.propertyNames.stateful;
      }

      const propertyNames = properties.map(property => property.key.name);
      const missingPropertyNames = allowedPropertyNames.filter(propertyName => !propertyNames.includes(propertyName)),
            surplusProperties = properties.filter(property => !allowedPropertyNames.includes(property.key.name));

      missingPropertyNames.forEach(property => {
        context.report({
          node,
          message: `Expected flow to contain '${property}'.`,
          loc
        });
      });

      surplusProperties.forEach(property => {
        context.report({
          node,
          message: `Unexpected '${property.key.name}' property.`,
          loc: property.loc
        });
      });
    }
  };
};

module.exports = { meta, create };
