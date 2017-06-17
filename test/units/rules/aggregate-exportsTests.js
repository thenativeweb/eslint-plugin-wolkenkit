'use strict';

const rule = require('../../../lib/rules/aggregate-exports'),
      ruleTester = require('../../helpers/ruleTester');

ruleTester.run('aggregate-exports', rule, {
  valid: [
    {
      // Exports using module.exports.

      filename: '~/app/server/writeModel/aggregate.js',
      code: `
        const initialState = {};
        const commands = {};
        const events = {};

        module.exports = {
          initialState,
          commands,
          events
        };
      `
    }, {
      // Exports using exports.

      filename: '~/app/server/writeModel/aggregate.js',
      code: `
        const initialState = {};
        const commands = {};
        const events = {};

        exports = {
          initialState,
          commands,
          events
        };
      `
    }, {
      // File is not in writeModel

      filename: '~/app/server/readModel/lists/list.js',
      code: `
        const events = {};

        exports = {
          events
        };
      `
    }
  ],

  invalid: [
    {
      // File is not directly below the writeModel folder.

      filename: '~/app/server/writeModel/context/aggregate.js',
      code: `
        const initialState = {};
        const commands = {};

        module.exports = {
          initialState,
          commands
        };
      `,
      errors: [{
        message: `Expected aggregate to contain 'events'.`,
        type: 'ExpressionStatement',
        line: 5,
        column: 16
      }]
    }, {
      // Exports is missing.

      filename: '~/app/server/writeModel/aggregate.js',
      code: `
        const initialState = {};
        const commands = {};
      `,
      errors: [{
        message: `Expected module to export an aggregate.`,
        type: 'Program',
        line: 2,
        column: 9
      }]
    }, {
      // Events are missing using module.exports.

      filename: '~/app/server/writeModel/aggregate.js',
      code: `
        const initialState = {};
        const commands = {};

        module.exports = {
          initialState,
          commands
        };
      `,
      errors: [{
        message: `Expected aggregate to contain 'events'.`,
        type: 'ExpressionStatement',
        line: 5,
        column: 16
      }]
    }, {
      // Command and events are missing using module.exports.

      filename: '~/app/server/writeModel/aggregate.js',
      code: `
        const initialState = {};

        module.exports = {
          initialState
        };
      `,
      errors: [{
        message: `Expected aggregate to contain 'commands'.`,
        type: 'ExpressionStatement',
        line: 4,
        column: 16
      },
      {
        message: `Expected aggregate to contain 'events'.`,
        type: 'ExpressionStatement',
        line: 4,
        column: 16
      }]
    }, {
      // Exports unneeded properties using module.exports.

      filename: '~/app/server/writeModel/aggregate.js',
      code: `
        const initialState = {};
        const commands = {};
        const whatever = {};

        module.exports = {
          initialState,
          commands,
          whatever
        };
      `,
      errors: [{
        message: `Expected aggregate to contain 'events'.`,
        type: 'ExpressionStatement',
        line: 6,
        column: 16
      }, {
        message: `Unexpected 'whatever' property.`,
        type: 'ExpressionStatement',
        line: 9,
        column: 11
      }]
    }, {
      // Exports a non-object using module.exports.

      filename: '~/app/server/writeModel/aggregate.js',
      code: `
        module.exports = 2;
      `,
      errors: [{
        message: 'Expected module to export an aggregate.',
        type: 'ExpressionStatement',
        line: 2,
        column: 16
      }]
    }, {
      // Exports an empty object using module.exports.

      filename: '~/app/server/writeModel/aggregate.js',
      code: `
        module.exports = {};
      `,
      errors: [{
        message: `Expected module to export an aggregate.`,
        type: 'ExpressionStatement',
        line: 2,
        column: 16
      }]
    }]
});
