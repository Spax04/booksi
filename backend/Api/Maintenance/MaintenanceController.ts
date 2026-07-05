import bodyParser = require('koa-bodyparser');
import { MaintenanceService } from './MaintenanceService';

interface IEnforceRetentionRes {
  body: Array<{ name: string; records: number }> | string;
  status: number;
}

export const MaintenanceController = (router: any) => {
  router.post('/maintenance/enforceRetention', bodyParser(), enforceRetention);
};

export const enforceRetention = async (ctx: IEnforceRetentionRes) => {
  try {
    const { success: enforceRetentionSuccess, results, msg } = await new MaintenanceService().enforceRetention();
    if (enforceRetentionSuccess) {
      ctx.body = results;
      ctx.status = 200;
    } else {
      ctx.body = msg;
      ctx.status = 200;
    }

  } catch (ex) {
    ctx.body = JSON.stringify({ success: false, data: {}, msg: 'enforceRetention exception' });
    ctx.status = 200;
  }
};
