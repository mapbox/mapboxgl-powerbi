/**
 * @fileoverview Rule identifier_indexedDB
 * @author ScanJS contributors
 * @copyright 2015 Mozilla Corporation. All rights reserved.
 */
"use strict";

module.exports = function (context) {


  return {
    "Identifier": function (node) {
      if (node.name == "indexedDB") {
        context.report(node, "indexedDB can be unsafe");
      }
    }
  }

}
