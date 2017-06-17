'use strict';

const _ = require('lodash');

const ast = require('../ast'),
      file = require('../file'),
      recommended = require('../recommended.json');

const { list } = require('../definitions');

const meta = {
  docs: {
    description: 'list-when-mark enforces when handlers to call a method of the mark parameter at the end of their code paths.',
    category: 'wolkenkit',
    recommended: Boolean(recommended['wolkenkit/list-when-mark'])
  },
  schema: []
};

const hasMarkParameter = function (node, context) {
  if (ast.type.isFunction(node)) {
    return context.getDeclaredVariables(node).some(variable => variable.name === 'mark');
  }

  return false;
};

const getMethodsInfo = function (node) {
  const methods = {
    allowed: list.markMethods,
    called: false,
    method: node.callee.property !== undefined,
    name: node.callee.name || node.callee.property.name
  };

  if (methods.allowed.includes(methods.name)) {
    methods.called = true;
  }

  return methods;
};

const create = function (context) {
  if (!file.isDescendant(context.getFilename(), 'readModel/lists')) {
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
          let methodsText = `${allowed[0]}`;

          if (allowed.length > 1) {
            methodsText = `${allowed.slice(0, allowed.length - 1).join(', ')} or ${allowed[allowed.length - 1]}`;
          }
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
