import { isEmpty } from 'lodash';
import { decodeToken } from '../../common';

export const tokenExtractor = async (ctx: any, next: any) => {
  ctx.isAdminRequest = ctx.request.url && ctx.request.url.startsWith('/admin');
  const authHeader = ctx.get('BKS');
  const authorizationHeader = ctx.get('authorization');
  let authJWT = authHeader.replace('Bearer', '').trim();
  ctx.isAdminImpersonationToken = authHeader.includes('BKSAD_');
  authJWT = authJWT.replace('BKSAD_', '').trim();
  console.log('tokenExtractor - authHeader', {authHeader, authorizationHeader, authJWT});
  if (authJWT && authJWT.length > 0 && authJWT != 'null') { // request has authentication header
    try {
      const decodedAuthJWT = decodeToken(authJWT);
      // console.log('AUTH - decodedAuthJWT', decodedAuthJWT);
      ctx.bkstoken = decodedAuthJWT;
      return await next();
    } catch (ex) { // exception for some reason - reject.
      console.log('ERROR! tokenExtractor - an exception was thrown during token decode', { authHeader, authJWT, ex });
      ctx.status = 401;
      ctx.body = 'extractor: forbidden - bad token';
    }
  } else {
    console.log('ERROR! - tokenExtractor - bad authHeader', authHeader, authJWT);
    ctx.status = 401;
    ctx.body = 'extractor: forbidden - bad authHeader';
  }
};
