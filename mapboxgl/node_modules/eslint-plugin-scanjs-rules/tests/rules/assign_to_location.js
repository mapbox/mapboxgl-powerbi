/**
 * @fileoverview Test for assign_to_location rule
 * @author ScanJS contributors
 * @copyright 2015 Mozilla Corporation. All rights reserved
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var rule = require("../../lib/rules/assign_to_location");
var RuleTester = require('eslint').RuleTester;

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

var eslintTester = new RuleTester();

eslintTester.run("assign_to_location", rule, {
  valid: [
    { code: "foo.location==bar" }
  ],    // Examples of code that should trigger the rule
  invalid: [

    {
      code: "foo.location=bar",
      errors: [
        { message: "Assignment to location can be unsafe" }
      ]
    },
  ]
});  // auto-generated from scanjs rules.json
