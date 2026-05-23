const fs = require("fs");
const path = require("path");

const BUILD_ID =
  process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 12) ||
  process.env.GITHUB_SHA?.slice(0, 12) ||
  process.env.REACT_APP_BUILD_ID ||
  "dev";

const templatePath = path.join(__dirname, "../public/service-worker.template.js");
const outputPath = path.join(__dirname, "../public/service-worker.js");

const template = fs.readFileSync(templatePath, "utf8");
const output = template.replace(/__BUILD_ID__/g, BUILD_ID);

fs.writeFileSync(outputPath, output);
console.log(`[stamp-service-worker] Wrote ${outputPath} (CACHE_VERSION=${BUILD_ID})`);
