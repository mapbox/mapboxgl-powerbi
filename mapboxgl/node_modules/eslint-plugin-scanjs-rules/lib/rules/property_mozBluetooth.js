/**
 * @fileoverview Rule property_mozBluetooth
 * @author ScanJS contributors
 * @copyright 2015 Mozilla Corporation. All rights reserved.
 */
"use strict";

module.exports = function (context) {

  return {
    "MemberExpression": function (node) {
      if (node.property.name == 'mozBluetooth') {
        context.report(node, "mozBluetooth can be unsafe");

      }
    }
  }

}
