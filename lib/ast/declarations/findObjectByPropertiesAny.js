'use strict';

const object = require('../object');

const findObjectByPropertiesAny = function (declarations, propertyNames) {
  return declarations.find(declarator => {
    const candidate = declarator.init;

    return (
      candidate.type === 'ObjectExpression' &&
      propertyNames.some(propertyName => object.hasProperty(candidate, propertyName))
    );
  });
};

module.exports = findObjectByPropertiesAny;
