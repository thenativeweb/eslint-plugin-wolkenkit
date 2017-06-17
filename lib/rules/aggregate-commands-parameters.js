'use strict';

const path = require('path');

const _ = require('lodash/core');

const ast = require('../ast'),
      file = require('../file'),
      recommended = require('../recommended.json');

const meta = {
  docs: {
    description: 'aggregate-commands-parameters enforces that command handlers have a valid signature.',
    category: 'wolkenkit',
    recommended: Boolean(recommended['wolkenkit/aggregate-commands-parameters'])
  },
  schema: []
};

const checkParams = function (context, node, params, identifierStart) {
  const fileBaseName = path.basename(context.getFilename(), '.js'),
        sourceCode = context.getSourceCode();

  const tokenProperty = sourceCode.getTokenByRangeStart(identifierStart);

  if (params.length < 3) {
    context.report({
      node,
      message: `Expected minimum 3 parameters (${fileBaseName}, command, mark).`,
      loc: tokenProperty.loc
    });
  }

  if (params.length > 4) {
    context.report({
      node,
      message: `Expected maximum 4 parameters (${fileBaseName}, command, services, mark).`,
      loc: tokenProperty.loc
    });
  }

  if (params[0] && params[0].name !== fileBaseName) {
    const tokenParam = sourceCode.getTokenByRangeStart(params[0].start);

    context.report({
      node,
      message: `Expected first parameter to be named '${fileBaseName}'.`,
      loc: tokenParam.loc
    });
  }

  if (params[1] && params[1].name !== 'command') {
    const tokenParam = sourceCode.getTokenByRangeStart(params[1].start);

    context.report({
      node,
      message: `Expected second parameter to be named 'command'.`,
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

const checkCommandsObject = function (context, node, state, properties) {
  const sourceCode = context.getSourceCode();

  properties.forEach(property => {
    if (property.value.type === 'Identifier') {
      state.identifiers.push({
        name: property.value.name,
        identifierStart: property.value.start,
        parent: 'Object'
      });

      return;
    }

    if (
      !ast.type.isFunction(property.value) &&
      !ast.type.isArray(property.value) &&
      property.value.type !== 'CallExpression'
    ) {
      const tokenProperty = sourceCode.getTokenByRangeStart(property.key.start);

      context.report({
        node,
        message: `Expected '${property.key.name}' to be a function or an array.`,
        loc: tokenProperty.loc
      });

      return;
    }

    if (ast.type.isFunction(property.value)) {
      checkParams(context, node, property.value.params, property.key.start);

      return;
    }

    if (ast.type.isArray(property.value)) {
      property.value.elements.forEach(element => {
        if (element.type === 'Identifier') {
          state.identifiers.push({
            name: element.name,
            identifierStart: element.start,
            parent: 'Array'
          });

          return;
        }

        if (!ast.type.isFunction(element) && element.type !== 'CallExpression') {
          const tokenElement = sourceCode.getTokenByRangeStart(element.start);

          context.report({
            node,
            message: `Expected '${element.name || element.value}' to be a function.`,
            loc: tokenElement.loc
          });

          return;
        }

        if (ast.type.isFunction(element)) {
          checkParams(context, node, element.params, element.start);
        }
      });
    }
  });
};

const create = function (context) {
  if (!file.isDescendant(context.getFilename(), 'writeModel')) {
    return {};
  }

  const state = {
    identifiers: [],
    functions: []
  };

  return {
    VariableDeclaration (node) {
      node.declarations.forEach(declarator => {
        if (declarator.id.name === 'commands' && ast.type.isObject(declarator.init)) {
          checkCommandsObject(context, node, state, declarator.init.properties);

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

        const tokenElement = sourceCode.getTokenByRangeStart(identifier.identifierStart);

        let message = `Expected '${identifier.name}' to be a function`;

        if (identifier.parent === 'Object') {
          message = `${message} or an array`;
        }

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
