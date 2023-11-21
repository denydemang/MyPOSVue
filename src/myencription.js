 import CryptoJS from 'crypto-js';

 const decrypt = (string) => {
    return CryptoJS.AES.decrypt(string, '').toString(CryptoJS.enc.Utf8)
 }
 const encrypt = (string) => {
    return CryptoJS.AES.encrypt(string.toString(), '').toString()
 }

export default {encrypt,decrypt}