#! /usr/bin/env node

import path from "path";
import fs from "fs";
import process from "process";
import minimist from "minimist";
import chalk from "chalk";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { execSync, spawnSync, spawn } from "child_process";
import { replaceInFileSync } from "replace-in-file";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 1. tsc
console.log(chalk.blue("1. tsc"));
try {
    const res = execSync("tsc");
    // console.log("NO ERROR");
    // console.log(res.toString());
} catch (err) {
    console.error(err.stdout.toString());
    process.exit();
}

// 2. copy files
console.log(chalk.blue("2. copy files"));
execSync("copyfiles -u 1 src/**/*.html lib/");

// 3. EventLogger module assembling
console.log(chalk.blue("3. EventLogger module assembling"));
execSync("node --no-experimental-fetch node_modules/webpack/bin/webpack.js -c event-logger.webpack.config.js");

// 4. Paste EventLogger module in logger.html
console.log(chalk.blue("Paste EventLogger module in logger.html"));
const options = {
    files: path.resolve("./lib", "logger.html"),
    from: /__EVENT_LOGGER_MODULE__/g,
    to: fs.readFileSync(path.resolve("./lib", "eventLogger/index.es5.js")).toString("utf8"),
};

replaceInFileSync(options);
