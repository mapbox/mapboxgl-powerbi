"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (a, b) {
  var arrayA = typeof a === "string" ? a.split(",") : a;
  var arrayB = typeof b === "string" ? b.split(",") : b;
  for (var i = 0, l = arrayB.length; i < l; i++) {
    if (arrayA[i] > arrayB[i]) {
      return false;
    }
    if (arrayB[i] > arrayA[i]) {
      return true;
    }
  }
  return false;
};