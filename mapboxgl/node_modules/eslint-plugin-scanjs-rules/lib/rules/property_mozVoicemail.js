/**
 * @fileoverview Rule property_mozVoicemail
 * @author ScanJS contributors
 * @copyright 2015 Mozilla Corporation. All rights reserved.
 */
"use strict";

module.exports = function (context) {

  return {
    "MemberExpression": function (node) {
      if (node.property.name == 'mozVoicemail') {
        context.report(node, "mozVoicemail can be unsafe");

      }
    }
  }

}
