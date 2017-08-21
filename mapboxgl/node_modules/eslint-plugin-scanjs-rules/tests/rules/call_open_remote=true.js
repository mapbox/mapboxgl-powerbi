/**
 * @fileoverview Test for call_open_remote=true rule
 * @author ScanJS contributors
 * @copyright 2015 Mozilla Corporation. All rights reserved
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var rule = require("../../lib/rules/call_open_remote=true");
var RuleTester = require('eslint').RuleTester;

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

var eslintTester = new RuleTester();

eslintTester.run("call_open_remote=true", rule, {
  valid: [
    { code: "foo()" } // XXX no need to test for code that does not trigger.
  ],    // Examples of code that should trigger the rule
  invalid: [

    {
      code: "window.open(target.dataset.url, '_blank', 'remote=true')",
      errors: [
        { message: "The function open with parameter remote=true can be unsafe" }
      ]
    },
  ]
});  // auto-generated from scanjs rules.json
