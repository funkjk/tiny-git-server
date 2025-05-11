'use strict';

const fs = require('..');
const assert = require('assert').strict;

assert.strictEqual(fs(), 'Hello from fs');
console.info('fs tests passed');
