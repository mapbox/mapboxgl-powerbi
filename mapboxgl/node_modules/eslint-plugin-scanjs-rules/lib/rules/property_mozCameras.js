/**
 * @fileoverview Rule property_mozCameras
 * @author ScanJS contributors
 * @copyright 2015 Mozilla Corporation. All rights reserved.
 */
"use strict";

module.exports = function (context) {

  return {
    "MemberExpression": function (node) {
      if (node.property.name == 'mozCameras') {
        context.report(node, "mozCameras can be unsafe");

      }
    }
  }

}
