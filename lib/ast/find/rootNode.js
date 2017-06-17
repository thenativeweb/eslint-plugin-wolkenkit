'use strict';

const rootNode = function (node) {
  if (node.parent === null) {
    return node;
  }

  return rootNode(node.parent);
};

module.exports = rootNode;
