import forge from 'node-forge';
import { VITE_BODY_ENCRYPTION_KEY, VITE_BODY_ENCRYPTION_SALT } from './constans';

const encryptData = (data: string) => {
  const key = VITE_BODY_ENCRYPTION_KEY?.toString() || '';
  const salt = VITE_BODY_ENCRYPTION_SALT;
  const cipher = forge.cipher.createCipher('AES-CBC', key);
  cipher.start({ iv: salt }); // In a real application, use a proper IV, not the salt
  cipher.update(forge.util.createBuffer(data));
  cipher.finish();
  const encrypted = cipher.output;
  return forge.util.encode64(encrypted.getBytes());
};

const decryptData = (encryptedData: string) => {
  const key = VITE_BODY_ENCRYPTION_KEY?.toString() || '';
  const salt = VITE_BODY_ENCRYPTION_SALT;
  const decipher = forge.cipher.createDecipher('AES-CBC', key);
  decipher.start({ iv: salt });
  decipher.update(forge.util.createBuffer(forge.util.decode64(encryptedData)));

  if (decipher.finish()) {
    // Check and process the decryptedString before returning or using it further
    return decipher.output.toString();
  }

  return undefined;
};
export {
  encryptData,
  decryptData,
};