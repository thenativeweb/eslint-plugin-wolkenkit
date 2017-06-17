'use strict';

const rule = require('../../../lib/rules/aggregate-commands'),
      ruleTester = require('../../helpers/ruleTester');

ruleTester.run('aggregate-commands', rule, {
  valid: [
    {
      // Declares commands object as variable.

      filename: '~/app/server/writeModel/aggregate.js',
      code: `
        const commands = {};

        module.exports = {
          commands
        };
      `
    }, {
      //  Doesn't export commmands.

      filename: '~/app/server/readModel/aggregate.js',
      code: `
        const commands = '';
        const whatever = {};

        module.exports = {
          whatever
        };
      `
    }, {
      //  Declares commands as a string inside readModel.

      filename: '~/app/server/readModel/aggregate.js',
      code: `
        const commands = '';

        module.exports = {
          commands
        };
      `
    }
  ],

  invalid: [
    {
      // Declares commands as a number.

      filename: '~/app/server/writeModel/aggregate.js',
      code: `
        const commands = 2;

        module.exports = {
          commands
        };
      `,
      errors: [{
        message: `Expected 'commands' to be an object.`,
        type: 'VariableDeclaration',
        line: 2,
        column: 15
      }]
    }
  ]
});
