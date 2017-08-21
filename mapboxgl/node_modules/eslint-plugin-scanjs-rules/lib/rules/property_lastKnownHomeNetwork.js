/**
 * @fileoverview Rule property_lastKnownHomeNetwork
 * @author ScanJS contributors
 * @copyright 2015 Mozilla Corporation. All rights reserved.
 */
"use strict";

module.exports = function (context) {

  return {
    "MemberExpression": function (node) {
      if (node.property.name == 'lastKnownHomeNetwork') {
        context.report(node, "lastKnownHomeNetwork can be unsafe");

      }
    }
  }

}
