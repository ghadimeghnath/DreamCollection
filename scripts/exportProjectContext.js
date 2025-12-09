// scripts/exportProjectContext.js
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.join(__dirname, "..");

// Skip unnecessary folders
const IGNORE_DIRS = [
  "node_modules",
  ".next",
  ".git",
  "public",
  "dist",
  "coverage",
  ".vercel"
];

// Extensions allowed (for code + necessary configs)
const ALLOWED_EXTS = [
  ".js", ".jsx", ".ts", ".tsx",
  ".json", ".md", ".css"
];

// Cut very large files to avoid AI overload
const MAX_FILE_SIZE = 6000; // characters

function scan(dir, output = {}) {
  const items = fs.readdirSync(dir, { withFileTypes: true });

  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    const relativePath = path.relative(ROOT_DIR, fullPath);
    const ext = path.extname(item.name);

    // Skip ignored folders
    if (IGNORE_DIRS.some(f => relativePath.startsWith(f))) continue;

    if (item.isDirectory()) {
      scan(fullPath, output);
    } else {
      if (!ALLOWED_EXTS.includes(ext)) continue;

      try {
        let content = fs.readFileSync(fullPath, "utf8");

        if (content.length > MAX_FILE_SIZE) {
          content = content.slice(0, MAX_FILE_SIZE) +
          `\n\n// ✂️ Truncated for AI (original ${content.length} characters)`;
        }

        output[relativePath] = content;
      } catch (e) {
        console.warn("⚠️ Failed to read:", relativePath);
      }
    }
  }

  return output;
}

console.log("📂 Scanning project...");
const files = scan(ROOT_DIR);

console.log("📌 Total included files:", Object.keys(files).length);

// Create final output JSON
const outputFile = "project-context.json";
fs.writeFileSync(outputFile, JSON.stringify(files, null, 2));

console.log(`🎉 Done! Saved → ${outputFile}`);
console.log("📦 Upload this file to ChatGPT for accurate debugging.");
