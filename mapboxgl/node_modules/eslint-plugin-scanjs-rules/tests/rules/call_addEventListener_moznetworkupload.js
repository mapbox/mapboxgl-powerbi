/**
 * @fileoverview Test for call_addEventListener_moznetworkupload rule
 * @author ScanJS contributors
 * @copyright 2015 Mozilla Corporation. All rights reserved
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var rule = require("../../lib/rules/call_addEventListener_moznetworkupload");
var RuleTester = require('eslint').RuleTester;

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

var eslintTester = new RuleTester();

eslintTester.run("call_addEventListener_moznetworkupload", rule, {
  valid: [
    { code: "foo()" }
  ],    // Examples of code that should trigger the rule
  invalid: [

    {
      code: "window.addEventListener('moznetworkupload', uploadHandler)",
      errors: [
        { message: "The function addEventListener with parameter moznetworkupload can be unsafe" }
      ]
    },
  ]
});  // auto-generated from scanjs rules.json
