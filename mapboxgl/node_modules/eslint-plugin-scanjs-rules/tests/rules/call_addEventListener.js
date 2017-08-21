/**
 * @fileoverview Test for call_addEventListener rule
 * @author ScanJS contributors
 * @copyright 2015 Mozilla Corporation. All rights reserved
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var rule = require("../../lib/rules/call_addEventListener");
var RuleTester = require('eslint').RuleTester;

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

var eslintTester = new RuleTester();

eslintTester.run("call_addEventListener", rule, {
  valid: [
    { code: "addEventListener" }
  ],    // Examples of code that should trigger the rule
  invalid: [

    {
      code: "foo.addEventListener(bar+'bar')",
      errors: [
        { message: "The function addEventListener can be unsafe" }
      ]
    },
  ]
});  // auto-generated from scanjs rules.json
