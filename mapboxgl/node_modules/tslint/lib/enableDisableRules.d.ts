import * as ts from "typescript";
import { SkippableTokenAwareRuleWalker } from "./language/walker/skippableTokenAwareRuleWalker";
import { IEnableDisablePosition } from "./ruleLoader";
export declare class EnableDisableRulesWalker extends SkippableTokenAwareRuleWalker {
    enableDisableRuleMap: {
        [rulename: string]: IEnableDisablePosition[];
    };
    visitSourceFile(node: ts.SourceFile): void;
    private handlePossibleTslintSwitch(commentText, startingPosition);
}
