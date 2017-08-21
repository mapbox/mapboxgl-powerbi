/**
 * @fileoverview Test for property_indexedDB rule
 * @author ScanJS contributors
 * @copyright 2015 Mozilla Corporation. All rights reserved
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var rule = require("../../lib/rules/property_indexedDB");
var RuleTester = require('eslint').RuleTester;

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

var eslintTester = new RuleTester();

eslintTester.run("property_indexedDB", rule, {
  valid: [
    { code: " 'indexeddb'" }
  ],    // Examples of code that should trigger the rule
  invalid: [

    {
      code: "window.indexedDB.open('MyTestDatabase')",
      errors: [
        { message: "indexedDB can be unsafe" }
      ]
    },
  ]
});  // auto-generated from scanjs rules.json
