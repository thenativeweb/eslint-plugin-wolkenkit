# eslint-plugin-wolkenkit

eslint-plugin-wolkenkit is a set of rules for ESLint.

## Table of contents

<!-- toc -->

- [Installation](#installation)
- [Quick start](#quick-start)
- [Using rules](#using-rules)
  * [Using rules for aggregates](#using-rules-for-aggregates)
  * [Using rules for flows](#using-rules-for-flows)
  * [Rules for lists](#rules-for-lists)
- [Running the build](#running-the-build)
- [License](#license)

<!-- tocstop -->

## Installation

```bash
$ npm install eslint-plugin-wolkenkit
```

## Quick start

First you need to add `eslint-plugin-wolkenkit` as a plugin to your ESLint configuration file. To improve readability you can skip the `eslint-plugin-` prefix.

```json
{
  "plugins": [
    "wolkenkit"
  ]
}
```

Then you need to configure the rules that you want to use as shown in the following example.

```json
{
  "rules": {
    "wolkenkit/aggregate-commands": 2,
    "wolkenkit/aggregate-commands-mark": 2,
    "wolkenkit/aggregate-commands-parameters": 2,
    "wolkenkit/aggregate-events": 2,
    "wolkenkit/aggregate-exports": 2,
    "wolkenkit/aggregate-initialstate": 2,
    "wolkenkit/aggregate-order": 2,

    "wolkenkit/flow-exports": 2,
    "wolkenkit/flow-identity": 2,
    "wolkenkit/flow-identity-parameters": 2,
    "wolkenkit/flow-initialState": 2,
    "wolkenkit/flow-order": 2,
    "wolkenkit/flow-transitions": 2,
    "wolkenkit/flow-transitions-parameters": 2,
    "wolkenkit/flow-when": 2,
    "wolkenkit/flow-when-mark": 2,
    "wolkenkit/flow-when-parameters": 2,

    "wolkenkit/list-exports": 2,
    "wolkenkit/list-fields": 2,
    "wolkenkit/list-order": 2,
    "wolkenkit/list-when": 2,
    "wolkenkit/list-when-mark": 2,
    "wolkenkit/list-when-parameters": 2
  }
}
```

Alternatively, you may enable all recommended rules at once.

```json
{
  "extends": [
    "plugin:wolkenkit/recommended"
  ]
}
```

## Using rules

### Using rules for aggregates

An aggregate is a module that exports `initialState`, `commands`, and `events`.

```javascript
const initialState = {};

const commands = {
  mount (board, command, services, mark) {
    // ...
  }
};

const events = {};

module.exports = { initialState, commands, events };
```

- `aggregate-commands` enforces that `commands` is an object.
- `aggregate-commands-mark` enforces command handlers to call a method of the mark parameter at the end of their code paths.
- `aggregate-commands-parameters` enforces that command handlers have a valid signature.
- `aggregate-events` enforces that `events` is an object.
- `aggregate-exports` enforces that aggregates export `initialState`, `commands` and `events`.
- `aggregate-initialstate` enforces that `initialState` is an object.
- `aggregate-order` enforces the order of `initialState`, `commands`, and `events`.

### Using rules for flows

A flow is a module that exports `when` if stateless, and `identity`, `initialState`, `transitions` and `when` if stateful.

```javascript
// stateless
const when = {
  bar (event, mark) {},
  baz (event, services, mark) {}
};

module.exports = { when };

// stateful
const identity = {
  foo (event) {
    // ...
  }
};

const initialState = {};

const transitions = {
  foo: {
    bar (flow) {
      // ...
    }
  }
};

const when = {
  foo: {
    bar (flow, event, mark) {},
    baz (flow, event, services, mark) {}
  }
};

module.exports = { identity, initialState, transitions, when };
```

- `flow-exports` enforces that flows export `when` if stateless and `identity`, `initialState`, `transitions` and `when` if stateful.
- `flow-identity` enforces that `identity` is an object.
- `flow-identity-parameters` enforces that identity handlers have a valid signature.
- `flow-initialState` enforces that `initialState` is an object.
- `floe-order` enforces the order of `identity`, `initialState`, `transitions`, and `when`.
- `flow-transitions` enforces that `transitions` is an object and contains objects.
- `flow-transitions-parameters` enforces that transition handlers have a valid signature.
- `flow-when` enforces that `when` is an object and contains objects.
- `flow-when-mark` enforces when handlers to call a method of the mark parameter at the end of their code paths.
- `flow-when-parameters` enforces that when handlers have a valid signature.

### Rules for lists

A list is a module that exports `fields` and `when`.

```javascript
const fields = {};

const when = {
  mounted (boards, event, services, mark) {
    // ...
  }
};

module.exports = { fields, when };
```

- `list-exports` enforces that list exports `fields` and `when`.
- `list-fields` enforces that `fields` is an object.
- `list-order` enforces the order of `fields` and `when`.
- `list-when` enforces that `when` is an object.
- `list-when-mark` enforces when handlers to call a method of the mark parameter at the end of their code paths.
- `list-when-parameters` enforces that when handlers have a valid signature.

## Running the build

To build this module use [roboter](https://www.npmjs.com/package/roboter).

```bash
$ bot
```

## License

Copyright (c) 2016-2017 the native web.

This program is free software: you can redistribute it and/or modify it under the terms of the GNU Lesser General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License along with this program. If not, see [GNU Licenses](http://www.gnu.org/licenses/).
