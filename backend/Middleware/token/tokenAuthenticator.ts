import { redirectToLogin } from '../shopifyInterceptor';
import { hashString } from '../../common';
const Models = require('../../db/models');
const { Op } = require('@sequelize/core');
const redisClient = require('../../db/redisClient');

export const tokenAuthenticator = async (ctx: any, next: any) => {
  if (ctx.isAdminRequest) {
    console.log('tokenAuthenticator - admin EP called, skipping User Authentication');
    return await next();
  }
  const { email, password } = ctx.mmtoken;
  console.log('tokenAuthenticator - { email, password }', { email, password });
  let authenticated = false;
    try {
      if (!email || !password ) {
        console.log('ERROR! tokenAuthenticator - an exception was thrown during token authentication', { email, password });
        ctx.status = 401;
        ctx.body = 'auth: forbidden - bad token';
        return;
      }
      if (ctx.isAdminImpersonationToken) {
        return await next();
      }
      ///// check redis for token, fallback to DB if redis is down, if no token / no user / redis token value is 'deAuth' / redis token mismatch (compromised by client) - go to login and clean caches if necessary
      const userUUID = hashString(email);
      const {success: redisGetSuccess, value: userToken} = await redisClient.get(userUUID);
      if (!redisGetSuccess) { // if redis failed - check in DB
        console.log('ERROR! tokenAuthenticator - redis client failed to get value! falling back to db', { password, userUUID });
        const user = await Models.users.findOne({ where: { email: {[Op.iLike]: email}, password }, logging: false });
        if (user) { // if user found in DB - OK
          authenticated = true;
        }
      } else { // redis get was successful
        if (userToken) { // get success and we found redis token for this user
          if (userToken == 'deAuth') {
            console.log('tokenAuthenticator - REDIS USER TOKEN DEAUTHENTICATED! REDIRECTING TO LOGIN WITH CACHE CLEAR');
            await redisClient.delete(userUUID);
            ctx.status = 401;
            ctx.body = 'auth: forbidden - bad token 1';
            return;
          }
          // const authHeader = ctx.get('MMT'); // we save and compare the ENCODED token without decoding it to json
          // const authJWT = authHeader.replace('Bearer', '').trim();
          // if (userToken != authJWT) {
          //   console.log('ERROR! REDIS TOKEN MATCH FAILED! TOKEN IS COMPROMISED!', {cache: {userUUID, userToken}, req: {authJWT, authHeader}});
          //   await redisClient.delete(userUUID);
          //   ctx.status = 401;
          //   ctx.body = 'auth: forbidden - bad token 2';
          //   return;
          // } else {
          //   console.log('tokenAuthenticator - REDIS TOKEN MATCH SUCCESS');
          // }
          // if value is OK
          console.log('tokenAuthenticator - REDIS GET TOKEN OK RESULT OK');
          authenticated = true;
        } else { // get success but no token found in redis - redirect to login (the only place where we add a redis token, after successful password authentication
          console.log('WARNING! tokenAuthenticator - redis get OK but no results, redirecting to login', { password, userUUID });
          ctx.status = 401;
          ctx.body = 'auth: forbidden - bad token 3';
          return;
        }
      }
      if (authenticated) {
        return await next();
      } else {
        await redirectToLogin(ctx); // if token expired - go to login.
        return;
      }
    } catch (ex) { // exception for some reason - reject.
      console.log('ERROR! tokenAuthenticator - an exception was thrown during token authentication', { email, password, ex });
      ctx.status = 401;
      ctx.body = 'auth: forbidden - bad token ex';
    }
};
