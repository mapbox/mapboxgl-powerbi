/**
 * @fileoverview Rule property_mozAlarms
 * @author ScanJS contributors
 * @copyright 2015 Mozilla Corporation. All rights reserved.
 */
"use strict";

module.exports = function (context) {

  return {
    "MemberExpression": function (node) {
      if (node.property.name == 'mozAlarms') {
        context.report(node, "mozAlarms can be unsafe");

      }
    }
  }

}
