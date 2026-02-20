import fs from "fs";
import fsp from "fs/promises";
import path from "path";
import archiver from "archiver";
import { Readable } from "stream";

type FileContent = Readable | Buffer | string;

export default class VFS {
  files: Record<string, FileContent> = {};
  private cwd: string = "";

  cd(cwd: string) {
    this.cwd = cwd;
  }

  write(filePath: string, content: FileContent) {
    this.files[this.cwd != "" ? this.cwd + "/" + filePath : filePath] = content;
  }

  async archive(outputPath: string) {
    const archive = archiver("zip", { zlib: { level: 9 } });
    archive.pipe(fs.createWriteStream(outputPath));
    for (const [filePath, content] of Object.entries(this.files)) {
      archive.append(content, { name: filePath });
    }
    await archive.finalize();
  }

  async finalize(outputPath: string) {
    const promises: Promise<void>[] = [];
    for (const [filePath, content] of Object.entries(this.files)) {
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
