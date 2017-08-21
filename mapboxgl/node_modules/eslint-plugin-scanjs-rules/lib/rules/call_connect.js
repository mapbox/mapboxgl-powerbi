/**
 * @fileoverview Rule call_connect
 * @author ScanJS contributors
 * @copyright 2015 Mozilla Corporation. All rights reserved.
 */
"use strict";

module.exports = function (context) {

  return {
    "CallExpression": function (node) {
      if ((node.callee.name == 'connect') || ((node.callee.property) && (node.callee.property.name == 'connect'))) {
        context.report(node, "The function connect can be unsafe");
      }
    }
  };

}
