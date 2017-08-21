"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (input, comparisonInput) {
  if (Array.isArray(input)) {
    return input.some(testAgainstStringOrArray);
  }
  return testAgainstStringOrArray(input);

  function testAgainstStringOrArray(value) {
    if (Array.isArray(comparisonInput)) {
      return comparisonInput.some(function (comparison) {
        return testAgainstString(value, comparison);
      });
    }
    return testAgainstString(value, comparisonInput);
  }

  function testAgainstString(value, comparison) {
    var comparisonIsRegex = comparison[0] === "/" && comparison[comparison.length - 1] === "/";
    if (comparisonIsRegex) {
      return new RegExp(comparison.slice(1, -1)).test(value);
    }
    return value === comparison;
  }
};