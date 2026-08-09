export interface LuaApiDef {
  name: string;
  params: LuaApiParam[];
  ret?: LuaType;
  doc?: string;
}

export interface LuaApiParam {
  name: string;
  ty: LuaType;
  default?: string;
}

export type LuaType =
  | { kind: "basic"; value: string }
  | { kind: "named"; name: string; inner: LuaType }
  | { kind: "array"; inner: LuaType }
  | { kind: "table"; key: LuaType; value: LuaType }
  | { kind: "disjoint"; parts: LuaType[] }
  | { kind: "return-list"; parts: LuaType[] };

export function parseLua(input: string): Array<LuaApiDef | string> {
  const lines = input.split(/\r?\n/);
  if (!lines.length) {
    throw new Error("Lua doc input file is empty");
  }

  const header = lines[0];
  const [_, version] = header.match(/Current modding API version: (.*)/) || [];
  if (!version) {
    throw new Error("Lua doc input file is missing the version header");
  }

  if (!lines[1]) {
    throw new Error("Lua doc input file is missing the splitter");
  }

  return lines.slice(2).map((line) => {
    const def = parseLuaApiDef(line);
    return def ? def : line;
  });
}

function parseLuaApiDef(def: string): LuaApiDef | null {
  const idx1 = def.indexOf("(");
  if (idx1 === -1) {
    return null;
  }
  const idx2 = def.indexOf(")", idx1);
  if (idx2 === -1) {
    return null;
  }

  const name = def.slice(0, idx1).trim();
  const paramsRaw = def.slice(idx1 + 1, idx2);
  const params =
    paramsRaw === "" ? [] : paramsRaw.split(",").map(parseLuaApiParam);

  const rest = def.slice(idx2 + 1);
  let maybeRet = rest;
  let maybeDoc = "";
  const idxBracket = rest.indexOf("[");
  const idxParen = rest.indexOf("(");
  if (idxBracket !== -1) {
    maybeRet = rest.slice(0, idxBracket);
    maybeDoc = rest.slice(idxBracket + 1, rest.lastIndexOf("]"));
  } else if (idxParen !== -1) {
    maybeRet = rest.slice(0, idxParen);
    maybeDoc = rest.slice(idxParen + 1, rest.lastIndexOf(")"));
  }

  const ret = maybeRet.trim().startsWith("->")
    ? parseLuaType(maybeRet.trim().slice(2))
    : undefined;

  const doc = maybeDoc.trim() ? maybeDoc.replace(/\\n/g, "\n") : undefined;

  return { name, params, ret, doc };
}

function parseLuaApiParam(s: string): LuaApiParam {
  const [rest, defaultVal] = s.trim().split("=");
  let [name, ty] = ["", ""];
  const colonIdx = rest.indexOf(":");
  if (colonIdx !== -1) {
    name = rest.slice(0, colonIdx).trim();
    ty = rest.slice(colonIdx + 1).trim();
  } else {
    const spaceIdx = rest.indexOf(" ");
    if (spaceIdx !== -1) {
      ty = rest.slice(0, spaceIdx).trim();
      name = rest.slice(spaceIdx + 1).trim();
    } else {
      name = rest.trim();
      ty = "";
    }
  }
  return {
    name,
    ty: parseLuaType(ty),
    default: defaultVal ? defaultVal.trim() : undefined,
  };
}

function parseLuaType(s: string): LuaType {
  return mergeLuaType(doParseLuaType(s.trim()));
}

function doParseLuaType(s: string): LuaType {
  if (!s) {
    return { kind: "basic", value: "" };
  }

  const stripped = stripParensBalanced(s, "(", ")");
  if (stripped) {
    return parseLuaType(stripped);
  }
  const stripped2 = stripParensBalanced(s, "{", "}");
  if (stripped2) {
    const dashIdx = stripped2.indexOf("-");
    if (dashIdx !== -1) {
      const k = stripped2.slice(0, dashIdx);
      const v = stripped2.slice(dashIdx + 1);
      return { kind: "table", key: parseLuaType(k), value: parseLuaType(v) };
    }
    return { kind: "array", inner: parseLuaType(stripped2) };
  }

  const commaParts = splitBalanced(s, ",");
  if (commaParts.length > 1) {
    return { kind: "return-list", parts: commaParts.map(parseLuaType) };
  }

  const colonIdx = s.indexOf(":");
  if (colonIdx > 0 && /^[a-zA-Z0-9_]+$/.test(s.slice(0, colonIdx))) {
    const name = s.slice(0, colonIdx);
    const rest = s.slice(colonIdx + 1);
    return { kind: "named", name, inner: parseLuaType(rest) };
  }

  const pipeParts = splitBalanced(s, "|");
  if (pipeParts.length > 1) {
    return { kind: "disjoint", parts: pipeParts.map(parseLuaType) };
  }

  return { kind: "basic", value: s.replace(/[ .-]+$/, "") };
}

function mergeLuaType(t: LuaType): LuaType {
  if (t.kind === "array") {
    return { kind: "array", inner: mergeLuaType(t.inner) };
  }
  if (t.kind === "table") {
    return {
      kind: "table",
      key: mergeLuaType(t.key),
      value: mergeLuaType(t.value),
    };
  }
  if (t.kind === "disjoint") {
    const merged: LuaType[] = [];
    for (const part of t.parts) {
      if (part.kind === "disjoint") {
        merged.push(...part.parts.map(mergeLuaType));
      } else {
        merged.push(mergeLuaType(part));
      }
    }
    return { kind: "disjoint", parts: merged };
  }
  if (t.kind === "return-list") {
    const merged: LuaType[] = [];
    for (const part of t.parts) {
      if (part.kind === "return-list") {
        merged.push(...part.parts.map(mergeLuaType));
      } else {
        merged.push(mergeLuaType(part));
      }
    }
    return { kind: "return-list", parts: merged };
  }
  return t;
}

// Splits a string by a separator, ignoring separators inside (), {}, []
function splitBalanced(s: string, sep: string): string[] {
  const result: string[] = [];
  let depth = 0;
  let last = 0;
  for (let i = 0; i < s.length; ++i) {
    if ("({[".includes(s[i])) {
      ++depth;
    }
    if (")}]".includes(s[i])) {
      --depth;
    }
    if (s[i] === sep && depth === 0) {
      result.push(s.slice(last, i));
      last = i + 1;
    }
  }
  result.push(s.slice(last));
  return result;
}

function stripParensBalanced(
  str: string,
  open: string,
  close: string,
): string | undefined {
  if (!str.startsWith(open) || !str.endsWith(close)) {
    return undefined;
  }
  let depth = 0;
  for (let i = open.length; i < str.length - close.length; ) {
    const ch = str[i];
    if (ch === open) {
      depth++;
    } else if (ch === close) {
      if (depth === 0) return undefined;
      depth--;
    }
    i++;
  }
  return str.substring(open.length, str.length - close.length);
}
