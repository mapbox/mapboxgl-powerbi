/**
 * @fileoverview Rule property_lastKnownNetwork
 * @author ScanJS contributors
 * @copyright 2015 Mozilla Corporation. All rights reserved.
 */
"use strict";

module.exports = function (context) {

  return {
    "MemberExpression": function (node) {
      if (node.property.name == 'lastKnownNetwork') {
        context.report(node, "lastKnownNetwork can be unsafe");

      }
    }
  }

}
