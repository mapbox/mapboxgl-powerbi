"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (str) {
  var blurChar = arguments.length <= 1 || arguments[1] === undefined ? "`" : arguments[1];

  return str.replace(/\/\*.*\*\//g, blurChar);
};