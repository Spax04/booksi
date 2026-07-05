import { SubscriptionsDao } from '../dao/SubscriptionsDao';
import { ShopDao } from '../dao/ShopDao';
const crypto = require('crypto');
const middlewareWhitelist = ['/favicon.ico'];

const permissionsRedirectUrl = process.env.BACKEND_BASE_URL + '/installation/permissionsApproved';
const onboardingRedirectUrl = process.env.FRONTEND_BASE_DOMAIN + '/onboarding';
const loginRedirectUrl = process.env.FRONTEND_BASE_DOMAIN;

export const shopifyInterceptor = async (ctx: any, next: any) => {
  if (middlewareWhitelist.includes(ctx.path)) return;
  if (String(ctx.request.method) != 'GET') {
    return await next();
  }
  if (String(ctx.request.url).substring(0, 2) == '/?') { // this MW takes care of cases we get a GET to root ('/') with query params
    console.log('GET to root with params: ', ctx.request.url);
    const query: any = ctx.request.query;
    if (!!query) {
      console.log('Found Query params:', { ...query });
      if (!!query.hmac && !isRequestHMACValid(ctx)) {
        ctx.status = 401;
        ctx.body = 'ntrcpt: forbidden - bad hmac';
        return;
      }
      if (query.shop) {
        const shopName = query.shop;
        const {success: getSubscriptionSuccess, subscription} = await new SubscriptionsDao().getSubscriptionByShopName(shopName);
        if (getSubscriptionSuccess) {
          const { shopName, installationStatus } = subscription;
          console.log('found subscription - installationStatus:', installationStatus);
          switch (installationStatus) {
            case 'onboarding':
              const { success: getShopSuccess, shop } = await new ShopDao().getShopByName(shopName);
              if (getShopSuccess) {
                ctx.redirect(onboardingRedirectUrl + '/?shopName=' + shopName + '&ownerName=' + shop.ownerName + '&ownerEmail=' + shop.ownerEmail);
              } else {
                await redirectToOnboarding(ctx, shopName); // redirect to onboarding
              }
              return;
            case 'installed':
              await redirectToLogin(ctx);
              return;
            default:
              await redirectToLogin(ctx);
              return;
          }
        } else { // no subscription
          console.log('no subscription');
          if (!!query.hmac && !!query.timestamp) { /*query.shop already checked in the wrapping IF*/ // classic Installation request
            console.log('received Installation payload from shop:', query.shop);
            await redirectToShopifyPermissions(ctx);
            return;
          } else {
            console.log('ERROR! newShopifyInterceptor - GET to root, NO subscription AND not an Installation payload', {query});
            await redirectToLogin(ctx); // maybe should treat as installation request?
          }
        }
      } else {
        console.log('no shop in query params, aborting');
      }
    } else {
      // request to root with no query parameters - redirect to login
      console.log('WARNING! - GET to root without Query params, redirecting to login'); // already happens via router in routes
      // await redirectToLogin(ctx);
      return;
    }
  }
  await next();
};

const redirectToOnboarding = async (ctx: any, shopName: string) => {
    ctx.redirect(onboardingRedirectUrl + '/?shopName=' + shopName);
};

export const redirectToLogin = async (ctx: any) => {
    console.log('redirectToLogin - redirecting with cache clear');
    ctx.redirect(loginRedirectUrl + '/?cc=true');
};

export const redirectToLoginOnError = async (ctx: any, unauthorized: boolean = false) => {
    console.log('redirectToLoginOnError - returning 401');
    ctx.status = 401;
    ctx.body = 'ntrcpt: forbidden - bad token';
};

const redirectToShopifyPermissions = async (ctx: any) => { // redirect to approve permissions
  const { shop } = ctx.request.query;
  ctx.set('X-Frame-Options', '');
  const state = getRandomBytesSanitized();
  const approvePermissionsPageUrl =
  'https://' + shop +
  '/admin/oauth/authorize' +
  '?client_id=' + process.env.SHOPIFY_API_KEY +
  '&scope=' + process.env.APP_PERMISSION_SCOPES +
  '&state=' + encodeURIComponent(state) +
  '&redirect_uri=' + permissionsRedirectUrl;

  if (ctx.cookies) {
    ctx.cookies.set('state', state);
    console.log('cookie STATE set to:', state);
  }
  console.log('redirecting to approvePermissionsPageUrl:', approvePermissionsPageUrl);
  ctx.redirect(approvePermissionsPageUrl);
};

export const getRandomBytesSanitized = (bytesNum: number = 16) => {
  return crypto.randomBytes(bytesNum).toString('base64').replace(/[^a-zA-Z0-9 ]/g, 'x');
};

export const extractHMACAndQueryString = (ctx: any, isWebhook: boolean = false) => {
  let hmac;
  if (isWebhook) { // requests and webhooks have the hmac in different places..
    const xHMACheader = ctx.get('x-shopify-hmac-sha256');
    const HMACheader = ctx.get('hmac');
    console.log('extractHMACAndQueryString - webhook', {xHMACheader, HMACheader});
    hmac = xHMACheader || HMACheader;
  } else {
    hmac = ctx.request.query.hmac;
    console.log('extractHMACAndQueryString - request', {hmac});
  }
  const query = {...ctx.request.query};
  delete query.hmac;
  let queryString = '';
  for (const key in query) {
    queryString += key + '=' + query[key] + '&';
  }
  queryString = queryString.slice(0, -1);
  return {hmac, queryString};
};

export const isRequestHMACValid = (ctx: any): boolean => {
  const {hmac, queryString} = extractHMACAndQueryString(ctx, false);
  const generatedHMAC = crypto
    .createHmac('sha256', process.env.SHOPIFY_SECRET)
    .update(queryString, 'utf8')
    .digest('hex');
  const isValidRequest = hmac == generatedHMAC;
  if (!isValidRequest) {
    console.log('ERROR! isRequestHMACValid - REQUEST ORIGIN VALIDATION FAILED', {hmac, generatedHMAC, url: ctx.request.url, queryString});
  }
  return isValidRequest;
};

export const isWebhookHMACValid = (ctx: any): boolean => {
  const {hmac, queryString} = extractHMACAndQueryString(ctx, true);
  const rawBody = ctx.request.rawBody;
  const generatedHMAC = crypto
    .createHmac('sha256', process.env.SHOPIFY_SECRET)
    .update(rawBody, 'utf8')
    .digest('base64');
  console.log('originalHmac', hmac);
  console.log('generatedHMAC', generatedHMAC);

  const isValidRequest = hmac == generatedHMAC;
  if (!isValidRequest) {
    console.log('ERROR! isWebhookHMACValid - WEBHHOK ORIGIN VALIDATION FAILED', {hmac, generatedHMAC, url: ctx.request.url, rawBody});
  }
  return isValidRequest;
};
