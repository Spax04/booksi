import { EncryptionService } from '../../services/EncryptionService';

export const bodyEncryptor = async (ctx: any, next: any) => {
  if (process.env.BODY_ENCRYPTION_ENABLED == 'false') { // encryption / decryption is disabled by env
    return await next();
  }
  await next();
  const reqBody = ctx.body;
  if (reqBody && reqBody.length > 0) { // request has body data
    try {
      const reqBodyEncrypted = new EncryptionService().encryptData(reqBody);
      console.log('ENCRYPT - encrypted', reqBodyEncrypted);
      ctx.body = reqBodyEncrypted;
      ctx.mmtEnc = true;
      ctx.mmtDec = false;
    } catch (ex) { // exception for some reason - reject.
      console.log('ERROR! bodyEncryptor - an exception was thrown during body encryption', { reqBody, ex });
      ctx.status = 401;
      ctx.body = 'ncrpt: body exception';
    }
  }
};
