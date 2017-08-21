"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (rule) {
  var selector = (0, _lodash.get)(rule, "raws.selector.raw", rule.selector);
  if (selector[selector.length - 1] === ":") {
    return true;
  }
  return false;
};

var _lodash = require("lodash");