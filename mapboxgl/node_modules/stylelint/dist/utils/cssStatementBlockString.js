"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (statement) {
  if (!(0, _cssStatementHasBlock2.default)(statement)) {
    return;
  }
  return (0, _rawNodeString2.default)(statement).slice((0, _cssStatementStringBeforeBlock2.default)(statement).length);
};

var _rawNodeString = require("./rawNodeString");

var _rawNodeString2 = _interopRequireDefault(_rawNodeString);

var _cssStatementHasBlock = require("./cssStatementHasBlock");

var _cssStatementHasBlock2 = _interopRequireDefault(_cssStatementHasBlock);

var _cssStatementStringBeforeBlock = require("./cssStatementStringBeforeBlock");

var _cssStatementStringBeforeBlock2 = _interopRequireDefault(_cssStatementStringBeforeBlock);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }