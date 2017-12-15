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
    const sourceFileName = sourceFile.fileName;
    const absoulutFileName = path.isAbsolute(sourceFileName)
      ? sourceFileName
      : path.resolve(sourceFileName);

    const sourceFileDirectory = getDirectoryNameFromFullFileNamePath(
      absoulutFileName
    );

    if (!isInside(this.containment, sourceFileDirectory)) {
      return [];
    }

    const maxLevels =
      path.relative(sourceFileDirectory, this.containment).split("..").length -
      1;

    return this.applyWithFunction(sourceFile, (ctx: Lint.WalkContext<void>) => {
      checkNode(ctx, maxLevels);
    });
  }
}

function checkNode(ctx: Lint.WalkContext<void>, maxLevels: number): void {
  return ts.forEachChild(ctx.sourceFile, cb);

  function cb(node: ts.Node): void {
    if (node.kind !== ts.SyntaxKind.ImportDeclaration) {
      return;
    }

    const importDeclaration = node as ts.ImportDeclaration;
    const importText = importDeclaration.moduleSpecifier
      .getText()
      .replace(/^"(.+?)"$/, "$1");

    if (!importText.startsWith("../")) {
      return;
    }

    const levels = countLevels(importText);
    // console.log("levels", levels);
    if (levels >= maxLevels) {
      ctx.addFailureAtNode(
        importDeclaration.moduleSpecifier,
        Rule.FAILURE_STRING
      );
    }
  }
}

function getDirectoryNameFromFullFileNamePath(fileNamePath: string): string {
  return fileNamePath.replace(/(.*?\/)[^\/]+?$/, "$1");
}

function isInside(containment: string, fileName: string): boolean {
  return fileName.replace(containment, "").length < fileName.length;
}

function countLevels(importText: string): number {
  // console.log("importText", importText);
  return importText.split("/").reduce((soFar: number, current: string) => {
    // console.log("current", current);
    switch (current) {
      case "..":
        return soFar + 1;
      default:
        return soFar;
    }
  }, 0);
}
