'use strict';

const path = require('path');

const isDescendant = function (filePath, parent) {
  const directory = path.dirname(filePath);
  const ancestors = directory.split(path.sep);

  const parents = parent.split(path.sep).filter(segment => segment !== '');
  let lastIndex;

  for (let i = parents.length - 1; i >= 0; i--) {
    const index = ancestors.indexOf(parents[i]);

    if (i === parents.length - 1) {
      lastIndex = index + 1;
    }

    if (index === -1 || index !== lastIndex - 1) {
      return false;
    }

    lastIndex = index;
  }

  return true;
};

module.exports = isDescendant;
