"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (decl) {
  var charsBeforeColon = decl.toString().indexOf(":");
  var charsAfterColon = decl.raw("between").length - decl.raw("between").indexOf(":");

  return charsBeforeColon + charsAfterColon;
};