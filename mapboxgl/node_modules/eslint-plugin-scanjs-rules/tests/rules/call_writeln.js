/**
 * @fileoverview Test for call_writeln rule
 * @author ScanJS contributors
 * @copyright 2015 Mozilla Corporation. All rights reserved
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var rule = require("../../lib/rules/call_writeln");
var RuleTester = require('eslint').RuleTester;

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

var eslintTester = new RuleTester();

eslintTester.run("call_writeln", rule, {
  valid: [
    { code: "document.writeln" }
  ],    // Examples of code that should trigger the rule
  invalid: [

    {
      code: "document.writeln('test')",
      errors: [
        { message: "The function writeln can be unsafe" }
      ]
    },
  ]
});  // auto-generated from scanjs rules.json
