/**
 * @fileoverview Test for call_mozSetMessageHandler_activity rule
 * @author ScanJS contributors
 * @copyright 2015 Mozilla Corporation. All rights reserved
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var rule = require("../../lib/rules/call_mozSetMessageHandler_activity");
var RuleTester = require('eslint').RuleTester;

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

var eslintTester = new RuleTester();

eslintTester.run("call_mozSetMessageHandler_activity", rule, {
  valid: [
    { code: "foo()" } // XXX no need to test for code that does not trigger.
  ],    // Examples of code that should trigger the rule
  invalid: [

    {
      code: "navigator.mozSetMessageHandler('activity',callback)",
      errors: [
        { message: "The function mozSetMessageHandler with parameter activity can be unsafe" }
      ]
    },
  ]
});  // auto-generated from scanjs rules.json
