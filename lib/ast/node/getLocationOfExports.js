'use strict';

const getLocationOfExports = function (sourceCode, node) {
  const errorPosition = node.expression.left.property ? node.expression.left.property.start : node.expression.left.start;
  const token = sourceCode.getTokenByRangeStart(errorPosition);

  return token.loc || node.loc;
};

module.exports = getLocationOfExports;
