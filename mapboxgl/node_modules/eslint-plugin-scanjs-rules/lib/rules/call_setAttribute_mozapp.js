/**
 * @fileoverview Rule call_setAttribute_mozapp
 * @author ScanJS contributors
 * @copyright 2015 Mozilla Corporation. All rights reserved.
 */
"use strict";

module.exports = function (context) {

  return {
    "CallExpression": function (node) {
      if ((node.callee.name == 'setAttribute') || ((node.callee.property) && (node.callee.property.name == 'setAttribute'))) {
        for (var i = 0; i < node.arguments.length; i++) {
          var arg = node.arguments[i];
          if ((arg.type == "Literal") && (arg.value == 'mozapp')) {
            context.report(node, "The function setAttribute with parameter mozapp can be unsafe");
          }
        }
      }
    }
  }
}
