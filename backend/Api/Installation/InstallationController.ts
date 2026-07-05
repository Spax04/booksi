import bodyParser = require('koa-bodyparser');
import { ShopifyService } from '../../services/ShopifyService';
import { ShopifyAPI } from '../../ExternalAPI/ShopifyApi/ShopifyAPI';
import { InstallationService } from './InstallationService';
import { isRequestHMACValid, isWebhookHMACValid } from '../../Middleware/shopifyInterceptor';



export const InstallationController = (router: any) => {
    router.get('/installation/permissionsApproved', permissionsApproved);
    router.get('/installation/usageChargeApproved', usageChargeApproved);
    router.get('/installation/updatedUsageChargeApproved', updatedUsageChargeApproved);
    router.get('/installation/re_approve_permissions', redirectToReApprovePermissions);
    router.post('/installation/planSelected', planSelected);
    router.post('/installation/unInstall', bodyParser(), unInstall);
    router.post('/onboarding/register', bodyParser(), register);
    router.post('/installation/gdpr/customer/data', bodyParser(), OK);
    router.post('/installation/gdpr/customer/redact', bodyParser(), OK);
    router.post('/installation/gdpr/shop/redact', bodyParser(), OK);
};

const permissionsApproved = async (ctx: any) => {
  // user is after accepting permissions
  // 1.a. validate request is from shopify
  if (!!ctx.request.query && !isRequestHMACValid(ctx)) {
    console.log('ERROR! - permissionsApproved - isRequestHMACValid failed');
    ctx.status = 401;
    ctx.body = 'ORIGIN hmac VALIDATION ERROR, Please refresh and try Installation again';
    return;
  }
 // 1.b. validate state (nonce) on cookie is the same
  const cookieState = ctx.cookies.get('state');
  const {state: queryState} = ctx.request.query;
  if (cookieState != queryState) {
    console.log('ERROR! - permissionsApproved - state nonce validation failed', {cookieState, queryState});
    ctx.status = 401;
    ctx.body = 'ORIGIN state VALIDATION ERROR, Please refresh and try Installation again';
    return;
  }
  // 1.c. validate shop name is valid format
  const {shop} = ctx.request.query;
  if (!/^[a-zA-Z0-9][a-zA-Z0-9\-]*\.myshopify\.com/.test(shop)) {
    console.log('ERROR! - permissionsApproved - shop name validation failed', {shop});
    ctx.status = 401;
    ctx.body = 'ORIGIN shop VALIDATION ERROR, Please refresh and try Installation again';
    return;
  }
  try {
    const {shop: shopName, code} = ctx.request.query;
    const { success, msg, redirectUrl } = await new InstallationService().permissionsApproved(shopName, code);
    console.log('controller - permissionsApproved', { success, msg, redirectUrl });
    if (success) {
      ctx.redirect(redirectUrl); // redirect to select pricing plan
    } else {
      console.log('ERROR! permissionsApproved failed!', msg);
      ctx.status = 500;
      ctx.body = msg;
    }
  } catch (exception) {
    console.log('ERROR! permissionsApproved threw an Exception!', exception);
    ctx.status = 500;
    ctx.body = 'Please try operation again';
  }
};

const planSelected = async (ctx: any) => {
  // user is after selecting pricing plan in front
  try {
    const {shopName, planName, planChange} = ctx.request.body;
    const { success, msg, redirectUrl } = await new InstallationService().planSelected(shopName, planName, planChange);
    if (success) {
      console.log('plan selected, redirecting to:', redirectUrl);
      // ctx.redirect(redirectUrl); // redirect to approve app charges
      ctx.body = JSON.stringify({ success, msg, redirectUrl });
      ctx.status = 200;
    } else {
      console.log('ERROR! planSelected failed!', msg);
      ctx.status = 500;
      ctx.body = msg;
    }
  } catch (exception) {
    console.log('ERROR! planSelected threw an Exception!', exception);
    ctx.status = 500;
    ctx.body = 'Please try operation again';
  }
};

