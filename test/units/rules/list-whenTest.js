'use strict';

const rule = require('../../../lib/rules/list-when'),
      ruleTester = require('../../helpers/ruleTester');

ruleTester.run('list-when', rule, {
  valid: [
    {
      // Declares when object.

      filename: '~/app/server/readModel/lists/list.js',
      code: `
        const when = {};

        module.exports = {
          when
        };
      `
    }, {
      // Doesn't export when.

      filename: '~/app/server/readModel/lists/list.js',
      code: `
        const when = 2;
        const whatever = {};

        module.exports = {
          whatever
        }
      `
    }, {
      //  Declares when as a string inside writeModel.

      filename: '~/app/server/writeModel/aggregate.js',
      code: `
        const when = '';

        module.exports = {
          when
        };
      `
    }
  ],

  invalid: [
    {
      // Declares when as a string.

      filename: '~/app/server/readModel/lists/list.js',
      code: `
        const when = '';

        module.exports = {
          when
        };
      `,
      errors: [{
        message: `Expected 'when' to be an object.`,
        type: 'VariableDeclaration',
        line: 2,
        column: 15
      }]
    }
  ]
});
