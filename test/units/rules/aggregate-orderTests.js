'use strict';

const rule = require('../../../lib/rules/aggregate-order'),
      ruleTester = require('../../helpers/ruleTester');

ruleTester.run('aggregate-order', rule, {
  valid: [{
    // Defines identifiers and properties in correct order.

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
  }],

  invalid: [{
    // Defines identifiers in wrong order.

    filename: '~/app/server/writeModel/aggregate.js',
    code: `
      const commands = {};
      const events = {};
      const initialState = {};

      module.exports = {
        initialState,
        commands,
        events
      };
    `,
    errors: [{
      message: `Expected 'commands' to be placed after 'initialState'.`,
      type: 'Program',
      line: 2,
      column: 13
    }, {
      message: `Expected 'events' to be placed after 'commands'.`,
      type: 'Program',
      line: 3,
      column: 13
    }, {
      message: `Expected 'initialState' to be placed before 'commands'.`,
      type: 'Program',
      line: 4,
      column: 13
    }]
  }, {
    // Defines properties in wrong order.

    filename: '~/app/server/writeModel/aggregate.js',
    code: `
      const initialState = {};
      const commands = {};
      const events = {};

      module.exports = {
        events,
        initialState,
        commands
      };
    `,
    errors: [{
      message: `Expected 'events' to be placed after 'commands'.`,
      type: 'Program',
      line: 7,
      column: 9
    }, {
      message: `Expected 'initialState' to be placed before 'commands'.`,
      type: 'Program',
      line: 8,
      column: 9
    }, {
      message: `Expected 'commands' to be placed before 'events'.`,
      type: 'Program',
      line: 9,
      column: 9
    }]
  }]
});
