'use strict';

const isArray = function (node) {
  return node.type === 'ObjectExpression';
};

module.exports = isArray;
