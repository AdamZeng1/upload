const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const multer = require('multer');
app.use(bodyParser.urlencoded({extended: true}));
var upload = multer({dest: 'uploads/'});
var router = express.Router();
const qiniu = require('qiniu');

router.post('/upload', upload.single('image'), function (req, res) {
    // res.json(req.file);
    uploadToQiniu(req.file);

});

const accessKey = 'T5tjcA9Ndp74hAzEEuXT4SeLhttKfKVgwgosoJXi';
const secretKey = '2xYkIijm6-0sJ2GuB9dnsVeKAUF3rrjefYB2B6KH';
const mac = new qiniu.auth.digest.Mac(accessKey, secretKey);

var options = {
    scope: 'image_test',
};
var putPolicy = new qiniu.rs.PutPolicy(options);
var uploadToken = putPolicy.uploadToken(mac);

var config = new qiniu.conf.Config();
// 空间对应的机房
config.zone = qiniu.zone.Zone_as0;
// 是否使用https域名
config.useHttpsDomain = true;
// 上传是否使用cdn加速
config.useCdnDomain = true;


function uploadToQiniu(fileInfo) {
    var localFile = fileInfo.path;
    var formUploader = new qiniu.form_up.FormUploader(config);
    var putExtra = new qiniu.form_up.PutExtra();
    var key = fileInfo.filename;

    formUploader.putFile(uploadToken, key, localFile, putExtra, function (respErr, respBody, respInfo) {
        if (respErr) {
            throw respErr;
        }
        if (respInfo.statusCode == 200) {
            console.log(respBody);
        } else {
            console.log(respInfo.statusCode);
            console.log(respBody);
        }
    });
}

module.exports = router;
