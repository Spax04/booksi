// custom env variables setup

const customEnv = require('custom-env');
const path = require('path');

customEnv.env(process.env.NODE_ENV, 'env');

const i18n = require('i18n');

console.log('dddd', path.join(__dirname, '..', 'Api', 'Mailing', 'locales'));

i18n.configure({
  locales: ['en', 'es'],
  directory: path.join(__dirname, '..', 'Api', 'Mailing', 'locales'),
});
// azure app insights setup
if (process.env.NODE_ENV == 'development' || process.env.NODE_ENV == 'production') {
  const appInsights = require('applicationinsights');
  appInsights.setup(process.env.APPINSIGHTS_INSTRUMENTATIONKEY || process.env.APP_INSIGHTS_KEY).setAutoCollectConsole(true, true).start();
}
// logging middleware

const blackList = ['/health', '/admin/host/ping'];
// const logCtx = async (ctx: any, next: any) => {
//   const userAgent = ctx.request.headers['user-agent'];
//   const isFromEnv = userAgent.includes('ElasticScaleControllerExtension') || userAgent.includes('HostnameSyncPinger') || userAgent.includes('AlwaysOn');
//   if (blackList.includes(ctx.request.url) || isFromEnv) {return await next(); }
//   console.log('logCtx method & URL: ', ctx.request.method, ctx.request.url, '\nlogCtx query: ', ctx.request.query, '\nlogCtx reqBody: ', ctx.request.body, '\nlogCtx reqHeaders: ', ctx.request.headers);
//   await next();
// };
const cors = require('@koa/cors');

const bodyParser = require('koa-bodyparser');

const responseTime = require('koa-response-time');
const helmet = require('koa-helmet');
const session = require('koa-session');
import { sessionConfig } from './sessionConfig';
import { publicRoutes, routes, adminRoutes } from './routes';

import { preflightInterceptor } from '../Middleware/preFlightInterceptor';
// import { posInterceptor } from '../Middleware/posInterceptor';
import { shopifyInterceptor } from '../Middleware/shopifyInterceptor';
import { addHeaders } from '../Middleware/addHeaders';
import Koa from 'koa';
import { tokenExtractor } from '../Middleware/token/tokenExtractor';
import { tokenValidator } from '../Middleware/token/tokenValidator';
import { tokenAuthenticator } from '../Middleware/token/tokenAuthenticator';
import { tokenAdminAuthenticator } from '../Middleware/token/tokenAdminAuthenticator';
import { bodyEncryptor } from '../Middleware/encryption/bodyEncryptor';
import { bodyDecryptor } from '../Middleware/encryption/bodyDecryptor';

// server setup
const app = new Koa();
app.use(cors());
app.use(bodyParser({jsonLimit: '50mb'}));
//app.use(logCtx);
app.use(responseTime({ hrtime: true }));
app.keys = [process.env.APP_SECRET];
app.use(session(sessionConfig, app));
app.use(preflightInterceptor);
app.use(shopifyInterceptor);
app.use(addHeaders);
app.use(publicRoutes.routes());
app.use(bodyDecryptor);
app.use(tokenExtractor);
app.use(tokenValidator);
app.use(tokenAuthenticator);
app.use(bodyEncryptor);
app.use(routes.routes());
app.use(tokenAdminAuthenticator);
app.use(adminRoutes.routes());
app.use(helmet());
app.use(i18n.init);


// util data in use now
// const asyncFunc = async () => {
//   try {
//
//   } catch (ex) {
//     console.log('asyncFunc threw an exception:', ex);
//   }
// };
// asyncFunc();


export const server = app.listen(process.env.PORT || 3000);
console.log(`Server running on port ${process.env.PORT || 3000}`);
