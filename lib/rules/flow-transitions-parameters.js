'use strict';

const _ = require('lodash/core');

const ast = require('../ast'),
      file = require('../file'),
      recommended = require('../recommended.json');

const meta = {
  docs: {
    description: 'flow-transitions-parameters enforces that transitions handlers have a valid signature.',
    category: 'wolkenkit',
    recommended: Boolean(recommended['wolkenkit/flow-transitions-parameters'])
  },
  schema: []
};

const checkParams = function (context, node, params, identifierStart) {
  const defaultMessage = `Expected 'flow' parameter.`,
        sourceCode = context.getSourceCode();

  const tokenProperty = sourceCode.getTokenByRangeStart(identifierStart);

  if (params.length === 0) {
    context.report({
      node,
      message: defaultMessage,
      loc: tokenProperty.loc
    });

    return;
  }

  if (params.length > 1) {
    context.report({
      node,
      message: `Expected maximum 1 parameter (flow).`,
      loc: tokenProperty.loc
    });
  }

  if (params[0] && params[0].name !== 'flow') {
    const tokenParam = sourceCode.getTokenByRangeStart(params[0].start);

    context.report({
      node,
      message: defaultMessage,
      loc: tokenParam.loc
    });
  }
};

const checkTransitionsObject = function (context, node, state, properties) {
  const sourceCode = context.getSourceCode();

  properties.forEach(property => {
    if (property.value.type !== 'ObjectExpression') {
      return;
    }

    property.value.properties.forEach(innerProperty => {
      if (innerProperty.value.type === 'Identifier') {
        state.identifiers.push({
          name: innerProperty.value.name,
          identifierStart: innerProperty.value.start
        });

        return;
      }
      if (!ast.type.isFunction(innerProperty.value)) {
        const tokenProperty = sourceCode.getTokenByRangeStart(innerProperty.key.start);

        context.report({
          node,
          message: `Expected '${innerProperty.key.name}' to be a function.`,
          loc: tokenProperty.loc
        });

        return;
      }

      if (ast.type.isFunction(innerProperty.value)) {
        checkParams(context, node, innerProperty.value.params, innerProperty.key.start);
      }
    });
  });
};

const create = function (context) {
  if (!file.isDescendant(context.getFilename(), 'flows')) {
    return {};
  }

  const state = {
    identifiers: [],
    functions: []
  };

  return {
    VariableDeclaration (node) {
      node.declarations.forEach(declarator => {
        if (declarator.id.name === 'transitions' && ast.type.isObject(declarator.init)) {
          checkTransitionsObject(context, node, state, declarator.init.properties);

          return;
        }

        if (
          ast.type.isFunction(declarator.init) &&
          !_.find(state.functions, func => func.name === declarator.id.name)
        ) {
          state.functions.push({
            node,
            name: declarator.id.name,
            params: declarator.init.params,
            identifierStart: declarator.init.type === 'ArrowFunctionExpression' ? declarator.id.start : declarator.init.start
          });
        }
      });
    },

    FunctionDeclaration (node) {
      if (!_.find(state.functions, func => func.name === node.id.name)) {
        state.functions.push({
          node,
          name: node.id.name,
          params: node.params,
          identifierStart: node.id.start
        });
      }
    },

    onCodePathEnd (codePath, node) {
      if (!ast.codePath.isRoot(codePath)) {
        return;
      }

      const sourceCode = context.getSourceCode();

      state.identifiers.forEach(identifier => {
        const func = state.functions.find(funct => funct.name === identifier.name);

        if (func) {
          checkParams(context, func.node, func.params, func.identifierStart);

          return;
        }

        const message = `Expected '${identifier.name}' to be a function`,
              tokenElement = sourceCode.getTokenByRangeStart(identifier.identifierStart);

        context.report({
          node,
          message: `${message}.`,
          loc: tokenElement.loc
        });
      });
    }
  };
};

module.exports = { meta, create };
