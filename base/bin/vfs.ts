import fs, { ReadStream } from "fs";
import path from "path";
import archiver from "archiver";

export default class VFS {
  files: Record<string, string | ReadStream> = {};
  private cwd: string = "";

  cd(cwd: string) {
    this.cwd = cwd;
  }

  write(filePath: string, content: string | ReadStream) {
    this.files[this.cwd != "" ? this.cwd + "/" + filePath : filePath] = content;
  }

  async archive(outputPath: string) {
    const archive = archiver("zip", {
      zlib: { level: 9 },
    });
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
      fs.mkdirSync(path.dirname(fullPath), { recursive: true });
      if (typeof content === "string") {
        fs.writeFileSync(fullPath, content);
        continue;
      }
      const stream = content.pipe(fs.createWriteStream(fullPath));
      promises.push(
        new Promise((resolve, reject) => {
          stream.on("finish", resolve);
          stream.on("error", reject);
        }),
      );
    }
    await Promise.all(promises);
  }
}
