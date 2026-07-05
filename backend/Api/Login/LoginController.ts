import bodyParser = require('koa-bodyparser');
import { LoginService } from './LoginService';

export const LoginController = (router: any) => {
  router.post('/login/authenticate', bodyParser(), authenticate);
  router.post('/login/reset', bodyParser(), reset);
  router.post('/login/set_password', bodyParser(), setPassword);
  router.post('/login/register', bodyParser(), register);
};

export const authenticate = async (ctx: any) => {
  const {email, password, shopName} = ctx.request.body;
  if (!email || !password) {
    ctx.body = JSON.stringify({ success: false, msg: 'missing parameters' } );
    ctx.status = 406;
  } else {
    try {
      const { success, msg, status, data } = await new LoginService().authenticate(email, password, shopName);
      if (success) {
        ctx.body = JSON.stringify({ success, msg, data });
        ctx.status = 200;
      } else {
        ctx.body = JSON.stringify({ success, msg });
        if (status) {
          ctx.status = status;
        } else {
          ctx.status = 500;
        }
      }
    } catch (ex) {
      ctx.body = JSON.stringify({ success: false, msg: 'server error' } );
      ctx.status = 500;
    }
  }
};

export const reset = async (ctx: any) => {
  const { email } = ctx.request.body;
  try {
    const { success, msg } = await new LoginService().reset(email);
    if (success) {
      ctx.body = JSON.stringify({ success, msg });
      ctx.status = 200;
    } else {
      ctx.body = JSON.stringify({ success, msg });
      ctx.status = 500;
    }
  } catch (ex) {
    ctx.body = JSON.stringify({ data: { success: false, msg: 'server error' } });
    ctx.status = 500;
  }
};

export const setPassword = async (ctx: any) => {
  const {resetToken, password} = ctx.request.body;
  try {
    const { success, msg, userEmail } = await new LoginService().setPassword(resetToken, password);
    if (success) {
      ctx.body = JSON.stringify({ success, msg, userEmail });
      ctx.status = 200;
    } else {
      ctx.body = JSON.stringify({ success, msg });
      ctx.status = 500;
    }
  } catch (ex) {
    ctx.body = JSON.stringify({ success: false, msg: 'server error' });
    ctx.status = 500;
  }
};

export const register = async (ctx: any) => {
  const {inviteKey, password} = ctx.request.body;
  try {
    const {success, msg, email} = await new LoginService().register(inviteKey, password);
    if (success) {
      ctx.body = JSON.stringify({success, msg, email});
      ctx.status = 200;
    } else {
      ctx.body = JSON.stringify({success, msg});
      ctx.status = 500;
    }
  } catch (ex) {
    ctx.body = JSON.stringify({ success: false, msg: 'server error' });
    ctx.status = 500;
  }
};
