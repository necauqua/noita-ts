#!/usr/bin/env node

import * as p from "@clack/prompts";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

function bail(msg: string): never {
  p.cancel(msg);
  process.exit(1);
}

function cancellable<T>(value: T | symbol): T {
  return p.isCancel(value) ? bail("Cancelled.") : (value as T);
}

async function main() {
  p.intro("@noita-ts/create-mod");

  const dirArg = process.argv[2];

  const location =
    dirArg ??
    cancellable(
      await p.text({
        message: "Select a directory:",
        validate(v) {
          if (!v) {
            return "A dir name is required";
          }
          if (fs.existsSync(v)) {
            return `Location "${v}" already exists.`;
          }
        },
      }),
    );

  const modId = cancellable(
    await p.text({
      message: "Mod ID:",
      placeholder: "my-ts-mod",
      initialValue: path
        .basename(location)
        .replaceAll(/\s+/g, "-")
        .toLowerCase(),
      validate(v) {
        if (!v) {
          return "Name is required";
        }
        if (!/^[a-z0-9-_]{1,32}$/.test(v)) {
          return "Use up to 32 lowercase alphanumeric characters, hyphens, and underscores only";
        }
      },
    }),
  );

  const name = cancellable(
    await p.text({
      message: "Name:",
      placeholder: "Example TS Mod",
    }),
  );

  const description = cancellable(
    await p.text({
      message: "Description:",
      placeholder: "A mod written in typescript via noita-ts",
    }),
  );

  const unsafe = cancellable(
    await p.confirm({
      message:
        "Unsafe? (aka 'no API restrictions', prevents publishing to Steam Workshop)",
      initialValue: false,
    }),
  );

  const author = cancellable(
    await p.text({
      message: "Author (leave empty to skip):",
      placeholder: "",
    }),
  );

  const extraBaseDeps = cancellable(
    await p.multiselect({
      message:
        "Extra base dependencies (space to select, enter to confirm/skip):",
      required: false,
      options: [
        {
          value: "@noita-ts/nxml",
          hint: "a library for convenient Noita XML file editing, wrapper around Nathans NXML fork",
        },
        {
          value: "@noita-ts/pollnet",
          hint: "a networking library, wrapper around pollnet",
        },
        {
          value: "@noita-ts/ffi",
          hint: "a set of Noita engine modding utitiles",
        },
      ],
    }),
  );

  const workshop =
    !unsafe &&
    cancellable(
      await p.confirm({
        message: "Setup (some of) Steam Workshop metadata?",
        initialValue: true,
      }),
    );

  let workshopName: string | undefined;
  let workshopDescription: string | undefined;

  if (workshop) {
    workshopName = cancellable(
      await p.text({
        message: "Workshop Name:",
        placeholder: "My TS Mod",
        initialValue: name,
      }),
    );
    workshopDescription = cancellable(
      await p.text({
        message: "Workshop Description:",
        placeholder: "A description for the Steam Workshop",
        initialValue: description,
      }),
    );
  }

  copyDir(
    path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "template"),
    location,
  );

  const pkg = {
    name: modId,
    description,
    ...(author ? { author } : {}),
    version: "0.1.0",
    private: true,
    ["noita.name"]: name,
    ["noita.compat"]: 12,
    ...(unsafe ? { ["noita.unsafe"]: true } : {}),
    ...(workshopName ? { ["noita.workshop.name"]: workshopName } : {}),
    ...(workshopDescription
      ? { ["noita.workshop.description"]: workshopDescription }
      : {}),
    scripts: {
      start: "nts run",
      build: "nts build",
    },
    dependencies: {
      "@noita-ts/base": "latest",
      ...Object.fromEntries(extraBaseDeps.map((dep) => [dep, "latest"])),
    },
  };

  fs.writeFileSync(
    path.join(location, "package.json"),
    JSON.stringify(pkg, null, 2) + "\n",
  );

  p.note(
    [`cd ${location}`, `npm install`, `npm start`, `npx nts publish`].join(
      "\n",
    ),
    "Next steps",
  );

  p.outro("Happy modding!");
}

function copyDir(src: string, dest: string) {
  fs.mkdirSync(dest, { recursive: true });

  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
