/**
 * @fileoverview Rule identifier_localStorage
 * @author ScanJS contributors
 * @copyright 2015 Mozilla Corporation. All rights reserved.
 */
"use strict";

module.exports = function (context) {


  return {
    "Identifier": function (node) {
      if (node.name == "localStorage") {
        context.report(node, "localStorage can be unsafe");
      }
    }
  }

}
