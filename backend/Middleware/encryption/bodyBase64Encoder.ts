import { EncryptionService } from '../../services/EncryptionService';

export const bodyBase64Encoder = async (ctx: any, next: any) => {
  if (process.env.BODY_ENCODING_ENABLED == 'false') { // encryption / decryption is disabled by env
    return await next();
  }
  await next();
  const reqBody = ctx.body;
  if (reqBody && reqBody.length > 0) { // request has body data
    try {
      const reqBodyEncoded = new EncryptionService().encodeBase64(reqBody);
      console.log('ENCRYPT - encrypted', reqBodyEncoded);
      ctx.body = reqBodyEncoded;
      ctx.mmtEnc = true;
      ctx.mmtDec = false;
    } catch (ex) { // exception for some reason - reject.
      console.log('ERROR! bodyEncoder - an exception was thrown during body encoding', { reqBody, ex });
      ctx.status = 401;
      ctx.body = 'ncod: body exception';
    }
  }
};
