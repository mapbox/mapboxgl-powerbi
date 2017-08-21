/**
 * @fileoverview Test for assign_to_mozAudioChannelType rule
 * @author ScanJS contributors
 * @copyright 2015 Mozilla Corporation. All rights reserved
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var rule = require("../../lib/rules/assign_to_mozAudioChannelType");
var RuleTester = require('eslint').RuleTester;

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

var eslintTester = new RuleTester();

eslintTester.run("assign_to_mozAudioChannelType", rule, {
  valid: [
    { code: "foo()" } // XXX no need to test for code that does not trigger.
  ],    // Examples of code that should trigger the rule
  invalid: [

    {
      code: "ringtonePlayer.mozAudioChannelType = 'telephony'",
      errors: [
        { message: "Assignment to mozAudioChannelType can be unsafe" }
      ]
    },
  ]
});  // auto-generated from scanjs rules.json
