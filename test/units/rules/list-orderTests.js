'use strict';

const rule = require('../../../lib/rules/list-order'),
      ruleTester = require('../../helpers/ruleTester');

ruleTester.run('list-order', rule, {
  valid: [{
    // Defines identifiers and properties in correct order.

    filename: '~/app/server/readModel/lists/list.js',
    code: `
      const fields = {};
      const when = {};

      module.exports = {
        fields,
        when
      };
    `
  }],

  invalid: [{
    // Defines identifiers in wrong order.

    filename: '~/app/server/readModel/lists/list.js',
    code: `
      const when = {};
      const fields = {};

      module.exports = {
        fields,
        when
      };
    `,
    errors: [{
      message: `Expected 'when' to be placed after 'fields'.`,
      type: 'Program',
      line: 2,
      column: 13
    }, {
      message: `Expected 'fields' to be placed before 'when'.`,
      type: 'Program',
      line: 3,
      column: 13
    }]
  }, {
    // Defines properties in wrong order.

    filename: '~/app/server/readModel/lists/list.js',
    code: `
      const fields = {};
      const when = {};

      module.exports = {
        when,
        fields
      };
    `,
    errors: [{
      message: `Expected 'when' to be placed after 'fields'.`,
      type: 'Program',
      line: 6,
      column: 9
    }, {
      message: `Expected 'fields' to be placed before 'when'.`,
      type: 'Program',
      line: 7,
      column: 9
    }]
  }]
});
