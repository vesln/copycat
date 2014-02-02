/**
 * Dependencies.
 */

var request = require('request');
var fs = require('fs');
var path = require('path');
var assert = require('assert');
var deepEqual = require('deep-eql');

/**
 * Options.
 */

var options = {
  fixtures: path.resolve('test/copycats'),
};

/**
 * Copycat stack.
 */

var stack = [];

/**
 * Requests for the current group.
 */

var requests = null;

/**
 * Start, record and finish a new copycat group with `name`.
 *
 * @param {String} name
 * @param {Function} fn [optional]
 * @api public
 */

function copycat(name, fn) {
  start(name);
  fn(end);
}

/**
 * Start a group with `name`.
 *
 * @param {String} name
 * @api public
 */

function start(name) {
  stack.push(name);
}

/**
 * End and store the last group.
 *
 * @api public
 */

function end() {
  var group = stack.pop();
  if (!requests) return;
  var data = JSON.stringify(requests);
  var dest = path.join(options.fixtures, group + '.json');
  fs.writeFileSync(dest, data, 'utf8');
  requests = null;
}

/**
 * Request copycat.
 *
 * @param {Object} options
 * @param {Function} fn
 * @api public
 */

function recorder(opts, fn) {
  var group = stack[stack.length - 1];
  var response = null;

  assert(group, 'please specify copycat group');
  recordings = load(group) || [];

  recordings.forEach(function(recording) {
    if (!deepEqual(recording.opts, opts)) return;
    response = recording;
  });

  if (response) {
    return fn(response.err, response.res, response.body);
  }

  request(opts, function(err, res, body) {
    requests = requests || [];
    requests.push({ opts: opts, err: err, res: res, body: body });
    fn.apply(null, arguments);
  });
}

/**
 * Load stored requests and responses for `group`.
 *
 * @param {Strin} group
 * @returns {Array}
 * @api private
 */

function load(group) {
  var dest = path.join(options.fixtures, group + '.json');
  var ret = null;
  var json = null;

  try {
    json = fs.readFileSync(dest, 'utf8');
    ret = JSON.parse(json);
  } catch (err) {}

  return ret;
}

/**
 * Configure.
 *
 * @param {Function} fn
 * @api public
 */

function configure(fn) {
  fn(options);
}

/**
 * Primary exports.
 */

module.exports = copycat;
module.exports.start = start;
module.exports.end = end;
module.exports.request = process.env.NODE_ENV === 'test' ? recorder : request;
module.exports.recorder = recorder;
module.exports.configure = configure;
