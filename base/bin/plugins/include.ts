import { CompilerOptions, EmitFile, EmitHost, Plugin } from "typescript-to-lua";
import { Program } from "typescript";
import path from "path";
import fs from "fs";

type WriteCallback = (filePath: string, content: Buffer) => void;

export default class IncludePlugin implements Plugin {
  private directive: string;
  private writeCallback: WriteCallback;
  private verbose: boolean;

  private directiveRegex: RegExp;

  constructor(
    directive: string,
    writeCallback: WriteCallback,
    verbose: boolean,
  ) {
    this.directive = directive;
    this.writeCallback = writeCallback;
    this.verbose = verbose;

    this.directiveRegex = new RegExp(
      `^\\s*---\\s*@${directive}\\s+(\\S+)\\s*$`,
      "gm",
    );
  }

  beforeEmit(
    _program: Program,
    _options: CompilerOptions,
    emitHost: EmitHost,
    result: EmitFile[],
  ) {
    for (const file of result) {
      for (const [_, include] of file.code.matchAll(this.directiveRegex)) {
        // we need the original location (from node_modules),
        // not the target directory (in lua_modules)
        const { fileName } = file as any; // from tstl.ProcessedFile
        if (typeof fileName !== "string") {
          continue;
        }

        const relative = path.relative(
          emitHost.getCurrentDirectory(),
          file.outputPath,
        );
        if (this.verbose) {
          console.log(
            `@${this.directive} "${include}" encountered in ${relative}`,
          );
        }

        const originalFile = path.resolve(path.dirname(fileName), include);
        try {
          this.writeCallback(
            path.join(path.dirname(relative), include),
            fs.readFileSync(originalFile),
          );
        } catch (e) {
          console.error(`failed to include ${include} from file ${relative}`);
        }
      }
    }
  }
}
