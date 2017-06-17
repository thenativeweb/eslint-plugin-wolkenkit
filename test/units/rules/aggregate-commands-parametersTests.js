'use strict';

const rule = require('../../../lib/rules/aggregate-commands-parameters'),
      ruleTester = require('../../helpers/ruleTester');

ruleTester.run('aggregate-commands-parameters', rule, {
  valid: [
    {
      // Declares two commands with different parameters

      filename: '~/app/server/writeModel/collaboration/board.js',
      code: `
        const commands = {
          mount1 (board, command, mark) {},
          mount2 (board, command, services, mark) {}
        };
      `
    }, {
      // Declares two middleware arrow functions with different parameters

      filename: '~/app/server/writeModel/collaboration/board.js',
      code: `
        const commands = {
          mount3: [
            (board, command, services, mark) => {},
            (board, command, mark) => {}
          ],
        };
      `
    }, {
      // Declares two middleware functions with different parameters

      filename: '~/app/server/writeModel/collaboration/board.js',
      code: `
        const commands = {
          mount3: [
            function (board, command, services, mark) {},
            function (board, command, mark) {}
          ],
        };
      `
    }, {
      // Adds call expressions as command handler and middleware.
      filename: '~/app/server/writeModel/collaboration/board.js',
      code: `
        const only = require('only');

        const commands = {
          mount1: only.ifExists(),
          mount2: (board, command, services, mark) => {},
          mount3: [
            (board, command, services, mark) => {},
            function (board, command, mark) {},
            only.ifExists()
          ],
        };
      `
    }, {
      // Declares two commands with different parameters outside the commands object

      filename: '~/app/server/writeModel/collaboration/board.js',
      code: `
        const bar = function (board, command, services, mark) {};

        const foo = function (board, command, mark) {};

        const commands = {
          foo,

          mount3: [
            bar
          ]
        };
      `
    }
  ],

  invalid: [
    {
      // Declares functions with wrong first parameter name

      filename: '~/app/server/writeModel/collaboration/board.js',
      code: `
        const bar = function (blub, command, services, mark) {
          mark.asDone();
        };

        const foo = function (blub, command, mark) {
          mark.asDone();
        };

        const commands = {
          mount1 (blub, command, services, mark) {
            mark.asDone();
          },

          mount2: [
            (blub, command, services, mark) => {
              mark.asReadyForNext();
              mark.asRejected();
            },
            function (blub, command, mark) {
              mark.asDone();
              mark.asRejected();
            },
            foo
          ],
          bar,
          mount3: (blub, command, services, mark) => {
            mark.asDone();
          }
        };
      `,
      errors: [{
        message: `Expected first parameter to be named 'board'.`,
        type: 'VariableDeclaration',
        line: 2,
        column: 31
      }, {
        message: `Expected first parameter to be named 'board'.`,
        type: 'VariableDeclaration',
        line: 6,
        column: 31
      }, {
        message: `Expected first parameter to be named 'board'.`,
        type: 'VariableDeclaration',
        line: 11,
        column: 19
      }, {
        message: `Expected first parameter to be named 'board'.`,
        type: 'VariableDeclaration',
        line: 16,
        column: 14
      }, {
        message: `Expected first parameter to be named 'board'.`,
        type: 'VariableDeclaration',
        line: 20,
        column: 23
      }, {
        message: `Expected first parameter to be named 'board'.`,
        type: 'VariableDeclaration',
        line: 27,
        column: 20
      }]
    }, {
      // Declares functions with wrong second parameter name

      filename: '~/app/server/writeModel/collaboration/board.js',
      code: `
        const bar = function (board, blub, services, mark) {
          mark.asDone();
        };

        const foo = function (board, blub, mark) {
          mark.asDone();
        };

        const commands = {
          mount1 (board, blub, services, mark) {
            mark.asDone();
          },

          mount2: [
            (board, blub, services, mark) => {
              mark.asReadyForNext();
              mark.asRejected();
            },
            function (board, blub, mark) {
              mark.asDone();
              mark.asRejected();
            },
            foo
          ],
          bar,
          mount3: (board, blub, services, mark) => {
            mark.asDone();
          }
        };
      `,
      errors: [{
        message: `Expected second parameter to be named 'command'.`,
        type: 'VariableDeclaration',
        line: 2,
        column: 38
      }, {
        message: `Expected second parameter to be named 'command'.`,
        type: 'VariableDeclaration',
        line: 6,
        column: 38
      }, {
        message: `Expected second parameter to be named 'command'.`,
        type: 'VariableDeclaration',
        line: 11,
        column: 26
      }, {
        message: `Expected second parameter to be named 'command'.`,
        type: 'VariableDeclaration',
        line: 16,
        column: 21
      }, {
        message: `Expected second parameter to be named 'command'.`,
        type: 'VariableDeclaration',
        line: 20,
        column: 30
      }, {
        message: `Expected second parameter to be named 'command'.`,
        type: 'VariableDeclaration',
        line: 27,
        column: 27
      }]
    }, {
      // Declares functions with wrong third parameter name

      filename: '~/app/server/writeModel/collaboration/board.js',
      code: `
        const bar = function (board, command, blub, mark) {
          mark.asDone();
        };

        const foo = function (board, command, blub) {
          mark.asDone();
        };

        const commands = {
          mount1 (board, command, blub, mark) {
            mark.asDone();
          },

          mount2: [
            (board, command, blub, mark) => {
              mark.asReadyForNext();
              mark.asRejected();
            },
            function (board, command, blub) {
              mark.asDone();
              mark.asRejected();
            },
            foo
          ],
          bar,
          mount3: (board, command, blub, mark) => {
            mark.asDone();
          }
        };
      `,
      errors: [{
        message: `Expected third parameter to be named 'services'.`,
        type: 'VariableDeclaration',
        line: 2,
        column: 47
      }, {
        message: `Expected third parameter to be named 'mark'.`,
        type: 'VariableDeclaration',
        line: 6,
        column: 47
      }, {
        message: `Expected third parameter to be named 'services'.`,
        type: 'VariableDeclaration',
        line: 11,
        column: 35
      }, {
        message: `Expected third parameter to be named 'services'.`,
        type: 'VariableDeclaration',
        line: 16,
        column: 30
      }, {
        message: `Expected third parameter to be named 'mark'.`,
        type: 'VariableDeclaration',
        line: 20,
        column: 39
      }, {
        message: `Expected third parameter to be named 'services'.`,
        type: 'VariableDeclaration',
        line: 27,
        column: 36
      }]
    }, {
      // Declares functions with wrong fourth parameter name

      filename: '~/app/server/writeModel/collaboration/board.js',
      code: `
        const bar = function (board, command, services, blub) {
          mark.asDone();
        };

        const foo = function (board, command, mark) {
          mark.asDone();
        };

        const commands = {
          mount1 (board, command, services, blub) {
            mark.asDone();
          },

          mount2: [
            (board, command, services, blub) => {
              mark.asReadyForNext();
              mark.asRejected();
            },
            function (board, command, mark) {
              mark.asDone();
              mark.asRejected();
            },
            foo
          ],
          bar,
          mount3: (board, command, services, blub) => {
            mark.asDone();
          }
        };
      `,
      errors: [{
        message: `Expected fourth parameter to be named 'mark'.`,
        type: 'VariableDeclaration',
        line: 2,
        column: 57
      }, {
        message: `Expected fourth parameter to be named 'mark'.`,
        type: 'VariableDeclaration',
        line: 11,
        column: 45
      }, {
        message: `Expected fourth parameter to be named 'mark'.`,
        type: 'VariableDeclaration',
        line: 16,
        column: 40
      }, {
        message: `Expected fourth parameter to be named 'mark'.`,
        type: 'VariableDeclaration',
        line: 27,
        column: 46
      }]
    }, {
      // Declares functions with more than four parameters

      filename: '~/app/server/writeModel/collaboration/board.js',
      code: `
        const bar = function (board, command, services, mark, blub) {
          mark.asDone();
        };

        const foo = function (board, command, mark) {
          mark.asDone();
        };

        const commands = {
          mount1 (board, command, services, mark, blub) {
            mark.asDone();
          },

          mount2: [
            (board, command, services, mark, blub) => {
              mark.asReadyForNext();
              mark.asRejected();
            },
            function (board, command, mark) {
              mark.asDone();
              mark.asRejected();
            },
            foo
          ],
          bar,
          mount3: (board, command, services, mark, blub) => {
            mark.asDone();
          }
        };
      `,
      errors: [{
        message: `Expected maximum 4 parameters (board, command, services, mark).`,
        type: 'VariableDeclaration',
        line: 2,
        column: 21
      }, {
        message: `Expected maximum 4 parameters (board, command, services, mark).`,
        type: 'VariableDeclaration',
        line: 11,
        column: 11
      }, {
        message: `Expected maximum 4 parameters (board, command, services, mark).`,
        type: 'VariableDeclaration',
        line: 16,
        column: 13
      }, {
        message: `Expected maximum 4 parameters (board, command, services, mark).`,
        type: 'VariableDeclaration',
        line: 27,
        column: 11
      }]
    }, {
      // Declares functions with less than three parameters

      filename: '~/app/server/writeModel/collaboration/board.js',
      code: `
        const bar = function (board, command, services, mark) {
          mark.asDone();
        };

        const foo = function (board, command) {
          mark.asDone();
        };

        const commands = {
          mount1 (board, command, services, mark) {
            mark.asDone();
          },

          mount2: [
            (board, command, services, mark) => {
              mark.asReadyForNext();
              mark.asRejected();
            },
            function (board, command) {
              mark.asDone();
              mark.asRejected();
            },
            foo
          ],
          bar,
          mount3: (board, command) => {
            mark.asDone();
          }
        };
      `,
      errors: [{
        message: `Expected minimum 3 parameters (board, command, mark).`,
        type: 'VariableDeclaration',
        line: 6,
        column: 21
      }, {
        message: `Expected minimum 3 parameters (board, command, mark).`,
        type: 'VariableDeclaration',
        line: 20,
        column: 13
      }, {
        message: `Expected minimum 3 parameters (board, command, mark).`,
        type: 'VariableDeclaration',
        line: 27,
        column: 11
      }]
    }, {
      // Declares properties which are no functions or arrays.

      filename: '~/app/server/writeModel/collaboration/board.js',
      code: `
        const bar = '1';

        const foo = 2;

        const commands = {
          mount1: 3,
          mount2: [
            4,
            function (board, command, mark) {
              mark.asDone();
              mark.asRejected();
            },
            foo
          ],
          bar,
          mount3: (board, command, mark) => {
            mark.asDone();
          }
        };
      `,
      errors: [{
        message: `Expected 'mount1' to be a function or an array.`,
        type: 'VariableDeclaration',
        line: 7,
        column: 11
      }, {
        message: `Expected '4' to be a function.`,
        type: 'VariableDeclaration',
        line: 9,
        column: 13
      }, {
        message: `Expected 'foo' to be a function.`,
        type: 'Program',
        line: 14,
        column: 13
      }, {
        message: `Expected 'bar' to be a function or an array.`,
        type: 'Program',
        line: 16,
        column: 11
      }]
    }
  ]
});
