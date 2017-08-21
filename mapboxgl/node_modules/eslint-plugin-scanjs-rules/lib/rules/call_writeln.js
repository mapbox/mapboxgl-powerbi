/**
 * @fileoverview Rule call_writeln
 * @author ScanJS contributors
 * @copyright 2015 Mozilla Corporation. All rights reserved.
 */
"use strict";

module.exports = function (context) {

  return {
    "CallExpression": function (node) {
      if ((node.callee.name == 'writeln') || ((node.callee.property) && (node.callee.property.name == 'writeln'))) {
        context.report(node, "The function writeln can be unsafe");
      }
    }
  };

}
