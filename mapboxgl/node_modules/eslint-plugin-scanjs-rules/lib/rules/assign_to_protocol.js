/**
 * @fileoverview Rule assign_to_protocol
 * @author ScanJS contributors
 * @copyright 2015 Mozilla Corporation. All rights reserved.
 */
"use strict";

module.exports = function (context) {

  return {
    "AssignmentExpression:exit": function (node) {
      if ("property" in node.left) { // member assignment, so yeah.
        if (['=', '+='].indexOf(node.operator) !== -1) {
          if (node.left.property.name === 'protocol') {
            context.report(node, "Assignment to protocol can be unsafe");
          }
        }
      }
    }
  };

}
