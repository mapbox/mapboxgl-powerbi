/**
 * @fileoverview Test for assign_to_pathname rule
 * @author ScanJS contributors
 * @copyright 2015 Mozilla Corporation. All rights reserved
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var rule = require("../../lib/rules/assign_to_pathname");
var RuleTester = require('eslint').RuleTester;

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

var eslintTester = new RuleTester();

eslintTester.run("assign_to_pathname", rule, {
  valid: [
    { code: "foo.pathname==bar" }
  ],    // Examples of code that should trigger the rule
  invalid: [

    {
      code: "foo.pathname=bar",
      errors: [
        { message: "Assignment to pathname can be unsafe" }
      ]
    },
  ]
});  // auto-generated from scanjs rules.json
