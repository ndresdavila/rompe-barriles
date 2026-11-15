// ganache@7.9.1 ships an npm-shrinkwrap that pins brace-expansion 1.1.11.
// npm installs that copy even when the root lock asks for 1.1.22, so after
// install we replace the nested package and update the shrinkwrap.
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const dest = path.join(root, "node_modules/ganache/node_modules/brace-expansion");
const shrinkwrapPath = path.join(root, "node_modules/ganache/npm-shrinkwrap.json");
const wanted = {
  version: "1.1.22",
  resolved: "https://registry.npmjs.org/brace-expansion/-/brace-expansion-1.1.22.tgz",
  integrity: "sha512-CKLDTuSsN0+r1ThM0WkzzBI7dnPI6xEGfa/JnVYIK9JNBA1N1NyPwXVHor//NKD/y3sDxp764sZdLhFK7pH8XQ==",
};

if (!fs.existsSync(path.dirname(dest))) {
  process.exit(0);
}

function readVersion(dir) {
  try {
    return JSON.parse(fs.readFileSync(path.join(dir, "package.json"), "utf8")).version;
  } catch (err) {
    return null;
  }
}

const candidates = [
  path.join(root, "node_modules/minimatch/node_modules/brace-expansion"),
  path.join(root, "node_modules/mocha/node_modules/brace-expansion"),
];
const source = candidates.find((dir) => readVersion(dir) === wanted.version);

if (source && readVersion(dest) !== wanted.version) {
  fs.rmSync(dest, { recursive: true, force: true });
  fs.cpSync(source, dest, { recursive: true });
}

if (fs.existsSync(shrinkwrapPath)) {
  const data = JSON.parse(fs.readFileSync(shrinkwrapPath, "utf8"));
  const entry = data.packages && data.packages["node_modules/brace-expansion"];
  if (entry && entry.version !== wanted.version) {
    entry.version = wanted.version;
    entry.resolved = wanted.resolved;
    entry.integrity = wanted.integrity;
    fs.writeFileSync(shrinkwrapPath, JSON.stringify(data));
  }
}
