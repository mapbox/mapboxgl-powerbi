/**
 * @fileoverview Rule call_getDeviceStorage_music
 * @author ScanJS contributors
 * @copyright 2015 Mozilla Corporation. All rights reserved.
 */
"use strict";

module.exports = function (context) {

  return {
    "CallExpression": function (node) {
      if ((node.callee.name == 'getDeviceStorage') || ((node.callee.property) && (node.callee.property.name == 'getDeviceStorage'))) {
        for (var i = 0; i < node.arguments.length; i++) {
          var arg = node.arguments[i];
          if ((arg.type == "Literal") && (arg.value == 'music')) {
            context.report(node, "The function getDeviceStorage with parameter music can be unsafe");
          }
        }
      }
    }
  }
}
