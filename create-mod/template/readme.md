## A noita-ts mod template

Includes a basic `init.ts` and `settings.ts` file setup, as well as generates
a sensible `package.json` that is ready to run.

A `workshop-preview.png` file in the root package directory will be used for
the workshop preview if present.

The keys from the `package.json` file used by `nts` to produce a mod:

- `"name": "example-mod"`\
  Name of the package also doubles as mod ID, although you can override it in `noita.id`.
- `"description": "An example mod written in TypeScript using noita-ts"`\
  Description of the npm package, also doubles as in-game mod description unless overridden by `noita.description`.
- `"author": "necauqua"`\
  Author of the package, not actually used in mod creation (yet).
- `"noita.id": "example-mod"`\
  Can be used to set the mod ID and free up the npm package name.
- `"noita.name": "Example TypeScript Mod"`\
  Name of the mod shown in-game (defaults to `noita.id`/`name`)
- `"noita.description": "An example mod written in TypeScript using noita-ts"`\
  Description of the mod shown in-game, defaults to package description.
- `"noita.unsafe": false`\
  Sets the `"request_no_api_restrictions"="1"` key in mod.xml - unsafe mods cannot be published to the workshop and must be installed manually, but are not sandboxed - meaning you can do network/file access, ffi and literally anything at all, including being a crypto miner.
- `"noita.workshop.id": 0`\
  This will be set by the publish command automatically. If you want to publish the mod as a separate workshop item (e.g. after deleting the original), remove this, otherwise don't touch it
- `"noita.workshop.name": "Example TypeScript Mod"`\
  Name of the mod on the steam workshop page, defaults to value of noita.name
- `"noita.workshop.description": "Uploaded to the workshop!"`\
  The description of the mod on the steam workshop page, defaults to value of `noita.description`.
- `"noita.workshop.tags": []`\
  Tags for the mod on the steam workshop page, just sets the corresponding key in `mod.xml`.
- `"noita.workshop.skip-files": []`\
  Files to skip when uploading to the workshop, just sets the corresponding key in `mod.xml`.
- `"noita.workshop.skip-folders": []`\
  Folders to skip when uploading to the workshop, just sets the corresponding key in `mod.xml`.
- `"noita.compat": 12`\
  API compatibility version, should Noita release a big update that changes this number, an icon "this mod has not been tested with latest mod api" will be shown in the modlist.
- `"noita.ui-newgame-name": null`\
  This and everything below is just setting other mod.xml properties:
  - `"noita.ui-newgame-description": null`
  - `"noita.ui-newgame-gfx-banner-bg": null`
  - `"noita.ui-newgame-gfx-banner-fg": null`
  - `"noita.is-game-mode": false`
  - `"noita.game-mode-supports-save-slots": false`
  - `"noita.is-translation": false`
  - `"noita.translation-xml-path": null`
  - `"noita.translation-csv-path": null`
