/**
 * @fileoverview Test for assign_to_src rule
 * @author ScanJS contributors
 * @copyright 2015 Mozilla Corporation. All rights reserved
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var rule = require("../../lib/rules/assign_to_src");
var RuleTester = require('eslint').RuleTester;

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

var eslintTester = new RuleTester();

eslintTester.run("assign_to_src", rule, {
  valid: [
    { code: "src.bar" }
  ],    // Examples of code that should trigger the rule
  invalid: [

    {
      code: "bar.src=foo",
      errors: [
        { message: "Assignment to src can be unsafe" }
      ]
    },
  ]
});  // auto-generated from scanjs rules.json
