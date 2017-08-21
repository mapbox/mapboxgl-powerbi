/**
 * @fileoverview Rule property_mgmt
 * @author ScanJS contributors
 * @copyright 2015 Mozilla Corporation. All rights reserved.
 */
"use strict";

module.exports = function (context) {

  return {
    "MemberExpression": function (node) {
      if (node.property.name == 'mgmt') {
        context.report(node, "mgmt can be unsafe");

      }
    }
  }

}
