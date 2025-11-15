import * as fs from "fs";
import { Command } from "commander";

import { parseLua, LuaApiDef, LuaType } from "./lua_parser";
import { parseComponents, Component } from "./component_parser";
import * as path from "path";

function writer(outPath?: string): NodeJS.WritableStream {
  if (!outPath) {
    return process.stdout;
  }
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  return fs.createWriteStream(outPath);
}

function mapLuaType(luaType: string, name?: string): string {
  if (name?.endsWith("entity_id") || name?.endsWith("entity")) {
    return "EntityID";
  }
  if (name?.endsWith("component_id") || name?.endsWith("component")) {
    return "ComponentID";
  }
  if (name == "gui") {
    return "GuiID";
  }
  switch (luaType) {
    case "nil":
      return "undefined";
    case "bool":
    case "bool_is_new":
    case "replace_existing_cells":
      return "boolean";
    case "component_id":
      return "ComponentID";
    case "item_entity_id":
      return "EntityID";
    case "physics_body_id":
    case "int_body_id":
      return "number";
    case "error_string":
    case "name":
    case "new_text":
      return "string";
    case "float":
    case "float x":
    case "float y":
    case "x":
    case "y":
      return "number";
    case "uint":
    case "int":
    case "uint32":
      return "number";
    case "function":
      return "unknown";
    case "":
    case "obj":
    case "script_return_type":
    case "multiple types":
    case "multiple_types":
      return "any";
    default:
      return luaType;
  }
}

function writeType(w: NodeJS.WritableStream, ty: LuaType, name?: string) {
  switch (ty.kind) {
    case "basic":
      w.write(mapLuaType(ty.value, name));
      break;
    case "named":
      writeType(w, ty.inner, ty.name);
      break;
    case "array":
      writeType(w, ty.inner);
      w.write("[]");
      break;
    case "table":
      w.write("{ [key: ");
      writeType(w, ty.key);
      w.write("]: ");
      writeType(w, ty.value);
      w.write(" }");
      break;
    case "disjoint":
      ty.parts.forEach((t, i) => {
        if (i !== 0) w.write(" | ");
        writeType(w, t);
      });
      break;
    case "return-list":
      w.write("LuaMultiReturn<[");
      ty.parts.forEach((t, i) => {
        if (i !== 0) w.write(", ");
        writeType(w, t);
      });
      w.write("]>");
      break;
  }
}

function writeLuaApi(w: NodeJS.WritableStream, luaApiDefs: LuaApiDef[]) {
  w.write("/** !Auto-generated! */\n/** @noSelfInFile */\n");
  for (const def of luaApiDefs) {
    w.write("\n/**\n");
    w.write(` * ${def.doc ?? "No documentation from Nolla"}\n`);
    w.write(" */\n");
    w.write(`declare function ${def.name}(`);
    def.params.forEach((param, i) => {
      if (i !== 0) w.write(", ");
      if (param.name === "" && param.ty.kind === "basic") {
        w.write(param.ty.value);
      } else {
        w.write(param.name);
      }
      if (param.default !== undefined) w.write("?");
      w.write(": ");
      writeType(w, param.ty, param.name);
    });
    w.write("): ");
    if (def.ret) {
      writeType(w, def.ret);
    } else {
      w.write("void");
    }
    w.write(";\n");
  }
}

function mapComponentType(ty: string): string {
  switch (ty) {
    case "bool":
      return "boolean";
    case "int":
    case "uint32":
    case "float":
    case "double":
      return "number";
    case "std_string":
    case "std::string":
      return "string";
    default:
      return `ComponentTypeMap['${ty}']`;
  }
}

function writeComponents(w: NodeJS.WritableStream, components: Component[]) {
  w.write("/** !Auto-generated! */\n\ndeclare type ComponentShapes = {\n");
  for (const component of components) {
    w.write(`    ${component.name}: {\n`);
    for (const field of component.fields) {
      w.write("        /**\n");
      if (field.doc) w.write(`         * ${field.doc}\n`);
      if (field.hints !== "-") w.write(`         * - Hints: ${field.hints}\n`);
      w.write("         */\n");
      w.write(`        ${field.name}: ${mapComponentType(field.ty)},\n`);
    }
    w.write("    };\n");
  }
  w.write("};\n");
}

function readExclusions(filename: string): Set<string> {
  const text = fs.readFileSync(filename, "utf8");
  const lines = text.split("\n");
  const exclusions = new Set<string>();
  for (const line of lines) {
    const match = line.trim().match(/declare function (.*?)[(<]/);
    if (match) {
      exclusions.add(match[1]);
    }
  }
  return exclusions;
}

const program = new Command("typegen");
program
  .command("lua")
  .description("Generate function types from lua_api_documentation.txt")
  .argument("[input]", "Input file", "lua_api_documentation.txt")
  .option("-o, --out <out>")
  .option(
    "-f, --fixups <fixups>",
    "Path to fixups file (declarations in it will be excluded from output)",
  )
  .description("Parse lua_api_documentation.txt")
  .action(
    (input: string, { out, fixups }: { out?: string; fixups?: string }) => {
      let luaApiDefs = parseLua(fs.readFileSync(input, "utf8")).filter(
        (res: any) => typeof res !== "string",
      ) as LuaApiDef[];

      if (fixups) {
        const exclusions = readExclusions(fixups);
        luaApiDefs = luaApiDefs.filter((def) => {
          const exclude = exclusions.has(def.name);
          if (exclude) {
            process.stderr.write(
              `Excluding function ${def.name} due to fixups\n`,
            );
          }
          return !exclude;
        });
      }
      writeLuaApi(writer(out), luaApiDefs);
    },
  );

program
  .command("components")
  .option("-i, --input <input>", "Input file", "component_documentation.txt")
  .option("-o, --out <out>")
  .description("Parse component_documentation.txt")
  .action((opts: { input: string; out?: string }) => {
    const [components, errors] = parseComponents(
      fs.readFileSync(opts.input, "utf8"),
    );
    for (const error of errors) {
      console.error(
        `Failed to parse component field, line: ${error.line} (component: ${error.component}, line number: ${error.lineNumber})`,
      );
    }
    writeComponents(writer(opts.out), components);
  });

program.parse(process.argv);
