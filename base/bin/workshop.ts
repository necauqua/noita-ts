import fs from "fs";
import path from "path";
import steamworks from "steamworks.js";
import type NoitaMod from "./mod.js";

/** Noita's Steam app id - the Workshop items live under it. */
export const NOITA_APP_ID = 881100;

/**
 * The tags Noita declares for its Workshop.
 *
 * Steam only accepts tags from an app's declared set, and a rejected tag fails
 * the whole submission, so they are checked before anything is uploaded.
 */
export const WORKSHOP_TAGS = [
  "gameplay",
  "graphics",
  "quality of life",
  "translations",
  "perks",
  "spells",
  "player characters",
  "loadouts",
  "biomes",
  "total conversions",
  "game modes",
  "creatures",
  "bosses",
  "alchemy",
  "tweaks",
  "items",
  "audio",
  "cheats",
  "funny",
  "streaming integration",
  "mod dependencies",
];

export const VISIBILITIES = [
  "public",
  "friends-only",
  "private",
  "unlisted",
] as const;

export type Visibility = (typeof VISIBILITIES)[number];

/** `UgcItemVisibility`, which is a const enum and so has no runtime value. */
const VISIBILITY_VALUE: Record<Visibility, 0 | 1 | 2 | 3> = {
  public: 0,
  "friends-only": 1,
  private: 2,
  unlisted: 3,
};

/**
 * Files that describe the item to the uploader rather than being part of it.
 *
 * Noita leaves these out of the content it uploads - a Workshop copy of a mod
 * has neither of them - and the preview image goes up through its own API call.
 */
const NOT_UPLOADED = new Set([
  "workshop.xml",
  "workshop_id.txt",
  "workshop_preview_image.png",
]);

/** Steam limits, so that an oversized field fails here instead of mid-upload. */
const MAX_TITLE = 128;
const MAX_DESCRIPTION = 8000;
const MAX_PREVIEW_BYTES = 1024 * 1024;

const UPDATE_STATUS = [
  "invalid",
  "preparing config",
  "preparing content",
  "uploading content",
  "uploading preview",
  "committing changes",
];

type Client = ReturnType<typeof steamworks.init>;

export type PublishOptions = {
  changeNotes: string;
  /** Create a new item even when the mod already has a `noita.workshop.id`. */
  forceNew?: boolean;
  /** Only set on the item when given, or when the item is newly created. */
  visibility?: Visibility;
  /**
   * Called as soon as a new item exists, before its content is uploaded.
   *
   * Creating the item and filling it are two separate requests, and an item
   * that was created but never filled is invisible junk on the author's
   * account. Persisting the id first means a retry updates that item instead
   * of leaving it behind and making another one.
   */
  onItemCreated?: (itemId: string) => void;
};

export type PublishResult = {
  itemId: string;
  /** Whether a new Workshop item was created rather than an existing updated. */
  created: boolean;
  /** The item stays hidden until the author accepts the Workshop agreement. */
  needsToAcceptAgreement: boolean;
};

