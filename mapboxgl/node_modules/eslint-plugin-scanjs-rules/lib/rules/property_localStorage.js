/**
 * @fileoverview Rule property_localStorage
 * @author ScanJS contributors
 * @copyright 2015 Mozilla Corporation. All rights reserved.
 */
"use strict";

module.exports = function (context) {

  return {
    "MemberExpression": function (node) {
      if (node.property.name == 'localStorage') {
        context.report(node, "localStorage can be unsafe");

      }
    }
  }

}
