/**
 * @fileoverview Rule property_mozPhoneNumberService
 * @author ScanJS contributors
 * @copyright 2015 Mozilla Corporation. All rights reserved.
 */
"use strict";

module.exports = function (context) {

  return {
    "MemberExpression": function (node) {
      if (node.property.name == 'mozPhoneNumberService') {
        context.report(node, "mozPhoneNumberService can be unsafe");

      }
    }
  }

}
