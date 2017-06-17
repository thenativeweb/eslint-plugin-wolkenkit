'use strict';

const ast = require('../ast'),
      file = require('../file'),
      recommended = require('../recommended.json');

const { list } = require('../definitions');

const meta = {
  docs: {
    description: `list-exports enforces that list exports 'fields' and 'when'.`,
    category: 'wolkenkit',
    recommended: Boolean(recommended['wolkenkit/list-exports'])
  },
  schema: []
};

const defaultMessage = `Expected module to export a list.`;

const create = function (context) {
  if (!file.isDescendant(context.getFilename(), 'readModel/lists')) {
    return {};
  }

  const state = {
    isExports: false
  };

  return {
    ExpressionStatement (node) {
      const isExports = ast.node.isModuleExports(node) || ast.node.isExports(node);

      if (!isExports) {
        return;
      }

      state.isExports = true;

      const properties = node.expression.right.properties || [],
            sourceCode = context.getSourceCode();

      const loc = ast.node.getLocationOfExports(sourceCode, node);

      if (!ast.type.isObject(node.expression.right) || properties.length === 0) {
        return context.report({
          node,
          message: defaultMessage,
          loc
        });
      }

      const propertyNames = properties.map(property => property.key.name);
      const missingPropertyNames = list.propertyNames.filter(propertyName => !propertyNames.includes(propertyName)),
            surplusProperties = properties.filter(property => !list.propertyNames.includes(property.key.name));

      missingPropertyNames.forEach(property => {
        context.report({
          node,
          message: `Expected list to contain '${property}'.`,
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
    },

    onCodePathEnd (codePath, root) {
      if (!ast.codePath.isRoot(codePath)) {
        return;
      }

      if (!state.isExports) {
        context.report({
          node: root,
          message: defaultMessage
        });
      }
    }
  };
};

module.exports = { meta, create };
