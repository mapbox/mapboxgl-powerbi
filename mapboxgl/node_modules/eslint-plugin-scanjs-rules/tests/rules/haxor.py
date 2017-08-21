import os
import re

files = os.listdir(".")


changes = [("""var eslint = require("eslint"),
  ESLintTester = require("eslint-tester");""",
"""var rule = require("../../%s");
var RuleTester = require('eslint').RuleTester;"""),
("""var eslintTester = new ESLintTester(eslint.linter);
eslintTester.addRuleTest("%s", {""",
 """var eslintTester = new RuleTester();

eslintTester.run("%s", rule, {"""
)
           ]



for f in files:
    if not f == __file__: # skip haxor.py
        h = open(f, 'r')
        content = h.read()
        # extract rule name from line:
        # eslintTester.addRuleTest("lib/rules/no-unsafe-innerhtml", {
        match = re.search('addRuleTest\("(.*)",', content)
        if not match:
            print "COuldnt look at", f
            continue
        else:
            rulename = match.groups()[0]
            print rulename
            for i, change in enumerate(changes):
                old = change[0]
                new = change[1]
                if ("%s" in old):
                    old = old % rulename
                if ("%s" in new):
                    if (i > 0):
                        new = new % rulename.replace("lib/rules/",'')
                    else:
                        new = new % rulename
                content = content.replace(old, new)
            w = open(f, 'w')
            w.write(content)
    else:
        print "skipping", f, __file__

