const qiniu = require("qiniu");

const bucket = "xxxx";
const accessKey = "xxxx";
const secretKey = "xxx-xxxx";
const qiniuBaseUrl = "http://static.xxxx.com";

function upload({ file, fileName }) {
  console.log("upload qiniu file:", file, fileName);

  const mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
  const options = {
    scope: fileName ? `${bucket}:${fileName}` : bucket
  };
  const putPolicy = new qiniu.rs.PutPolicy(options);
  const uploadToken = putPolicy.uploadToken(mac);
  const config = new qiniu.conf.Config();
  config.zone = qiniu.zone.Zone_z0;
  const formUploader = new qiniu.form_up.FormUploader(config);
  const putExtra = new qiniu.form_up.PutExtra();

  return new Promise((resolve, reject) => {
    formUploader.putFile(
      uploadToken,
      fileName,
      file,
      putExtra,
      (err, resBody, resInfo) => {
        if (err) {
          reject(err);
          return;
        }

        if (resInfo.statusCode === 200) {
          console.log("qiniu upload success:");
          const url = `${qiniuBaseUrl}/${resBody.key}`;
          console.log("url: ", url);
          resolve({
            url
          });
        } else {
          console.error("qiniu upload error:");
          console.error(resInfo);
          console.error(resBody);
          const error = new Error(resBody.error);
          Object.assign(error, resBody);
          reject(error);
        }
      }
    );
  });
}

module.exports = {
  upload
};
