'use strict';

const rule = require('../../../lib/rules/flow-identity-parameters'),
      ruleTester = require('../../helpers/ruleTester');

ruleTester.run('flow-identity-parameters', rule, {
  valid: [
    {
      // Declares one identity handler

      filename: '~/app/server/flows/flow.js',
      code: `
        const identity = {
          foo (event) {},
        };
      `
    }, {
      // Declares one identity handler outside the identity object

      filename: '~/app/server/flows/flow.js',
      code: `
        const bar = function (event) {};

        const identity = {
          bar,
          mounted2: (event) => {}
        };
      `
    }
  ],

  invalid: [
    {
      // Declares functions with wrong parameter name

      filename: '~/app/server/flows/flow.js',
      code: `
        const bar = function (blub) {};

        const identity = {
          foo (blub) {},
          bar,
          mounted3: (blub) => {}
        };
      `,
      errors: [{
        message: `Expected 'event' parameter.`,
        type: 'VariableDeclaration',
        line: 2,
        column: 31
      }, {
        message: `Expected 'event' parameter.`,
        type: 'VariableDeclaration',
        line: 5,
        column: 16
      }, {
        message: `Expected 'event' parameter.`,
        type: 'VariableDeclaration',
        line: 7,
        column: 22
      }]
    }, {
      // Declares functions with more than one parameter

      filename: '~/app/server/flows/flow.js',
      code: `
        const bar = function (event, blub) {};

        const identity = {
          foo (event, blub) {},
          bar,
          mounted3: (event, blub) => {}
        };
      `,
      errors: [{
        message: `Expected maximum 1 parameter (event).`,
        type: 'VariableDeclaration',
        line: 2,
        column: 21
      }, {
        message: `Expected maximum 1 parameter (event).`,
        type: 'VariableDeclaration',
        line: 5,
        column: 11
      }, {
        message: `Expected maximum 1 parameter (event).`,
        type: 'VariableDeclaration',
        line: 7,
        column: 11
      }]
    }, {
      // Declares functions with no parameter

      filename: '~/app/server/flows/flow.js',
      code: `
        const bar = function () {};

        const identity = {
          foo () {},
          bar,
          mounted3: () => {}
        };
      `,
      errors: [{
        message: `Expected 'event' parameter.`,
        type: 'VariableDeclaration',
        line: 2,
        column: 21
      }, {
        message: `Expected 'event' parameter.`,
        type: 'VariableDeclaration',
        line: 5,
        column: 11
      }, {
        message: `Expected 'event' parameter.`,
        type: 'VariableDeclaration',
        line: 7,
        column: 11
      }]
    }, {
      // Declares properties which are no functions.

      filename: '~/app/server/flows/flow.js',
      code: `
        const bar = '1';

        const foo = 2;

        const identity = {
          fu: 3,
          foo,
          bar,
          mounted3: (event) => {}
        };
      `,
      errors: [{
        message: `Expected 'fu' to be a function.`,
        type: 'VariableDeclaration',
        line: 7,
        column: 11
      }, {
        message: `Expected 'foo' to be a function.`,
        type: 'Program',
        line: 8,
        column: 11
      }, {
        message: `Expected 'bar' to be a function.`,
        type: 'Program',
        line: 9,
        column: 11
      }]
    }
  ]
});
