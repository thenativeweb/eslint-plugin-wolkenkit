'use strict';

const isModuleExports = function (node) {
  if (
    !node.expression ||
    !node.expression.left ||
    !node.expression.left.object
  ) {
    return false;
  }
  if (
    node.expression.left.object.name === 'module' &&
    node.expression.left.property &&
    node.expression.left.property.name === 'exports'
  ) {
    return true;
  }

  return false;
};

module.exports = isModuleExports;
