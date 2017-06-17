'use strict';

const rule = require('../../../lib/rules/aggregate-commands-mark'),
      ruleTester = require('../../helpers/ruleTester');

ruleTester.run('aggregate-commands-mark', rule, {
  valid: [
    {
      // Declares two command handlers

      filename: '~/app/server/writeModel/collaboration/board.js',
      code: `
        const commands = {
          mount1 (board, command, mark) {
            mark.asDone();
          },
          mount2 (board, command, mark) {
            mark.asRejected();
          }
        };
      `
    }, {
      // Declares middleware command handlers

      filename: '~/app/server/writeModel/collaboration/board.js',
      code: `
        const commands = {
          mount3: [
            (board, command, services, mark) => {
              mark.asRejected();
            },
            (board, command, services, mark) => {
              mark.asReadyForNext();
            },
            (board, command, mark) => {
              mark.asDone();
            }
          ],
        };
      `
    }, {
      // Declares three function variables

      filename: '~/app/server/writeModel/collaboration/board.js',
      code: `
        const bar = function (board, command, services, mark) {
          mark.asDone();
        };

        const foo = function (board, command, mark) {
          mark.asDone();
        };

        const baz = function (board, command, mark) {
          mark.asReadyForNext();
        };

        const commands = {
          foo,

          mount3: [
            baz,
            bar
          ]
        };
      `
    }, {
      // Doesn't call mark or mark method

      filename: '~/app/server/writeModel/collaboration/board.js',
      code: `
        const bar = function (board, command, services, mark) {};

        const commands = {
          bar
        };
      `
    }
  ],

  invalid: [
    {
      // calls wrong mark methods

      filename: '~/app/server/writeModel/collaboration/board.js',
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

        const commands = {
          mount1 (board, command, services, mark) {
            mark.asMount1();
          },

          mount2: [
            (board, command, services, mark) => {
              mark.asMount2_1();
            },
            fu,
            function (board, command, mark) {
              mark.asMount2_2();
            },
            foo
          ],
          mount3: (board, command, services, mark) => {
            mark.asMount3();
          },
          bar,
          mount4: [
            (board, command, services, mark) => {
              mark.asMount4_1();
            },
            function (board, command, mark) {
              mark.asMount4_2();
            },
            baz
          ]
        };
      `,
      errors: [{
        message: `Unexpected method name 'asFoo', expected 'asDone or asRejected'.`,
        type: 'FunctionExpression',
        line: 3,
        column: 11
      }, {
        message: `Unexpected method name 'asBar', expected 'asDone or asRejected'.`,
        type: 'FunctionExpression',
        line: 7,
        column: 11
      }, {
        message: `Unexpected method name 'asBaz', expected 'asDone or asRejected'.`,
        type: 'FunctionExpression',
        line: 11,
        column: 11
      }, {
        message: `Unexpected method name 'asFu', expected 'asReadyForNext or asRejected'.`,
        type: 'FunctionExpression',
        line: 15,
        column: 11
      }, {
        message: `Unexpected method name 'asMount1', expected 'asDone or asRejected'.`,
        type: 'FunctionExpression',
        line: 20,
        column: 13
      }, {
        message: `Unexpected method name 'asMount2_1', expected 'asReadyForNext or asRejected'.`,
        type: 'ArrowFunctionExpression',
        line: 25,
        column: 15
      }, {
        message: `Unexpected method name 'asMount2_2', expected 'asReadyForNext or asRejected'.`,
        type: 'FunctionExpression',
        line: 29,
        column: 15
      }, {
        message: `Unexpected method name 'asMount3', expected 'asDone or asRejected'.`,
        type: 'ArrowFunctionExpression',
        line: 34,
        column: 13
      }, {
        message: `Unexpected method name 'asMount4_1', expected 'asReadyForNext or asRejected'.`,
        type: 'ArrowFunctionExpression',
        line: 39,
        column: 15
      }, {
        message: `Unexpected method name 'asMount4_2', expected 'asReadyForNext or asRejected'.`,
        type: 'FunctionExpression',
        line: 42,
        column: 15
      }]
    }, {
      // calls methods twice

      filename: '~/app/server/writeModel/collaboration/board.js',
      code: `
        const foo = function (board, command, mark) {
          mark.asDone();
          mark.asDone();
        };

        const bar = function (board, command, services, mark) {
          mark.asDone();
          mark.asDone();
        };

        const fu = function (board, command, mark) {
          mark.asReadyForNext();
          mark.asReadyForNext();
        };

        const commands = {
          mount1 (board, command, services, mark) {
            mark.asDone();
            mark.asDone();
          },

          mount2: [
            (board, command, services, mark) => {
              mark.asReadyForNext();
              mark.asReadyForNext();
            },
            fu,
            function (board, command, mark) {
              mark.asRejected();
              mark.asRejected();
            },
            foo
          ],
          mount3: (board, command, services, mark) => {
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
        message: `Unexpected multiple call to 'asReadyForNext'.`,
        type: 'FunctionExpression',
        line: 12,
        column: 20
      }, {
        message: `Unexpected multiple call to 'asDone'.`,
        type: 'FunctionExpression',
        line: 18,
        column: 18
      }, {
        message: `Unexpected multiple call to 'asReadyForNext'.`,
        type: 'ArrowFunctionExpression',
        line: 24,
        column: 13
      }, {
        message: `Unexpected multiple call to 'asRejected'.`,
        type: 'FunctionExpression',
        line: 29,
        column: 13
      }, {
        message: `Unexpected multiple call to 'asDone'.`,
        type: 'ArrowFunctionExpression',
        line: 35,
        column: 19
      }]
    }, {
      // calls mark directly

      filename: '~/app/server/writeModel/collaboration/board.js',
      code: `
        const commands = {
          mount1 (board, command, services, mark) {
            mark();
          },
          mount2: [
            (board, command, mark) => {
              mark();
            },
            (board, command, mark) => {
              mark.asDone();
            }
          ]
        };
      `,
      errors: [{
        message: `Unexpected call to 'mark', expected call to its methods 'asDone or asRejected'.`,
        type: 'FunctionExpression',
        line: 4,
        column: 13
      }, {
        message: `Unexpected call to 'mark', expected call to its methods 'asReadyForNext or asRejected'.`,
        type: 'ArrowFunctionExpression',
        line: 8,
        column: 15
      }]
    }
  ]
});
