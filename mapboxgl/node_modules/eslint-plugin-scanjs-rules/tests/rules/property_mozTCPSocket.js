/**
 * @fileoverview Test for property_mozTCPSocket rule
 * @author ScanJS contributors
 * @copyright 2015 Mozilla Corporation. All rights reserved
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var rule = require("../../lib/rules/property_mozTCPSocket");
var RuleTester = require('eslint').RuleTester;

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

var eslintTester = new RuleTester();

eslintTester.run("property_mozTCPSocket", rule, {
  valid: [
    { code: "foo()" } // XXX no need to test for code that does not trigger.
  ],    // Examples of code that should trigger the rule
  invalid: [

    {
      code: "var TCPSocket = navigator.mozTCPSocket",
      errors: [
        { message: "mozTCPSocket can be unsafe" }
      ]
    },
  ]
});  // auto-generated from scanjs rules.json
