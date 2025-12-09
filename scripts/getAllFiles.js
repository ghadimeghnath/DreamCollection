// scripts/getAllFiles.js
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.join(__dirname, "..");

// Directories to exclude from scanning
const IGNORE_DIRS = ["node_modules", ".next", ".git"];

// File types to exclude (binary / large)
const IGNORE_EXTS = [".ico", ".svg", ".png", ".jpg", ".jpeg", ".webp"];

function getAllFilesWithContent(dir, result = {}) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.relative(ROOT_DIR, fullPath);

    // Skip ignored directories
    if (IGNORE_DIRS.some(d => relativePath.startsWith(d))) continue;

    if (entry.isDirectory()) {
      getAllFilesWithContent(fullPath, result);
    } else {
      const ext = path.extname(entry.name);
      if (!IGNORE_EXTS.includes(ext)) {
        try {
          const content = fs.readFileSync(fullPath, "utf8");
          result[relativePath] = content;
        } catch {
          console.warn("⚠️ Skipping unreadable file:", relativePath);
        }
      }
    }
  }

  return result;
}

const projectFiles = getAllFilesWithContent(ROOT_DIR);

console.log("📌 Files loaded:", Object.keys(projectFiles).length);

// Optionally save to a JSON file:
fs.writeFileSync(
  "project-files.json",
  JSON.stringify(projectFiles, null, 2)
);
console.log("📄 Output saved → project-files.json");
