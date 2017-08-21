/**
 * @fileoverview Rule property_mozNotification
 * @author ScanJS contributors
 * @copyright 2015 Mozilla Corporation. All rights reserved.
 */
"use strict";

module.exports = function (context) {

  return {
    "MemberExpression": function (node) {
      if (node.property.name == 'mozNotification') {
        context.report(node, "mozNotification can be unsafe");

      }
    }
  }

}
