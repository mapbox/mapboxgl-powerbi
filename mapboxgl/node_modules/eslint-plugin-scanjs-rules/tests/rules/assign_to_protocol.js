/**
 * @fileoverview Test for assign_to_protocol rule
 * @author ScanJS contributors
 * @copyright 2015 Mozilla Corporation. All rights reserved
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var rule = require("../../lib/rules/assign_to_protocol");
var RuleTester = require('eslint').RuleTester;

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

var eslintTester = new RuleTester();

eslintTester.run("assign_to_protocol", rule, {
  valid: [
    { code: "foo.protocol==bar" }
  ],    // Examples of code that should trigger the rule
  invalid: [

    {
      code: "foo.protocol=bar",
      errors: [
        { message: "Assignment to protocol can be unsafe" }
      ]
    },
  ]
});  // auto-generated from scanjs rules.json
