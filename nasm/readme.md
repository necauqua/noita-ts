# @noita-ts/nasm

The [NASM](https://nasm.us/) assembler as an npm package, together with the TSTL
plugin that turns `*.asm` x86 patches into Lua modules — see
[asm-plugin.md](asm-plugin.md) for the patch format, the `reloc` macro and the
plugin's types.

```sh
npm i -D @noita-ts/nasm
```

```jsonc
// tsconfig.json
{
  "tstl": { "luaPlugins": [{ "name": "@noita-ts/nasm/asm-plugin" }] }
}
```

```ts
/// <reference types="@noita-ts/nasm/asm" />
import patch from './patches/my_patch.asm';
// patch({ <reloc>: value, ... }), patch.raw, patch.vars.<reloc>, patch.labels.<label>

// or inline, no file needed — relocs and labels are parsed from the source:
const patch2 = asm(`
target: reloc
entry:
    jmp [target]
`);
patch2({ target: addr });
```

The assembled patches are plain `{ asm, vars, labels }` tables and don't depend
on anything else; [`@noita-ts/ffi`](../ffi) is what you'd normally use to
actually inject them at runtime.

The binary path is also exposed directly, for CommonJS too
(`require('@noita-ts/nasm')`), since the TSTL plugin hook that assembles patches
is synchronous:

```js
import { nasmPath } from '@noita-ts/nasm'; // absolute path to the executable
```

## Platform packages

The binaries live in one package per platform:

| package                    | binary     |
| -------------------------- | ---------- |
| `@noita-ts/nasm-linux-x64` | `nasm`     |
| `@noita-ts/nasm-win32-x64` | `nasm.exe` |

They're listed here as `optionalDependencies` and each declares `os`/`cpu`, so
npm downloads only the one matching the current machine and silently skips the
rest — you never depend on them by name. Adding a platform means publishing a
new `@noita-ts/nasm-<os>-<cpu>` and listing it in `index.cjs` + the
`optionalDependencies` here.

If the matching package is missing (installed with `--no-optional`, or a
`node_modules`/lockfile copied from another platform), importing this package
throws explaining which package is absent.
