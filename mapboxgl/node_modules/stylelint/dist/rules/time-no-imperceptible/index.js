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
      if (LONGHAND_PROPERTIES_TO_CHECK.indexOf(decl.prop) !== -1) {
        if (isImperceptibleTime(decl.value)) {
          complain(messages.rejected(decl.value), decl);
        }
      }

      if (SHORTHAND_PROPERTIES_TO_CHECK.indexOf(decl.prop) !== -1) {
        var valueList = _postcss2.default.list.space(decl.value);
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = valueList[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var value = _step.value;

            if (isImperceptibleTime(value)) {
              complain(messages.rejected(value), decl, decl.value.indexOf(value));
            }
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator.return) {
              _iterator.return();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }
      }
    });

    function isImperceptibleTime(time) {
      var parsedTime = _postcssValueParser2.default.unit(time);
      if (!parsedTime) return false;
      if (parsedTime.unit === "ms" && parsedTime.number <= MINIMUM_MILLISECONDS) {
        return true;
      }
      if (parsedTime.unit === "s" && parsedTime.number * 1000 <= MINIMUM_MILLISECONDS) {
        return true;
      }
      return false;
    }

    function complain(message, decl) {
      var offset = arguments.length <= 2 || arguments[2] === undefined ? 0 : arguments[2];

      (0, _utils.report)({
        result: result,
        ruleName: ruleName,
        message: message,
        index: (0, _utils.declarationValueIndexOffset)(decl) + offset,
        node: decl
      });
    }
  };
};

var _postcss = require("postcss");

var _postcss2 = _interopRequireDefault(_postcss);

var _postcssValueParser = require("postcss-value-parser");

var _postcssValueParser2 = _interopRequireDefault(_postcssValueParser);

var _utils = require("../../utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ruleName = exports.ruleName = "time-no-imperceptible";

var messages = exports.messages = (0, _utils.ruleMessages)(ruleName, {
  rejected: function rejected(time) {
    return "Unexpected time value \"" + time + "\" less than or equal to 100ms";
  }
});

var LONGHAND_PROPERTIES_TO_CHECK = ["transition-duration", "transition-delay", "animation-duration", "animation-delay"];

var SHORTHAND_PROPERTIES_TO_CHECK = ["transition", "animation"];

var MINIMUM_MILLISECONDS = 100;