'use strict';

const rule = require('../../../lib/rules/flow-identity'),
      ruleTester = require('../../helpers/ruleTester');

ruleTester.run('flow-identity', rule, {
  valid: [
    {
      // Declares identity object.

      filename: '~/app/server/flows/flow.js',
      code: `
        const identity = {};

        module.exports = {
          identity
        };
      `
    }, {
      // Doesn't export identity.

      filename: '~/app/server/flows/flow.js',
      code: `
        const identity = 2;
        const whatever = {};

        module.exports = {
          whatever
        }
      `
    }, {
      //  Declares identity as a string inside writeModel.

      filename: '~/app/server/writeModel/aggregate.js',
      code: `
        const identity = '';

        module.exports = {
          identity
        };
      `
    }
  ],

  invalid: [
    {
      // Declares identity as a string.

      filename: '~/app/server/flows/flow.js',
      code: `
        const identity = '';

        module.exports = {
          identity
        };
      `,
      errors: [{
        message: `Expected 'identity' to be an object.`,
        type: 'VariableDeclaration',
        line: 2,
        column: 15
      }]
    }
  ]
});
