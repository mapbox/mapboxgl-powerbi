'use strict';

var _cssColorNames = require('css-color-names');

var _cssColorNames2 = _interopRequireDefault(_cssColorNames);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Determine if name is a valid CSS color name
 * @param {String} name - name to determine if is valid CSS color name
 * @return {Boolean} - is name a valid CSS color name?
 */
module.exports = function (name) {
  return typeof name === 'string' ? !!_cssColorNames2.default[name.toLowerCase()] : false;
};