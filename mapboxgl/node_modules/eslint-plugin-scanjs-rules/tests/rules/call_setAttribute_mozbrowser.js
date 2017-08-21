/**
 * @fileoverview Test for call_setAttribute_mozbrowser rule
 * @author ScanJS contributors
 * @copyright 2015 Mozilla Corporation. All rights reserved
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var rule = require("../../lib/rules/call_setAttribute_mozbrowser");
var RuleTester = require('eslint').RuleTester;

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

var eslintTester = new RuleTester();

eslintTester.run("call_setAttribute_mozbrowser", rule, {
  valid: [
    { code: "foo()" } // XXX no need to test for code that does not trigger.
  ],    // Examples of code that should trigger the rule
  invalid: [

    {
      code: "iframe.setAttribute('mozbrowser', true)",
      errors: [
        { message: "The function setAttribute with parameter mozbrowser can be unsafe" }
      ]
    },
  ]
});  // auto-generated from scanjs rules.json
