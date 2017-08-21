/**
 * @fileoverview Test for call_eval rule
 * @author ScanJS contributors
 * @copyright 2015 Mozilla Corporation. All rights reserved
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var rule = require("../../lib/rules/call_eval");
var RuleTester = require('eslint').RuleTester;

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

var eslintTester = new RuleTester();

eslintTester.run("call_eval", rule, {
  valid: [
    { code: "eval" }
  ],    // Examples of code that should trigger the rule
  invalid: [

    {
      code: "window.eval('jsCode'+usercontrolledVal )",
      errors: [
        { message: "The function eval can be unsafe" }
      ]
    },
  ]
});  // auto-generated from scanjs rules.json
