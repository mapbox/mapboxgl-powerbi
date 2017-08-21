/**
 * @fileoverview Test for new_MozActivity rule
 * @author ScanJS contributors
 * @copyright 2015 Mozilla Corporation. All rights reserved
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var rule = require("../../lib/rules/new_MozActivity");
var RuleTester = require('eslint').RuleTester;

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

var eslintTester = new RuleTester();

eslintTester.run("new_MozActivity", rule, {
  valid: [
    { code: "MozActivity +1" }
  ],    // Examples of code that should trigger the rule
  invalid: [

    {
      code: "new MozActivity({type:'pick'})",
      errors: [
        { message: "The MozActivity constructor can be unsafe" }
      ]
    },
  ]
});  // auto-generated from scanjs rules.json
