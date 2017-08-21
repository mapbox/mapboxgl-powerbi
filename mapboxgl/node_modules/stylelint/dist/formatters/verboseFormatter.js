"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (results) {
  var output = (0, _stringFormatter2.default)(results);

  var sourceWord = results.length > 1 ? "sources" : "source";
  output += _chalk2.default.bold.underline.cyan("\n" + results.length + " " + sourceWord + " checked\n\n");
  results.forEach(function (result) {
    var formatting = "green";
    if (result.errored) {
      formatting = "red.bold";
    } else if (result.warnings.length) {
      formatting = "yellow.bold";
    }
    output += _lodash2.default.get(_chalk2.default, formatting)(result.source + "\n");
  });

  var warnings = _lodash2.default.flatten(results.map(function (r) {
    return r.warnings;
  }));
  var warningsBySeverity = _lodash2.default.groupBy(warnings, "severity");
  var problemWord = warnings.length === 1 ? "problem" : "problems";

  output += _chalk2.default.bold.underline.cyan("\n" + warnings.length + " " + problemWord + " found\n");

  _lodash2.default.forOwn(warningsBySeverity, function (warningList, severityLevel) {
    var warningsByRule = _lodash2.default.groupBy(warningList, "rule");
    output += _chalk2.default.bold("\nSeverity level \"" + severityLevel + "\": " + warningList.length + "\n");
    _lodash2.default.forOwn(warningsByRule, function (list, rule) {
      output += "- " + rule + ": " + list.length + "\n";
    });
  });

  return output + "\n";
};

var _lodash = require("lodash");

var _lodash2 = _interopRequireDefault(_lodash);

var _stringFormatter = require("./stringFormatter");

var _stringFormatter2 = _interopRequireDefault(_stringFormatter);

var _chalk = require("chalk");

var _chalk2 = _interopRequireDefault(_chalk);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }