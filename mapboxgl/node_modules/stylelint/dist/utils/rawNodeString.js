"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (node) {
  var result = "";
  if (node.raw("before")) {
    result += node.raw("before");
  }
  result += node.toString();
  return result;
};