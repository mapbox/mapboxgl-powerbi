"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.messages = exports.ruleName = undefined;

exports.default = function (expectation) {
  return function (root, result) {
    var validOptions = (0, _utils.validateOptions)(result, ruleName, {
      actual: expectation,
      possible: ["single-where-required", "single-where-recommended", "single-unless-keyword", "double-where-required", "double-where-recommended", "double-unless-keyword"]
    });
    if (!validOptions) {
      return;
    }

    root.walkDecls("font-family", function (decl) {
      _postcss2.default.list.comma(decl.value).forEach(function (familyName) {
        checkFamilyName(familyName, decl);
      });
    });

    function checkFamilyName(rawFamily, decl) {
      if ((0, _utils.cssWordIsVariable)(rawFamily)) {
        return;
      }

      var quoteType = getQuoteType(rawFamily);
      // Clean the family of its quotes
      var family = rawFamily.replace(/^['"]|['"]$/g, "");

      // Disallow quotes around (case-insensitive) keywords in all cases
      if (FONT_FAMILY_KEYWORDS.indexOf(family.toLowerCase()) !== -1) {
        if (quoteType !== "none") {
          return complain(messages.expected("no", family), family, decl);
        }
        return;
      }

      var required = quotesRequired(family);
      var recommended = quotesRecommended(family);

      switch (expectation) {
        case "single-where-required":
          if (!required && quoteType !== "none") {
            return complain(messages.expected("no", family), family, decl);
          }
          if (required && quoteType !== "single") {
            return complain(messages.expected("single", family), family, decl);
          }
          return;
        case "single-where-recommended":
          if (!recommended && quoteType !== "none") {
            return complain(messages.expected("no", family), family, decl);
          }
          if (recommended && quoteType !== "single") {
            return complain(messages.expected("single", family), family, decl);
          }
          return;
        case "single-unless-keyword":
          if (quoteType !== "single") {
            return complain(messages.expected("single", family), family, decl);
          }
          return;
        case "double-where-required":
          if (!required && quoteType !== "none") {
            return complain(messages.expected("no", family), family, decl);
          }
          if (required && quoteType !== "double") {
            return complain(messages.expected("double", family), family, decl);
          }
          return;
        case "double-where-recommended":
          if (!recommended && quoteType !== "none") {
            return complain(messages.expected("no", family), family, decl);
          }
          if (recommended && quoteType !== "double") {
            return complain(messages.expected("double", family), family, decl);
          }
          return;
        case "double-unless-keyword":
          if (quoteType !== "double") {
            return complain(messages.expected("double", family), family, decl);
          }
          return;
        default:
          return;
      }
    }

    function complain(message, family, decl) {
      (0, _utils.report)({
        result: result,
        ruleName: ruleName,
        message: message,
        node: decl,
        word: family
      });
    }
  };
};

var _postcss = require("postcss");

var _postcss2 = _interopRequireDefault(_postcss);

var _utils = require("../../utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ruleName = exports.ruleName = "font-family-name-quotes";

var messages = exports.messages = (0, _utils.ruleMessages)(ruleName, {
  expected: function expected(style, family) {
    return "Expected " + style + " quotes around font-family name \"" + family + "\"";
  }
});

var FONT_FAMILY_KEYWORDS = ["inherit", "serif", "sans-serif", "cursive", "fantasy", "monospace"];

// "To avoid mistakes in escaping, it is recommended to quote font family names
// that contain white space, digits, or punctuation characters other than hyphens"
// (https://www.w3.org/TR/CSS2/fonts.html#font-family-prop)
function quotesRecommended(family) {
  return !/^[-a-zA-Z]+$/.test(family);
}

// Quotes are required if the family is not a valid CSS identifier
// (regexes from https://mathiasbynens.be/notes/unquoted-font-family)
function quotesRequired(family) {
  return family.split(/\s+/).some(function (word) {
    return (/^(-?\d|--)/.test(word) || !/^[-_a-zA-Z0-9\u00A0-\u10FFFF]+$/.test(word)
    );
  });
}

function getQuoteType(str) {
  if (str[0] && str[str.length - 1] === "\"") {
    return "double";
  }
  if (str[0] && str[str.length - 1] === "'") {
    return "single";
  }
  return "none";
}