/**
 * @fileoverview Test for assign_to_href rule
 * @author ScanJS contributors
 * @copyright 2015 Mozilla Corporation. All rights reserved
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var rule = require("../../lib/rules/assign_to_href");
var RuleTester = require('eslint').RuleTester;

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

var eslintTester = new RuleTester();

eslintTester.run("assign_to_href", rule, {
  valid: [
    { code: "foo.href==bar" }
  ],    // Examples of code that should trigger the rule
  invalid: [

    {
      code: "foo.href=bar",
      errors: [
        { message: "Assignment to href can be unsafe" }
      ]
    },
  ]
});  // auto-generated from scanjs rules.json
