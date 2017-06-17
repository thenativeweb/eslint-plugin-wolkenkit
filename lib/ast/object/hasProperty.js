'use strict';

const hasProperty = function (objectExpression, propertyName) {
  if (!objectExpression.properties) {
    return false;
  }

  return objectExpression.properties.filter(property => property.key.name === propertyName);
};

module.exports = hasProperty;
