const crypto = require('crypto');

module.exports = function(data){
    var md5 = crypto.createHash('md5');
    var password = md5.update(data).digest('base64');
    return password;
}