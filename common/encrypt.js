/**
 * 加密工具
 * Created by duanying on 2015/8/13.
 */

var crypto = require('crypto');
var key = "db-extract@0123x100$#365#$";//加密的秘钥

crypto.sha1Hash = function (str, addSalt) {
    var salt = (addSalt) ? new Date().getTime() : "";
    return crypto.createHmac('sha1', salt + "").update(str + "").digest('hex');
}

crypto.md5Hash = function (str) {
    return crypto.createHash('md5').update(str + "").digest('hex');
}

crypto.encode = function (str) {
    var cipher = crypto.createCipher('des-ede', key);
    var crypted = cipher.update(str, 'utf8', 'base64');
    crypted += cipher.final('base64');
    return crypted;
}

crypto.dencode = function (str) {
    var decipher = crypto.createDecipher('des-ede', key);
    var dec = decipher.update(str, 'base64', 'utf8');
    dec += decipher.final('utf8');
    return dec;
}

module.exports = crypto;