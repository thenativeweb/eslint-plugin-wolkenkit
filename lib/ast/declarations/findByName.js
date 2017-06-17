'use strict';

const findByName = function (declarations, name) {
  return declarations.find(declarator => declarator.id.name === name);
};

module.exports = findByName;
