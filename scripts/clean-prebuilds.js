const fs = require("fs");
const path = require("path");

const prebuildsDirectory = path.join(__dirname, "..", "prebuilds");

fs.rmSync(prebuildsDirectory, { force: true, recursive: true });
console.log(`Removed ${prebuildsDirectory}`);
