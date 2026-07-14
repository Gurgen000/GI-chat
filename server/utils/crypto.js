const CryptoJS = require("crypto-js");

const SECRET_KEY = "gichat_super_secret_key_2026_armenia";

const encrypt = (text) => {
  try {
    if (!text) return text;
    return CryptoJS.AES.encrypt(text, SECRET_KEY).toString();
  } catch (e) {
    return text;
  }
};

const decrypt = (ciphertext) => {
  try {
    if (!ciphertext) return ciphertext;
    const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
    const result = bytes.toString(CryptoJS.enc.Utf8);
    return result || ciphertext;
  } catch (e) {
    return ciphertext;
  }
};

module.exports = { encrypt, decrypt };
