/**
 * @fileoverview Rule property_mozPower
 * @author ScanJS contributors
 * @copyright 2015 Mozilla Corporation. All rights reserved.
 */
"use strict";

module.exports = function (context) {

  return {
    "MemberExpression": function (node) {
      if (node.property.name == 'mozPower') {
        context.report(node, "mozPower can be unsafe");

      }
    }
  }

}
