/**
 * @fileoverview Rule identifier_sessionStorage
 * @author ScanJS contributors
 * @copyright 2015 Mozilla Corporation. All rights reserved.
 */
"use strict";

module.exports = function (context) {


  return {
    "Identifier": function (node) {
      if (node.name == "sessionStorage") {
        context.report(node, "sessionStorage can be unsafe");
      }
    }
  }

}
