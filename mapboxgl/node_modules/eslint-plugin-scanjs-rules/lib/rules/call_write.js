/**
 * @fileoverview Rule call_write
 * @author ScanJS contributors
 * @copyright 2015 Mozilla Corporation. All rights reserved.
 */
"use strict";

module.exports = function (context) {

  return {
    "CallExpression": function (node) {
      if ((node.callee.name == 'write') || ((node.callee.property) && (node.callee.property.name == 'write'))) {
        context.report(node, "The function write can be unsafe");
      }
    }
  };

}
