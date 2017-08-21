/**
 * @fileoverview Rule call_execScript
 * @author ScanJS contributors
 * @copyright 2015 Mozilla Corporation. All rights reserved.
 */
"use strict";

module.exports = function (context) {

  return {
    "CallExpression": function (node) {
      if ((node.callee.name == 'execScript') || ((node.callee.property) && (node.callee.property.name == 'execScript'))) {
        context.report(node, "The function execScript can be unsafe");
      }
    }
  };

}
