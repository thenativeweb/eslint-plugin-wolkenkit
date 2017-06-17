'use strict';

const rule = require('../../../lib/rules/flow-order'),
      ruleTester = require('../../helpers/ruleTester');

ruleTester.run('flow-order', rule, {
  valid: [{
    // Defines identifiers and properties in correct order.

    filename: '~/app/server/flows/flow.js',
    code: `
      const identity = {};
      const initialState = {};
      const transitions = {};
      const when = {};

      module.exports = {
        identity,
        initialState,
        transitions,
        when
      };
    `
  }, {
    // Defines when only.

    filename: '~/app/server/flows/flow.js',
    code: `
      const when = {};

      module.exports = {
        when
      };
    `
  }],

  invalid: [{
    // Defines identifiers in wrong order.

    filename: '~/app/server/flows/flow.js',
    code: `
      const transitions = {};
      const identity = {};
      const when = {};
      const initialState = {};

      module.exports = {
        identity,
        initialState,
        transitions,
        when
      };
    `,
    errors: [{
      message: `Expected 'transitions' to be placed after 'initialState'.`,
      type: 'Program',
      line: 2,
      column: 13
    }, {
      message: `Expected 'identity' to be placed before 'initialState'.`,
      type: 'Program',
      line: 3,
      column: 13
    }, {
      message: `Expected 'when' to be placed after 'transitions'.`,
      type: 'Program',
      line: 4,
      column: 13
    }, {
      message: `Expected 'initialState' to be placed before 'transitions'.`,
      type: 'Program',
      line: 5,
      column: 13
    }]
  }, {
    // Defines properties in wrong order.

    filename: '~/app/server/flows/flow.js',
    code: `
      const identity = {};
      const initialState = {};
      const transitions = {};
      const when = {};

      module.exports = {
        initialState,
        transitions,
        when,
        identity
      };
    `,
    errors: [{
      message: `Expected 'initialState' to be placed after 'identity'.`,
      type: 'Program',
      line: 8,
      column: 9
    }, {
      message: `Expected 'transitions' to be placed after 'initialState'.`,
      type: 'Program',
      line: 9,
      column: 9
    }, {
      message: `Expected 'when' to be placed after 'transitions'.`,
      type: 'Program',
      line: 10,
      column: 9
    }, {
      message: `Expected 'identity' to be placed before 'initialState'.`,
      type: 'Program',
      line: 11,
      column: 9
    }]
  }]
});
