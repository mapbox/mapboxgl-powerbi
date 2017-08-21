/**
 * @fileoverview Test for property_createContextualFragment rule
 * @author ScanJS contributors
 * @copyright 2015 Mozilla Corporation. All rights reserved
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var rule = require("../../lib/rules/property_createContextualFragment");
var RuleTester = require('eslint').RuleTester;

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

var eslintTester = new RuleTester();

eslintTester.run("property_createContextualFragment", rule, {
  valid: [
    { code: "createContextualFragment" }
  ],    // Examples of code that should trigger the rule
  invalid: [

    {
      code: "foo.createContextualFragment",
      errors: [
        { message: "createContextualFragment can be unsafe" }
      ]
    },
  ]
});  // auto-generated from scanjs rules.json
