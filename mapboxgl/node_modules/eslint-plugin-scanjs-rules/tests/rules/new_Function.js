/**
 * @fileoverview Test for new_Function rule
 * @author ScanJS contributors
 * @copyright 2015 Mozilla Corporation. All rights reserved
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var rule = require("../../lib/rules/new_Function");
var RuleTester = require('eslint').RuleTester;

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

var eslintTester = new RuleTester();

eslintTester.run("new_Function", rule, {
  valid: [
    { code: "Function" }
  ],    // Examples of code that should trigger the rule
  invalid: [

    {
      code: "new Function('jsCode'+usercontrolledVal ) ",
      errors: [
        { message: "The Function constructor can be unsafe" }
      ]
    },
    {
      code: " new Function('arg','arg2','jsCode'+usercontrolledVal )",
      errors: [
        { message: "The Function constructor can be unsafe" }
      ]
    },
  ]
});  // auto-generated from scanjs rules.json
