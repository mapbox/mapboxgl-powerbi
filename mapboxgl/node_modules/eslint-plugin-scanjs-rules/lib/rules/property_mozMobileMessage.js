/**
 * @fileoverview Rule property_mozMobileMessage
 * @author ScanJS contributors
 * @copyright 2015 Mozilla Corporation. All rights reserved.
 */
"use strict";

module.exports = function (context) {

  return {
    "MemberExpression": function (node) {
      if (node.property.name == 'mozMobileMessage') {
        context.report(node, "mozMobileMessage can be unsafe");

      }
    }
  }

}
