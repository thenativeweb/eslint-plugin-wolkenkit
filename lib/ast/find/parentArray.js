'use strict';

const type = require('../type');

const parentArray = function (node) {
  if (!node) {
    return null;
  }

  if (type.isArray(node)) {
    return node;
  }

  return parentArray(node.parent);
};

module.exports = parentArray;
