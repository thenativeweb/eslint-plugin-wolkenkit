'use strict';

const rule = require('../../../lib/rules/flow-initialstate'),
      ruleTester = require('../../helpers/ruleTester');

ruleTester.run('flow-initialstate', rule, {
  valid: [
    {
      // Declares initialState object.

      filename: '~/app/server/flows/flow.js',
      code: `
        const initialState = {};

        module.exports = {
          initialState
        };
      `
    }, {
      // Doesn't export initialState.

      filename: '~/app/server/flows/flow.js',
      code: `
        const initialState = 2;
        const whatever = {};

        module.exports = {
          whatever
        }
      `
    }, {
      //  Declares initialState as a string inside writeModel.

      filename: '~/app/server/writeModel/aggregate.js',
      code: `
        const initialState = '';

        module.exports = {
          initialState
        };
      `
    }
  ],

  invalid: [
    {
      // Declares initialState as a string.

      filename: '~/app/server/flows/flow.js',
      code: `
        const initialState = '';

        module.exports = {
          initialState
        };
      `,
      errors: [{
        message: `Expected 'initialState' to be an object.`,
        type: 'VariableDeclaration',
        line: 2,
        column: 15
      }]
    }
  ]
});
