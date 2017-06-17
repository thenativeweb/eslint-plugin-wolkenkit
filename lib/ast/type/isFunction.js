'use strict';

const isFunction = function (node) {
  return (
    node.type === 'FunctionExpression' ||
    node.type === 'FunctionDeclaration' ||
    node.type === 'ArrowFunctionExpression'
  );
};

module.exports = isFunction;
