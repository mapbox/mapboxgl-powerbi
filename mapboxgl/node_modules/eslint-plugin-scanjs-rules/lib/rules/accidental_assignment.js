/**
 * @fileoverview Rule accidental_assignment: Checks for assignments in
 *   condition tests.
 * @author ScanJS contributors
 * @copyright 2015 Mozilla Corporation. All rights reserved.
 */
"use strict";

module.exports = function (context) {

  function testIsAssignment(node) {
    if (node.test.type == "AssignmentExpression") {
      if (node.test.operator == "=") {
        context.report(node, "Assignment in " +node.type+ ". Is this accidental?");
      }
    }
  }

  return {
    "IfStatement": testIsAssignment,
    "WhileStatement": testIsAssignment,
    "ConditionalExpression": testIsAssignment,
    "DoWhileStatement":testIsAssignment,
  };

}
