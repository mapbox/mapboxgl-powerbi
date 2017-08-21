/**
 * @fileoverview Rule property_mozPermissionSettings
 * @author ScanJS contributors
 * @copyright 2015 Mozilla Corporation. All rights reserved.
 */
"use strict";

module.exports = function (context) {

  return {
    "MemberExpression": function (node) {
      if (node.property.name == 'mozPermissionSettings') {
        context.report(node, "mozPermissionSettings can be unsafe");

      }
    }
  }

}
