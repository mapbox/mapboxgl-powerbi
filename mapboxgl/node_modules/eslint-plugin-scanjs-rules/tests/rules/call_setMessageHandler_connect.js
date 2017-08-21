/**
 * @fileoverview Test for call_setMessageHandler_connect rule
 * @author ScanJS contributors
 * @copyright 2015 Mozilla Corporation. All rights reserved
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var rule = require("../../lib/rules/call_setMessageHandler_connect");
var RuleTester = require('eslint').RuleTester;

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

var eslintTester = new RuleTester();

eslintTester.run("call_setMessageHandler_connect", rule, {
  valid: [
    { code: "foo()" } // XXX no need to test for code that does not trigger.
  ],    // Examples of code that should trigger the rule
  invalid: [

    {
      code: " navigator.setMessageHandler('connect',callback)",
      errors: [
        { message: "The function setMessageHandler with parameter connect can be unsafe" }
      ]
    },
  ]
});  // auto-generated from scanjs rules.json
