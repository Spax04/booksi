import { logInspect } from '../../common';

export const hasActionPermission = (ctx: any, next: any, actionCategory: string, actionName: string) => {
    try {
      const { permissions, email } = ctx.mmtoken;
      const { actions, permissionLevel } = permissions;
      if (!actions[actionCategory]) {
        logInspect({ mmtoken: ctx.mmtoken, actionCategory, actionName }, 'WARNING! hasActionPermission - unknown action category entered');
        ctx.status = 403;
        ctx.body = 'actprm: forbidden - you dont have sufficient permission to perform this action';
        return;
      }
      if (!actions[actionCategory][actionName]) {
        ctx.status = 403;
        ctx.body = 'actprm: forbidden - you dont have sufficient permission to perform this action';
        return;
      }
      return next();
    } catch (ex) { // exception for some reason - reject.
      console.log('ERROR! hasActionPermission - an exception was thrown during action permission validation', { mmtoken: ctx.mmtoken, actionCategory, actionName, ex });
      ctx.status = 403;
      ctx.body = 'actprm: forbidden - unauthorized';
    }
};
