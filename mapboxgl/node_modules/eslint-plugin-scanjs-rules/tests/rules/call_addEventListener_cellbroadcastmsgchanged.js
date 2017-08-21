/**
 * @fileoverview Test for call_addEventListener_cellbroadcastmsgchanged rule
 * @author ScanJS contributors
 * @copyright 2015 Mozilla Corporation. All rights reserved
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var rule = require("../../lib/rules/call_addEventListener_cellbroadcastmsgchanged");
var RuleTester = require('eslint').RuleTester;

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

var eslintTester = new RuleTester();

eslintTester.run("call_addEventListener_cellbroadcastmsgchanged", rule, {
  valid: [
    { code: "foo()" } // XXX no need to test for code that does not trigger.
  ],    // Examples of code that should trigger the rule
  invalid: [

    {
      code: "window.addEventListener('cellbroadcastmsgchanged', callback)",
      errors: [
        { message: "The function addEventListener with parameter cellbroadcastmsgchanged can be unsafe" }
      ]
    },
  ]
});  // auto-generated from scanjs rules.json
