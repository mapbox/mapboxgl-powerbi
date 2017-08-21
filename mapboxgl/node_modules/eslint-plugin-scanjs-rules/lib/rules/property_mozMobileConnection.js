/**
 * @fileoverview Rule property_mozMobileConnection
 * @author ScanJS contributors
 * @copyright 2015 Mozilla Corporation. All rights reserved.
 */
"use strict";

module.exports = function (context) {

  return {
    "MemberExpression": function (node) {
      if (node.property.name == 'mozMobileConnection') {
        context.report(node, "mozMobileConnection can be unsafe");

      }
    }
  }

}
