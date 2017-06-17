'use strict';

const _ = require('lodash');

const ast = require('../ast'),
      file = require('../file'),
      recommended = require('../recommended.json');

const { aggregate } = require('../definitions');

const meta = {
  docs: {
    description: 'aggregate-commands-mark enforces command handlers to call a method of the mark parameter at the end of their code paths.',
    category: 'wolkenkit',
    recommended: Boolean(recommended['wolkenkit/aggregate-commands-mark'])
  },
  schema: []
};

const hasMarkParameter = function (node, context) {
  if (ast.type.isFunction(node)) {
    return context.getDeclaredVariables(node).some(variable => variable.name === 'mark');
  }

  return false;
};

const getCommandsNode = function (node) {
  const rootNode = ast.find.rootNode(node);

  return _.find(rootNode.body, bodyNode => {
    if (
      bodyNode.type === 'VariableDeclaration' &&
      _.find(bodyNode.declarations, declarator => declarator.id.name === 'commands')
    ) {
      return true;
    }

    return false;
  });
};

const getMiddleware = function (commands, identifier) {
  if (
    !commands ||
    !commands.declarations ||
    commands.declarations[0].init.type !== 'ObjectExpression'
  ) {
    return null;
  }

  const properties = commands.declarations[0].init.properties;
  const arrayProperties = properties.filter(property => ast.type.isArray(property.value));

  for (let i = 0; i < arrayProperties.length; i++) {
    const arrayProperty = arrayProperties[i];
    const foundElement = arrayProperty.value.elements.find(element =>
      element.type === 'Identifier' && element.name === identifier
    );

    if (foundElement) {
      return {
        elementIdentifier: foundElement,
        array: arrayProperty
      };
    }
  }

  return null;
};

const isLastMiddlewareElement = function (node) {
  const parentFunction = ast.find.parentFunction(node);

  if (parentFunction.parent.type !== 'ArrayExpression' && parentFunction.parent.type !== 'VariableDeclarator') {
    return false;
  }

  let rangeStart = parentFunction.start;
  let elements = parentFunction.parent.elements;

  // if VariableDeclarator, search for middleware array
  if (parentFunction.parent.type === 'VariableDeclarator') {
    const commands = getCommandsNode(node),
          identifier = parentFunction.parent.id.name;

    const middleware = getMiddleware(commands, identifier);

    if (!middleware) {
      return false;
    }

    elements = middleware.array.value.elements;
    rangeStart = middleware.elementIdentifier.start;
  }

  // identify element by its range start value
  const index = _.findIndex(elements, element => element.start === rangeStart);

  if (index === elements.length - 1) {
    return true;
  }

  return false;
};

const isMiddleware = function (node) {
  if (ast.find.parentArray(node)) {
    return true;
  }

  const parentFunction = ast.find.parentFunction(node);

  // if VariableDeclarator, search for middleware array
  if (parentFunction.parent.type === 'VariableDeclarator') {
    const commands = getCommandsNode(node),
          identifier = parentFunction.parent.id.name;

    if (getMiddleware(commands, identifier)) {
      return true;
    }
  }

  return false;
};

const getMethodsInfo = function (node) {
  const methods = {
    allowed: aggregate.markMethods.command,
    called: false,
    method: node.callee.property !== undefined,
    isMiddleware: isMiddleware(node),
    name: node.callee.name || node.callee.property.name
  };

  if (methods.isMiddleware && !isLastMiddlewareElement(node)) {
    methods.allowed = aggregate.markMethods.middleware;
  }

  if (methods.allowed.includes(methods.name)) {
    methods.called = true;
  }

  return methods;
};

const create = function (context) {
  if (!file.isDescendant(context.getFilename(), 'writeModel')) {
    return {};
  }

  const funcInfoStack = [];
  const segmentInfoMap = {};

  return {
    onCodePathStart (codePath, node) {
      funcInfoStack.push({
        codePath,
        hasMarkParameter: hasMarkParameter(node, context)
      });
    },

    onCodePathEnd (codePath, node) {
      funcInfoStack.pop();

      codePath.finalSegments.forEach(segment => {
        const info = segmentInfoMap[segment.id];

        if (!info) {
          return;
        }

        if (!info.methods.called && info.methods.allowed) {
          const allowed = info.methods.allowed;
          const methodsText = `${allowed.slice(0, allowed.length - 1).join(', ')} or ${allowed[allowed.length - 1]}`;
          const message = info.methods.method ?
            `Unexpected method name '${info.methods.name}', expected '${methodsText}'.` :
            `Unexpected call to '${info.methods.name}', expected call to its methods '${methodsText}'.`;

          context.report({
            message,
            node,
            loc: info.loc
          });

          return;
        }

        if (info.callCount > 1) {
          context.report({
            message: `Unexpected multiple call to '${info.methods.name}'.`,
            node
          });
        }
      });
    },

    // manages state of code paths
    onCodePathSegmentStart (segment) {
      if (!_.last(funcInfoStack).hasMarkParameter) {
        return;
      }

      // initialize state of this path
      const info = segmentInfoMap[segment.id] = {
        methods: {},
        callCount: 0,
        loc: {}
      };

      // if there are the previous paths, merges state,
      // checks `mark method` was called in every previous path
      if (segment.prevSegments.length > 0) {
        info.methods.called = segment.prevSegments.every(prevSegment => {
          const prevInfo = segmentInfoMap[prevSegment.id];

          return prevInfo.methods.called;
        });
      }
    },

    CallExpression (node) {
      const callee = node.callee,
            funcInfo = _.last(funcInfoStack);

      if (!funcInfo.hasMarkParameter) {
        return;
      }

      if (callee.type === 'MemberExpression' && callee.object.name === 'mark' || callee.name === 'mark') {
        funcInfo.codePath.currentSegments.forEach(segment => {
          const info = segmentInfoMap[segment.id];

          if (info && info.callCount === 0) {
            info.methods = getMethodsInfo(node);
            info.loc = callee.loc;
          }
          info.callCount += 1;
        });
      }
    }
  };
};

module.exports = {
  meta,
  create
};
