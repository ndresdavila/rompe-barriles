// ganache@7.9.1 publishes an npm-shrinkwrap that reinstalls old nested
// copies even when the root lock asks for the patched version. After install,
// replace those copies with the patched package already present in the tree
// and record that version in the shrinkwrap and the root lock.
const { execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");

function majorOf(version) {
  return Number(String(version).split(".")[0]);
}

function olderThan(version, target) {
  const left = String(version).split("-")[0].split(".").map(Number);
  const right = String(target).split("-")[0].split(".").map(Number);
  for (let i = 0; i < 3; i += 1) {
    const diff = (left[i] || 0) - (right[i] || 0);
    if (diff) return diff < 0;
  }
  return false;
}

const root = path.resolve(__dirname, "..");
const ganacheModules = path.join(root, "node_modules/ganache/node_modules");
const shrinkwrapPath = path.join(root, "node_modules/ganache/npm-shrinkwrap.json");
const lockPath = path.join(root, "package-lock.json");

function sameMajor(version, major, target) {
  return majorOf(version) === major && olderThan(version, target) ? target : null;
}

const pick = {
  ajv: (v) => sameMajor(v, 6, "6.14.0") || sameMajor(v, 8, "8.18.0"),
  "bn.js": (v) => sameMajor(v, 4, "4.12.3") || sameMajor(v, 5, "5.2.3"),
  "brace-expansion": (v) => sameMajor(v, 1, "1.1.22") || sameMajor(v, 2, "2.1.8"),
  braces: (v) => sameMajor(v, 3, "3.0.3"),
  "browserify-sign": (v) => sameMajor(v, 4, "4.2.2"),
  browserslist: (v) => sameMajor(v, 4, "4.28.7"),
  "cipher-base": (v) => sameMajor(v, 1, "1.0.5"),
  "cross-spawn": (v) => sameMajor(v, 7, "7.0.5"),
  diff: (v) => sameMajor(v, 4, "4.0.4") || sameMajor(v, 5, "5.2.2"),
  elliptic: (v) => sameMajor(v, 6, "6.6.1"),
  "js-yaml": (v) => sameMajor(v, 3, "3.15.2") || sameMajor(v, 4, "4.3.2"),
  json5: (v) => sameMajor(v, 2, "2.2.3"),
  lodash: (v) => sameMajor(v, 4, "4.18.1"),
  micromatch: (v) => sameMajor(v, 4, "4.0.8"),
  minimatch: (v) => sameMajor(v, 3, "3.1.4") || sameMajor(v, 5, "5.1.8"),
  nanoid: (v) => sameMajor(v, 3, "3.3.18"),
  pbkdf2: (v) => sameMajor(v, 3, "3.1.7"),
  picomatch: (v) => sameMajor(v, 2, "2.3.2"),
  secp256k1: (v) => sameMajor(v, 4, "4.0.5"),
  semver: (v) => sameMajor(v, 5, "5.7.2") || sameMajor(v, 7, "7.6.3"),
  "serialize-javascript": (v) => (olderThan(v, "7.1.3") ? "7.1.3" : null),
  "sha.js": (v) => sameMajor(v, 2, "2.4.12"),
  validator: (v) => sameMajor(v, 13, "13.15.22"),
  webpack: (v) => sameMajor(v, 5, "5.104.1"),
  ws: (v) => sameMajor(v, 8, "8.21.0") || sameMajor(v, 7, "7.5.11") || sameMajor(v, 5, "5.2.5"),
};

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function readVersion(dir) {
  try {
    return readJson(path.join(dir, "package.json")).version;
  } catch (err) {
    return null;
  }
}

function walkPackages(dir, out = []) {
  const nm = path.join(dir, "node_modules");
  if (!fs.existsSync(nm)) return out;
  for (const name of fs.readdirSync(nm)) {
    if (name.startsWith(".")) continue;
    const base = path.join(nm, name);
    if (name.startsWith("@")) {
      if (!fs.existsSync(base)) continue;
      for (const sub of fs.readdirSync(base)) {
        const pkgDir = path.join(base, sub);
        if (fs.existsSync(path.join(pkgDir, "package.json"))) {
          out.push(pkgDir);
          walkPackages(pkgDir, out);
        }
      }
    } else if (fs.existsSync(path.join(base, "package.json"))) {
      out.push(base);
      walkPackages(base, out);
    }
  }
  return out;
}

if (!fs.existsSync(ganacheModules) || !fs.existsSync(lockPath)) {
  process.exit(0);
}

const byVersion = new Map();
for (const dir of walkPackages(root)) {
  if (dir.includes(`${path.sep}ganache${path.sep}`)) continue;
  let pkg;
  try {
    pkg = readJson(path.join(dir, "package.json"));
  } catch (err) {
    continue;
  }
  if (!byVersion.has(`${pkg.name}@${pkg.version}`)) byVersion.set(`${pkg.name}@${pkg.version}`, dir);
}

const lock = readJson(lockPath);
const replaced = [];
const fetchedMeta = new Map();

function fetchPackage(name, version) {
  const cache = path.join(root, "node_modules/.pin-cache");
  fs.mkdirSync(cache, { recursive: true });
  const view = JSON.parse(execFileSync("npm", ["view", `${name}@${version}`, "dist", "--json", "--silent"], { encoding: "utf8" }));
  fetchedMeta.set(`${name}@${version}`, { resolved: view.tarball, integrity: view.integrity });
  const packed = execFileSync("npm", ["pack", `${name}@${version}`, "--pack-destination", cache, "--silent"], { encoding: "utf8" })
    .trim()
    .split("\n")
    .pop();
  const extract = path.join(cache, `${name.replace("/", "+")}-${version}`);
  fs.rmSync(extract, { recursive: true, force: true });
  fs.mkdirSync(extract, { recursive: true });
  execFileSync("tar", ["-xzf", path.join(cache, packed), "-C", extract, "--strip-components=1"]);
  byVersion.set(`${name}@${version}`, extract);
  return extract;
}

for (const dir of walkPackages(path.join(root, "node_modules/ganache"))) {
  let pkg;
  try {
    pkg = readJson(path.join(dir, "package.json"));
  } catch (err) {
    continue;
  }
  const choose = pick[pkg.name];
  if (!choose) continue;
  const target = choose(pkg.version);
  if (!target || target === pkg.version) continue;
  const source = byVersion.get(`${pkg.name}@${target}`) || fetchPackage(pkg.name, target);
  fs.rmSync(dir, { recursive: true, force: true });
  fs.cpSync(source, dir, { recursive: true });
  replaced.push({ name: pkg.name, from: pkg.version, to: target, dir });
}

function metaFor(name, version) {
  for (const [key, entry] of Object.entries(lock.packages)) {
    if (entry.version === version && entry.integrity && key.endsWith(`node_modules/${name}`)) {
      return { resolved: entry.resolved, integrity: entry.integrity };
    }
  }
  return fetchedMeta.get(`${name}@${version}`) || null;
}

if (fs.existsSync(shrinkwrapPath)) {
  const shrink = readJson(shrinkwrapPath);
  let changed = false;
  for (const [key, entry] of Object.entries(shrink.packages || {})) {
    const name = key.split("node_modules/").pop();
    const choose = pick[name];
    if (!choose || !entry.version) continue;
    const target = choose(entry.version);
    if (!target || target === entry.version) continue;
    const meta = metaFor(name, target);
    if (!meta) continue;
    entry.version = target;
    entry.resolved = meta.resolved;
    entry.integrity = meta.integrity;
    changed = true;
  }
  if (changed) fs.writeFileSync(shrinkwrapPath, JSON.stringify(shrink));
}

let lockChanged = false;
for (const [key, entry] of Object.entries(lock.packages)) {
  if (!key.includes("node_modules/ganache/")) continue;
  const name = key.split("node_modules/").pop();
  const choose = pick[name];
  if (!choose || !entry.version) continue;
  const target = choose(entry.version);
  if (!target || target === entry.version) continue;
  const meta = metaFor(name, target);
  if (!meta) continue;
  entry.version = target;
  entry.resolved = meta.resolved;
  entry.integrity = meta.integrity;
  lockChanged = true;
}

if (lockChanged) {
  fs.writeFileSync(lockPath, JSON.stringify(lock, null, 2) + "\n");
}

if (replaced.length) {
  console.log(`pin-ganache-deps: replaced ${replaced.length} nested packages`);
}
