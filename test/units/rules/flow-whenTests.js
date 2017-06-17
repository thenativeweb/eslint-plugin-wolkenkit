'use strict';

const rule = require('../../../lib/rules/flow-when'),
      ruleTester = require('../../helpers/ruleTester');

ruleTester.run('flow-when', rule, {
  valid: [
    {
      // Declares stateless when object.

      filename: '~/app/server/flows/flow.js',
      code: `
        const when = {
          foo: function () {}
        };

        module.exports = {
          when
        };
      `
    }, {
      // Declares stateful when object.

      filename: '~/app/server/flows/flow.js',
      code: `
        const identity = {};
        const initialState = {};
        const transitions = {};
        const when = {
          foo: {},
          bar: {}
        };

        module.exports = {
          identity,
          initialState,
          transitions,
          when
        };
      `
    }, {
      // Doesn't export when.

      filename: '~/app/server/flows/flow.js',
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

      filename: '~/app/server/flows/flow.js',
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
    }, {
      // Declares when with non-object properties.

      filename: '~/app/server/flows/flow.js',
      code: `
        const identity = {};
        const initialState = {};
        const transitions = {};
        const when = {
          foo () {},
          bar () {},
          baa: 2
        };

        module.exports = {
          identity,
          initialState,
          transitions,
          when
        };
      `,
      errors: [{
        message: `Expected 'foo' to be an object.`,
        type: 'VariableDeclaration',
        line: 6,
        column: 11
      }, {
        message: `Expected 'bar' to be an object.`,
        type: 'VariableDeclaration',
        line: 7,
        column: 11
      }, {
        message: `Expected 'baa' to be an object.`,
        type: 'VariableDeclaration',
        line: 8,
        column: 11
      }]
    }
  ]
});
