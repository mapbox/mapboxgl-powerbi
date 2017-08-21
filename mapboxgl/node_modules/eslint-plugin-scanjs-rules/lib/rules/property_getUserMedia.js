/**
 * @fileoverview Rule property_getUserMedia
 * @author ScanJS contributors
 * @copyright 2015 Mozilla Corporation. All rights reserved.
 */
"use strict";

module.exports = function (context) {

  return {
    "MemberExpression": function (node) {
      if (node.property.name == 'getUserMedia') {
        context.report(node, "getUserMedia can be unsafe");

      }
    }
  }

}
