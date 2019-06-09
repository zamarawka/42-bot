const uniq = require('lodash/uniq');
const random = require('lodash/random');

module.exports.isAngry = rate => random(100) < rate;

module.exports.mergeRegexp = (left, right) => (new RegExp(left.source + right.source, uniq(left.flags + right.flags).join('')));
