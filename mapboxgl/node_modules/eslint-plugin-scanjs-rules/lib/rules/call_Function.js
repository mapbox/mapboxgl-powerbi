/**
 * @fileoverview Rule call_Function
 * @author ScanJS contributors
 * @copyright 2015 Mozilla Corporation. All rights reserved.
 */
"use strict";

module.exports = function (context) {

  return {
    "CallExpression": function (node) {
      if ((node.callee.name == 'Function') || ((node.callee.property) && (node.callee.property.name == 'Function'))) {
        context.report(node, "The function Function can be unsafe");
      }
    }
  };

}
