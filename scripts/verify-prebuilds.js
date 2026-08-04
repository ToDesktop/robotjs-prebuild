const fs = require("fs");
const path = require("path");
const nodeAbi = require("node-abi");

const prebuildCommand = require("../package.json").scripts.prebuild;
const targets = Array.from(
  prebuildCommand.matchAll(/(?:^|\s)-t\s+(node|electron)@([^\s]+)/g),
  (match) => [match[1], match[2]],
);

if (targets.length === 0) {
  console.error("No Node or Electron targets found in the prebuild command");
  process.exit(1);
}

const architectures = process.argv.slice(2);
if (architectures.length === 0) architectures.push(process.arch);

const expectedAbis = new Set(
  targets.map(([runtime, version]) => nodeAbi.getAbi(version, runtime)),
);
const failures = [];

for (const architecture of architectures) {
  const directory = path.join(
    __dirname,
    "..",
    "prebuilds",
    `${process.platform}-${architecture}`,
  );
  const files = fs.existsSync(directory) ? fs.readdirSync(directory) : [];

  for (const abi of expectedAbis) {
    if (!files.some((file) => file.endsWith(`.abi${abi}.node`))) {
      failures.push(`${directory}: missing ABI ${abi}`);
    }
  }

  if (files.some((file) => !file.includes(".abi") && file.endsWith(".node"))) {
    failures.push(`${directory}: contains an untagged native binary`);
  }
}

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(
  `Verified ${expectedAbis.size} ABI-tagged prebuilds for ${architectures.join(
    ", ",
  )}`,
);
