'use strict';

const rules = require('./rules'),
      rulesRecommended = require('./recommended.json');

const wolkenkit = {
  rules,
  configs: {
    recommended: {
      rules: rulesRecommended
    }
  }
};

module.exports = wolkenkit;
