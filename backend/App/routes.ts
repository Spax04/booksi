import Router from '@koa/router';
import { LoadPublicControllers, LoadControllers, LoadAdminControllers } from '../Api/Controllers';
const router = new Router();
const publicRouter = new Router();
const adminRouter = new Router();

// Base route, redirect to front login
publicRouter.get('/', async ctx => {
  console.log('WARNING - GET TO ROOT - REDIRECTING TO LOGIN', {
    method: ctx.request.method || 'undefined',
    url: ctx.request.url || 'undefined',
    query: ctx.request.query || 'undefined',
    body: ctx.request.body || 'undefined',
    headers: ctx.request.headers || 'undefined',
    redirectedTo: process.env.FRONTEND_BASE_DOMAIN || 'undefined'
  });
  ctx.redirect(process.env.FRONTEND_BASE_DOMAIN);
});
// Basic health check
publicRouter.get('/health', async ctx => {
  ctx.body = 'OK';
  ctx.status = 200;
});
publicRouter.get('/admin/host/ping', async ctx => { // azure availability monitor health checks
  ctx.body = 'OK';
  ctx.status = 200;
});
publicRouter.post('/admin/host/ping', async ctx => { // azure availability monitor health checks
  ctx.body = 'OK';
  ctx.status = 200;
});
publicRouter.get('/admin/host/status', async ctx => { // azure availability monitor health checks
  ctx.body = 'OK';
  ctx.status = 200;
});
publicRouter.get('/health_env', async ctx => {
  ctx.body = process.env.NODE_ENV;
  ctx.status = 200;
});
publicRouter.get('/p_env', async ctx => {
  ctx.body = JSON.stringify(process.env);
  ctx.status = 200;
});
publicRouter.get('/robots(.*)', async ctx => {
  ctx.body = 'OK';
  ctx.status = 200;
});
// publicRouter.get('/favicon.ico', async ctx => {
//   ctx.body = process.env.NODE_ENV;
//   ctx.status = 200;
// });
LoadControllers(router);
LoadPublicControllers(publicRouter);
LoadAdminControllers(adminRouter);

export const routes = router;
export const publicRoutes = publicRouter;
export const adminRoutes = adminRouter;



