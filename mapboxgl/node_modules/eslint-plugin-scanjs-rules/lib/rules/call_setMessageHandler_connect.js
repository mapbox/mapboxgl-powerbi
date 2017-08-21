/**
 * @fileoverview Rule call_setMessageHandler_connect
 * @author ScanJS contributors
 * @copyright 2015 Mozilla Corporation. All rights reserved.
 */
"use strict";

module.exports = function (context) {

  return {
    "CallExpression": function (node) {
      if ((node.callee.name == 'setMessageHandler') || ((node.callee.property) && (node.callee.property.name == 'setMessageHandler'))) {
        for (var i = 0; i < node.arguments.length; i++) {
          var arg = node.arguments[i];
          if ((arg.type == "Literal") && (arg.value == 'connect')) {
            context.report(node, "The function setMessageHandler with parameter connect can be unsafe");
          }
        }
      }
    }
  }
}
