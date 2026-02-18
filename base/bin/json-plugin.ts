import ts from "typescript";
import {
  CompilerOptions,
  EmitHost,
  Plugin,
  ProcessedFile,
  Visitors,
} from "typescript-to-lua";

export default class JsonPlugin implements Plugin {
  private verbose: boolean;
  visitors?: Visitors | undefined;

  private jsonImportingFiles = new Set<string>();

  constructor(verbose: boolean) {
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
    _options: CompilerOptions,
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

      file.code =
        'local JSON = require("@noita-ts/base/dist/json")\n' + file.code;
    }
  }
}
