/**
 * @fileoverview Rule new_MozSpeakerManager
 * @author ScanJS contributors
 * @copyright 2015 Mozilla Corporation. All rights reserved.
 */
"use strict";

module.exports = function (context) {

  return {
    "NewExpression": function (node) {
      if (node.callee.name == 'MozSpeakerManager') {
        context.report(node, "The MozSpeakerManager constructor can be unsafe");
      }
    }
  };

}
