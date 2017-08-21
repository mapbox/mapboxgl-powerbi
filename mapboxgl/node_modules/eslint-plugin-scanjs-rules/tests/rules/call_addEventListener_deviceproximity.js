/**
 * @fileoverview Test for call_addEventListener_deviceproximity rule
 * @author ScanJS contributors
 * @copyright 2015 Mozilla Corporation. All rights reserved
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var rule = require("../../lib/rules/call_addEventListener_deviceproximity");
var RuleTester = require('eslint').RuleTester;

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

var eslintTester = new RuleTester();

eslintTester.run("call_addEventListener_deviceproximity", rule, {
  valid: [
    { code: "foo()" } // XXX no need to test for code that does not trigger.
  ],    // Examples of code that should trigger the rule
  invalid: [

    {
      code: "window.addEventListener('deviceproximity', callback)",
      errors: [
        { message: "The function addEventListener with parameter deviceproximity can be unsafe" }
      ]
    },
  ]
});  // auto-generated from scanjs rules.json
