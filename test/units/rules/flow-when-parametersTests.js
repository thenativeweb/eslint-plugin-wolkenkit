'use strict';

const rule = require('../../../lib/rules/flow-when-parameters'),
      ruleTester = require('../../helpers/ruleTester');

ruleTester.run('flow-when-parameters', rule, {
  valid: [
    {
      // Declares two stateless when handler

      filename: '~/app/server/flows/flow.js',
      code: `
        const when = {
          bar (event, mark) {},
          fuu (event, services, mark) {}
        };
      `
    }, {
      // Declares two stateful when handler

      filename: '~/app/server/flows/flow.js',
      code: `        
        const identity = {};
        const initialState = {};
        const transitions = {};
        const when = {
          foo : {
            bar (flow, event, mark) {}
          },
          baz: {
            fuu (flow, event, services, mark) {}
          }
        };
      `
    }, {
      // Declares two stateless when handler outside the when object

      filename: '~/app/server/flows/flow.js',
      code: `
        const fu = function (event, mark) {
          flow();
        };
        const ba = function (event, services, mark) {
          flow();
        };

        const when = {
          bar (event, mark) {},
          fu,
          fuu (event, services, mark) {}
        };
      `
    }, {
      // Declares two stateful when handler outside the when object

      filename: '~/app/server/flows/flow.js',
      code: `
        const identity = {};
        const initialState = {};
        const transitions = {};
        const fu = function (flow, event, mark) {
          flow();
        };
        const ba = function (flow, event, services, mark) {
          flow();
        };

        const when = {
          foo: {
            bar (flow, event, mark) {},
            fu
          },
          baz: {
            fuu (flow, event, services, mark) {}
          }
        };
      `
    }
  ],

  invalid: [
    {
      // Declares functions with wrong first parameter name in stateless when object

      filename: '~/app/server/flows/flow.js',
      code: `
        const bar = function (blub, mark) {};
        const ba = function(blub, services, mark) {};

        const when = {
          fu (blub, services, mark) {},
          bar,
          mounted3: (blub, mark) => {},
          ba
        };
      `,
      errors: [{
        message: `Expected first parameter to be named 'event'.`,
        type: 'VariableDeclaration',
        line: 2,
        column: 31
      }, {
        message: `Expected first parameter to be named 'event'.`,
        type: 'VariableDeclaration',
        line: 3,
        column: 29
      }, {
        message: `Expected first parameter to be named 'event'.`,
        type: 'VariableDeclaration',
        line: 6,
        column: 15
      }, {
        message: `Expected first parameter to be named 'event'.`,
        type: 'VariableDeclaration',
        line: 8,
        column: 22
      }]
    }, {
      // Declares functions with wrong second parameter name in stateless when object

      filename: '~/app/server/flows/flow.js',
      code: `
        const bar = function (event, blub) {};
        const ba = function(event, blub, mark) {};

        const when = {
          fu (event, blub, mark) {},
          bar,
          mounted3: (event, blub) => {},
          ba
        };
      `,
      errors: [{
        message: `Expected second parameter to be named 'mark'.`,
        type: 'VariableDeclaration',
        line: 2,
        column: 38
      }, {
        message: `Expected second parameter to be named 'services'.`,
        type: 'VariableDeclaration',
        line: 3,
        column: 36
      }, {
        message: `Expected second parameter to be named 'services'.`,
        type: 'VariableDeclaration',
        line: 6,
        column: 22
      }, {
        message: `Expected second parameter to be named 'mark'.`,
        type: 'VariableDeclaration',
        line: 8,
        column: 29
      }]
    }, {
      // Declares functions with more than three parameter in stateless when object

      filename: '~/app/server/flows/flow.js',
      code: `
        const bar = function (event, services, mark, blub) {};

        const when = {
          fu (event, mark) {},
          bar,
          mounted3: (event, services, mark, blub) => {}
        };
      `,
      errors: [{
        message: `Expected maximum 3 parameters event, services, mark).`,
        type: 'VariableDeclaration',
        line: 2,
        column: 21
      }, {
        message: `Expected maximum 3 parameters event, services, mark).`,
        type: 'VariableDeclaration',
        line: 7,
        column: 11
      }]
    }, {
      // Declares functions with less than 2 parameters in stateless when object

      filename: '~/app/server/flows/flow.js',
      code: `
        const bar = function (event) {};
        const when = {
          fu () {},
          bar,
          mounted3: (event) => {}
        };
      `,
      errors: [{
        message: `Expected minimum 2 parameters event, mark).`,
        type: 'VariableDeclaration',
        line: 2,
        column: 21
      }, {
        message: `Expected minimum 2 parameters event, mark).`,
        type: 'VariableDeclaration',
        line: 4,
        column: 11
      }, {
        message: `Expected minimum 2 parameters event, mark).`,
        type: 'VariableDeclaration',
        line: 6,
        column: 11
      }]
    }, {
      // Declares properties which are no functions in stateless when object

      filename: '~/app/server/flows/flow.js',
      code: `
        const bar = '1';

        const fuu = 2;

        const when = {
          fu: 3,
          fuu,
          bar,
          mounted3: (event, mark) => {}
        };
      `,
      errors: [{
        message: `Expected 'fu' to be a function.`,
        type: 'VariableDeclaration',
        line: 7,
        column: 11
      }, {
        message: `Expected 'fuu' to be a function.`,
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
      // Declares functions with wrong first parameter name in stateful when object

      filename: '~/app/server/flows/flow.js',
      code: `
        const identity = {};
        const initialState = {};
        const transitions = {};

        const bar = function (blub, event, mark) {};
        const ba = function(blub, event, services, mark) {};

        const when = {
          foo: {
            fu (blub, event, services, mark) {},
            bar,
            mounted3: (blub, event, mark) => {}
          }, 
          baz: {
            ba
          }
        };
      `,
      errors: [{
        message: `Expected first parameter to be named 'flow'.`,
        type: 'VariableDeclaration',
        line: 6,
        column: 31
      }, {
        message: `Expected first parameter to be named 'flow'.`,
        type: 'VariableDeclaration',
        line: 7,
        column: 29
      }, {
        message: `Expected first parameter to be named 'flow'.`,
        type: 'VariableDeclaration',
        line: 11,
        column: 17
      }, {
        message: `Expected first parameter to be named 'flow'.`,
        type: 'VariableDeclaration',
        line: 13,
        column: 24
      }]
    }, {
      // Declares functions with wrong second parameter name in stateful when object

      filename: '~/app/server/flows/flow.js',
      code: `
        const identity = {};
        const initialState = {};
        const transitions = {};

        const bar = function (flow, blub, mark) {};
        const ba = function(flow, blub, services, mark) {};

        const when = {
          foo: {
            fu (flow, blub, services, mark) {},
            bar,
            mounted3: (flow, blub, mark) => {}
          }, 
          baz: {
            ba
          }
        };
      `,
      errors: [{
        message: `Expected second parameter to be named 'event'.`,
        type: 'VariableDeclaration',
        line: 6,
        column: 37
      }, {
        message: `Expected second parameter to be named 'event'.`,
        type: 'VariableDeclaration',
        line: 7,
        column: 35
      }, {
        message: `Expected second parameter to be named 'event'.`,
        type: 'VariableDeclaration',
        line: 11,
        column: 23
      }, {
        message: `Expected second parameter to be named 'event'.`,
        type: 'VariableDeclaration',
        line: 13,
        column: 30
      }]
    }, {
      // Declares functions with wrong third parameter name in stateful when object

      filename: '~/app/server/flows/flow.js',
      code: `
        const identity = {};
        const initialState = {};
        const transitions = {};

        const bar = function (flow, event, blub) {};
        const ba = function(flow, event, blub, mark) {};

        const when = {
          foo: {
            fu (flow, event, blub, mark) {},
            bar,
            mounted3: (flow, event, blub) => {}
          }, 
          baz: {
            ba
          }
        };
      `,
      errors: [{
        message: `Expected third parameter to be named 'mark'.`,
        type: 'VariableDeclaration',
        line: 6,
        column: 44
      }, {
        message: `Expected third parameter to be named 'services'.`,
        type: 'VariableDeclaration',
        line: 7,
        column: 42
      }, {
        message: `Expected third parameter to be named 'services'.`,
        type: 'VariableDeclaration',
        line: 11,
        column: 30
      }, {
        message: `Expected third parameter to be named 'mark'.`,
        type: 'VariableDeclaration',
        line: 13,
        column: 37
      }]
    }, {
      // Declares functions with wrong fourth parameter name in stateful when object

      filename: '~/app/server/flows/flow.js',
      code: `
        const identity = {};
        const initialState = {};
        const transitions = {};

        const bar = function (flow, event, mark) {};
        const ba = function(flow, event, services, blub) {};

        const when = {
          foo: {
            fu (flow, event, services, blub) {},
            bar,
            mounted3: (flow, event, mark) => {}
          }, 
          baz: {
            ba
          }
        };
      `,
      errors: [{
        message: `Expected fourth parameter to be named 'mark'.`,
        type: 'VariableDeclaration',
        line: 7,
        column: 52
      }, {
        message: `Expected fourth parameter to be named 'mark'.`,
        type: 'VariableDeclaration',
        line: 11,
        column: 40
      }]
    }, {
      // Declares functions with more than four parameter in stateful when object

      filename: '~/app/server/flows/flow.js',
      code: `
        const identity = {};
        const initialState = {};
        const transitions = {};

        const bar = function (flow, event, services, mark, blub) {};

        const when = {
          foo: {
            fu (flow, event, mark) {}
          },
          baz: {
            bar,
            mounted3: (flow, event, services, mark, blub) => {}
          }
        };
      `,
      errors: [{
        message: `Expected maximum 4 parameters flow, event, services, mark).`,
        type: 'VariableDeclaration',
        line: 6,
        column: 21
      }, {
        message: `Expected maximum 4 parameters flow, event, services, mark).`,
        type: 'VariableDeclaration',
        line: 14,
        column: 13
      }]
    }, {
      // Declares functions with less than 3 parameters in stateful when object

      filename: '~/app/server/flows/flow.js',
      code: `
        const identity = {};
        const initialState = {};
        const transitions = {};

        const bar = function (flow, event) {};
        const when = {
          foo: {
            fu () {},
            bar
          },
          baz: {
            mounted3: (flow) => {}
          }
        };
      `,
      errors: [{
        message: `Expected minimum 3 parameters flow, event, mark).`,
        type: 'VariableDeclaration',
        line: 6,
        column: 21
      }, {
        message: `Expected minimum 3 parameters flow, event, mark).`,
        type: 'VariableDeclaration',
        line: 9,
        column: 13
      }, {
        message: `Expected minimum 3 parameters flow, event, mark).`,
        type: 'VariableDeclaration',
        line: 13,
        column: 13
      }]
    }, {
      // Declares properties which are no functions in stateful when object

      filename: '~/app/server/flows/flow.js',
      code: `
        const identity = {};
        const initialState = {};
        const transitions = {};

        const bar = '1';

        const fuu = 2;

        const when = {
          foo: {
            fu: 3,
            fuu
          },
          baz: {
            bar,
            mounted3: (flow, event, mark) => {}
          }
        };
      `,
      errors: [{
        message: `Expected 'fu' to be a function.`,
        type: 'VariableDeclaration',
        line: 12,
        column: 13
      }, {
        message: `Expected 'fuu' to be a function.`,
        type: 'Program',
        line: 13,
        column: 13
      }, {
        message: `Expected 'bar' to be a function.`,
        type: 'Program',
        line: 16,
        column: 13
      }]
    }
  ]
});
