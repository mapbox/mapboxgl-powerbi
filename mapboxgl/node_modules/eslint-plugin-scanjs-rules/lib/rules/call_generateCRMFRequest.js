/**
 * @fileoverview Rule call_generateCRMFRequest
 * @author ScanJS contributors
 * @copyright 2015 Mozilla Corporation. All rights reserved.
 */
"use strict";

module.exports = function (context) {

  return {
    "CallExpression": function (node) {
      if ((node.callee.name == 'generateCRMFRequest') || ((node.callee.property) && (node.callee.property.name == 'generateCRMFRequest'))) {
        context.report(node, "The function generateCRMFRequest can be unsafe");
      }
    }
  };

}
