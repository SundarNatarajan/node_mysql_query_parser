const crypto = require('crypto')

class EncryptionHelper {

  static get CIPHERS() {
    return {
      AES_128: 'aes128',          //requires 16 byte key
      AES_128_CBC: 'aes-128-cbc', //requires 16 byte key
      AES_192: 'aes192',          //requires 24 byte key
      AES_256: 'aes256'           //requires 32 byte key
    }
  }

  static getKeyAndIV(length, key, callback) {
    crypto.pseudoRandomBytes(length, (err, ivBuffer) => {
      const keyBuffer = (key instanceof Buffer) ? key : new Buffer(key)
      callback({
        iv: ivBuffer,
        key: keyBuffer
      })
    })
  }

  static encryptText(alg, key, iv, text, encoding = 'binary') {
    try {
      const cipher = crypto.createCipheriv(alg, key, iv)

      let result = cipher.update(text, 'utf8', encoding)
      result += cipher.final(encoding)

      return result
    } catch (e) {
      return null;
    }
  }

  static decryptText(alg, key, iv, text, encoding = 'binary') {
    try {
      const decipher = crypto.createDecipheriv(alg, key, iv)

      let result = decipher.update(text, encoding)
      result += decipher.final()

      return result
    } catch (e) {
      return null;
    }
  }
}

module.exports = EncryptionHelper
