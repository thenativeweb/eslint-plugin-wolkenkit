'use strict';

const rule = require('../../../lib/rules/aggregate-events'),
      ruleTester = require('../../helpers/ruleTester');

ruleTester.run('aggregate-events', rule, {
  valid: [
    {
      // Declares events object.

      filename: '~/app/server/writeModel/aggregate.js',
      code: `
        const events = {};

        module.exports = {
          events
        };
      `
    }, {
      // Doesn't export events.

      filename: '~/app/server/writeModel/aggregate.js',
      code: `
        const events = 2;
        const whatever = {};

        module.exports = {
          whatever
        }
      `
    }, {
      //  Declares events as a string inside readModel.

      filename: '~/app/server/readModel/aggregate.js',
      code: `
        const events = '';

        module.exports = {
          events
        };
      `
    }
  ],

  invalid: [
    {
      // Declares events as a string.

      filename: '~/app/server/writeModel/aggregate.js',
      code: `
        const events = '';

        module.exports = {
          events
        };
      `,
      errors: [{
        message: `Expected 'events' to be an object.`,
        type: 'VariableDeclaration',
        line: 2,
        column: 15
      }]
    }
  ]
});
