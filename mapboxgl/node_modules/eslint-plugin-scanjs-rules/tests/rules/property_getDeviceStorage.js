/**
 * @fileoverview Test for property_getDeviceStorage rule
 * @author ScanJS contributors
 * @copyright 2015 Mozilla Corporation. All rights reserved
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var rule = require("../../lib/rules/property_getDeviceStorage");
var RuleTester = require('eslint').RuleTester;

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

var eslintTester = new RuleTester();

eslintTester.run("property_getDeviceStorage", rule, {
  valid: [
    { code: "foo()" } // XXX no need to test for code that does not trigger.
  ],    // Examples of code that should trigger the rule
  invalid: [

    {
      code: "apps = navigator.getDeviceStorage('apps')",
      errors: [
        { message: "getDeviceStorage can be unsafe" }
      ]
    },
  ]
});  // auto-generated from scanjs rules.json
