"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.messages = exports.ruleName = undefined;

exports.default = function (actual) {
  return function (root, result) {
    var validOptions = (0, _utils.validateOptions)(result, ruleName, { actual: actual });
    if (!validOptions) {
      return;
    }

    root.walkDecls(function (decl) {
      check((0, _utils.blurComments)(decl.toString()), decl);
    });

    root.walkAtRules(function (atRule) {
      var source = (0, _utils.cssStatementHasBlock)(atRule) ? (0, _utils.cssStatementStringBeforeBlock)(atRule, { noBefore: true }) : atRule.toString();
      check(source, atRule);
    });

    function check(value, node) {
      var ignorableIndexes = new Set();

      (0, _utils.styleSearch)({ source: value, target: "0" }, function (match) {
        var index = match.startIndex;

        // Given a 0 somewhere in the full property value (not in a string, thanks
        // to styleSearch) we need to isolate the value that contains the zero.
        // To do so, we'll find the last index before the 0 of a character that would
        // divide one value in a list from another, and the next index of such a
        // character; then we build a substring from those indexes, which we can
        // assess.

        // If a single value includes multiple 0's (e.g. 100.01px), we don't want
        // each 0 to be treated as a separate value, possibly resulting in multiple
        // warnings for the same value (e.g. 0.00px).
        //
        // This check prevents that from happening: we build and check against a
        // Set containing all the indexes that are part of a value already validated.
        if (ignorableIndexes.has(index)) {
          return;
        }

        var prevValueBreakIndex = (0, _lodash.findLastIndex)(value.substr(0, index), function (char) {
          return [" ", ",", ")", "(", "#"].indexOf(char) !== -1;
        });

        // Ignore hex colors
        if (value[prevValueBreakIndex] === "#") {
          return;
        }

        // If no prev break was found, this value starts at 0
        var valueWithZeroStart = prevValueBreakIndex === -1 ? 0 : prevValueBreakIndex + 1;

        var nextValueBreakIndex = (0, _lodash.findIndex)(value.substr(valueWithZeroStart), function (char) {
          return [" ", ",", ")"].indexOf(char) !== -1;
        });

        // If no next break was found, this value ends at the end of the string
        var valueWithZeroEnd = nextValueBreakIndex === -1 ? value.length : nextValueBreakIndex + valueWithZeroStart;

        var valueWithZero = value.slice(valueWithZeroStart, valueWithZeroEnd);

        // Add the indexes to ignorableIndexes so the same value will not
        // be checked multiple times.
        (0, _lodash.range)(valueWithZeroStart, valueWithZeroEnd).forEach(function (i) {
          return ignorableIndexes.add(i);
        });

        // Only pay attention if the value parses to 0
        if (parseFloat(valueWithZero, 10) !== 0) {
          return;
        }

        // If there is not a length unit at the end of this value, ignore.
        // (Length units are 2, 3, or 4 characters)
        var unitLength = function () {
          if (lengthUnits.has(valueWithZero.slice(-4))) {
            return 4;
          }
          if (lengthUnits.has(valueWithZero.slice(-3))) {
            return 3;
          }
          if (lengthUnits.has(valueWithZero.slice(-2))) {
            return 2;
          }
          return 0;
        }();

        if (!unitLength) {
          return;
        }

        (0, _utils.report)({
          message: messages.rejected,
          node: node,
          index: valueWithZeroEnd - unitLength,
          result: result,
          ruleName: ruleName
        });
      });
    }
  };
};

var _lodash = require("lodash");

var _utils = require("../../utils");

var ruleName = exports.ruleName = "number-zero-length-no-unit";
var messages = exports.messages = (0, _utils.ruleMessages)(ruleName, {
  rejected: "Unexpected unit on zero length number"
});

// Only length units can be left off
// cf. http://www.w3.org/TR/css3-values/#length-value
// cf. https://github.com/brigade/scss-lint/issues/154
var lengthUnits = new Set(["em", "ex", "ch", "vw", "vh", "cm", "mm", "in", "pt", "pc", "px", "rem", "vmin", "vmax"]);