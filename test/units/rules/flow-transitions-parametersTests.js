'use strict';

const rule = require('../../../lib/rules/flow-transitions-parameters'),
      ruleTester = require('../../helpers/ruleTester');

ruleTester.run('flow-transitions-parameters', rule, {
  valid: [
    {
      // Declares one transitions handler

      filename: '~/app/server/flows/flow.js',
      code: `
        const transitions = {
          foo : {
            bar (flow) {}
          },
          baz: {
            fuu (flow) {}
          }
        };
      `
    }, {
      // Declares one transitions handler outside the transitions object

      filename: '~/app/server/flows/flow.js',
      code: `
        const fu = function (flow) {
          flow();
        };

        const transitions = {
          foo: {
            bar (flow) {},
            fu
          },
          baz: {
            fuu (flow) {}
          }
        };
      `
    }
  ],

  invalid: [
    {
      // Declares functions with wrong parameter name

      filename: '~/app/server/flows/flow.js',
      code: `
        const bar = function (blub) {};

        const transitions = {
          foo: {
            fu (blub) {},
            bar,
            mounted3: (blub) => {}
          }
        };
      `,
      errors: [{
        message: `Expected 'flow' parameter.`,
        type: 'VariableDeclaration',
        line: 2,
        column: 31
      }, {
        message: `Expected 'flow' parameter.`,
        type: 'VariableDeclaration',
        line: 6,
        column: 17
      }, {
        message: `Expected 'flow' parameter.`,
        type: 'VariableDeclaration',
        line: 8,
        column: 24
      }]
    }, {
      // Declares functions with more than one parameter

      filename: '~/app/server/flows/flow.js',
      code: `
        const bar = function (flow, blub) {};

        const transitions = {
          foo: {
            fu (flow, blub) {}
          },
          baz: {
            bar,
            mounted3: (flow, blub) => {}
          }
        };
      `,
      errors: [{
        message: `Expected maximum 1 parameter (flow).`,
        type: 'VariableDeclaration',
        line: 2,
        column: 21
      }, {
        message: `Expected maximum 1 parameter (flow).`,
        type: 'VariableDeclaration',
        line: 6,
        column: 13
      }, {
        message: `Expected maximum 1 parameter (flow).`,
        type: 'VariableDeclaration',
        line: 10,
        column: 13
      }]
    }, {
      // Declares functions with no parameter

      filename: '~/app/server/flows/flow.js',
      code: `
        const bar = function () {};

        const transitions = {
          foo: {
            fu () {},
            bar
          },
          baz: {
            mounted3: () => {}
          }
        };
      `,
      errors: [{
        message: `Expected 'flow' parameter.`,
        type: 'VariableDeclaration',
        line: 2,
        column: 21
      }, {
        message: `Expected 'flow' parameter.`,
        type: 'VariableDeclaration',
        line: 6,
        column: 13
      }, {
        message: `Expected 'flow' parameter.`,
        type: 'VariableDeclaration',
        line: 10,
        column: 13
      }]
    }, {
      // Declares properties which are no functions.

      filename: '~/app/server/flows/flow.js',
      code: `
        const bar = '1';

        const fuu = 2;

        const transitions = {
          foo: {
            fu: 3,
            fuu
          },
          baz: {
            bar,
            mounted3: (flow) => {}
          }
        };
      `,
      errors: [{
        message: `Expected 'fu' to be a function.`,
        type: 'VariableDeclaration',
        line: 8,
        column: 13
      }, {
        message: `Expected 'fuu' to be a function.`,
        type: 'Program',
        line: 9,
        column: 13
      }, {
        message: `Expected 'bar' to be a function.`,
        type: 'Program',
        line: 12,
        column: 13
      }]
    }
  ]
});
