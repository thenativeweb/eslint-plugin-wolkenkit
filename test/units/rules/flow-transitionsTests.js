'use strict';

const rule = require('../../../lib/rules/flow-transitions'),
      ruleTester = require('../../helpers/ruleTester');

ruleTester.run('flow-transitions', rule, {
  valid: [
    {
      // Declares transitions object.

      filename: '~/app/server/flows/flow.js',
      code: `
        const transitions = {
          foo: {},
          bar: {}
        };

        module.exports = {
          transitions
        };
      `
    }, {
      // Doesn't export transitions.

      filename: '~/app/server/flows/flow.js',
      code: `
        const transitions = 2;
        const whatever = {};

        module.exports = {
          whatever
        }
      `
    }, {
      //  Declares transitions as a string inside writeModel.

      filename: '~/app/server/writeModel/aggregate.js',
      code: `
        const transitions = '';

        module.exports = {
          transitions
        };
      `
    }
  ],

  invalid: [
    {
      // Declares transitions as a string.

      filename: '~/app/server/flows/flow.js',
      code: `
        const transitions = '';

        module.exports = {
          transitions
        };
      `,
      errors: [{
        message: `Expected 'transitions' to be an object.`,
        type: 'VariableDeclaration',
        line: 2,
        column: 15
      }]
    }, {
      // Declares transitions with non-object properties.

      filename: '~/app/server/flows/flow.js',
      code: `
        const transitions = {
          foo () {},
          bar () {}
        };

        module.exports = {
          transitions
        };
      `,
      errors: [{
        message: `Expected 'foo' to be an object.`,
        type: 'VariableDeclaration',
        line: 3,
        column: 11
      }, {
        message: `Expected 'bar' to be an object.`,
        type: 'VariableDeclaration',
        line: 4,
        column: 11
      }]
    }
  ]
});
