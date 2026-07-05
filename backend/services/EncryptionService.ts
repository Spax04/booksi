const forge = require('node-forge');



export class EncryptionService {
// Function to convert a passphrase into a key
  generateKey(passphrase: string) {
    // Use an appropriate key derivation function to generate a key
    // const salt = forge.random.getBytesSync(128);
    // const key = forge.pkcs5.pbkdf2(passphrase, salt, 10, 16); // 16 bytes for AES-128
    // const passphrase = 'poopySecret'; // Your secret key
    // const salt =  process.env.BODY_ENCRYPTION_SALT;
    // const key =  process.env.BODY_ENCRYPTION_KEY;
    // return { key, salt };
  }

// Function to encrypt data using AES
  encryptData(data: string) {
    const key = process.env.BODY_ENCRYPTION_KEY;
    const salt = process.env.BODY_ENCRYPTION_SALT;
    const cipher = forge.cipher.createCipher('AES-CBC', key);
    cipher.start({iv: salt}); // In a real application, use a proper IV, not the salt
    cipher.update(forge.util.createBuffer(data));
    cipher.finish();
    const encrypted = cipher.output;
    return forge.util.encode64(encrypted.getBytes());
  }

// Function to decrypt data using AES
  decryptData(encryptedData: string) {
    const key = process.env.BODY_ENCRYPTION_KEY;
    const salt = process.env.BODY_ENCRYPTION_SALT;
    const decipher = forge.cipher.createDecipher('AES-CBC', key);
    decipher.start({iv: salt}); // The IV must be the same as used during encryption
    decipher.update(forge.util.createBuffer(forge.util.decode64(encryptedData)));
    if (decipher.finish()) { // Check finish() to ensure there were no errors
      return decipher.output.toString();
    }
    return undefined; // or throw an error
  }

  // Function to encode data to base64 string
  encodeBase64(data: string) {
    const buff = new Buffer(data);
    const base64data = buff.toString('base64');
    return base64data;
  }

  // Function to decode data from base64 string
  decodeBase64(data: string) {
    const buff = new Buffer(data, 'base64');
    const text = buff.toString('ascii');
    return text;
  }
}
