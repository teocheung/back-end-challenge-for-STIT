
// use crypto to encrypt password when the server handle the register information
// the salt(which is an additional handling for password) is default to be "salt"

var crypto = require('crypto');

module.exports = {
  cryptoPwd: (password, salt) => {
    var saltPassword = password + ':' + salt;
    var md5 = crypto.createHash('md5');
    return md5.update(saltPassword).digest('hex');
  }
}
