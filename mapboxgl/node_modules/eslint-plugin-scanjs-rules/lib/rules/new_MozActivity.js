/**
 * @fileoverview Rule new_MozActivity
 * @author ScanJS contributors
 * @copyright 2015 Mozilla Corporation. All rights reserved.
 */
"use strict";

module.exports = function (context) {

  return {
    "NewExpression": function (node) {
      if (node.callee.name == 'MozActivity') {
        context.report(node, "The MozActivity constructor can be unsafe");
      }
    }
  };

}
