/**
 * @fileoverview Rule property_mozMobileConnections
 * @author ScanJS contributors
 * @copyright 2015 Mozilla Corporation. All rights reserved.
 */
"use strict";

module.exports = function (context) {

  return {
    "MemberExpression": function (node) {
      if (node.property.name == 'mozMobileConnections') {
        context.report(node, "mozMobileConnections can be unsafe");

      }
    }
  }

}