/** Normalizes a mod-relative path the way the skip settings are matched. */
const normalize = (p: string) =>
  p.replace(/\\/g, "/").replace(/^\.\//, "").replace(/\/+$/, "");

/** Something the author should know about, but that needs no answer. */
export type Warning = string;

/**
 * Something easy to forget and awkward to undo once the item is live, so the
 * author is asked about it rather than told.
 */
export type Question = {
  /** What is wrong. */
  note: string;
  /** The yes/no question that follows it. */
  prompt: string;
};

export type Checks = { warnings: Warning[]; questions: Question[] };

export type ValidateOptions = {
  /** Uploading through the game, which has rules of its own. */
  viaGame?: boolean;
  /** The visibility that was asked for, if any. */
  visibility?: Visibility;
};

/**
 * Checks everything Steam would reject, all at once, before the upload starts.
 *
 * Returns what to tell the author and what to ask them; anything fatal is
 * thrown.
 */
export function validate(
  mod: NoitaMod,
  { viaGame, visibility }: ValidateOptions = {},
): Checks {
  const { name, description, tags, previewPath, unsafe } = mod.workshop;
  const errors: string[] = [];
  const warnings: Warning[] = [];
  const questions: Question[] = [];

  if (!name) {
    errors.push('the mod has no name ("noita.workshop.name" or "noita.name")');
  } else if (name.length > MAX_TITLE) {
    errors.push(
      `the name is ${name.length} characters, Steam allows at most ${MAX_TITLE}`,
    );
  }

  if (description && description.length > MAX_DESCRIPTION) {
    errors.push(
      `the description is ${description.length} characters, ` +
        `Steam allows at most ${MAX_DESCRIPTION}`,
    );
  }

  const unknown = tags.filter((tag) => !WORKSHOP_TAGS.includes(tag));
  if (unknown.length > 0) {
    errors.push(
      `unknown "noita.workshop.tags": ${unknown.map((t) => `"${t}"`).join(", ")}\n` +
        `  Noita only declares: ${WORKSHOP_TAGS.join(", ")}`,
    );
  }

  if (previewPath) {
    const size = fs.statSync(previewPath).size;
    if (size > MAX_PREVIEW_BYTES) {
      errors.push(
        `the preview image is ${(size / 1024).toFixed(1)} KiB, ` +
          "Steam allows at most 1 MiB",
      );
    }
  } else {
    warnings.push(
      "the mod has no workshop-preview.png, so the item gets no preview image",
    );
  }

  if (tags.length === 0) {
    questions.push({
      note:
        'the mod has no "noita.workshop.tags", so it turns up under none of ' +
        "the Workshop's tag filters",
      prompt: "Publish it untagged?",
    });
  }

  if (unsafe) {
    if (viaGame) {
      errors.push(
        'the game refuses to upload unsafe mods ("noita.unsafe") - publish ' +
          "without --via-game to put one on the Workshop anyway",
      );
    } else {
      questions.push({
        note:
          'this is an unsafe mod ("noita.unsafe"), and Noita refuses to run ' +
          "those when they come from the Workshop - subscribers need a DLL " +
          "patch for it to load",
        prompt: "Publish it anyway?",
      });
    }
  }

  if (viaGame && visibility !== undefined && visibility !== "public") {
    warnings.push(
      `--visibility ${visibility} does nothing together with --via-game, ` +
        "which always uploads publicly",
    );
  }

  // only worth asking where public is not what was asked for: a new item is
  // unlisted, an update keeps whatever it had, and `--visibility public` says
  // it outright - but the game publishes for anyone to find no matter what
  if (viaGame) {
    questions.push({
      note: "the game always uploads publicly, for anyone to find and install",
      prompt: "Go public?",
    });
  }

  if (errors.length > 0) {
    throw new Error(
      `The mod cannot be published:\n${errors.map((e) => `  ${e}`).join("\n")}`,
    );
  }

  return { warnings, questions };
}

/** The predicate deciding what of the built mod actually goes to Steam. */
export function uploadFilter(mod: NoitaMod): (filePath: string) => boolean {
  const prefix = `${mod.id}/`;
  const skipFiles = new Set(mod.workshop.skipFiles.map(normalize));
  const skipFolders = mod.workshop.skipFolders.map(normalize).filter(Boolean);

  return (filePath) => {
    const rel = filePath.startsWith(prefix)
      ? filePath.slice(prefix.length)
      : filePath;
    if (NOT_UPLOADED.has(rel) || skipFiles.has(rel)) {
      return false;
    }
    return !skipFolders.some((f) => rel === f || rel.startsWith(`${f}/`));
  };
}

/** Connects to the running Steam client as Noita. */
function connect(): Client {
  let client;
  try {
    client = steamworks.init(NOITA_APP_ID);
  } catch (cause) {
    throw new Error(
      "Could not talk to Steam - it has to be running and logged in, and " +
        "Noita must not be running at the same time.",
      { cause },
    );
  }

  if (!client.apps.isSubscribedApp(NOITA_APP_ID)) {
    throw new Error(
      `${client.localplayer.getName()} does not own Noita, and only owners ` +
        "can publish to its Workshop.",
    );
  }

  return client;
}

/** Submits the update, reporting progress on a single line while it runs. */
function submit(
  client: Client,
  itemId: bigint,
  update: Parameters<Client["workshop"]["updateItem"]>[1],
): Promise<{ needsToAcceptAgreement: boolean }> {
  return new Promise((resolve, reject) => {
    let lastStatus = -1;
    client.workshop.updateItemWithCallback(
      itemId,
      update,
      NOITA_APP_ID,
      (data) => {
        if (lastStatus !== -1 && process.stdout.isTTY) {
          process.stdout.write("\n");
        }
        resolve(data);
      },
      reject,
      ({ status, progress, total }) => {
        if (!process.stdout.isTTY) {
          if (status !== lastStatus) {
            console.log(`  ${UPDATE_STATUS[status] ?? status}...`);
            lastStatus = status;
          }
          return;
        }
        lastStatus = status;
        const done = Number(progress);
        const all = Number(total);
        const percent = all > 0 ? `${((done / all) * 100).toFixed(0)}%` : "";
        process.stdout.write(
          `\r  ${UPDATE_STATUS[status] ?? status} ${percent}`.padEnd(40),
        );
      },
      250,
    );
  });
}

/**
 * Uploads the built mod to the Steam Workshop.
 *
 * The content is staged into a temporary folder because Steam takes a plain
 * directory, and the skip settings mean it is not the same tree `nts build`
 * would produce.
 */
export async function publish(
  mod: NoitaMod,
  { changeNotes, forceNew, visibility, onItemCreated }: PublishOptions,
): Promise<PublishResult> {
  const client = connect();
  console.log(`Publishing as ${client.localplayer.getName()}`);

  let needsToAcceptAgreement = false;
  let itemId: bigint;
  const created = forceNew || !mod.workshop.id;

  if (created) {
    console.log("Creating a new Workshop item...");
    const result = await client.workshop.createItem(NOITA_APP_ID);
    itemId = result.itemId;
    needsToAcceptAgreement = result.needsToAcceptAgreement;
    onItemCreated?.(itemId.toString());
  } else {
    itemId = BigInt(mod.workshop.id!);
  }

  const output = path.resolve("dist");
  fs.mkdirSync(output, { recursive: true });
  const staging = fs.mkdtempSync(path.join(output, ".workshop-"));

  try {
    await mod.vfs.finalize(staging, uploadFilter(mod));

    const result = await submit(client, itemId, {
      title: mod.workshop.name,
      description: mod.workshop.description,
      changeNote: changeNotes,
      tags: mod.workshop.tags,
      previewPath: mod.workshop.previewPath,
      contentPath: path.join(staging, mod.id),
      // an existing item keeps whatever visibility it was given on the site.
      // A new one is only unlisted: reachable by link, so it can be looked over
      // before anyone finds it, and going public stays a deliberate act
      visibility:
        visibility !== undefined
          ? VISIBILITY_VALUE[visibility]
          : created
            ? VISIBILITY_VALUE.unlisted
            : undefined,
    });

    return {
      itemId: itemId.toString(),
      created,
      needsToAcceptAgreement:
        needsToAcceptAgreement || result.needsToAcceptAgreement,
    };
  } catch (cause) {
    // the API only ever reports an EResult, and the reason behind it is in
    // Steam's own logs
    throw new Error(
      `Steam refused the upload of item ${itemId}.\n` +
        `See workshopbuilds/depot_build_${NOITA_APP_ID}.log and logs/workshop_log.txt in your ` +
        "Steam directory.",
      { cause },
    );
  } finally {
    fs.rmSync(staging, { recursive: true, force: true });
  }
}
