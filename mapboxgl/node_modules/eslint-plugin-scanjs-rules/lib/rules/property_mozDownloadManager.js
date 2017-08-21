/**
 * @fileoverview Rule property_mozDownloadManager
 * @author ScanJS contributors
 * @copyright 2015 Mozilla Corporation. All rights reserved.
 */
"use strict";

module.exports = function (context) {

  return {
    "MemberExpression": function (node) {
      if (node.property.name == 'mozDownloadManager') {
        context.report(node, "mozDownloadManager can be unsafe");

      }
    }
  }

}
