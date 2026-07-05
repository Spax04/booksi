import bodyParser = require('koa-bodyparser');
import { CommonService } from './CommonService';
import { allCurrencies } from '../../common/currencies';


export const CommonController = (router: any) => {
    // Common
    router.post('/common/data', bodyParser(), getData);
    router.post('/common/positions', bodyParser(), getPositions);
    router.post('/common/currencies', bodyParser(), getCurrencies);
    router.post('/common/departments', bodyParser(), getDepartments);
    router.post('/common/update_user', bodyParser(), updateUser);
    router.post('/common/set_default_shop', bodyParser(), setDefaultShop);
    router.post('/common/load_locations', bodyParser(), loadLocations);
    router.post('/common/locations', bodyParser(), getLocations);
    router.post('/common/feedback', bodyParser(), feedbackReceived);
    router.post('/common/get_shop', bodyParser(), getShop);
};

export const getShop = async (ctx: any) => { // TODO move to common controller!!
  const {email, shopName} = ctx.request.body;
  try {
    const { success, msg, shop, personnel, newToken } = await new CommonService().getShop(email, shopName, ctx.mmtoken);
    if (success) {
      ctx.body = JSON.stringify({ success, msg, shop, personnel, newToken });
      ctx.status = 200;
    } else {
      ctx.body = JSON.stringify({ success, msg });
      ctx.status = 500;
    }
  } catch (ex) {
    ctx.body = JSON.stringify({ success: false, msg: 'server error' } );
    ctx.status = 500;
  }
};

export const getData = async (ctx: any) => {
  const { shopName } = ctx.request.body;
  try {
    const categories = await new CommonService().getGeneralData(shopName);
    // console.log('categories', categories);
    if (!!categories) {
      ctx.body = JSON.stringify({success: true, data:{categories}});
      ctx.status = 200;
    } else {
      ctx.body = JSON.stringify({success: false, data:{}, msg: 'server/db exception'});
      ctx.status = 500;
    }
  }
  catch (ex) {
    ctx.body = JSON.stringify({success: false, data:{}, msg: 'db exception'});
    ctx.status = 500;
  }
};

export const getPositions = async (ctx: any) => {
  const { shopName } = ctx.request.body;
  try {
    const positions = await new CommonService().getPositions(shopName);
    // console.log('positions', positions);
    if (!!positions) {
      ctx.body = JSON.stringify(positions);
      ctx.status = 200;
    } else {
      ctx.body = JSON.stringify({success: false, data:{}, msg: 'server/db exception'});
      ctx.status = 500;
    }
  }
  catch (ex) {
    ctx.body = JSON.stringify({success: false, data:{}, msg: 'db exception'});
    ctx.status = 500;
  }
};

export const getDepartments = async (ctx: any) => {
  const { shopName } = ctx.request.body;
  try {
    const departments = await new CommonService().getDepartments(shopName);
    // console.log('departments', departments);
    if (!!departments) {
      ctx.body = JSON.stringify(departments);
      ctx.status = 200;
    } else {
      ctx.body = JSON.stringify({success: false, data:{}, msg: 'server/db exception'});
      ctx.status = 500;
    }
  }
  catch (ex) {
    ctx.body = JSON.stringify({success: false, data:{}, msg: 'db exception'});
    ctx.status = 500;
  }
};

export const getLocations = async (ctx: any) => {
  const { shopName } = ctx.request.body;
  try {
    const locationsResult = await new CommonService().getLocationsData(shopName);
    ctx.body = JSON.stringify(locationsResult);
    if (locationsResult.success) {
      ctx.status = 200;
    } else {
      ctx.status = 500;
    }
  }
  catch (ex) {
    ctx.body = JSON.stringify({success: false, data:{}, msg: 'getShopLocations failed'});
    ctx.status = 500;
  }
};

export const updateUser = async (ctx: any) => {
  const { email, userData } = ctx.request.body;
  try {
    const { success, msg } = await new CommonService().updateUserData(email, userData);
    // console.log('updateResult', updateResult);
    if (success) {
      ctx.body = JSON.stringify({ success, msg });
      ctx.status = 200;
    } else {
      ctx.body = JSON.stringify({ success, msg });
      ctx.status = 500;
    }
  }
  catch (ex) {
    ctx.body = JSON.stringify({success: false, data:{}, msg: 'db exception'});
    ctx.status = 500;
  }
};

export const setDefaultShop = async (ctx: any) => {
  const { shopName, email } = ctx.request.body;
  try {
    const { success, msg } = await new CommonService().updateDefaultShop(email, shopName);
    // console.log('updateResult', updateResult);
    if (success) {
      ctx.body = JSON.stringify({ success, msg });
      ctx.status = 200;
    } else {
      ctx.body = JSON.stringify({ success, msg });
      ctx.status = 500;
    }
  }
  catch (ex) {
    ctx.body = JSON.stringify({success: false, data:{}, msg: 'db exception'});
    ctx.status = 500;
  }
};

export const feedbackReceived = async (ctx: any) => {
  const { shopName, email, userName, rating, message } = ctx.request.body;
  try {
    const { success, msg } = await new CommonService().feedbackReceived(shopName, email, userName, rating, message);
    // console.log('updateResult', updateResult);
    if (success) {
      ctx.body = JSON.stringify({ success, msg });
      ctx.status = 200;
    } else {
      ctx.body = JSON.stringify({ success, msg });
      ctx.status = 500;
    }
  }
  catch (ex) {
    ctx.body = JSON.stringify({success: false, data:{}, msg: 'db exception'});
    ctx.status = 500;
  }
};

export const getCurrencies = async (ctx: any) => {
  try {
      ctx.body = JSON.stringify({success: true, data:{currencies: allCurrencies}});
      ctx.status = 200;
  }
  catch (ex) {
    ctx.body = JSON.stringify({success: false, data:{}, msg: 'db exception'});
    ctx.status = 500;
  }
};

export const loadLocations = async (ctx: any) => {
  const { shopName } = ctx.request.body;
  try {
    const shopLocations: any = await new CommonService().refreshShopLocations(shopName);
    // console.log('shopLocations', shopLocations);
    if (!!shopLocations) {
      ctx.body = JSON.stringify(shopLocations);
      ctx.status = 200;
    } else {
      ctx.body = JSON.stringify({success: false, data:{}, msg: 'server/db exception'});
      ctx.status = 500;
    }
  }
  catch (ex) {
    ctx.body = JSON.stringify({success: false, data:{}, msg: 'db exception'});
    ctx.status = 500;
  }
};
