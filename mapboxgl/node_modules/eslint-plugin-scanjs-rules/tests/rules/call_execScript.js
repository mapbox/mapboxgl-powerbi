/**
 * @fileoverview Test for call_execScript rule
 * @author ScanJS contributors
 * @copyright 2015 Mozilla Corporation. All rights reserved
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var rule = require("../../lib/rules/call_execScript");
var RuleTester = require('eslint').RuleTester;

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

var eslintTester = new RuleTester();

eslintTester.run("call_execScript", rule, {
  valid: [
    { code: "execSript" }
  ],    // Examples of code that should trigger the rule
  invalid: [

    {
      code: "execScript('jsCode'+usercontrolledVal ,'JScript')",
      errors: [
        { message: "The function execScript can be unsafe" }
      ]
    },
  ]
});  // auto-generated from scanjs rules.json
