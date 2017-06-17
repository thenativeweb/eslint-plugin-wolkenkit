'use strict';

const getLocationOfDeclaration = function (sourceCode, node) {
  const errorPosition = node.declarations[0].id.start;
  const token = sourceCode.getTokenByRangeStart(errorPosition);

  return token.loc || node.loc;
};

module.exports = getLocationOfDeclaration;
