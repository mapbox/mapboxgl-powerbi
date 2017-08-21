"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.messages = exports.ruleName = undefined;

exports.default = function (expectation) {
  return function (root, result) {
    var validOptions = (0, _utils.validateOptions)(result, ruleName, {
      actual: expectation,
      possible: ["never", "always-where-possible"]
    });
    if (!validOptions) {
      return;
    }

    var namedColors = Object.keys(_representations2.default);

    root.walkDecls(function (decl) {
      (0, _postcssValueParser2.default)(decl.value).walk(function (node) {
        var value = node.value;
        var type = node.type;
        var sourceIndex = node.sourceIndex;

        // Return early if neither a word nor a function

        if (NODE_TYPES.indexOf(type) === -1) {
          return;
        }

        // Check for named colors for "never" option
        if (expectation === "never" && type === "word" && namedColors.indexOf(value) !== -1) {
          complain(messages.rejected(value), decl, (0, _utils.declarationValueIndexOffset)(decl) + sourceIndex);
        }
        // Check "always-where-possible" option
        if (expectation === "always-where-possible") {
          // First by checking for alternative color function representations
          if (type === "function" && FUNC_REPRESENTATION.indexOf(value) !== -1) {
            (function () {
              var cssString = _postcssValueParser2.default.stringify(node).replace(/\s+/g, "");
              namedColors.forEach(function (namedColor) {
                if (_representations2.default[namedColor].func.indexOf(cssString) !== -1) {
                  complain(messages.expected(namedColor, cssString), decl, (0, _utils.declarationValueIndexOffset)(decl) + sourceIndex);
                }
              });
              // Then by checking for alternative hex representations
            })();
          } else {
              namedColors.forEach(function (namedColor) {
                if (_representations2.default[namedColor].hex.indexOf(value) !== -1) {
                  complain(messages.expected(namedColor, value), decl, (0, _utils.declarationValueIndexOffset)(decl) + sourceIndex);
                }
              });
            }
        }
      });
    });

    function complain(message, node, index) {
      (0, _utils.report)({
        result: result,
        ruleName: ruleName,
        message: message,
        node: node,
        index: index
      });
    }
  };
};

var _postcssValueParser = require("postcss-value-parser");

var _postcssValueParser2 = _interopRequireDefault(_postcssValueParser);

var _utils = require("../../utils");

var _representations = require("./representations");

var _representations2 = _interopRequireDefault(_representations);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ruleName = exports.ruleName = "color-named";

var messages = exports.messages = (0, _utils.ruleMessages)(ruleName, {
  expected: function expected(named, original) {
    return "Expected \"" + original + "\" to be \"" + named + "\"";
  },
  rejected: function rejected(named) {
    return "Unexpected named color \"" + named + "\"";
  }
});

var FUNC_REPRESENTATION = ["rgb", "rgba", "hsl", "hsla", "hwb", "gray"];
var NODE_TYPES = ["word", "function"];