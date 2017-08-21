/**
 * @fileoverview Test for new_MozSpeakerManager rule
 * @author ScanJS contributors
 * @copyright 2015 Mozilla Corporation. All rights reserved
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var rule = require("../../lib/rules/new_MozSpeakerManager");
var RuleTester = require('eslint').RuleTester;

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

var eslintTester = new RuleTester();

eslintTester.run("new_MozSpeakerManager", rule, {
  valid: [
    { code: "foo()" } // XXX no need to test for code that does not trigger.
  ],    // Examples of code that should trigger the rule
  invalid: [

    {
      code: "var mgr = new MozSpeakerManager()",
      errors: [
        { message: "The MozSpeakerManager constructor can be unsafe" }
      ]
    },
  ]
});  // auto-generated from scanjs rules.json
