import { EncryptionService } from '../../services/EncryptionService';

export const bodyDecryptor = async (ctx: any, next: any) => {
  console.log('DECRYPT - enabled:', process.env.BODY_ENCRYPTION_ENABLED == 'true');
  if (process.env.BODY_ENCRYPTION_ENABLED == 'false') { // encryption / decryption is disabled by env
    return await next();
  }
  // const mmtEnc = ctx.get('mmtEnc');
  // if (!mmtEnc) { // body is not encrypted
  //   console.log('DECRYPT - !mmtEnc', mmtEnc);
  //   return await next();
  // }

  const reqBodyEncrypted = ctx.request.body.data;
  if (reqBodyEncrypted && reqBodyEncrypted.length > 0) { // request has body data
    try {
      const reqBodyDecrypted = new EncryptionService().decryptData(reqBodyEncrypted);
      console.log('DECRYPT - reqBodyDecrypted', reqBodyDecrypted);
      ctx.request.body = JSON.parse(reqBodyDecrypted);
      ctx.mmtEnc = false;
      ctx.mmtDec = true;
      return await next();
    } catch (ex) { // exception for some reason - reject.
      console.log('ERROR! bodyDecryptor - an exception was thrown during body decryption', { reqBodyEncrypted, ex });
      ctx.status = 401;
      ctx.body = 'dcrpt: body exception';
    }
  }
};
