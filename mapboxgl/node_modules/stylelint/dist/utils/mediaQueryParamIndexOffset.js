"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (atRule) {
  // Initial 1 is for the `@`
  var indexOffset = 1 + atRule.name.length;
  if (atRule.raw("afterName")) {
    indexOffset += atRule.raw("afterName").length;
  }
  return indexOffset;
};