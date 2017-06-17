'use strict';

const rule = require('../../../lib/rules/list-exports'),
      ruleTester = require('../../helpers/ruleTester');

ruleTester.run('list-exports', rule, {
  valid: [
    {
      // Exports using module.exports.

      filename: '~/app/server/readModel/lists/list.js',
      code: `
        const fields = {};
        const when = {};

        module.exports = {
          fields,
          when
        };
      `
    }, {
      // Exports using exports.

      filename: '~/app/server/readModel/lists/list.js',
      code: `
        const fields = {};
        const when = {};

        exports = {
          fields,
          when
        };
      `
    }, {
      // File is not in readModel/lists

      filename: '~/app/server/readModel/list.js',
      code: `
        const when = {};

        exports = {
          when
        };
      `
    }
  ],

  invalid: [
    {
      // Exports is missing.

      filename: '~/app/server/readModel/lists/list.js',
      code: `
        const fields = {};
        const when = {};
      `,
      errors: [{
        message: `Expected module to export a list.`,
        type: 'Program',
        line: 2,
        column: 9
      }]
    }, {
      // When is missing using module.exports.

      filename: '~/app/server/readModel/lists/list.js',
      code: `
        const fields = {};

        module.exports = {
          fields
        };
      `,
      errors: [{
        message: `Expected list to contain 'when'.`,
        type: 'ExpressionStatement',
        line: 4,
        column: 16
      }]
    }, {
      // Fields are missing using module.exports.

      filename: '~/app/server/readModel/lists/list.js',
      code: `
        const when = {};

        module.exports = {
          when
        };
      `,
      errors: [{
        message: `Expected list to contain 'fields'.`,
        type: 'ExpressionStatement',
        line: 4,
        column: 16
      }]
    }, {
      // Exports unneeded properties using module.exports.

      filename: '~/app/server/readModel/lists/list.js',
      code: `
        const fields = {};
        const whatever = {};

        module.exports = {
          fields,
          whatever
        };
      `,
      errors: [{
        message: `Expected list to contain 'when'.`,
        type: 'ExpressionStatement',
        line: 5,
        column: 16
      }, {
        message: `Unexpected 'whatever' property.`,
        type: 'ExpressionStatement',
        line: 7,
        column: 11
      }]
    }, {
      // Exports a non-object using module.exports.

      filename: '~/app/server/readModel/lists/list.js',
      code: `
        module.exports = 2;
      `,
      errors: [{
        message: 'Expected module to export a list.',
        type: 'ExpressionStatement',
        line: 2,
        column: 16
      }]
    }, {
      // Exports an empty object using module.exports.

      filename: '~/app/server/readModel/lists/list.js',
      code: `
        module.exports = {};
      `,
      errors: [{
        message: `Expected module to export a list.`,
        type: 'ExpressionStatement',
        line: 2,
        column: 16
      }]
    }]
});
