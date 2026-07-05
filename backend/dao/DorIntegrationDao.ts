import { clean } from '../common';
import {
  IShopSettings,
  IShopIntegrations
} from '../common/defaultSettings';
import { IDorIntegration, IDorLocationMapping } from '../ExternalAPI/DorApi/DorAPI';
const Models = require('../db/models/');


export class DorIntegrationDao {

  async getDorIntegrationByShopName(shopName: string) {
    try {
      const dorIntegrationData: any = await Models.dorIntegration.findOne({ where: { shopName }, logging: false });
      const dorIntegration: IDorIntegration = dorIntegrationData ? dorIntegrationData.dataValues : undefined;
      return { success: true, msg: 'getDorIntegrationByShopName OK', dorIntegration };
    } catch (ex) {
      console.log('ERROR! DorIntegrationDao - getDorIntegrationByShopName threw an exception:', ex);
      return {success: false, msg: 'DorIntegrationDao - getDorIntegrationByShopName failed!'};
    }
  }

  async addDorIntegrationByShopName(shopName: string, teamId: string, apiKey: string) {
    try {
      const dorIntegration = await Models.dorIntegration.upsert({shopName, teamId, apiKey}, {logging: false });
      if (dorIntegration) {
        return { success: true, msg: 'add dor integration OK', dorIntegration };
      } else {
        return { success: false, msg: 'add dor integration failed' };
      }
    } catch (ex) {
      console.log('ERROR! addDorIntegrationByShopName threw an exception:', ex);
      return {success: false, msg: 'addDorIntegrationByShopName failed!'};
    }
  }

  async setDorLocationsMapping(shopName: string, locationsMapping: IDorLocationMapping[]) {
    try {
      await Models.dorIntegration.update({locationsMapping}, { where: { shopName }, logging: false });
      return { success: true, msg: 'setDorLocationsMapping OK' };
    } catch (ex) {
      console.log('ERROR! setDorLocationsMapping threw an exception:', ex);
      return {success: false, msg: 'setDorLocationsMapping failed!'};
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

}
