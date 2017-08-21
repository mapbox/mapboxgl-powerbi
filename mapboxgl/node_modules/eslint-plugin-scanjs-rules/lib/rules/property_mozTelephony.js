/**
 * @fileoverview Rule property_mozTelephony
 * @author ScanJS contributors
 * @copyright 2015 Mozilla Corporation. All rights reserved.
 */
"use strict";

module.exports = function (context) {

  return {
    "MemberExpression": function (node) {
      if (node.property.name == 'mozTelephony') {
        context.report(node, "mozTelephony can be unsafe");

      }
    }
  }

}
