/**
 * @fileoverview Rule assign_to_mozAudioChannel
 * @author ScanJS contributors
 * @copyright 2015 Mozilla Corporation. All rights reserved.
 */
"use strict";

module.exports = function (context) {

  return {
    "AssignmentExpression:exit": function (node) {
      if ("property" in node.left) { // member assignment, so yeah.
        if (['=', '+='].indexOf(node.operator) !== -1) {
          if (node.left.property.name === 'mozAudioChannel') {
            context.report(node, "Assignment to mozAudioChannel can be unsafe");
          }
        }
      }
    }
  };

}
