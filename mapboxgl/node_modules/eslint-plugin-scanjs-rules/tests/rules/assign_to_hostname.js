/**
 * @fileoverview Test for assign_to_hostname rule
 * @author ScanJS contributors
 * @copyright 2015 Mozilla Corporation. All rights reserved
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var rule = require("../../lib/rules/assign_to_hostname");
var RuleTester = require('eslint').RuleTester;

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

var eslintTester = new RuleTester();

eslintTester.run("assign_to_hostname", rule, {
  valid: [
    { code: "foo.hostname==bar" }
  ],    // Examples of code that should trigger the rule
  invalid: [

    {
      code: "foo.hostname=bar",
      errors: [
        { message: "Assignment to hostname can be unsafe" }
      ]
    },
  ]
});  // auto-generated from scanjs rules.json
