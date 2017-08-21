"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (results) {
  var output = invalidOptionsFormatter(results);
  output += deprecationsFormatter(results);

  return results.reduce(function (output, result) {
    output += minimalFormatter({
      messages: result.warnings,
      source: result.source
    });
    return output;
  }, output);
};

var _chalk = require("chalk");

var _chalk2 = _interopRequireDefault(_chalk);

var _lodash = require("lodash");

var _lodash2 = _interopRequireDefault(_lodash);

var _formatter = require("postcss-reporter/lib/formatter");

var _formatter2 = _interopRequireDefault(_formatter);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var minimalFormatter = (0, _formatter2.default)({
  noIcon: true,
  noPlugin: true
});

function deprecationsFormatter(results) {
  var allDeprecationWarnings = _lodash2.default.flatMap(results, "deprecations");
  var uniqueDeprecationWarnings = _lodash2.default.uniqBy(allDeprecationWarnings, "text");

  if (!uniqueDeprecationWarnings || !uniqueDeprecationWarnings.length) {
    return "";
  }

  return uniqueDeprecationWarnings.reduce(function (output, warning) {
    output += _chalk2.default.yellow.bold(">> Deprecation Warning: ");
    output += warning.text;
    if (warning.reference) {
      output += _chalk2.default.yellow(" See: ");
      output += _chalk2.default.green.underline(warning.reference);
    }
    return output + "\n";
  }, "\n");
}

function invalidOptionsFormatter(results) {
  var allInvalidOptionWarnings = _lodash2.default.flatMap(results, function (r) {
    return r.invalidOptionWarnings.map(function (w) {
      return w.text;
    });
  });
  var uniqueInvalidOptionWarnings = _lodash2.default.uniq(allInvalidOptionWarnings);

  return uniqueInvalidOptionWarnings.reduce(function (output, warning) {
    output += _chalk2.default.red.bold(">> Invalid Option: ");
    output += warning;
    return output + "\n";
  }, "\n");
}