/**
 * @fileoverview Test for property_mozMobileConnection rule
 * @author ScanJS contributors
 * @copyright 2015 Mozilla Corporation. All rights reserved
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var rule = require("../../lib/rules/property_mozMobileConnection");
var RuleTester = require('eslint').RuleTester;

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

var eslintTester = new RuleTester();

eslintTester.run("property_mozMobileConnection", rule, {
  valid: [
    { code: "foo()" } // XXX no need to test for code that does not trigger.
  ],    // Examples of code that should trigger the rule
  invalid: [

    {
      code: "var conn = window.navigator.mozMobileConnection || window.navigator.mozMobileConnections",
      errors: [
        { message: "mozMobileConnection can be unsafe" }
      ]
    },
  ]
});  // auto-generated from scanjs rules.json
