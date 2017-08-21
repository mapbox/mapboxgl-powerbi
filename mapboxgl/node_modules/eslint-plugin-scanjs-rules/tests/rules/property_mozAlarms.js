/**
 * @fileoverview Test for property_mozAlarms rule
 * @author ScanJS contributors
 * @copyright 2015 Mozilla Corporation. All rights reserved
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var rule = require("../../lib/rules/property_mozAlarms");
var RuleTester = require('eslint').RuleTester;

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

var eslintTester = new RuleTester();

eslintTester.run("property_mozAlarms", rule, {
  valid: [
    { code: "MozAlarms" }
  ],    // Examples of code that should trigger the rule
  invalid: [

    {
      code: "navigator.mozAlarms",
      errors: [
        { message: "mozAlarms can be unsafe" }
      ]
    },
  ]
});  // auto-generated from scanjs rules.json
