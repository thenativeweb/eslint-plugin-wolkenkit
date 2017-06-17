'use strict';

const _ = require('lodash/core');

const ast = require('../ast'),
      file = require('../file'),
      recommended = require('../recommended.json');

const meta = {
  docs: {
    description: 'flow-when-parameters enforces that when handlers have a valid signature.',
    category: 'wolkenkit',
    recommended: Boolean(recommended['wolkenkit/flow-when-parameters'])
  },
  schema: []
};

const { flow } = require('../definitions');

const checkStateLessParams = function (context, node, params, identifierStart) {
  const sourceCode = context.getSourceCode();

  const tokenProperty = sourceCode.getTokenByRangeStart(identifierStart);

  if (params.length < 2) {
    context.report({
      node,
      message: `Expected minimum 2 parameters event, mark).`,
      loc: tokenProperty.loc
    });
  }

  if (params.length > 3) {
    context.report({
      node,
      message: `Expected maximum 3 parameters event, services, mark).`,
      loc: tokenProperty.loc
    });
  }

  if (params[0] && params[0].name !== 'event') {
    const tokenParam = sourceCode.getTokenByRangeStart(params[0].start);

    context.report({
      node,
      message: `Expected first parameter to be named 'event'.`,
      loc: tokenParam.loc
    });
  }

  if (params.length === 2 && params[1].name !== 'mark') {
    const tokenParam = sourceCode.getTokenByRangeStart(params[1].start);

    context.report({
      node,
      message: `Expected second parameter to be named 'mark'.`,
      loc: tokenParam.loc
    });
  }

  if (params.length >= 3) {
    if (params[1].name !== 'services') {
      const tokenParam = sourceCode.getTokenByRangeStart(params[1].start);

      context.report({
        node,
        message: `Expected second parameter to be named 'services'.`,
        loc: tokenParam.loc
      });
    }

    if (params[2].name !== 'mark') {
      const tokenParam = sourceCode.getTokenByRangeStart(params[2].start);

      context.report({
        node,
        message: `Expected third parameter to be named 'mark'.`,
        loc: tokenParam.loc
      });
    }
  }
};

const checkStatefulParams = function (context, node, params, identifierStart) {
  const sourceCode = context.getSourceCode();

  const tokenProperty = sourceCode.getTokenByRangeStart(identifierStart);

  if (params.length < 3) {
    context.report({
      node,
      message: `Expected minimum 3 parameters flow, event, mark).`,
      loc: tokenProperty.loc
    });
  }

  if (params.length > 4) {
    context.report({
      node,
      message: `Expected maximum 4 parameters flow, event, services, mark).`,
      loc: tokenProperty.loc
    });
  }

  if (params[0] && params[0].name !== 'flow') {
    const tokenParam = sourceCode.getTokenByRangeStart(params[0].start);

    context.report({
      node,
      message: `Expected first parameter to be named 'flow'.`,
      loc: tokenParam.loc
    });
  }

  if (params[1] && params[1].name !== 'event') {
    const tokenParam = sourceCode.getTokenByRangeStart(params[1].start);

    context.report({
      node,
      message: `Expected second parameter to be named 'event'.`,
      loc: tokenParam.loc
    });
  }

  if (params.length === 3 && params[2].name !== 'mark') {
    const tokenParam = sourceCode.getTokenByRangeStart(params[2].start);

    context.report({
      node,
      message: `Expected third parameter to be named 'mark'.`,
      loc: tokenParam.loc
    });
  }

  if (params.length >= 4) {
    if (params[2].name !== 'services') {
      const tokenParam = sourceCode.getTokenByRangeStart(params[2].start);

      context.report({
        node,
        message: `Expected third parameter to be named 'services'.`,
        loc: tokenParam.loc
      });
    }

    if (params[3].name !== 'mark') {
      const tokenParam = sourceCode.getTokenByRangeStart(params[3].start);

      context.report({
        node,
        message: `Expected fourth parameter to be named 'mark'.`,
        loc: tokenParam.loc
      });
    }
  }
};

const checkWhenObject = function (context, node, state, properties, isStateful) {
  const sourceCode = context.getSourceCode();
  let handlerProperties = [];

  if (isStateful) {
    properties.filter(property => property.value.type === 'ObjectExpression').
      forEach(property => {
        handlerProperties = handlerProperties.concat(property.value.properties);
      });
  } else {
    handlerProperties = properties;
  }

  handlerProperties.forEach(innerProperty => {
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
      if (isStateful) {
        checkStatefulParams(context, node, innerProperty.value.params, innerProperty.key.start);
      } else {
        checkStateLessParams(context, node, innerProperty.value.params, innerProperty.key.start);
      }
    }
  });
};

const create = function (context) {
  if (!file.isDescendant(context.getFilename(), 'flows')) {
    return {};
  }

  const state = {
    flowIdentifiers: [],
    functions: [],
    identifiers: [],
    when: null
  };

  return {
    VariableDeclaration (node) {
      node.declarations.forEach(declarator => {
        if (flow.propertyNames.stateful.includes(declarator.id.name)) {
          state.flowIdentifiers.push(declarator);
        }

        if (declarator.id.name === 'when' && ast.type.isObject(declarator.init)) {
          state.when = {
            declarator,
            node
          };

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
      const isStateful = state.flowIdentifiers.length > 1;

      if (state.when) {
        checkWhenObject(context, state.when.node, state, state.when.declarator.init.properties, isStateful);
      }

      state.identifiers.forEach(identifier => {
        const func = state.functions.find(funct => funct.name === identifier.name);

        if (func) {
          if (isStateful) {
            checkStatefulParams(context, func.node, func.params, func.identifierStart);
          } else {
            checkStateLessParams(context, func.node, func.params, func.identifierStart);
          }

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
