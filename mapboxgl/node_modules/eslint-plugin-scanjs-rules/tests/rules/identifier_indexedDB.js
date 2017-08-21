/**
 * @fileoverview Test for identifier_indexedDB rule
 * @author ScanJS contributors
 * @copyright 2015 Mozilla Corporation. All rights reserved
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var rule = require("../../lib/rules/identifier_indexedDB");
var RuleTester = require('eslint').RuleTester;

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

var eslintTester = new RuleTester();

eslintTester.run("identifier_indexedDB", rule, {
  valid: [
    { code: " 'indexeddb'" }
  ],    // Examples of code that should trigger the rule
  invalid: [

    {
      code: "indexedDB.open('MyTestDatabase')",
      errors: [
        { message: "indexedDB can be unsafe" }
      ]
    },
  ]
});  // auto-generated from scanjs rules.json
