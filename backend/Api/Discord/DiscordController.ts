import bodyParser = require('koa-bodyparser');
import { DiscordService } from './DiscordService';

export const DiscordController = (router: any) => {
  // router.post('/discord/daily_stats', bodyParser(), sendDailyStats); // already in azure MW
};

// export const sendDailyStats = async (ctx: any) => {
//   try {
//     await new DiscordService().sendDailyStats();
//     ctx.status = 200;
//   } catch (ex) {
//     ctx.body = JSON.stringify({success: false, msg: ex});
//     ctx.status = 500;
//   }
// };
