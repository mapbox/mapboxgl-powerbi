/**
 * @fileoverview Rule property_mozFMRadio
 * @author ScanJS contributors
 * @copyright 2015 Mozilla Corporation. All rights reserved.
 */
"use strict";

module.exports = function (context) {

  return {
    "MemberExpression": function (node) {
      if (node.property.name == 'mozFMRadio') {
        context.report(node, "mozFMRadio can be unsafe");

      }
    }
  }

}
