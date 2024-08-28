import fs from "fs";

// This is because the node version of lint-staged dont support import json file directly, have to use `with { type: "json" }`
// But that will conflict with our syntax, so we have to use a workaround
const loadJSON = (path) => JSON.parse(fs.readFileSync(new URL(path, import.meta.url)));
const packageJson = loadJSON("./package.json");

// Resolve conflict when filename have `$` in it
function escape(filepath) {
  return `'${filepath}'`;
}

export default {
  "*.{js,jsx,mjs,cjs,ts,mts,cts,json}": (filenames) => [
    `${packageJson.scripts["base:lint:script"]} --fix ${filenames.map(escape).join(" ")}`,
  ],
  "package.json": ["pnpm run lint:pub"],
  "(*.{js,jsx,mjs,cjs,ts,mts,cts,json})": (filenames) => [
    `${packageJson.scripts["test"]} related --run ${filenames.map(escape).join(" ")}`,
  ],
  "*.{ts,tsx}": [() => "tsc"],
};
