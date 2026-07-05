import { redirectToLogin } from '../shopifyInterceptor';
const Models = require('../../db/models');
const { Op } = require('@sequelize/core');

export const tokenAdminAuthenticator = async (ctx: any, next: any) => {
  const { email, password } = ctx.mmtoken;
  console.log('tokenAdminAuthenticator - { email, password }', { email, password });
    try {
      const admin = await Models.admins.findOne({ where: { email: {[Op.iLike]: email}, password }, logging: false });
      if (admin) {
        ctx.adminPermmissions = admin.permissions;
        return await next();
      } else {
        ctx.status = 401;
        ctx.body = 'tkadmn: forbidden - user not found';
        return;
      }
    } catch (ex) { // exception for some reason - reject.
      console.log('ERROR! tokenAdminAuthenticator - an exception was thrown during token authentication', { email, ex });
      ctx.status = 401;
      ctx.body = 'tkadmn: forbidden - not an admin';
    }
};
