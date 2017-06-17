'use strict';

const rule = require('../../../lib/rules/aggregate-initialstate'),
      ruleTester = require('../../helpers/ruleTester');

ruleTester.run('aggregate-initialstate', rule, {
  valid: [
    {
      // Declares initialState object as variable.

      filename: '~/app/server/writeModel/aggregate.js',
      code: `
        const initialState = {};

        module.exports = {
          initialState
        };
      `
    }, {
      // Declares no initialState object variable and no exports an object without initialState object.

      filename: '~/app/server/writeModel/aggregate.js',
      code: `
        const whatever = {};
        const events = '';

        module.exports = {
          whatever
        }
      `
    }, {
      //  Declares initialState as a string inside readModel.

      filename: '~/app/server/readModel/aggregate.js',
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

      filename: '~/app/server/writeModel/aggregate.js',
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
