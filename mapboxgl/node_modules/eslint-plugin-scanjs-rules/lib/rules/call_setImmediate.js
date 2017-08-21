/**
 * @fileoverview Rule call_setImmediate
 * @author ScanJS contributors
 * @copyright 2015 Mozilla Corporation. All rights reserved.
 */
"use strict";

module.exports = function (context) {

  return {
    "CallExpression": function (node) {
      if ((node.callee.name == 'setImmediate') || ((node.callee.property) && (node.callee.property.name == 'setImmediate'))) {
        context.report(node, "The function setImmediate can be unsafe");
      }
    }
  };

}
