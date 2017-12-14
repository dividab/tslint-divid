import * as ts from "typescript";
import * as Lint from "tslint";
import * as path from "path";

export class Rule extends Lint.Rules.AbstractRule {
  private containment: string = "./";
  constructor(options: Lint.IOptions) {
    super(options);
    const containmentRelative = options.ruleArguments[0] as string | undefined;
    if (!containmentRelative) {
      throw new Error("Missing relative containment path");
    }
    this.containment = path.resolve(containmentRelative);
  }
  public static FAILURE_STRING = "Import violating limit-relative-import rule";

  public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    return this.applyWithFunction(sourceFile, (ctx: Lint.WalkContext<void>) => {
      checkNode(ctx, this.containment);
    });
  }
}

function checkNode(ctx: Lint.WalkContext<void>, containment: string): void {
  return ts.forEachChild(ctx.sourceFile, cb);

  function cb(node: ts.Node): void {
    if (node.kind !== ts.SyntaxKind.ImportDeclaration) {
      return;
    }

    const importDeclaration = node as ts.ImportDeclaration;

    const sourceFileName = node.getSourceFile().fileName;
    const importText = importDeclaration.moduleSpecifier
      .getText()
      .replace(/^"(.+?)"$/, "$1");

    if (
      !importText.startsWith("../") ||
      !isInside(containment, sourceFileName)
    ) {
      return;
    }

    const stepsUp = importText.split("/").filter(s => s === "..");
    const resultParent = path.join(sourceFileName, ...stepsUp.map(s => s));
    /* console.log("------------------------------------------------");
    console.log("containment", containment);
    console.log("sourceFileName", sourceFileName);
    console.log("resultParent", resultParent); */
    if (resultParent.length <= containment.length) {
      ctx.addFailureAtNode(
        importDeclaration.moduleSpecifier,
        Rule.FAILURE_STRING
      );
    }
  }
}

function isInside(containment: string, fileName: string): boolean {
  return fileName.replace(containment, "").length < fileName.length;
}
