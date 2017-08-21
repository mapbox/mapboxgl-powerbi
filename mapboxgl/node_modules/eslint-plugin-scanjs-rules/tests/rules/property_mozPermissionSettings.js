/**
 * @fileoverview Test for property_mozPermissionSettings rule
 * @author ScanJS contributors
 * @copyright 2015 Mozilla Corporation. All rights reserved
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var rule = require("../../lib/rules/property_mozPermissionSettings");
var RuleTester = require('eslint').RuleTester;

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

var eslintTester = new RuleTester();

eslintTester.run("property_mozPermissionSettings", rule, {
  valid: [
    { code: "foo()" } // XXX no need to test for code that does not trigger.
  ],    // Examples of code that should trigger the rule
  invalid: [

    {
      code: "var mozPerms = navigator.mozPermissionSettings",
      errors: [
        { message: "mozPermissionSettings can be unsafe" }
      ]
    },
  ]
});  // auto-generated from scanjs rules.json
