/**
 * @fileoverview Rule property_mozNfc
 * @author ScanJS contributors
 * @copyright 2015 Mozilla Corporation. All rights reserved.
 */
"use strict";

module.exports = function (context) {

  return {
    "MemberExpression": function (node) {
      if (node.property.name == 'mozNfc') {
        context.report(node, "mozNfc can be unsafe");

      }
    }
  }

}
