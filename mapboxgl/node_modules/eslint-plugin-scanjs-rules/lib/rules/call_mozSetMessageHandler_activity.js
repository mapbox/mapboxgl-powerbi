/**
 * @fileoverview Rule call_mozSetMessageHandler_activity
 * @author ScanJS contributors
 * @copyright 2015 Mozilla Corporation. All rights reserved.
 */
"use strict";

module.exports = function (context) {

  return {
    "CallExpression": function (node) {
      if ((node.callee.name == 'mozSetMessageHandler') || ((node.callee.property) && (node.callee.property.name == 'mozSetMessageHandler'))) {
        for (var i = 0; i < node.arguments.length; i++) {
          var arg = node.arguments[i];
          if ((arg.type == "Literal") && (arg.value == 'activity')) {
            context.report(node, "The function mozSetMessageHandler with parameter activity can be unsafe");
          }
        }
      }
    }
  }
}