const usageChargeApproved = async (ctx: any) => {
  try {
    const {shopName, planName, charge_id: chargeId} = ctx.request.query;
    const { success, msg, redirectURL, isTrialShop } = await new InstallationService().usageChargeApproved(shopName, planName, chargeId);
    if (success) {
      ctx.redirect(redirectURL); // redirect to onboarding
    } else {
      if (isTrialShop) { // TODO what dies this do? i think delete, why care if trial shop?
        ctx.status = 500;
        ctx.body = 'msg';
      }
      console.log('ERROR! usageChargeApproved failed!', msg);
      ctx.status = 500;
      ctx.body = msg;
    }
  } catch (exception) {
    console.log('ERROR! usageChargeApproved threw an Exception!', exception);
    ctx.status = 500;
    ctx.body = 'Please try operation again';
  }
};

const updatedUsageChargeApproved = async (ctx: any) => {
  try {
    const {shopName, planName, charge_id: chargeId} = ctx.request.query;
    const { success, msg } = await new InstallationService().updatedUsageChargeApproved(shopName, planName, chargeId);
    if (success) {
      ctx.redirect(process.env.FRONTEND_BASE_DOMAIN + '/?cc=true'); // redirect to login
    } else {
      console.log('ERROR! updatedUsageChargeApproved failed!', msg);
      ctx.status = 500;
      ctx.body = msg;
    }
  } catch (exception) {
    console.log('ERROR! updatedUsageChargeApproved threw an Exception!', exception);
    ctx.status = 500;
    ctx.body = 'Please try operation again';
  }
};

const redirectToReApprovePermissions = async (ctx: any) => {
  try {
    const {shopName} = ctx.request.body;
    const reApprovePermissionsPageUrl =
      'https://' + shopName +
      '/admin/oauth/authorize' +
      '?client_id=' + process.env.SHOPIFY_API_KEY +
      '&scope=' + process.env.APP_PERMISSION_SCOPES +
      '&state=' + encodeURIComponent('state') +
      '&redirect_uri=' + process.env.FRONTEND_BASE_DOMAIN;
    console.log('reApprovePermissionsPageUrl', reApprovePermissionsPageUrl);
    ctx.redirect(reApprovePermissionsPageUrl); // redirect to approve permissions and then to login
  } catch (ex) {
    console.log('ERROR! updatedUsageChargeApproved threw an Exception!', ex);
    ctx.status = 500;
    ctx.body = 'Please try operation again';
  }
};

export const unInstall = async (ctx: any) => {
  if (!!ctx.request.query && !isWebhookHMACValid(ctx)) {
    console.log('ERROR! - unInstall - isRequestHMACValid failed');
    ctx.status = 401;
    ctx.body = 'ORIGIN VALIDATION ERROR';
    return;
  }
  const { subToken } = ctx.request.query;
  const bodyData = ctx.request.body;
  try {
    new InstallationService().unInstall(subToken, bodyData);
      ctx.body = 'OK';
      ctx.status = 200;
  } catch (ex) {
    ctx.body = JSON.stringify({ data: { success: false, msg: 'server error' } });
    ctx.status = 200;
  }
};

export const OK = async (ctx: any) => {
  const queryData = ctx.request.query;
  const bodyData = ctx.request.body;
  try {
    console.log('RECEIVED SHOPIFY WEBHOOK');
    console.log('queryData', queryData);
    console.log('bodyData', bodyData);
      ctx.body = 'OK';
      ctx.status = 200;
  } catch (ex) {
    ctx.body = JSON.stringify({ data: { success: false, msg: 'server error' } });
    ctx.status = 200;
  }
};

export const register = async (ctx: any) => {
  const { shopName, userName, email, password, timezone } = ctx.request.body;
  try {
    const res = await new InstallationService().register(shopName, userName, email, password, timezone);
    ctx.body = JSON.stringify(res);
    ctx.status = 200;
  } catch (ex) {
    ctx.body = JSON.stringify({ data: { success: false, msg: 'server error' } });
    ctx.status = 200;
  }
};
