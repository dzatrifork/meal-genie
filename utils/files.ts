import * as fsPromise from "fs/promises";
import * as fs from "fs";
import * as path from "path";

export async function readFilesInDirectory(
  directoryPath: string
): Promise<string[]> {
  const fileContents: string[] = [];
  const files = await fsPromise.readdir(directoryPath);

  for (const file of files) {
    const filePath = path.join(directoryPath, file);
    const content = await fsPromise.readFile(filePath, "utf8");
    fileContents.push(content);
  }

  return fileContents;
}

export function saveStringAsFile(content: string, filename: string): void {
  fs.writeFileSync(filename, content, { flag: "w" });
}

export function ensureDirectoryExists(directory: string): void {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
}
