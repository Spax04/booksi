import { PreferencesDao } from '../../dao/PreferencesDao';
import { IShopSettings, IPreferences, IShopIntegrations } from '../../common/defaultSettings';
import { IPersonnelPermissions, IUserPhone } from '../../Types/common';
import { UserDao } from '../../dao/UserDao';


export class SettingsService {

  async getShopSettings(shopName: string): Promise<{success: boolean, msg: string, settings?: IPreferences}> {
    try {
      const { success, settings }: {success: boolean, settings?: IPreferences} = await new PreferencesDao().getSettingsByShopName(shopName);
      if (!success) {
        return { success: false, msg: 'getSettingsByShopName failed' };
      }
      return {success: true, msg: 'getShopSettings OK', settings };
    } catch (ex) {
      console.log('ERROR! getShopSettings threw an exception:', ex);
      return {success: false, msg: 'getShopSettings failed' };
    }
  }

  async updateShopSettings(shopName: string, settings: IShopSettings) {
    try {
      // TODO validate settings object and apply defaults where missing specifications
      const { success } = await new PreferencesDao().updateSettingsByShopName(shopName, settings);
      if (!success) {
        return { success: false, msg: 'updateSettingsByShopName failed' };
      }
      return {success: true, msg: 'shop settings updated successfully' }; // update was successful
    } catch (ex) {
      console.log('ERROR! updateShopSettings threw an exception:', ex);
      return {success: false, msg: 'updateShopSettings failed' };
    }
  }

  async updateShopIntegrations(shopName: string, integrations: IShopIntegrations) {
    try {
      // TODO validate integrations object and apply defaults where missing specifications
      const { success } = await new PreferencesDao().updateIntegrationsByShopName(shopName, integrations);
      if (!success) {
        return { success: false, msg: 'updateShopIntegrations failed' };
      }
      return {success: true, msg: 'shop integrations updated successfully' }; // update was successful
    } catch (ex) {
      console.log('ERROR! updateShopIntegrations threw an exception:', ex);
      return {success: false, msg: 'updateShopIntegrations failed' };
    }
  }

  async updateUserPhone(email: string, phone: IUserPhone) {
    try {
      // TODO validate settings object and apply defaults where missing specifications
      const { success } = await new UserDao().updateUserPhoneByEmail(email, phone);
      if (!success) {
        return { success: false, msg: 'updateSettingsByShopName failed' };
      }
      return {success: true, msg: 'shop settings updated successfully' }; // update was successful
    } catch (ex) {
      console.log('ERROR! updateShopSettings threw an exception:', ex);
      return {success: false, msg: 'updateShopSettings failed' };
    }
  }

  async updateEmployeePermissions(shopName: string, permissions: IPersonnelPermissions) {
    try {
      // TODO validate settings object and apply defaults where missing specifications
      const { success } = await new PreferencesDao().updateEmployeePermissionsByShopName(shopName, permissions);
      if (!success) {
        return { success: false, msg: 'updateEmployeePermissions failed' };
      }
      return {success: true, msg: 'shop permissions updated successfully' }; // update was successful
    } catch (ex) {
      console.log('ERROR! updateEmployeePermissions threw an exception:', ex);
      return {success: false, msg: 'updateEmployeePermissions failed' };
    }
  }

  async updateManagerPermissions(shopName: string, permissions: IPersonnelPermissions) {
    try {
      // TODO validate settings object and apply defaults where missing specifications
      const { success } = await new PreferencesDao().updateManagerPermissionsByShopName(shopName, permissions);
      if (!success) {
        return { success: false, msg: 'updateManagerPermissions failed' };
      }
      return {success: true, msg: 'shop permissions updated successfully' }; // update was successful
    } catch (ex) {
      console.log('ERROR! updateManagerPermissions threw an exception:', ex);
      return {success: false, msg: 'updateManagerPermissions failed' };
    }
  }

  async updateAdminPermissions(shopName: string, permissions: IPersonnelPermissions) {
    try {
      // TODO validate settings object and apply defaults where missing specifications
      const { success } = await new PreferencesDao().updateAdminPermissionsByShopName(shopName, permissions);
      if (!success) {
        return { success: false, msg: 'updateAdminPermissions failed' };
      }
      return {success: true, msg: 'shop permissions updated successfully' }; // update was successful
    } catch (ex) {
      console.log('ERROR! updateAdminPermissions threw an exception:', ex);
      return {success: false, msg: 'updateAdminPermissions failed' };
    }
  }
}
