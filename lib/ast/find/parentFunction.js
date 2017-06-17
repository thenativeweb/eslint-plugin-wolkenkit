'use strict';

const type = require('../type');

const parentFunction = function (node) {
  if (!node) {
    return null;
  }

  if (type.isFunction(node)) {
    return node;
  }

  return parentFunction(node.parent);
};

module.exports = parentFunction;
