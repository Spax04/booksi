import { clean } from '../common';
import {
  defaultInstallationShopSettings,
  IShopSettings,
  IPreferences,
  IShopIntegrations
} from '../common/defaultSettings';
const Models = require('../db/models/');


export class PreferencesDao {

  async getSettingsByShopName(shopName: string) {
    try {
      const settings: IPreferences = await Models.preferences.findOne({ where: { shopName }, logging: false });
      if (settings) {
        return { success: true, msg: 'get settings OK', settings };
      } else {
        await this.createNewDefaultSettings(shopName);
        console.log('WARNING! getSettingsByShopName couldnt find settings for shop and created default!', {shopName});
        return { success: true, msg: 'no settings, created defaults', settings: defaultInstallationShopSettings };
      }
    } catch (ex) {
      console.log('ERROR! getSettingsByShopName threw an exception:', ex);
      return {success: false, msg: 'getSettingsByShopName failed!'};
    }
  }

  async getIntegrationsByShopName(shopName: string) {
    try {
      let preferences = await Models.preferences.findOne({ where: { shopName }, attributes: ['integrations'], logging: false });
      preferences = preferences.dataValues;
      if (preferences) {
        const integrations = preferences.integrations;
        if (integrations) {
          return { success: true, msg: 'get integrations OK', integrations };
        } else {
          return { success: false, msg: 'integrations not found' };
        }
      } else {
        return { success: false, msg: 'preferences not found' };
      }
    } catch (ex) {
      console.log('ERROR! getIntegrationsByShopName threw an exception:', ex);
      return {success: false, msg: 'getIntegrationsByShopName failed!'};
    }
  }

  async updateSettingsByShopName(shopName: string, settings: IShopSettings) {
    try {
      const newSettings = {...clean(settings)};
      await Models.preferences.update({settings: newSettings}, {where: {shopName}, logging: false});
      return {success: true};
    } catch (ex) {
      console.log('ERROR! updateSettingsByShopName threw an exception', ex);
      return {success: false};
    }
  }

  async updateIntegrationsByShopName(shopName: string, integrations: IShopIntegrations) {
    try {
      const newIntegrations = {...clean(integrations)};
      await Models.preferences.update({integrations: newIntegrations}, {where: {shopName}, logging: false});
      return {success: true};
    } catch (ex) {
      console.log('ERROR! updateIntegrationsByShopName threw an exception', ex);
      return {success: false};
    }
  }

  async updateEmployeePermissionsByShopName(shopName: string, permissions: any) {
    try {
      const newPermissions = {...clean(permissions)};
      await Models.preferences.update({employeePermissions: newPermissions}, {where: {shopName}, logging: false});
      await Models.personnel.update({permissions: newPermissions}, {where: { shopName, permissionLevel: 'Employee' }});
      return {success: true};
    } catch (ex) {
      console.log('ERROR! updateEmployeePermissionsByShopName threw an exception', ex);
      return {success: false};
    }
  }

  async updateManagerPermissionsByShopName(shopName: string, permissions: any) {
    try {
      const newPermissions = {...clean(permissions)};
      await Models.preferences.update({managerPermissions: newPermissions}, {where: {shopName}, logging: false});
      await Models.personnel.update({permissions: newPermissions}, {where: { shopName, permissionLevel: 'Manager' }});
      return {success: true};
    } catch (ex) {
      console.log('ERROR! updateManagerPermissionsByShopName threw an exception', ex);
      return {success: false};
    }
  }

  async updateAdminPermissionsByShopName(shopName: string, permissions: any) {
    try {
      const newPermissions = {...clean(permissions)};
      await Models.preferences.update({adminPermissions: newPermissions}, {where: {shopName}, logging: false});
      await Models.personnel.update({permissions: newPermissions}, {where: { shopName, permissionLevel: 'Admin' }});
      return {success: true};
    } catch (ex) {
      console.log('ERROR! updateAdminPermissionsByShopName threw an exception', ex);
      return {success: false};
    }
  }

  async createNewDefaultSettings(shopName: string) {
    try {
      const preExistingSettings = await Models.preferences.findOne({ where: { shopName }, logging: false });
      // create shop settings
      if (!preExistingSettings) {
        console.log('SettingsDao - creating new shop settings with defaults');
        await Models.preferences.create({ shopName, ...defaultInstallationShopSettings }, { logging: false });
        return ({ success: true, msg: 'createNewDefaultSettings ok'});
      } else {
        console.log('WARNING! SettingsDao - shop settings already exist, updating to defaults', shopName);
        await Models.preferences.update({ ...defaultInstallationShopSettings }, {
          where: { shopName },
          logging: false
        });
        return ({ success: true, msg: 'createNewDefaultSettings - updated to defaults' });
      }
    } catch (ex) {
      console.log('ERROR! createNewDefaultSettings threw an exception', ex);
      return ({ success: false, msg: 'createNewDefaultSettings failed' });
    }
  }

}
