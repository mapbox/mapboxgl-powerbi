/**
 * @fileoverview Test for assign_to_onmessage rule
 * @author ScanJS contributors
 * @copyright 2015 Mozilla Corporation. All rights reserved
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var rule = require("../../lib/rules/assign_to_onmessage");
var RuleTester = require('eslint').RuleTester;

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

var eslintTester = new RuleTester();

eslintTester.run("assign_to_onmessage", rule, {
  valid: [
    { code: "onmessage" }
  ],    // Examples of code that should trigger the rule
  invalid: [

    {
      code: "onmessage=bar",
      errors: [
        { message: "Assignment to onmessage can be unsafe" }
      ]
    },
  ]
});  // auto-generated from scanjs rules.json
