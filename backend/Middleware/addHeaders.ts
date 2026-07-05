import { getAllowedOrigins } from './allowedOrigins';

export const addHeaders = async (ctx: any, next: any) => {
  // const origin = ctx.headers.origin;
  ctx.set('Access-Control-Allow-Origin', '*');
  // if (getAllowedOrigins().includes(origin)) {
  //   ctx.set('Access-Control-Allow-Origin', origin);
  // }
  ctx.set('Access-Control-Allow-Headers', 'MMT, authorization, Origin, Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers');
  ctx.set('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS');
  ctx.set('Access-Control-Request-Method', '*');
  ctx.set('Access-Control-Allow-Credentials', 'true');
  ctx.set('Access-Control-Allow-Headers', '*');
  ctx.set('X-Frame-Options', '');

  await next();
};


