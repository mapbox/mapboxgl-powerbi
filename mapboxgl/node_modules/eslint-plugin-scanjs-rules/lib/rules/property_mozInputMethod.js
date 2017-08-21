/**
 * @fileoverview Rule property_mozInputMethod
 * @author ScanJS contributors
 * @copyright 2015 Mozilla Corporation. All rights reserved.
 */
"use strict";

module.exports = function (context) {

  return {
    "MemberExpression": function (node) {
      if (node.property.name == 'mozInputMethod') {
        context.report(node, "mozInputMethod can be unsafe");

      }
    }
  }

}
