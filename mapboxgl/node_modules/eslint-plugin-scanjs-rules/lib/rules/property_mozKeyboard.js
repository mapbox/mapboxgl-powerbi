/**
 * @fileoverview Rule property_mozKeyboard
 * @author ScanJS contributors
 * @copyright 2015 Mozilla Corporation. All rights reserved.
 */
"use strict";

module.exports = function (context) {

  return {
    "MemberExpression": function (node) {
      if (node.property.name == 'mozKeyboard') {
        context.report(node, "mozKeyboard can be unsafe");

      }
    }
  }

}
