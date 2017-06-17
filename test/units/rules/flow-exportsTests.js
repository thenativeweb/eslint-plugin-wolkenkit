'use strict';

const rule = require('../../../lib/rules/flow-exports'),
      ruleTester = require('../../helpers/ruleTester');

ruleTester.run('flow-exports', rule, {
  valid: [
    {
      // Exports stateless flow using module.exports.

      filename: '~/app/server/flows/flow.js',
      code: `
        const when = {};

        module.exports = {
          when
        };
      `
    }, {
      // Exports stateful flow using module.exports.

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
      // Exports stateless flow using exports.

      filename: '~/app/server/flows/flow.js',
      code: `
        const when = {};

        exports = {
          when
        };
      `
    }, {
      // Exports stateful flow using exports.

      filename: '~/app/server/flows/flow.js',
      code: `
        const identity = {};
        const initialState = {};
        const transitions = {};
        const when = {};

        exports = {
          identity,
          initialState,
          transitions,
          when
        };
      `
    }
  ],

  invalid: [
    {
      // File is not directly below the flows folder.

      filename: '~/app/server/flows/context/flow.js',
      code: `
        const when = {};

        module.exports = {};
      `,
      errors: [{
        message: `Expected module to export a flow.`,
        type: 'ExpressionStatement',
        line: 4,
        column: 16
      }]
    }, {
      // Exports is missing.

      filename: '~/app/server/flows/flow.js',
      code: `
        const when = {};
      `,
      errors: [{
        message: `Expected module to export a flow.`,
        type: 'Program',
        line: 2,
        column: 9
      }]
    }, {
      // Exports a non-object using module.exports.

      filename: '~/app/server/flows/flow.js',
      code: `
        module.exports = 2;
      `,
      errors: [{
        message: 'Expected module to export a flow.',
        type: 'ExpressionStatement',
        line: 2,
        column: 16
      }]
    }, {
      // Exports an empty object using module.exports.

      filename: '~/app/server/flows/flow.js',
      code: `
        module.exports = {};
      `,
      errors: [{
        message: `Expected module to export a flow.`,
        type: 'ExpressionStatement',
        line: 2,
        column: 16
      }]
    }, {
      // Exports unneeded property using module.exports.

      filename: '~/app/server/flows/flow.js',
      code: `
        const whatever = {};

        module.exports = {
          whatever
        };
      `,
      errors: [{
        message: `Expected flow to contain 'when'.`,
        type: 'ExpressionStatement',
        line: 4,
        column: 16
      },
      {
        message: `Unexpected 'whatever' property.`,
        type: 'ExpressionStatement',
        line: 5,
        column: 11
      }]
    }, {
      // Exports unneeded property and when using module.exports.

      filename: '~/app/server/flows/flow.js',
      code: `
        const when = {};
        const whatever = {};

        module.exports = {
          when,
          whatever
        };
      `,
      errors: [{
        message: `Unexpected 'whatever' property.`,
        type: 'ExpressionStatement',
        line: 7,
        column: 11
      }]
    }, {
      // stateful
      //
      // identity is missing using module.exports.

      filename: '~/app/server/flows/flow.js',
      code: `
        const initialState = {};
        const transitions = {};
        const when = {};

        module.exports = {
          initialState,
          transitions,
          when
        };
      `,
      errors: [{
        message: `Expected flow to contain 'identity'.`,
        type: 'ExpressionStatement',
        line: 6,
        column: 16
      }]
    }, {
      // initialState is missing using module.exports.

      filename: '~/app/server/flows/flow.js',
      code: `
        const identity = {};
        const transitions = {};
        const when = {};

        module.exports = {
          identity,
          transitions,
          when
        };
      `,
      errors: [{
        message: `Expected flow to contain 'initialState'.`,
        type: 'ExpressionStatement',
        line: 6,
        column: 16
      }]
    }, {
      // transitions are missing using module.exports.

      filename: '~/app/server/flows/flow.js',
      code: `
        const identity = {};
        const initialState = {};
        const when = {};

        module.exports = {
          identity,
          initialState,
          when
        };
      `,
      errors: [{
        message: `Expected flow to contain 'transitions'.`,
        type: 'ExpressionStatement',
        line: 6,
        column: 16
      }]
    }, {
      // when is missing using module.exports.

      filename: '~/app/server/flows/flow.js',
      code: `
        const identity = {};
        const initialState = {};
        const transitions = {};

        module.exports = {
          identity,
          initialState,
          transitions
        };
      `,
      errors: [{
        message: `Expected flow to contain 'when'.`,
        type: 'ExpressionStatement',
        line: 6,
        column: 16
      }]
    }, {
      // identity and when are missing using module.exports.

      filename: '~/app/server/flows/flow.js',
      code: `
        const initialState = {};
        const transitions = {};

        module.exports = {
          initialState,
          transitions
        };
      `,
      errors: [{
        message: `Expected flow to contain 'identity'.`,
        type: 'ExpressionStatement',
        line: 5,
        column: 16
      }, {
        message: `Expected flow to contain 'when'.`,
        type: 'ExpressionStatement',
        line: 5,
        column: 16
      }]
    }, {
      // Exports unneeded property using module.exports.

      filename: '~/app/server/flows/flow.js',
      code: `
        const identity = {};
        const initialState = {};
        const transitions = {};
        const whatever = {};
        const when = {};

        module.exports = {
          identity,
          initialState,
          transitions,
          whatever,
          when
        };
      `,
      errors: [{
        message: `Unexpected 'whatever' property.`,
        type: 'ExpressionStatement',
        line: 12,
        column: 11
      }]
    }]
});
