import fs from "fs";
import fsp from "fs/promises";
import path from "path";
import archiver from "archiver";
import { Readable } from "stream";

type FileContent = Readable | Buffer | string;

export default class VFS {
  files: Record<string, FileContent> = {};
  private sizes: Record<string, number> = {};
  private cwd: string = "";

  cd(cwd: string) {
    this.cwd = cwd;
  }

  private resolve(filePath: string) {
    return this.cwd != "" ? this.cwd + "/" + filePath : filePath;
  }

  write(filePath: string, content: FileContent, size?: number) {
    const full = this.resolve(filePath);
    this.files[full] = content;
    this.sizes[full] =
      size ??
      (typeof content === "string"
        ? Buffer.byteLength(content)
        : Buffer.isBuffer(content)
          ? content.length
          : NaN);
  }

  /** Writes a file from disk, keeping its size known without reading it. */
  writeFrom(filePath: string, sourcePath: string) {
    this.write(
      filePath,
      fs.createReadStream(sourcePath),
      fs.statSync(sourcePath).size,
    );
  }

  /** The contained files with their sizes in bytes, sorted by path. */
  entries(): { path: string; size: number }[] {
    return Object.keys(this.files)
      .sort()
      .map((path) => ({ path, size: this.sizes[path] }));
  }

  has(filePath: string) {
    return this.resolve(filePath) in this.files;
  }

  /** Reads back a text file that was written before. */
  read(filePath: string): string {
    const full = this.resolve(filePath);
    const content = this.files[full];
    if (typeof content !== "string") {
      throw new Error(`${full} is not a text file`);
    }
    return content;
  }

  async archive(outputPath: string) {
    const archive = archiver("zip", { zlib: { level: 9 } });
    archive.pipe(fs.createWriteStream(outputPath));
    for (const [filePath, content] of Object.entries(this.files)) {
      archive.append(content, { name: filePath });
    }
    await archive.finalize();
  }

  /**
   * Writes every contained file under `outputPath`.
   *
   * @param include optional predicate on the stored path, used to leave files
   * out of the result - `nts publish` uses it to apply the `skip-files` and
   * `skip-folders` workshop settings.
   */
  async finalize(outputPath: string, include?: (filePath: string) => boolean) {
    const promises: Promise<void>[] = [];
    for (const [filePath, content] of Object.entries(this.files)) {
      if (include && !include(filePath)) {
        continue;
      }
      const fullPath = path.join(outputPath, filePath);
      promises.push(
        fsp
          .mkdir(path.dirname(fullPath), { recursive: true })
          .then(() => fsp.writeFile(fullPath, content)),
      );
    }
    await Promise.all(promises);
  }
}
