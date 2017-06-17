'use strict';

const rule = require('../../../lib/rules/list-when-parameters'),
      ruleTester = require('../../helpers/ruleTester');

ruleTester.run('list-when-parameters', rule, {
  valid: [
    {
      // Declares two events with different parameters

      filename: '~/app/server/readModel/lists/boards.js',
      code: `
        const when = {
          mounted1 (boards, event, mark) {},
          mounted2 (boards, event, services, mark) {}
        };
      `
    }, {
      // Declares two events with different parameters outside the when object

      filename: '~/app/server/readModel/lists/boards.js',
      code: `
        const bar = function (boards, event, services, mark) {};

        const foo = function (boards, event, mark) {};

        const when = {
          foo,
          bar
        };
      `
    }
  ],

  invalid: [
    {
      // Declares functions with wrong first parameter name

      filename: '~/app/server/readModel/lists/boards.js',
      code: `
        const bar = function (blub, event, services, mark) {
          mark.asDone();
        };

        const foo = function (blub, event, mark) {
          mark.asDone();
        };

        const when = {
          mounted1 (blub, event, services, mark) {
            mark.asDone();
          },
          foo,
          bar,
          mounted3: (blub, event, services, mark) => {
            mark.asDone();
          }
        };
      `,
      errors: [{
        message: `Expected first parameter to be named 'boards'.`,
        type: 'VariableDeclaration',
        line: 2,
        column: 31
      }, {
        message: `Expected first parameter to be named 'boards'.`,
        type: 'VariableDeclaration',
        line: 6,
        column: 31
      }, {
        message: `Expected first parameter to be named 'boards'.`,
        type: 'VariableDeclaration',
        line: 11,
        column: 21
      }, {
        message: `Expected first parameter to be named 'boards'.`,
        type: 'VariableDeclaration',
        line: 16,
        column: 22
      }]
    }, {
      // Declares functions with wrong second parameter name

      filename: '~/app/server/readModel/lists/boards.js',
      code: `
        const bar = function (boards, blub, services, mark) {
          mark.asDone();
        };

        const foo = function (boards, blub, mark) {
          mark.asDone();
        };

        const when = {
          mounted1 (boards, blub, services, mark) {
            mark.asDone();
          },
          foo,
          bar,
          mounted3: (boards, blub, services, mark) => {
            mark.asDone();
          }
        };
      `,
      errors: [{
        message: `Expected second parameter to be named 'event'.`,
        type: 'VariableDeclaration',
        line: 2,
        column: 39
      }, {
        message: `Expected second parameter to be named 'event'.`,
        type: 'VariableDeclaration',
        line: 6,
        column: 39
      }, {
        message: `Expected second parameter to be named 'event'.`,
        type: 'VariableDeclaration',
        line: 11,
        column: 29
      }, {
        message: `Expected second parameter to be named 'event'.`,
        type: 'VariableDeclaration',
        line: 16,
        column: 30
      }]
    }, {
      // Declares functions with wrong third parameter name

      filename: '~/app/server/readModel/lists/boards.js',
      code: `
        const bar = function (boards, event, blub, mark) {
          mark.asDone();
        };

        const foo = function (boards, event, blub) {
          mark.asDone();
        };

        const when = {
          mounted1 (boards, event, blub, mark) {
            mark.asDone();
          },
          foo,
          bar,
          mounted3: (boards, event, blub, mark) => {
            mark.asDone();
          }
        };
      `,
      errors: [{
        message: `Expected third parameter to be named 'services'.`,
        type: 'VariableDeclaration',
        line: 2,
        column: 46
      }, {
        message: `Expected third parameter to be named 'mark'.`,
        type: 'VariableDeclaration',
        line: 6,
        column: 46
      }, {
        message: `Expected third parameter to be named 'services'.`,
        type: 'VariableDeclaration',
        line: 11,
        column: 36
      }, {
        message: `Expected third parameter to be named 'services'.`,
        type: 'VariableDeclaration',
        line: 16,
        column: 37
      }]
    }, {
      // Declares functions with wrong fourth parameter name

      filename: '~/app/server/readModel/lists/boards.js',
      code: `
        const bar = function (boards, event, services, blub) {
          mark.asDone();
        };

        const foo = function (boards, event, mark) {
          mark.asDone();
        };

        const when = {
          mounted1 (boards, event, services, blub) {
            mark.asDone();
          },
          foo,
          bar,
          mounted3: (boards, event, services, blub) => {
            mark.asDone();
          }
        };
      `,
      errors: [{
        message: `Expected fourth parameter to be named 'mark'.`,
        type: 'VariableDeclaration',
        line: 2,
        column: 56
      }, {
        message: `Expected fourth parameter to be named 'mark'.`,
        type: 'VariableDeclaration',
        line: 11,
        column: 46
      }, {
        message: `Expected fourth parameter to be named 'mark'.`,
        type: 'VariableDeclaration',
        line: 16,
        column: 47
      }]
    }, {
      // Declares functions with more than four parameters

      filename: '~/app/server/readModel/lists/boards.js',
      code: `
        const bar = function (boards, event, services, mark, blub) {
          mark.asDone();
        };

        const foo = function (boards, event, mark) {
          mark.asDone();
        };

        const when = {
          mounted1 (boards, event, services, mark, blub) {
            mark.asDone();
          },
          foo,
          bar,
          mounted3: (boards, event, services, mark, blub) => {
            mark.asDone();
          }
        };
      `,
      errors: [{
        message: `Expected maximum 4 parameters (boards, event, services, mark).`,
        type: 'VariableDeclaration',
        line: 2,
        column: 21
      }, {
        message: `Expected maximum 4 parameters (boards, event, services, mark).`,
        type: 'VariableDeclaration',
        line: 11,
        column: 11
      }, {
        message: `Expected maximum 4 parameters (boards, event, services, mark).`,
        type: 'VariableDeclaration',
        line: 16,
        column: 11
      }]
    }, {
      // Declares functions with less than three parameters

      filename: '~/app/server/readModel/lists/boards.js',
      code: `
        const bar = function (boards, event, services, mark) {
          mark.asDone();
        };

        const foo = function (boards, event) {
          mark.asDone();
        };

        const when = {
          mounted1 (boards, event, services, mark) {
            mark.asDone();
          },
          function (boards, event) {
            mark.asDone();
            mark.asRejected();
          },
          foo,
          bar,
          mounted3: (boards, event) => {
            mark.asDone();
          }
        };
      `,
      errors: [{
        message: `Expected minimum 3 parameters (boards, event, mark).`,
        type: 'VariableDeclaration',
        line: 6,
        column: 21
      }, {
        message: `Expected minimum 3 parameters (boards, event, mark).`,
        type: 'VariableDeclaration',
        line: 14,
        column: 11
      }, {
        message: `Expected minimum 3 parameters (boards, event, mark).`,
        type: 'VariableDeclaration',
        line: 20,
        column: 11
      }]
    }, {
      // Declares properties which are no functions or arrays.

      filename: '~/app/server/readModel/lists/boards.js',
      code: `
        const bar = '1';

        const foo = 2;

        const when = {
          mounted1: 3,
          foo,
          bar,
          mounted3: (boards, event, mark) => {
            mark.asDone();
          }
        };
      `,
      errors: [{
        message: `Expected 'mounted1' to be a function.`,
        type: 'VariableDeclaration',
        line: 7,
        column: 11
      }, {
        message: `Expected 'foo' to be a function.`,
        type: 'Program',
        line: 8,
        column: 11
      }, {
        message: `Expected 'bar' to be a function.`,
        type: 'Program',
        line: 9,
        column: 11
      }]
    }, {
      // Adds call expressions as when handler and middleware.

      filename: '~/app/server/readModel/lists/boards.js',
      code: `
        const only = require('only');

        const when = {
          mounted1: only.ifExists(),
          mounted2: (boards, event, services, mark) => {}
        };
      `,
      errors: [{
        message: `Expected 'mounted1' to be a function.`,
        type: 'VariableDeclaration',
        line: 5,
        column: 11
      }]
    }
  ]
});
