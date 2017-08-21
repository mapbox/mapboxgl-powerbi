/**
 * @fileoverview Test for call_setInterval rule
 * @author ScanJS contributors
 * @copyright 2015 Mozilla Corporation. All rights reserved
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var rule = require("../../lib/rules/call_setInterval");
var RuleTester = require('eslint').RuleTester;

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

var eslintTester = new RuleTester();

eslintTester.run("call_setInterval", rule, {
  valid: [
    { code: "setInterval" }
  ],    // Examples of code that should trigger the rule
  invalid: [

    {
      code: "global.setInterval('jsCode'+usercontrolledVal ,timMs)",
      errors: [
        { message: "The function setInterval can be unsafe" }
      ]
    },
  ]
});  // auto-generated from scanjs rules.json
