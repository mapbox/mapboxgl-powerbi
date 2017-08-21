/**
 * @fileoverview Rule new_Function
 * @author ScanJS contributors
 * @copyright 2015 Mozilla Corporation. All rights reserved.
 */
"use strict";

module.exports = function (context) {

  return {
    "NewExpression": function (node) {
      if (node.callee.name == 'Function') {
        context.report(node, "The Function constructor can be unsafe");
      }
    }
  };

}
