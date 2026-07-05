export const hasVisibilityPermission = (ctx: any, next: any, visibilityCategory: string, visibilityName: string) => {
    try {
      const { permissions, email } = ctx.mmtoken;
      const { visibility, permissionLevel } = permissions;
      if (!visibility[visibilityCategory]) {
        console.log('WARNING! hasVisibilityPermission - unknown action category entered', { mmtoken: ctx.mmtoken, visibilityCategory, visibilityName });
        ctx.status = 401;
        ctx.body = 'visprm: forbidden - you dont have sufficient permission to view this data';
        return;
      }
      if (!visibility[visibilityCategory][visibilityName]) {
        ctx.status = 401;
        ctx.body = 'visprm: forbidden - you dont have sufficient permission to view this data';
        return;
      }
      return next();
    } catch (ex) { // exception for some reason - reject.
      console.log('ERROR! hasVisibilityPermission - an exception was thrown during visibility permission validation', { mmtoken: ctx.mmtoken, visibilityCategory, visibilityName, ex });
      ctx.status = 401;
      ctx.body = 'visprm: forbidden - unauthorized';
    }
};
