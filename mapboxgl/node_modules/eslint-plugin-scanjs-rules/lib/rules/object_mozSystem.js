/**
 * @fileoverview Rule object_mozSystem
 * @author ScanJS contributors
 * @copyright 2015 Mozilla Corporation. All rights reserved.
 */
"use strict";

module.exports = function (context) {

  return {
    "ObjectExpression": function (node) {
      for (var i = 0; i < node.properties.length; i++) {
        var prop = node.properties[i];
        if (prop.key.type == "Identifier") {
          if (prop.key.name == "mozSystem") {
            context.report(node, "mozSystem can be unsafe");
          }
        } else if (prop.key.type == "Literal") {
          if (prop.key.value == "mozSystem") {
            context.report(node, "mozSystem can be unsafe");
          }
        }
      }
    }
  }

}
