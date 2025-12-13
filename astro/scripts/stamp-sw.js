import fs from "node:fs";

const buildId =
  (process.env.GITHUB_SHA || process.env.VERCEL_GIT_COMMIT_SHA || "")
    .slice(0, 8) ||
  process.env.BUILD_ID ||
  new Date().toISOString().replace(/[-:.TZ]/g, "");

// Input template (tracked), output SW (generated)
const templatePath = "public/serviceworker.template.js";
const outPath = "public/serviceworker.js";

let sw = fs.readFileSync(templatePath, "utf8");
sw = sw.replaceAll("__BUILD_ID__", buildId);

fs.writeFileSync(outPath, sw);

console.log(`Stamped ${outPath} with BUILD_ID=${buildId}`);
