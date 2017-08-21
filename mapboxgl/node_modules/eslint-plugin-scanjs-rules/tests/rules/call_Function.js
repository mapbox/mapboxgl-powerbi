/**
 * @fileoverview Test for call_Function rule
 * @author ScanJS contributors
 * @copyright 2015 Mozilla Corporation. All rights reserved
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var rule = require("../../lib/rules/call_Function");
var RuleTester = require('eslint').RuleTester;

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

var eslintTester = new RuleTester();

eslintTester.run("call_Function", rule, {
  valid: [
    { code: "Function" }
  ],    // Examples of code that should trigger the rule
  invalid: [

    {
      code: "Function('jsCode'+usercontrolledVal ) ",
      errors: [
        { message: "The function Function can be unsafe" }
      ]
    },
    {
      code: " Function('arg','arg2','jsCode'+usercontrolledVal )",
      errors: [
        { message: "The function Function can be unsafe" }
      ]
    },
  ]
});  // auto-generated from scanjs rules.json
