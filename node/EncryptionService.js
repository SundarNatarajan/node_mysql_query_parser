const EncryptionHelper = require('./encryptionHelper')
const encryptionConfig = {
    algorithm: 'aes-128-cbc',
    key: '6bc52e3db567cfef',
    iv: 'Kp3EtCU98XjR2rGGHWlzTw=='
  }

class EncryptionService {

  constructor(algorithm, key, iv, encoding = 'base64') {
    this.algorithm = algorithm
    this.key = key
    this.iv = new Buffer(iv, 'base64')
    this.encoding = encoding
  }

  encrypt(text) {
    return EncryptionHelper.encryptText(this.algorithm, this.key, this.iv, text, this.encoding)
  }

  decrypt(text) {
    return EncryptionHelper.decryptText(this.algorithm, this.key, this.iv, text, this.encoding)
  }
}

module.exports = new EncryptionService(encryptionConfig.algorithm, encryptionConfig.key, encryptionConfig.iv)