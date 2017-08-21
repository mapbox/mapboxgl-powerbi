/**
 * @fileoverview Test for assign_to_search rule
 * @author ScanJS contributors
 * @copyright 2015 Mozilla Corporation. All rights reserved
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var rule = require("../../lib/rules/assign_to_search");
var RuleTester = require('eslint').RuleTester;

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

var eslintTester = new RuleTester();

eslintTester.run("assign_to_search", rule, {
  valid: [
    { code: "foo.search==bar" }
  ],    // Examples of code that should trigger the rule
  invalid: [

    {
      code: "foo.search=bar",
      errors: [
        { message: "Assignment to search can be unsafe" }
      ]
    },
  ]
});  // auto-generated from scanjs rules.json
