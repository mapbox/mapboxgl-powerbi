"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (word) {
  if (word[0] === "$") return true;
  if (word[0] === "@") return true;
  if (word.slice(0, 2) === "--") return true;
  if (word.slice(0, 4) === "var(") return true;
  return false;
};