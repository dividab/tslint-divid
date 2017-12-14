import * as ts from "typescript";
import * as Lint from "tslint";
import * as path from "path";

export class Rule extends Lint.Rules.AbstractRule {
  constructor(options: Lint.IOptions) {
    super(options);
  }
  public static FAILURE_STRING = "Import violating limit-relative-import rule";

  public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    return this.applyWithWalker(
      new NoImportsWalker(sourceFile, this.getOptions())
    );
  }
}

// The walker takes care of all the work.
class NoImportsWalker extends Lint.RuleWalker {
  private containment: string = "./";
  constructor(sourceFile: ts.SourceFile, options: Lint.IOptions) {
    super(sourceFile, options);
    const containmentRelative = options.ruleArguments[0] as string | undefined;
    if (!containmentRelative) {
      throw new Error("Missing relative containment path");
    }

    this.containment = path.resolve(containmentRelative);
  }
  public visitImportDeclaration(node: ts.ImportDeclaration): void {
    const sourceFileName = node.getSourceFile().fileName;
    const importText = node.moduleSpecifier
      .getText()
      .replace(/^"(.+?)"$/, "$1");

    if (
      !importText.startsWith("../") ||
      !isInside(this.containment, sourceFileName)
    ) {
      super.visitImportDeclaration(node);
      return;
    }

    const stepsUp = importText.split("/").filter(s => s === "..");
    const resultParent = path.join(
      this.containment,
      ...stepsUp.map(s => `${s}/`)
    );

    if (resultParent.length < this.containment.length) {
      this.addFailureAtNode(node.moduleSpecifier, Rule.FAILURE_STRING);
    }

    // call the base version of this visitor to actually parse this node
    super.visitImportDeclaration(node);
  }
}

function isInside(containment: string, fileName: string): boolean {
  return fileName.replace(containment, "").length < fileName.length;
}
