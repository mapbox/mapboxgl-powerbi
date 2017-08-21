/**
 * @fileoverview Test for call_getDeviceStorage_apps rule
 * @author ScanJS contributors
 * @copyright 2015 Mozilla Corporation. All rights reserved
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var rule = require("../../lib/rules/call_getDeviceStorage_apps");
var RuleTester = require('eslint').RuleTester;

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

var eslintTester = new RuleTester();

eslintTester.run("call_getDeviceStorage_apps", rule, {
  valid: [
    { code: "foo()" } // XXX no need to test for code that does not trigger.
  ],    // Examples of code that should trigger the rule
  invalid: [

    {
      code: "apps = navigator.getDeviceStorage('apps')",
      errors: [
        { message: "The function getDeviceStorage with parameter apps can be unsafe" }
      ]
    },
  ]
});  // auto-generated from scanjs rules.json
