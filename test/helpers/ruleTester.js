'use strict';

const eslint = require('eslint');

const { RuleTester } = eslint;

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 6
  }
});

module.exports = ruleTester;
