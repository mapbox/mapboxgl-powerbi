/**
 * @fileoverview Test for call_setTimeout rule
 * @author ScanJS contributors
 * @copyright 2015 Mozilla Corporation. All rights reserved
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var rule = require("../../lib/rules/call_setTimeout");
var RuleTester = require('eslint').RuleTester;

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

var eslintTester = new RuleTester();

eslintTester.run("call_setTimeout", rule, {
  valid: [
    { code: "setTimeout" }
  ],    // Examples of code that should trigger the rule
  invalid: [

    {
      code: "global.setTimeout('jsCode'+usercontrolledVal ,timeMs)",
      errors: [
        { message: "The function setTimeout can be unsafe" }
      ]
    },
  ]
});  // auto-generated from scanjs rules.json
