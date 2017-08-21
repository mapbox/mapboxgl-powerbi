/**
 * @fileoverview Rule assign_to_onmessage
 * @author ScanJS contributors
 * @copyright 2015 Mozilla Corporation. All rights reserved.
 */
"use strict";

module.exports = function (context) {


  return {
    "AssignmentExpression:exit": function (node) {
      if (node.left.name == 'onmessage') {
        context.report(node, "Assignment to onmessage can be unsafe");
      }
    }
  };

}
