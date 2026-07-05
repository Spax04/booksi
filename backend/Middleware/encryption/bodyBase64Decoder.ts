import { EncryptionService } from '../../services/EncryptionService';

export const bodyBase64Decoder = async (ctx: any, next: any) => {
  console.log('DECODE_BODY - enabled:', process.env.BODY_ENCODING_ENABLED == 'true');
  if (process.env.BODY_ENCODING_ENABLED == 'false') { // encryption / decryption is disabled by env
    return await next();
  }

  const reqBodyEncoded = ctx.request.body.data;
  if (reqBodyEncoded && reqBodyEncoded.length > 0) { // request has body data
    try {
      const reqBodyDecoded = new EncryptionService().decodeBase64(reqBodyEncoded);
      console.log('DECODE_BODY - reqBodyDecoded', reqBodyDecoded);
      ctx.request.body = JSON.parse(reqBodyDecoded);
      return await next();
    } catch (ex) { // exception for some reason - reject.
      console.log('ERROR! bodyDecoder - an exception was thrown during body decoding', { reqBodyEncoded, ex });
      ctx.status = 401;
      ctx.body = 'dcod: body exception';
    }
  }
};
