'use strict';

const rule = require('../../../lib/rules/list-when-mark'),
      ruleTester = require('../../helpers/ruleTester');

ruleTester.run('list-when-mark', rule, {
  valid: [
    {
      // Declares two command handlers

      filename: '~/app/server/readModel/lists/list.js',
      code: `
        const when = {
          mounted1 (board, command, mark) {
            mark.asDone();
          },
          mounted2 (board, command, mark) {
            mark.asDone();
          }
        };
      `
    }, {
      // Declares three function variables

      filename: '~/app/server/readModel/lists/list.js',
      code: `
        const bar = function (board, command, services, mark) {
          mark.asDone();
        };

        const foo = function (board, command, mark) {
          mark.asDone();
        };

        const baz = function (board, command, mark) {
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

      filename: '~/app/server/readModel/lists/list.js',
      code: `
        const bar = function (board, command, services, mark) {};

        const when = {
          bar
        };
      `
    }
  ],

  invalid: [
    {
      // calls wrong mark methods

      filename: '~/app/server/readModel/lists/list.js',
      code: `
        const foo = function (board, command, mark) {
          mark.asFoo();
        };

        const bar = function (board, command, services, mark) {
          mark.asBar();
        };

        const baz = function (board, command, mark) {
          mark.asBaz();
        };

        const fu = function (board, command, mark) {
          mark.asFu();
        };

        const when = {
          mounted1 (board, command, services, mark) {
            mark.asMounted1();
          },
          fu,
          foo,
          mounted3: (board, command, services, mark) => {
            mark.asMounted3();
          },
          bar,
          baz
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
        line: 20,
        column: 13
      }, {
        message: `Unexpected method name 'asMounted3', expected 'asDone'.`,
        type: 'ArrowFunctionExpression',
        line: 25,
        column: 13
      }]
    }, {
      // calls methods twice

      filename: '~/app/server/readModel/lists/list.js',
      code: `
        const foo = function (board, command, mark) {
          mark.asDone();
          mark.asDone();
        };

        const bar = function (board, command, services, mark) {
          mark.asDone();
          mark.asDone();
        };

        const when = {
          mounted1 (board, command, services, mark) {
            mark.asDone();
            mark.asDone();
          },
          fu,
          function (board, command, mark) {
            mark.asDone();
            mark.asDone();
          },
          foo,
          mounted3: (board, command, services, mark) => {
            mark.asDone();
            mark.asDone();
          },
          bar
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
        line: 13,
        column: 20
      }, {
        message: `Unexpected multiple call to 'asDone'.`,
        type: 'FunctionExpression',
        line: 18,
        column: 20
      }, {
        message: `Unexpected multiple call to 'asDone'.`,
        type: 'ArrowFunctionExpression',
        line: 23,
        column: 21
      }]
    }, {
      // calls wron mark method in if statement

      filename: '~/app/server/readModel/lists/list.js',
      code: `
        const when = {
          mounted1 (board, command, services, mark) {
            if (true) {
              mark.asMounted1();
              return;
            }
            mark.asDone();
          },
          mounted2: (board, command, mark) => {
            if (true) {
              mark.asMounted2_1();
              return;
            }
            mark.asDone();
          },
          mounted3 (board, command, mark) {
            if (true) {
              mark.asMounted2_2();
              return;
            }
            mark.asDone();
          }
        };
      `,
      errors: [{
        message: `Unexpected method name 'asMounted1', expected 'asDone'.`,
        type: 'FunctionExpression',
        line: 5,
        column: 15
      }, {
        message: `Unexpected method name 'asMounted2_1', expected 'asDone'.`,
        type: 'ArrowFunctionExpression',
        line: 12,
        column: 15
      }, {
        message: `Unexpected method name 'asMounted2_2', expected 'asDone'.`,
        type: 'FunctionExpression',
        line: 19,
        column: 15
      }]
    }, {
      // calls mark directly

      filename: '~/app/server/readModel/lists/list.js',
      code: `
        const when = {
          mounted1 (board, command, services, mark) {
            mark();
          },
          mounted2: (board, command, mark) => {
            mark();
          },
          mounted3: (board, command, mark) => {
            mark.asDone();
          }
        };
      `,
      errors: [{
        message: `Unexpected call to 'mark', expected call to its methods 'asDone'.`,
        type: 'FunctionExpression',
        line: 4,
        column: 13
      }, {
        message: `Unexpected call to 'mark', expected call to its methods 'asDone'.`,
        type: 'ArrowFunctionExpression',
        line: 7,
        column: 13
      }]
    }
  ]
});
