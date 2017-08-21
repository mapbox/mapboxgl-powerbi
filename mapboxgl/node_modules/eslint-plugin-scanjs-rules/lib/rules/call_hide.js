/**
 * @fileoverview Rule call_hide
 * @author ScanJS contributors
 * @copyright 2015 Mozilla Corporation. All rights reserved.
 */
"use strict";

module.exports = function (context) {

  return {
    "CallExpression": function (node) {
      if ((node.callee.name == 'hide') || ((node.callee.property) && (node.callee.property.name == 'hide'))) {
        context.report(node, "The function hide can be unsafe");
      }
    }
  };

}
