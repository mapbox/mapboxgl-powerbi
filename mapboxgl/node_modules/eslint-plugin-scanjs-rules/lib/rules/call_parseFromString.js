/**
 * @fileoverview Rule call_parseFromString
 * @author ScanJS contributors
 * @copyright 2015 Mozilla Corporation. All rights reserved.
 */
"use strict";

module.exports = function (context) {

  return {
    "CallExpression": function (node) {
      if ((node.callee.name == 'parseFromString') || ((node.callee.property) && (node.callee.property.name == 'parseFromString'))) {
        context.report(node, "The function parseFromString can be unsafe");
      }
    }
  };

}
