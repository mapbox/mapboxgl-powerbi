"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (decl) {
  var prop = decl.prop;
  var value = decl.value;

  if (prop[0] === "$" && value[0] === "(" && value[value.length - 1] === ")" && value.indexOf(":") !== -1) {
    return true;
  }
  return false;
};