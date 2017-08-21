/**
 * @fileoverview Rule property_createContextualFragment
 * @author ScanJS contributors
 * @copyright 2015 Mozilla Corporation. All rights reserved.
 */
"use strict";

module.exports = function (context) {

  return {
    "MemberExpression": function (node) {
      if (node.property.name == 'createContextualFragment') {
        context.report(node, "createContextualFragment can be unsafe");

      }
    }
  }

}
