/**
 * @fileoverview Rule assign_to_pathname
 * @author ScanJS contributors
 * @copyright 2015 Mozilla Corporation. All rights reserved.
 */
"use strict";

module.exports = function (context) {

  return {
    "AssignmentExpression:exit": function (node) {
      if ("property" in node.left) { // member assignment, so yeah.
        if (['=', '+='].indexOf(node.operator) !== -1) {
          if (node.left.property.name === 'pathname') {
            context.report(node, "Assignment to pathname can be unsafe");
          }
        }
      }
    }
  };

}
