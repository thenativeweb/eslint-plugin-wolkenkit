'use strict';

const isArray = function (node) {
  return node.type === 'ArrayExpression';
};

module.exports = isArray;
