/**
 * @fileoverview Rule call_eval
 * @author ScanJS contributors
 * @copyright 2015 Mozilla Corporation. All rights reserved.
 */
"use strict";

module.exports = function (context) {

  return {
    "CallExpression": function (node) {
      if ((node.callee.name == 'eval') || ((node.callee.property) && (node.callee.property.name == 'eval'))) {
        context.report(node, "The function eval can be unsafe");
      }
    }
  };

}
