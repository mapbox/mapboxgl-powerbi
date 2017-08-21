/**
 * @fileoverview Rule new_Notification
 * @author ScanJS contributors
 * @copyright 2015 Mozilla Corporation. All rights reserved.
 */
"use strict";

module.exports = function (context) {

  return {
    "NewExpression": function (node) {
      if (node.callee.name == 'Notification') {
        context.report(node, "The Notification constructor can be unsafe");
      }
    }
  };

}
