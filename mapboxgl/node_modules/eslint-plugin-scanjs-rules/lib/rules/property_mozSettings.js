/**
 * @fileoverview Rule property_mozSettings
 * @author ScanJS contributors
 * @copyright 2015 Mozilla Corporation. All rights reserved.
 */
"use strict";

module.exports = function (context) {

  return {
    "MemberExpression": function (node) {
      if (node.property.name == 'mozSettings') {
        context.report(node, "mozSettings can be unsafe");

      }
    }
  }

}
