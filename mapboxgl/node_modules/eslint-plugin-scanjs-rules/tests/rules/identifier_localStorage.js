/**
 * @fileoverview Test for identifier_localStorage rule
 * @author ScanJS contributors
 * @copyright 2015 Mozilla Corporation. All rights reserved
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var rule = require("../../lib/rules/identifier_localStorage");
var RuleTester = require('eslint').RuleTester;

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

var eslintTester = new RuleTester();

eslintTester.run("identifier_localStorage", rule, {
  valid: [
    { code: " 'localStorage'" }
  ],    // Examples of code that should trigger the rule
  invalid: [

    {
      code: "localStorage.setItem('name', 'user1')",
      errors: [
        { message: "localStorage can be unsafe" }
      ]
    },
  ]
});  // auto-generated from scanjs rules.json
