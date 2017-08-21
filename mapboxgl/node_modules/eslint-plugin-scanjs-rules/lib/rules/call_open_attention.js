/**
 * @fileoverview Rule call_open_attention
 * @author ScanJS contributors
 * @copyright 2015 Mozilla Corporation. All rights reserved.
 */
"use strict";

module.exports = function (context) {

  return {
    "CallExpression": function (node) {
      if ((node.callee.name == 'open') || ((node.callee.property) && (node.callee.property.name == 'open'))) {
        for (var i = 0; i < node.arguments.length; i++) {
          var arg = node.arguments[i];
          if ((arg.type == "Literal") && (arg.value == 'attention')) {
            context.report(node, "The function open with parameter attention can be unsafe");
          }
        }
      }
    }
  }
}
