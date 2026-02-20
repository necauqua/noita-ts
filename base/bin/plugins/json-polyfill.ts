import ts from "typescript";
import {
  CompilerOptions,
  EmitHost,
  Plugin,
  ProcessedFile,
  Visitors,
} from "typescript-to-lua";

export default class JsonPolyfillPlugin implements Plugin {
  private prefix: string;
  private verbose: boolean;
  visitors?: Visitors | undefined;

  private jsonImportingFiles = new Set<string>();

  constructor(module: string, verbose: boolean) {
    this.prefix = `local JSON = require("${module}")\n`;
    this.verbose = verbose;
    this.visitors = {
      [ts.SyntaxKind.Identifier]: (node, context) => {
        if (node.text === "JSON") {
          this.jsonImportingFiles.add(node.getSourceFile().fileName);
        }
        return context.superTransformExpression(node);
      },
    };
  }

  afterPrint(
    _program: ts.Program,
    options: CompilerOptions,
    _emitHost: EmitHost,
    result: ProcessedFile[],
  ) {
    if (this.jsonImportingFiles.size === 0) {
      return;
    }
    for (const file of result) {
      if (!this.jsonImportingFiles.has(file.fileName)) {
        continue;
      }
      if (this.verbose) {
        console.log(`JSON detected in file: ${file.fileName}`);
      }

      file.code = this.prefix + file.code;

      if (options.luaBundle) {
        file.sourceMapNode = undefined;
      }
    }
  }
}
