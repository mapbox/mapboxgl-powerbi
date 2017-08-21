/**
 * @fileoverview Test for call_parseFromString rule
 * @author ScanJS contributors
 * @copyright 2015 Mozilla Corporation. All rights reserved
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var rule = require("../../lib/rules/call_parseFromString");
var RuleTester = require('eslint').RuleTester;

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

var eslintTester = new RuleTester();

eslintTester.run("call_parseFromString", rule, {
  valid: [
    { code: "parseFromString" }
  ],    // Examples of code that should trigger the rule
  invalid: [

    {
      code: "window.doc = parser.parseFromString(someVar, 'text/html')",
      errors: [
        { message: "The function parseFromString can be unsafe" }
      ]
    },
  ]
});  // auto-generated from scanjs rules.json
