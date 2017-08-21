"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.messages = exports.ruleName = undefined;

exports.default = function (expectation) {
  return function (root, result) {
    var validOptions = (0, _utils.validateOptions)(result, ruleName, {
      actual: expectation,
      possible: ["short", "long"]
    });
    if (!validOptions) {
      return;
    }

    root.walkDecls(function (decl) {
      var declString = decl.toString();

      (0, _utils.styleSearch)({ source: declString, target: "#" }, function (match) {

        var hexMatch = /^#[0-9A-Za-z]+/.exec(declString.substr(match.startIndex));
        if (!hexMatch) {
          return;
        }

        var hexValue = hexMatch[0];

        if (expectation === "long" && hexValue.length !== 4 && hexValue.length !== 5) {
          return;
        }

        if (expectation === "short" && (hexValue.length < 6 || !canShrink(hexValue))) {
          return;
        }

        var variant = expectation === "long" ? longer : shorter;

        (0, _utils.report)({
          message: messages.expected(hexValue, variant(hexValue)),
          node: decl,
          index: match.startIndex,
          result: result,
          ruleName: ruleName
        });
      });
    });
  };
};

var _utils = require("../../utils");

var ruleName = exports.ruleName = "color-hex-length";

var messages = exports.messages = (0, _utils.ruleMessages)(ruleName, {
  expected: function expected(h, v) {
    return "Expected \"" + h + "\" to be \"" + v + "\"";
  }
});

function canShrink(hex) {
  hex = hex.toLowerCase();

  return hex[1] === hex[2] && hex[3] === hex[4] && hex[5] === hex[6] && (hex.length === 7 || hex.length === 9 && hex[7] === hex[8]);
}

function shorter(hex) {
  var hexVariant = "#";
  for (var i = 1; i < hex.length; i = i + 2) {
    hexVariant += hex[i];
  }
  return hexVariant;
}

function longer(hex) {
  var hexVariant = "#";
  for (var i = 1; i < hex.length; i++) {
    hexVariant += hex[i] + hex[i];
  }
  return hexVariant;
}