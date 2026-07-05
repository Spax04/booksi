import { getAllowedOrigins } from './allowedOrigins';

export const preflightInterceptor = async (ctx: any, next: any) => {
  if (ctx.request.method == 'OPTIONS') {
    ctx.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    ctx.set('Access-Control-Allow-Origin', '*');
    const origin = ctx.headers.origin;
    // if (getAllowedOrigins().includes(origin)) {
    //   ctx.set('Access-Control-Allow-Origin', origin);
    // }
    console.log('preflightInterceptor - origin', origin);
    return;
  } else {
    return await next();
  }
};
