'use strict';

const isExports = function (node) {
  if (
    !node.expression ||
    !node.expression.left ||
    !node.expression.left.name
  ) {
    return false;
  }

  if (node.expression.left.name === 'exports') {
    return true;
  }

  return false;
};

module.exports = isExports;
