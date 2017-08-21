"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.messages = exports.ruleName = undefined;

exports.default = function (pattern, options) {
  return function (root, result) {
    var validOptions = (0, _utils.validateOptions)(result, ruleName, {
      actual: pattern,
      possible: [_lodash2.default.isRegExp, _lodash2.default.isString]
    }, {
      actual: options,
      possible: {
        resolveNestedSelectors: _lodash2.default.isBoolean
      },
      optional: true
    });
    if (!validOptions) {
      return;
    }

    var shouldResolveNestedSelectors = _lodash2.default.get(options, "resolveNestedSelectors");
    var normalizedPattern = _lodash2.default.isString(pattern) ? new RegExp(pattern) : pattern;

    root.walkRules(function (rule) {
      if ((0, _utils.cssRuleHasSelectorEndingWithColon)(rule)) {
        return;
      }

      // Only bother resolving selectors that have an interpolating &
      if (shouldResolveNestedSelectors && hasInterpolatingAmpersand(rule.selector)) {
        (0, _postcssResolveNestedSelector2.default)(rule.selector, rule).forEach(function (selector) {
          (0, _postcssSelectorParser2.default)(function (s) {
            return checkSelector(s, rule);
          }).process(selector);
        });
      } else {
        (0, _postcssSelectorParser2.default)(function (s) {
          return checkSelector(s, rule);
        }).process(rule.selector);
      }
    });

    function checkSelector(fullSelector, rule) {
      fullSelector.eachClass(function (classNode) {
        var value = classNode.value;
        var sourceIndex = classNode.sourceIndex;

        if (!normalizedPattern.test(value)) {
          (0, _utils.report)({
            result: result,
            ruleName: ruleName,
            message: messages.expected(value),
            node: rule,
            index: sourceIndex
          });
        }
      });
    }
  };
};

var _postcssResolveNestedSelector = require("postcss-resolve-nested-selector");

var _postcssResolveNestedSelector2 = _interopRequireDefault(_postcssResolveNestedSelector);

var _postcssSelectorParser = require("postcss-selector-parser");

var _postcssSelectorParser2 = _interopRequireDefault(_postcssSelectorParser);

var _lodash = require("lodash");

var _lodash2 = _interopRequireDefault(_lodash);

var _utils = require("../../utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ruleName = exports.ruleName = "selector-class-pattern";

var messages = exports.messages = (0, _utils.ruleMessages)(ruleName, {
  expected: function expected(selectorValue) {
    return "Expected class selector \"." + selectorValue + "\" to match specified pattern";
  }
});

// An "interpolating ampersand" means an "&" used to interpolate
// within another simple selector, rather than an "&" that
// stands on its own as a simple selector
function hasInterpolatingAmpersand(selector) {
  for (var i = 0, l = selector.length; i < l; i++) {
    if (selector[i] !== "&") {
      continue;
    }
    if (!_lodash2.default.isUndefined(selector[i - 1]) && !isCombinator(selector[i - 1])) {
      return true;
    }
    if (!_lodash2.default.isUndefined(selector[i + 1]) && !isCombinator(selector[i + 1])) {
      return true;
    }
  }
  return false;
}

function isCombinator(x) {
  return (/[\s+>~]/.test(x)
  );
}