import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, "../client/dist");

if (!fs.existsSync(distDir)) {
  console.log("No client/dist directory found to check. Build first using 'npm run build'.");
  process.exit(0);
}

const forbiddenPatterns = [
  /AIza[0-9A-Za-z-_]{35}/,
  /GEMINI_API_KEY/i,
  /SUPABASE_SERVICE_ROLE_KEY/i,
  /service_role/i
];

let leakFound = false;

function scanDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      scanDir(fullPath);
    } else if (/\.(js|html|css|json|map)$/i.test(file)) {
      const content = fs.readFileSync(fullPath, "utf-8");
      for (const pattern of forbiddenPatterns) {
        if (pattern.test(content)) {
          console.error(`❌ Potential secret or sensitive token pattern matched in ${fullPath}: ${pattern}`);
          leakFound = true;
        }
      }
    }
  }
}

scanDir(distDir);

if (leakFound) {
  console.error("❌ Secret check failed: sensitive keys or tokens detected in client bundle!");
  process.exit(1);
} else {
  console.log("✅ Secret check passed: client/dist is clean of Gemini and service-role secrets.");
  process.exit(0);
}
