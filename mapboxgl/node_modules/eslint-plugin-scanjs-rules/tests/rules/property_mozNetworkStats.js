/**
 * @fileoverview Test for property_mozNetworkStats rule
 * @author ScanJS contributors
 * @copyright 2015 Mozilla Corporation. All rights reserved
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var rule = require("../../lib/rules/property_mozNetworkStats");
var RuleTester = require('eslint').RuleTester;

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

var eslintTester = new RuleTester();

eslintTester.run("property_mozNetworkStats", rule, {
  valid: [
    { code: "foo()" } // XXX no need to test for code that does not trigger.
  ],    // Examples of code that should trigger the rule
  invalid: [

    {
      code: "var networks = navigator.mozNetworkStats.getAvailableNetworks()",
      errors: [
        { message: "mozNetworkStats can be unsafe" }
      ]
    },
  ]
});  // auto-generated from scanjs rules.json
