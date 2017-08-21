/**
 * @fileoverview Test for call_write rule
 * @author ScanJS contributors
 * @copyright 2015 Mozilla Corporation. All rights reserved
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var rule = require("../../lib/rules/call_write");
var RuleTester = require('eslint').RuleTester;

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

var eslintTester = new RuleTester();

eslintTester.run("call_write", rule, {
  valid: [
    { code: "document.write" }
  ],    // Examples of code that should trigger the rule
  invalid: [

    {
      code: "document.write('test')",
      errors: [
        { message: "The function write can be unsafe" }
      ]
    },
  ]
});  // auto-generated from scanjs rules.json
