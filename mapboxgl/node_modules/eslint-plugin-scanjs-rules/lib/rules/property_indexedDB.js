/**
 * @fileoverview Rule property_indexedDB
 * @author ScanJS contributors
 * @copyright 2015 Mozilla Corporation. All rights reserved.
 */
"use strict";

module.exports = function (context) {

  return {
    "MemberExpression": function (node) {
      if (node.property.name == 'indexedDB') {
        context.report(node, "indexedDB can be unsafe");

      }
    }
  }

}
