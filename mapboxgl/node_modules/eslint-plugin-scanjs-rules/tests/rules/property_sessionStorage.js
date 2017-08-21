/**
 * @fileoverview Test for property_sessionStorage rule
 * @author ScanJS contributors
 * @copyright 2015 Mozilla Corporation. All rights reserved
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var rule = require("../../lib/rules/property_sessionStorage");
var RuleTester = require('eslint').RuleTester;

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

var eslintTester = new RuleTester();

eslintTester.run("property_sessionStorage", rule, {
  valid: [
    { code: " 'sessionStorage'" }
  ],    // Examples of code that should trigger the rule
  invalid: [

    {
      code: "window.sessionStorage.setItem('name', 'user1')",
      errors: [
        { message: "sessionStorage can be unsafe" }
      ]
    },
  ]
});  // auto-generated from scanjs rules.json
