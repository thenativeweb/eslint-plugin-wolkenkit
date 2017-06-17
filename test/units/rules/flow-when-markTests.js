'use strict';

const rule = require('../../../lib/rules/flow-when-mark'),
      ruleTester = require('../../helpers/ruleTester');

ruleTester.run('flow-when-mark', rule, {
  valid: [
    {
      // Declares two when handlers

      filename: '~/app/server/flows/flow.js',
      code: `
        const when = {
          foo: {
            mounted1 (flow, when, services, mark) {
              mark.asDone();
            }
          },
          bar: {
            mounted2 (flow, when, mark) {
              mark.asDone();
            }
          }
        };
      `
    }, {
      // Declares three function variables

      filename: '~/app/server/flows/flow.js',
      code: `
        const bar = function (flow, when, services, mark) {
          mark.asDone();
        };

        const foo = function (flow, when, mark) {
          mark.asDone();
        };

        const baz = function (flow, when, mark) {
          mark.asDone();
        };

        const when = {
          foo,
          baz,
          bar
        };
      `
    }, {
      // Doesn't call mark or mark method

      filename: '~/app/server/flows/flow.js',
      code: `
        const bar = function (flow, when, services, mark) {};

        const when = {
          bar
        };
      `
    }
  ],

  invalid: [
    {
      // calls wrong mark methods

      filename: '~/app/server/flows/flow.js',
      code: `
        const foo = function (flow, when, mark) {
          mark.asFoo();
        };

        const bar = function (flow, when, services, mark) {
          mark.asBar();
        };

        const baz = function (flow, when, mark) {
          mark.asBaz();
        };

        const fu = function (flow, when, mark) {
          mark.asFu();
        };

        const when = {
          fuu: {
            mounted1 (flow, when, services, mark) {
              mark.asMounted1();
            },
            fu,
            foo
          },
          baa: {
            mounted3: (flow, when, services, mark) => {
              mark.asMounted3();
            },
            bar,
            baz
          } 
        };
      `,
      errors: [{
        message: `Unexpected method name 'asFoo', expected 'asDone'.`,
        type: 'FunctionExpression',
        line: 3,
        column: 11
      }, {
        message: `Unexpected method name 'asBar', expected 'asDone'.`,
        type: 'FunctionExpression',
        line: 7,
        column: 11
      }, {
        message: `Unexpected method name 'asBaz', expected 'asDone'.`,
        type: 'FunctionExpression',
        line: 11,
        column: 11
      }, {
        message: `Unexpected method name 'asFu', expected 'asDone'.`,
        type: 'FunctionExpression',
        line: 15,
        column: 11
      }, {
        message: `Unexpected method name 'asMounted1', expected 'asDone'.`,
        type: 'FunctionExpression',
        line: 21,
        column: 15
      }, {
        message: `Unexpected method name 'asMounted3', expected 'asDone'.`,
        type: 'ArrowFunctionExpression',
        line: 28,
        column: 15
      }]
    }, {
      // calls methods twice

      filename: '~/app/server/flows/flow.js',
      code: `
        const foo = function (flow, when, mark) {
          mark.asDone();
          mark.asDone();
        };

        const bar = function (flow, when, services, mark) {
          mark.asDone();
          mark.asDone();
        };

        const when = {
          fuu: {
            mounted1 (flow, when, services, mark) {
              mark.asDone();
              mark.asDone();
            },
            fu,
            function (flow, when, mark) {
              mark.asDone();
              mark.asDone();
            }
          },
          baa: {
            foo,
            mounted3: (flow, when, services, mark) => {
              mark.asDone();
              mark.asDone();
            },
            bar
          }
        };
      `,
      errors: [{
        message: `Unexpected multiple call to 'asDone'.`,
        type: 'FunctionExpression',
        line: 2,
        column: 21
      }, {
        message: `Unexpected multiple call to 'asDone'.`,
        type: 'FunctionExpression',
        line: 7,
        column: 21
      }, {
        message: `Unexpected multiple call to 'asDone'.`,
        type: 'FunctionExpression',
        line: 14,
        column: 22
      }, {
        message: `Unexpected multiple call to 'asDone'.`,
        type: 'FunctionExpression',
        line: 19,
        column: 22
      }, {
        message: `Unexpected multiple call to 'asDone'.`,
        type: 'ArrowFunctionExpression',
        line: 26,
        column: 23
      }]
    }, {
      // calls wrong mark method in if statement

      filename: '~/app/server/flows/flow.js',
      code: `
        const when = {
          foo: {
            mounted1 (flow, when, services, mark) {
              if (true) {
                mark.asMounted1();
                return;
              }
              mark.asDone();
            }
          },
          baz: {
            fuu (flow, when, mark) {
              if (true) {
                mark.asMounted2_1();
                return;
              }
              mark.asDone();
            },
            baa (flow, when, mark) {
              if (true) {
                mark.asMounted2_2();
                return;
              }
              mark.asDone();
            }
          }
        };
      `,
      errors: [{
        message: `Unexpected method name 'asMounted1', expected 'asDone'.`,
        type: 'FunctionExpression',
        line: 6,
        column: 17
      }, {
        message: `Unexpected method name 'asMounted2_1', expected 'asDone'.`,
        type: 'FunctionExpression',
        line: 15,
        column: 17
      }, {
        message: `Unexpected method name 'asMounted2_2', expected 'asDone'.`,
        type: 'FunctionExpression',
        line: 22,
        column: 17
      }]
    }, {
      // calls mark directly

      filename: '~/app/server/flows/flow.js',
      code: `
        const when = {
          foo: {
            mounted1 (flow, when, services, mark) {
              mark();
            }
          },
          baa: {
            fu (flow, when, mark) {
              mark();
            },
            ba (flow, when, mark) {
              mark.asDone();
            }
          }
        };
      `,
      errors: [{
        message: `Unexpected call to 'mark', expected call to its methods 'asDone'.`,
        type: 'FunctionExpression',
        line: 5,
        column: 15
      }, {
        message: `Unexpected call to 'mark', expected call to its methods 'asDone'.`,
        type: 'FunctionExpression',
        line: 10,
        column: 15
      }]
    }
  ]
});
