'use strict';

const isRoot = function (codePath) {
  if (codePath.upper === null) {
    return true;
  }

  return false;
};

module.exports = isRoot;
