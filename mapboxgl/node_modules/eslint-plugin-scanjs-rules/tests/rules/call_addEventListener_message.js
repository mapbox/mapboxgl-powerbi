/**
 * @fileoverview Test for call_addEventListener_message rule
 * @author ScanJS contributors
 * @copyright 2015 Mozilla Corporation. All rights reserved
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var rule = require("../../lib/rules/call_addEventListener_message");
var RuleTester = require('eslint').RuleTester;

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

var eslintTester = new RuleTester();

eslintTester.run("call_addEventListener_message", rule, {
  valid: [
    { code: " " }
  ],    // Examples of code that should trigger the rule
  invalid: [

    {
      code: "window.addEventListener('message', receiveMessage, false)",
      errors: [
        { message: "The function addEventListener with parameter message can be unsafe" }
      ]
    },
  ]
});  // auto-generated from scanjs rules.json
