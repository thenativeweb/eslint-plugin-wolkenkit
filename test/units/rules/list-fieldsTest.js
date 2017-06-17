'use strict';

const rule = require('../../../lib/rules/list-fields'),
      ruleTester = require('../../helpers/ruleTester');

ruleTester.run('list-fields', rule, {
  valid: [
    {
      // Declares fields object.

      filename: '~/app/server/readModel/lists/list.js',
      code: `
        const fields = {};

        module.exports = {
          fields
        };
      `
    }, {
      // Doesn't export fields.

      filename: '~/app/server/readModel/lists/list.js',
      code: `
        const fields = 2;
        const whatever = {};

        module.exports = {
          whatever
        }
      `
    }, {
      //  Declares fields as a string inside writeModel.

      filename: '~/app/server/writeModel/aggregate.js',
      code: `
        const fields = '';

        module.exports = {
          fields
        };
      `
    }
  ],

  invalid: [
    {
      // Declares fields as a string.

      filename: '~/app/server/readModel/lists/list.js',
      code: `
        const fields = '';

        module.exports = {
          fields
        };
      `,
      errors: [{
        message: `Expected 'fields' to be an object.`,
        type: 'VariableDeclaration',
        line: 2,
        column: 15
      }]
    }
  ]
});
