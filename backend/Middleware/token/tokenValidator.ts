import { IBKSTOKEN } from '../../Api/Login/LoginService';
const moment = require('moment-timezone');

export const tokenValidator = async (ctx: any, next: any) => {
  const bkstoken: IBKSTOKEN = ctx.bkstoken;
  // console.log('tokenValidator - bkstoken', bkstoken);
  // console.log('tokenValidator - bkstoken.permissions', bkstoken.permissions);
  if (!!bkstoken) { // request has authentication header
    try {
      const expirationDate = moment(bkstoken.expiration);
      const now = moment();
      const expired = expirationDate.isBefore(now); // check if valid expiration date
      if (expired) {
        console.log('WARNING! tokenValidator - token expired', { mmtoken: bkstoken });
        ctx.status = 401;
        ctx.body = 'vld: forbidden - bad token 1';
        return;
      }
      if (!bkstoken.email || !bkstoken.password) {
        console.log('ERROR! tokenValidator - token missing email or password', { mmtoken: bkstoken });
        ctx.status = 401;
        ctx.body = 'vld: forbidden - bad token 2';
        return;
      }
      if (!ctx.isAdminRequest && !(bkstoken?.subscription?.subscriptionPlanName)) {
        console.log('ERROR! tokenValidator - token missing subscription or subscriptionPlanName', { mmtoken: bkstoken });
        ctx.status = 401;
        ctx.body = 'vld: forbidden - no subscription';
        return;
      }
      ctx.subscriptionPlanName = ctx.isAdminRequest ? 'Admin' : bkstoken?.subscription?.subscriptionPlanName;
      if (!ctx.isAdminRequest && !bkstoken.permissions.permissionLevel) {
        console.log('ERROR! tokenValidator - token missing permission level', { mmtoken: bkstoken });
        ctx.status = 401;
        ctx.body = 'vld: forbidden - bad token 3';
        return;
      }
      if (ctx.isAdminRequest && !bkstoken.permissions) {
        console.log('ERROR! tokenValidator - token missing permissions', { mmtoken: bkstoken });
        ctx.status = 401;
        ctx.body = 'vld: forbidden - bad admin token';
        return;
      }
      return await next();
    } catch (ex) { // exception for some reason - reject.
      console.log('ERROR! tokenValidator - an exception was thrown during token validation', { mmtoken: bkstoken, ex });
      ctx.status = 401;
      ctx.body = 'vld: forbidden - bad token ex';
    }
  }
};
