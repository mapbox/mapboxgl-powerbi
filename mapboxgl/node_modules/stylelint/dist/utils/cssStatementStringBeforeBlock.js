"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (statement) {
  var _ref = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  var noBefore = _ref.noBefore;

  var result = "";
  if (statement.type !== "rule" && statement.type !== "atrule") {
    return result;
  }

  if (!noBefore) {
    result += statement.raw("before");
  }
  if (statement.type === "rule") {
    result += statement.selector;
  } else {
    result += "@" + statement.name + statement.raw("afterName") + statement.params;
  }
  result += statement.raw("between");
  return result;
};