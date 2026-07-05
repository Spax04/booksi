import bodyParser = require('koa-bodyparser');
import { SettingsService } from './SettingsService';
import { IShopSettings, IPreferences, IShopIntegrations } from '../../common/defaultSettings';
import { IUserPhone } from '../../Types/common';

export const SettingsController = (router: any) => {
  router.post('/settings/get', bodyParser(), getSettings);
  router.post('/settings/update_settings', bodyParser(), updateSettings);
  router.post('/settings/update_phone', bodyParser(), updatePhone);
  router.post('/settings/update_employee', bodyParser(), updateEmployee);
  router.post('/settings/update_manager', bodyParser(), updateManager);
  router.post('/settings/update_admin', bodyParser(), updateAdmin);
  router.post('/settings/update_integrations', bodyParser(), updateIntegrations);
};

export const getSettings = async (ctx: any) => {
  const { shopName } = ctx.request.body;
  try {
    const { success, msg, settings }: {success: boolean, msg: string, settings?: IPreferences} = await new SettingsService().getShopSettings(shopName);
    if (success) {
      ctx.body = JSON.stringify({ success, msg, settings });
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

export const updateSettings = async (ctx: any) => {
  const { shopName, settings }: {shopName: string, settings: IShopSettings} = ctx.request.body;
  try {
    const { success, msg } = await new SettingsService().updateShopSettings(shopName, settings);
    ctx.body = JSON.stringify({ success, msg });
    ctx.status = success ? 200 : 500;
  }
  catch (ex) {
    ctx.body = JSON.stringify({success: false, data:{}, msg: 'db exception'});
    ctx.status = 500;
  }
};

export const updateIntegrations = async (ctx: any) => {
  const { shopName, integrations }: {shopName: string, integrations: IShopIntegrations} = ctx.request.body;
  try {
    const { success, msg } = await new SettingsService().updateShopIntegrations(shopName, integrations);
    ctx.body = JSON.stringify({ success, msg });
    ctx.status = success ? 200 : 500;
  }
  catch (ex) {
    ctx.body = JSON.stringify({success: false, data:{}, msg: 'db exception'});
    ctx.status = 500;
  }
};

export const updatePhone = async (ctx: any) => {
  const { phone }: { phone: IUserPhone } = ctx.request.body;
  const { email } = ctx.mmtoken;

  try {
    const { success, msg } = await new SettingsService().updateUserPhone(email, phone);
    ctx.body = JSON.stringify({ success, msg });
    ctx.status = success ? 200 : 500;
  }
  catch (ex) {
    ctx.body = JSON.stringify({success: false, data:{}, msg: 'db exception'});
    ctx.status = 500;
  }
};

export const updateEmployee = async (ctx: any) => {
  const { shopName, permissions } = ctx.request.body;
  try {
    const { success, msg } = await new SettingsService().updateEmployeePermissions(shopName, permissions);
    ctx.body = JSON.stringify({ success, msg });
    ctx.status = success ? 200 : 500;
  }
  catch (ex) {
    ctx.body = JSON.stringify({success: false, data:{}, msg: 'db exception'});
    ctx.status = 500;
  }
};

export const updateManager = async (ctx: any) => {
  const { shopName, permissions } = ctx.request.body;
  try {
    const { success, msg } = await new SettingsService().updateManagerPermissions(shopName, permissions);
    ctx.body = JSON.stringify({ success, msg });
    ctx.status = success ? 200 : 500;
  }
  catch (ex) {
    ctx.body = JSON.stringify({success: false, data:{}, msg: 'db exception'});
    ctx.status = 500;
  }
};

export const updateAdmin = async (ctx: any) => {
  const { shopName, permissions } = ctx.request.body;
  try {
    const { success, msg } = await new SettingsService().updateAdminPermissions(shopName, permissions);
    ctx.body = JSON.stringify({ success, msg });
    ctx.status = success ? 200 : 500;
  }
  catch (ex) {
    ctx.body = JSON.stringify({success: false, data:{}, msg: 'db exception'});
    ctx.status = 500;
  }
};
