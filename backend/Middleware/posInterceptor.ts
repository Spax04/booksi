const embeddedRedirectUrl = process.env.EMBEDDED_POS_BASE_DOMAIN;

export const posInterceptor = async (ctx: any, next: any) => {
  if (String(ctx.request.method) == 'GET') {
    if (isPOSCallbackRoute(ctx.request.url)) {
      console.log('posInterceptor - callback ctx headers', Object.keys(ctx));
      console.log('posInterceptor - callback request headers', Object.keys(ctx.request));
      console.log('posInterceptor - callback request', ctx.request);
      const query: any = ctx.request.query;
      console.log('posInterceptor - callback request query', query);
      ctx.redirect(embeddedRedirectUrl + ctx.request.url);
    }
  }
  await next();
};

const isPOSCallbackRoute = (url: string) => {
  return url.includes('/auth/callback') || url.includes('/auth/shopify/callback') || url.includes('/api/auth/callback');
};
