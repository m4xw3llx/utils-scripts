#!/usr/bin/env node

/* eslint-disable no-await-in-loop */

const path = require("path");
const fs = require("fs-extra");
const minimist = require("minimist");
const _ = require("lodash");
const { exec } = require("shelljs");
const prompt = require("prompt");
const { projectRoot, buildDir } = require("./config");

function printHelp() {
  console.log("usage:");
  console.log(
    "download-image.js <image.zip> <image_file_name> [--dest <dest dir(default src/assets)>]"
  );
}

async function run() {
  const argv = minimist(process.argv.slice(2), {
    alias: {
      "delete-file": "deleteFile"
    },
    boolean: ["deleteFile"],
    default: {
      deleteFile: true
    }
  });

  let {
    _: [zipPath, name],
    dest,
    deleteFile
  } = argv;

  if (!zipPath) {
    printHelp();
    process.exit(1);
  }

  let zipPaths;
  if (zipPath === "batch") {
    zipPaths = argv._.slice(1);
    name = undefined;
  } else {
    if (!/^[a-zA-Z0-9_]+$/.test(name)) {
      console.log("名字不合法", name);
      process.exit(1);
    }
    zipPaths = [zipPath];
  }

  console.log(zipPaths);
  console.log(name);

  const destDir = dest
    ? path.resolve(dest)
    : path.join(projectRoot, "src/assets");
  const tempDir = path.join(buildDir, "temp");

  const codeArr = [];
  for (const zipFile of zipPaths) {
    const code = await copyImage({
      destDir,
      tempDir,
      zipFile,
      deleteFile,
      name
    });

    if (code) {
      codeArr.push(code);
    }
  }

  console.log();
  console.log("code:");
  for (const code of codeArr) {
    console.log(code);
  }
}

async function copyImage({ destDir, tempDir, zipFile, deleteFile, name }) {
  const tempDestDir = path.join(tempDir, `icon_${Date.now()}`);
  fs.mkdirpSync(tempDestDir);
  exec(`ditto -V -x -k --sequesterRsrc --rsrc "${zipFile}" ${tempDestDir}`);
  const files = fs.readdirSync(tempDestDir);

  console.log("mv:");
  const reg = /^(?:[^／]+／)?([^／]+?)((?:@[\d]x)?\.png)$/;
  let isNameValid = true;
  let isOverwriteChecked = false;
  for (const file of files) {
    const matchRes = reg.exec(file);
    if (matchRes) {
      if (!name) {
        // 名字保持不变
        name = matchRes[1];

        if (!/^[a-zA-Z0-9_]+$/.test(name)) {
          const canUse = await promptYN(`图片命名不合法，是否使用？(${file})`);
          if (!canUse) {
            isNameValid = false;
            break;
          }
        }
      }
      const destFile = path.join(destDir, `${name}${matchRes[2]}`);
      console.log(destFile);
      if (!isOverwriteChecked && fs.existsSync(destFile)) {
        const canOverwrite = await promptYN("文件已存在是否覆盖？");
        isOverwriteChecked = true;

        if (!canOverwrite) {
          break;
        }
      }
      fs.moveSync(path.join(tempDestDir, file), destFile, { overwrite: true });
    }
  }

  fs.removeSync(tempDestDir);

  if (!isNameValid) {
    return;
  }

  if (!name) {
    console.log("压缩包内没有图片!!!", zipFile);
    return;
  }

  if (deleteFile) {
    fs.removeSync(zipFile);
  }

  return `import ${_.camelCase(
    name.startsWith("ic") ? name : `ic_${name}`
  )} from '$/assets/${name}.png';`;
}

function promptYN(message) {
  prompt.start();

  const property = {
    name: "yesno",
    message: `${message} (y/n) `,
    validator: /y[es]*|n[o]?/,
    warning: "Must respond yes or no",
    default: "no"
  };

  return new Promise(resolve => {
    prompt.get(property, (err, result) => {
      if (result.yesno[0] === "y") {
        resolve(true);
      } else {
        resolve(false);
      }
    });
  });
}

run();
