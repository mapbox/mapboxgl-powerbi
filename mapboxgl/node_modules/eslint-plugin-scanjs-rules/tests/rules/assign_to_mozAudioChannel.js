/**
 * @fileoverview Test for assign_to_mozAudioChannel rule
 * @author ScanJS contributors
 * @copyright 2015 Mozilla Corporation. All rights reserved
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var rule = require("../../lib/rules/assign_to_mozAudioChannel");
var RuleTester = require('eslint').RuleTester;

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

var eslintTester = new RuleTester();

eslintTester.run("assign_to_mozAudioChannel", rule, {
  valid: [
    { code: "foo()" } // XXX no need to test for code that does not trigger.
  ],    // Examples of code that should trigger the rule
  invalid: [

    {
      code: "ringtonePlayer.mozAudioChannel = 'telephony'",
      errors: [
        { message: "Assignment to mozAudioChannel can be unsafe" }
      ]
    },
  ]
});  // auto-generated from scanjs rules.json
