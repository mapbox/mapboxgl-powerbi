/**
 * @fileoverview Rule call_addEventListener_deviceproximity
 * @author ScanJS contributors
 * @copyright 2015 Mozilla Corporation. All rights reserved.
 */
"use strict";

module.exports = function (context) {

  return {
    "CallExpression": function (node) {
      if ((node.callee.name == 'addEventListener') || ((node.callee.property) && (node.callee.property.name == 'addEventListener'))) {
        for (var i = 0; i < node.arguments.length; i++) {
          var arg = node.arguments[i];
          if ((arg.type == "Literal") && (arg.value == 'deviceproximity')) {
            context.report(node, "The function addEventListener with parameter deviceproximity can be unsafe");
          }
        }
      }
    }
  }
}
