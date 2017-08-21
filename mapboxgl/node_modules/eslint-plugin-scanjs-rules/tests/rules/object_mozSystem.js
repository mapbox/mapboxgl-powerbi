/**
 * @fileoverview Test for object_mozSystem rule
 * @author ScanJS contributors
 * @copyright 2015 Mozilla Corporation. All rights reserved
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var rule = require("../../lib/rules/object_mozSystem");
var RuleTester = require('eslint').RuleTester;

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

var eslintTester = new RuleTester();

eslintTester.run("object_mozSystem", rule, {
  valid: [
    { code: "foo()" } // XXX no need to test for code that does not trigger.
  ],    // Examples of code that should trigger the rule
  invalid: [

    {
      code: "var xhr = new XMLHttpRequest({mozSystem: true})",
      errors: [
        { message: "mozSystem can be unsafe" }
      ]
    },
    {
      code: "var xhr = new XMLHttpRequest({'mozSystem': true})",
      errors: [
        { message: "mozSystem can be unsafe" }
      ]
    },
  ]
});  // auto-generated from scanjs rules.json
