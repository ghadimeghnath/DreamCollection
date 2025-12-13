// scripts/exportProjectContext.js
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.join(__dirname, "..");

// Folders to skip
const IGNORE_DIRS = new Set([
  "node_modules",
  ".next",
  ".git",
  "public",
  "dist",
  "coverage",
  ".vercel",
  "project-context.json" ,
  "project-files.json",
  "scripts",
  ".env.local",
  // avoid including itself
]);

// Extensions allowed
const ALLOWED_EXTS = new Set([
  ".js", ".jsx", ".ts", ".tsx",
  ".json", ".md", ".css"
]);

// Cut large files
const MAX_FILE_SIZE = 6000;

// Normalize folder name for matching
function shouldIgnore(relativePath) {
  const parts = relativePath.split(path.sep);
  return parts.some(p => IGNORE_DIRS.has(p));
}

function scan(dir, output = {}) {
  const items = fs.readdirSync(dir, { withFileTypes: true });

  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    const relativePath = path.relative(ROOT_DIR, fullPath);

    if (shouldIgnore(relativePath)) continue;

    if (item.isDirectory()) {
      scan(fullPath, output);
      continue;
    }

    const ext = path.extname(item.name);
    if (!ALLOWED_EXTS.has(ext)) continue;

    try {
      let content = fs.readFileSync(fullPath, "utf8");

      if (content.length > MAX_FILE_SIZE) {
        content =
          content.slice(0, MAX_FILE_SIZE) +
          `\n\n// ✂️ Truncated for AI (original ${content.length} characters)`;
      }

      output[relativePath] = content;
    } catch {
      console.warn("⚠️ Failed to read:", relativePath);
    }
  }

  return output;
}

// --- MAIN EXECUTION ---
console.log("📂 Scanning project...");

// Clear old file BEFORE writing new content (guaranteed overwrite)
const outputFile = path.join(ROOT_DIR, "project-context.json");
try {
  fs.writeFileSync(outputFile, "{}", "utf8");
} catch (err) {
  console.error("❌ Failed to clear old context file", err);
}

const files = scan(ROOT_DIR);

console.log("📌 Total included files:", Object.keys(files).length);

// Save final JSON
fs.writeFileSync(outputFile, JSON.stringify(files, null, 2));

console.log(`🎉 Done! Saved → project-context.json`);
