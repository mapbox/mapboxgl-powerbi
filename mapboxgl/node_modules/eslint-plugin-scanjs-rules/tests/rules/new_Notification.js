/**
 * @fileoverview Test for new_Notification rule
 * @author ScanJS contributors
 * @copyright 2015 Mozilla Corporation. All rights reserved
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var rule = require("../../lib/rules/new_Notification");
var RuleTester = require('eslint').RuleTester;

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

var eslintTester = new RuleTester();

eslintTester.run("new_Notification", rule, {
  valid: [
    { code: "foo()" } // XXX no need to test for code that does not trigger.
  ],    // Examples of code that should trigger the rule
  invalid: [

    {
      code: "var notification = new Notification(title, {body: body, icon: iconURL})",
      errors: [
        { message: "The Notification constructor can be unsafe" }
      ]
    },
  ]
});  // auto-generated from scanjs rules.json
