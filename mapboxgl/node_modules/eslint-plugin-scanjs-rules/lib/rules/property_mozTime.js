/**
 * @fileoverview Rule property_mozTime
 * @author ScanJS contributors
 * @copyright 2015 Mozilla Corporation. All rights reserved.
 */
"use strict";

module.exports = function (context) {

  return {
    "MemberExpression": function (node) {
      if (node.property.name == 'mozTime') {
        context.report(node, "mozTime can be unsafe");

      }
    }
  }

}
