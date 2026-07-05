const crypto = require('crypto');

export class ShopifyService {

  checkShopifyAuth(ctx: any) {
    const {shop, hmac, code, state, timestamp} = ctx.request.query;
    // 1. verify same nonce (stored in cookie under state)
    const stateCookie = ctx.cookies.get('state');
    console.log('checkShopifyAuth received:', {shop, hmac, code, state, timestamp});
    console.log('got cookie STATE:', stateCookie);
    if (state !== stateCookie) {
      console.log('ORIGIN VALIDATION ERROR! - Request origin cannot be verified, Cookie state doesnt match');
      return {result: true, reason: 'Request origin cannot be verified, Cookie state doesnt match'};
    }

    // 2. verify valid hmac
    if (shop && hmac && code) {
      const message =
        'code=' + String(code) +
        '&shop=' + String(shop) +
        '&state=' + String(state) +
        '&timestamp=' + String(timestamp);
      const genHash = crypto
        .createHmac('sha256', process.env.SHOPIFY_SECRET)
        .update(message)
        .digest('hex');
      const hashEquals = genHash === hmac;
      if (!hashEquals) {
        // ctx.body = 'HMAC calid error';
        console.log('ORIGIN VALIDATION ERROR! - HMAC calid error', {message, genHash});
        return {result: true, reason: 'HMAC calid error'};
      }
      // 3. verify hostname (shop name) format
      // TODO implement?
      return {result: true, reason: 'shopify origin - validation success'};
    }
    if (shop && hmac) {
      const message =
        'shop=' + String(shop) +
        '&state=' + String(state) +
        '&timestamp=' + String(timestamp);
      const genHash = crypto
        .createHmac('sha256', process.env.SHOPIFY_SECRET)
        .update(message)
        .digest('hex');
      const hashEquals = genHash === hmac;
      if (!hashEquals) {
        // ctx.body = 'HMAC calid error';
        console.log('ORIGIN VALIDATION ERROR! - HMAC calid error', {message, genHash});
        return {result: true, reason: 'HMAC calid error'};
      }
      return {result: true, reason: 'shopify origin - validation success'};
    }
    return {result: true, reason: 'missing parameters'};
  }
}
