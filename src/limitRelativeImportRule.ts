import * as ts from "typescript";
import * as Lint from "tslint";

export class Rule extends Lint.Rules.AbstractRule {
  public static FAILURE_STRING = "Import violating limit-relative-import rule";

  public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    return this.applyWithWalker(
      new NoImportsWalker(sourceFile, this.getOptions())
    );
  }
}

// The walker takes care of all the work.
class NoImportsWalker extends Lint.RuleWalker {
  public visitImportDeclaration(node: ts.ImportDeclaration): void {
    console.log(node.moduleSpecifier.getText());
    this.addFailureAtNode(node.moduleSpecifier, Rule.FAILURE_STRING);
    // create a failure at the current position
    /* this.addFailure(
      this.createFailure(node.getStart(), node.getWidth(), Rule.FAILURE_STRING)
    ); */

    // call the base version of this visitor to actually parse this node
    super.visitImportDeclaration(node);
  }
}
