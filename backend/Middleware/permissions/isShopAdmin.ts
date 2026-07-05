export const isShopAdmin = async (ctx: any, next: any) => {
    try {
      const { permissions, email } = ctx.mmtoken;
      const { permissionLevel } = permissions;
      if (permissionLevel != 'Admin') {
        console.log('WARNING! isShopAdmin - a request was made by an unauthorized personnel', { mmtoken: ctx.mmtoken });
        ctx.status = 401;
        ctx.body = 'iadmn: forbidden - unauthorized';
        return;
      } else {
        return await next();
      }
    } catch (ex) { // exception for some reason - reject.
      console.log('ERROR! isShopAdmin - an exception was thrown during admin validation', { mmtoken: ctx.mmtoken, ex });
      ctx.status = 401;
      ctx.body = 'iadmn: forbidden - unauthorized';
    }
};
