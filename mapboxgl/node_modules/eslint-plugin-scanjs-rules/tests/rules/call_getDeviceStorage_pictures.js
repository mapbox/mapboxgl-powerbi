/**
 * @fileoverview Test for call_getDeviceStorage_pictures rule
 * @author ScanJS contributors
 * @copyright 2015 Mozilla Corporation. All rights reserved
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var rule = require("../../lib/rules/call_getDeviceStorage_pictures");
var RuleTester = require('eslint').RuleTester;

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

var eslintTester = new RuleTester();

eslintTester.run("call_getDeviceStorage_pictures", rule, {
  valid: [
    { code: "foo()" } // XXX no need to test for code that does not trigger.
  ],    // Examples of code that should trigger the rule
  invalid: [

    {
      code: "this.image = navigator.getDeviceStorage('pictures')",
      errors: [
        { message: "The function getDeviceStorage with parameter pictures can be unsafe" }
      ]
    },
  ]
});  // auto-generated from scanjs rules.json
