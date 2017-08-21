/**
 * @fileoverview Rule property_getDataStores
 * @author ScanJS contributors
 * @copyright 2015 Mozilla Corporation. All rights reserved.
 */
"use strict";

module.exports = function (context) {

  return {
    "MemberExpression": function (node) {
      if (node.property.name == 'getDataStores') {
        context.report(node, "getDataStores can be unsafe");

      }
    }
  }

}
