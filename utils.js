const fs = require("fs");
const path = require("path");
const { exec } = require("shelljs");
const retryify = require("retryify");
const { outputsDir, getOutputFile, getOutputFileName } = require("./config");

function versionToTagName(version, buildType) {
  if (!buildType || buildType === "release") {
    return `v${version}`;
  }
  return `v${version}-${buildType}`;
}

function checkTagExists(tag) {
  const res = exec(`git describe --abbrev=0 --tags ${tag}`, {
    silent: true
  });

  return res.code === 0;
}

/**
 * 返回 git commit message
 * @return null commit 不存在
 */
function getGitRefMessage(gitRef) {
  const res = exec(`git log --format=%B -n 1 ${gitRef}`, {
    silent: true
  });
  if (res.code) {
    return null;
  }
  return res.stdout;
}

function getGitTagMessage(tag) {
  const res = exec(`git show ${tag}`, {
    silent: true
  });
  if (res.code) {
    return null;
  }
  const execRes = /\nDate:.+\n\n([\s\S]+?)\ncommit\s[a-z0-9]+/.exec(res.stdout);
  if (execRes == null) {
    // TODO
    return "";
  }
  return execRes[1];
}

function copyOutputFile({ platform, buildType, version }) {
  const outputFileName = getOutputFileName({ platform, buildType, version });
  const outputFile = getOutputFile({ platform, buildType, version });
  if (!fs.existsSync(outputFile)) {
    throw new Error(`copyOutputFile 输出文件未找到!!!!! ${outputFile}`);
  }
  exec(`cp ${outputFile} ${outputsDir}/`);
  return path.join(outputsDir, outputFileName);
}

const withRetry = retryify({
  retries: 8,
  timeout: 1000,
  factor: 2,
  // errors: [RequestError, StatusCodeError],
  log(msg) {
    console.log(msg);
  }
});

module.exports = {
  versionToTagName,
  checkTagExists,
  getGitRefMessage,
  getGitTagMessage,
  copyOutputFile,
  withRetry
};
