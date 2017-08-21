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

    root.walkAtRules("media", function (atRule) {
      (0, _execall2.default)(/\((.*?)\)/g, atRule.params).forEach(function (mediaFeatureMatch) {
        var splitMediaFeature = mediaFeatureMatch.sub[0].trim().split(/\s+/);
        if (splitMediaFeature.length === 1) {
          return;
        }

        // Ignore the last one
        for (var i = 0, l = splitMediaFeature.length - 1; i < l; i++) {
          var mediaFeaturePart = splitMediaFeature[i];

          // This part is valid if it is punctuation,
          // it ends with punctuation,
          // the next part is punctuation,
          // or the next part begins with punctuation
          if (isPunctuation(mediaFeaturePart)) {
            continue;
          }
          if (endsWithPunctuation(mediaFeaturePart)) {
            continue;
          }
          var nextPart = splitMediaFeature[i + 1];
          if (isPunctuation(nextPart)) {
            continue;
          }
          if (startsWithPunctuation(nextPart)) {
            continue;
          }

          return (0, _utils.report)({
            result: result,
            ruleName: ruleName,
            message: messages.rejected,
            node: atRule,
            index: (0, _utils.mediaQueryParamIndexOffset)(atRule) + mediaFeatureMatch.index
          });
        }
      });
    });
  };
};

var _execall = require("execall");

var _execall2 = _interopRequireDefault(_execall);

var _utils = require("../../utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ruleName = exports.ruleName = "media-feature-no-missing-punctuation";

var messages = exports.messages = (0, _utils.ruleMessages)(ruleName, {
  rejected: "Unexpected missing punctuation within non-boolean media feature"
});

var PUNCTUATION = [":", "=", ">", ">=", "<", "<="];

function isPunctuation(str) {
  return PUNCTUATION.indexOf(str) !== -1;
}

function endsWithPunctuation(str) {
  return isPunctuation(str.slice(-1)) || isPunctuation(str.slice(-2));
}

function startsWithPunctuation(str) {
  return isPunctuation(str[0]) || isPunctuation(str.slice(0, 2));
}