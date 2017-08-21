/**
 * @fileoverview Rule property_mozTCPSocket
 * @author ScanJS contributors
 * @copyright 2015 Mozilla Corporation. All rights reserved.
 */
"use strict";

module.exports = function (context) {

  return {
    "MemberExpression": function (node) {
      if (node.property.name == 'mozTCPSocket') {
        context.report(node, "mozTCPSocket can be unsafe");

      }
    }
  }

}
