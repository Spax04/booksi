import bodyParser = require('koa-bodyparser');
import { SupportService } from './SupportService';


export const SupportController = (router: any) => {
  router.post('/support/contact', bodyParser(), contactUs);
};

export const contactUs = async (ctx: any) => {
  try {
    const { email, subject, message, payload } = ctx.request.body;
    const { success, msg } = await new SupportService().contactUs(email, subject, message, payload);
    ctx.body = JSON.stringify({ success, msg });
    if (success) {
      ctx.status = 200;
    } else {
      ctx.status = 500;
    }

  } catch (ex) {
    ctx.body = JSON.stringify({ success: false, data: {}, msg: 'enforceRetention exception' });
    ctx.status = 200;
  }
};
