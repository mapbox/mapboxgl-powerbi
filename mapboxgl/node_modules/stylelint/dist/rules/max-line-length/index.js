"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.messages = exports.ruleName = undefined;

exports.default = function (maxLength, options) {
  return function (root, result) {
    var validOptions = (0, _utils.validateOptions)(result, ruleName, {
      maxLength: _lodash.isNumber
    }, {
      actual: options,
      possible: {
        ignore: ["non-comments"]
      },
      optional: true
    });
    if (!validOptions) {
      return;
    }

    // Collapse all urls into something nice and short,
    // so they do not throw the game
    var rootString = root.toString().replace(/url\(.*\)/g, "url()");

    // Check first line
    checkNewline({ endIndex: 0 });

    // Check subsequent lines
    (0, _utils.styleSearch)({ source: rootString, target: ["\n"], checkComments: true }, checkNewline);

    function checkNewline(match) {
      var nextNewlineIndex = rootString.indexOf("\n", match.endIndex);

      // Accommodate last line
      if (nextNewlineIndex === -1) {
        nextNewlineIndex = rootString.length;
      }

      // If the line's length is less than or equal to the specified
      // max, ignore it
      if (nextNewlineIndex - match.endIndex <= maxLength) {
        return;
      }

      // If there are no spaces besides initial (indent) spaces, ignore it
      var lineString = rootString.slice(match.endIndex, nextNewlineIndex);
      if (lineString.replace(/^\s+/, "").indexOf(" ") === -1) {
        return;
      }

      if ((0, _utils.optionsHaveIgnored)(options, "non-comments")) {
        // This trimming business is to notice when the line starts a
        // comment but that comment is indented, e.g.
        //       /* something here */
        var nextTwoChars = rootString.slice(match.endIndex).trim().slice(0, 2);
        if (!match.insideComment && nextTwoChars !== "/*" && nextTwoChars !== "//") {
          return;
        }
      }

      (0, _utils.report)({
        message: messages.expected(maxLength),
        node: root,
        index: nextNewlineIndex - 1,
        result: result,
        ruleName: ruleName
      });
    }
  };
};

var _lodash = require("lodash");

var _utils = require("../../utils");

var ruleName = exports.ruleName = "max-line-length";

var messages = exports.messages = (0, _utils.ruleMessages)(ruleName, {
  expected: function expected(l) {
    return "Expected line length equal to or less than " + l + " characters";
  }
});