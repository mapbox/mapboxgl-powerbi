/**
 * @fileoverview Rule property_mozNetworkStats
 * @author ScanJS contributors
 * @copyright 2015 Mozilla Corporation. All rights reserved.
 */
"use strict";

module.exports = function (context) {

  return {
    "MemberExpression": function (node) {
      if (node.property.name == 'mozNetworkStats') {
        context.report(node, "mozNetworkStats can be unsafe");

      }
    }
  }

}
