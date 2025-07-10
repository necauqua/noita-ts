export enum Category {
  Member = "Member",
  CustomDataType = "Custom Data Type",
  Private = "Private",
  Object = "Object",
}

export type Component = {
  name: string;
  fields: ComponentField[];
};

export type ComponentField = {
  category: Category;
  ty: string;
  name: string;
  hints: string;
  doc: string;
};

export type ComponentError = {
  component: string;
  lineNumber: number;
  line: string;
};

function newComponentError(
  component: string | undefined,
  lineNumber: number,
  line: string,
): ComponentError {
  return {
    component: component ?? "",
    lineNumber,
    line,
  };
}

export function parseComponents(
  input: string,
): [Component[], ComponentError[]] {
  const result: Component[] = [];
  const errors: ComponentError[] = [];

  let name: string | undefined = undefined;
  let fields: ComponentField[] = [];
  let category: Category = Category.Member;

  const lines = input.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const origLine = lines[i];
    if (origLine.trim() === "") continue;

    if (!origLine.startsWith(" ")) {
      if (name !== undefined) {
        result.push({ name, fields: fields.slice() });
        fields = [];
      }
      name = origLine.trim();
      continue;
    }

    const line = origLine.trim();
    if (line.startsWith("-")) {
      const cat = line.slice(1).trim().replace(/-+$/, "").trimEnd();
      switch (cat) {
        case "Members":
          category = Category.Member;
          break;
        case "Custom data types":
          category = Category.CustomDataType;
          break;
        case "Privates":
          category = Category.Private;
          break;
        case "Objects":
          category = Category.Object;
          break;
        default:
          category = Category.Member;
      }
      continue;
    }

    const splitTy = splitType(line);
    if (!splitTy) {
      errors.push(newComponentError(name, i + 1, line));
      continue;
    }
    const [ty, rest1] = splitTy;
    const rest1Trim = rest1.trim();
    const fieldNameSplit = rest1Trim.indexOf(" ");
    if (fieldNameSplit === -1) {
      errors.push(newComponentError(name, i + 1, line));
      continue;
    }
    const fieldName = rest1Trim.slice(0, fieldNameSplit);
    const rest2 = rest1Trim.slice(fieldNameSplit + 1).trim();
    const hintsDocSplit = rest2.indexOf('"');
    if (hintsDocSplit === -1) {
      errors.push(newComponentError(name, i + 1, line));
      continue;
    }
    const hints = rest2.slice(0, hintsDocSplit).trim();
    const doc = rest2.slice(hintsDocSplit + 1).replace(/"$/, "");

    fields.push({
      category,
      ty,
      name: fieldName,
      hints,
      doc,
    });
  }

  return [result, errors];
}

/// A collection of cringetastic workarounds for the types that overflow their
/// table cells and since there's apparently no minimal size for separators
/// they get mushed with the name.
///
/// Heuristic-ish algorithms here:
///  - Handle the unsigned types because ofc they have a space in them
///  - If the type is a pointer we split on the star
///  - If the type is an enum we split on the "::Enum" part
///  - Else all types seem to be SCREAMING_CASE so we split on `[A-Z]{4}[a-z]`
///    regex basically (4 because of IKLimbAttackerState)
///  - And then we have the happy path of splitting on space
function splitType(s: string): [string, string] | undefined {
  if (s.startsWith("unsigned ")) {
    const rest = s.slice("unsigned ".length);
    const split = splitType(rest);
    if (!split) return undefined;
    return [`unsigned ${split[0]}`, split[1]];
  }

  const rstar = s.lastIndexOf("*");
  if (rstar !== -1) {
    const ty = s.slice(0, rstar + 1);
    const rest = s.slice(rstar + 1);
    if (!ty.includes(" ") && !rest.startsWith(" ")) {
      return [ty, rest];
    }
  }

  const enumIdx = s.indexOf("::Enum");
  if (enumIdx !== -1) {
    const ty = s.slice(0, enumIdx + 6);
    const rest = s.slice(enumIdx + 6);
    if (!ty.includes(" ") && !rest.startsWith(" ")) {
      return [ty, rest];
    }
  }

  // Heuristic: split on SCREAMING_CASE followed by lowercase
  let prev = ["", "", "", ""];
  for (let i = 0; i < s.length; i++) {
    if (
      prev.every((ch) => ch >= "A" && ch <= "Z") &&
      s[i] >= "a" &&
      s[i] <= "z"
    ) {
      const ty = s.slice(0, i);
      const rest = s.slice(i);
      if (!ty.includes(" ") && !rest.startsWith(" ")) {
        return [ty, rest];
      }
    }
    prev = [prev[1], prev[2], prev[3], s[i]];
  }

  // Default: split on first space
  const splitBalanced = splitBalancedSpace(s);
  if (splitBalanced.length > 0) {
    const ty = splitBalanced[0].replace(/ /g, "");
    const rest = s.slice(splitBalanced[0].length);
    return [ty, rest];
  }
  return undefined;
}

function splitBalancedSpace(str: string): string[] {
  const parts: string[] = [];
  let buf = "";
  let depth = 0;
  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    if (ch === " " && depth === 0) {
      parts.push(buf);
      buf = "";
      continue;
    }
    buf += ch;
    if ("({[<".includes(ch)) depth++;
    if (")}]>".includes(ch)) depth--;
  }
  if (buf.length > 0) parts.push(buf);
  return parts;
}
