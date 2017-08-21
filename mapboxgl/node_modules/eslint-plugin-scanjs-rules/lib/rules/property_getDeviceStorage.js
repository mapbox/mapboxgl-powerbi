/**
 * @fileoverview Rule property_getDeviceStorage
 * @author ScanJS contributors
 * @copyright 2015 Mozilla Corporation. All rights reserved.
 */
"use strict";

module.exports = function (context) {

  return {
    "MemberExpression": function (node) {
      if (node.property.name == 'getDeviceStorage') {
        context.report(node, "getDeviceStorage can be unsafe");

      }
    }
  }

}
