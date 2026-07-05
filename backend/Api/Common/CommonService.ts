import { PersonnelDao } from '../../dao/PersonnelDao';
const { Op } = require('@sequelize/core');
import { allCurrencies } from '../../common/currencies';
import { DiscordService } from '../Discord/DiscordService';
import { PreferencesDao } from '../../dao/PreferencesDao';
import { clean, createToken, hashString, logInspect } from '../../common';
import { NewShopifyAPI } from '../../ExternalAPI/ShopifyApi/NewShopifyAPI';
import { ShopDao } from '../../dao/ShopDao';
import { IMGMTOKEN } from '../Login/LoginService';
const moment = require('moment-timezone');
const Models = require('../../db/models');
const redisClient = require('../../db/redisClient');

export class CommonService {
  async getGeneralData(shopName: string) {
    let generalData = {};
    try {
      const { success: getSettingsSuccess, settings } = await new PreferencesDao().getSettingsByShopName(shopName);
      if (!getSettingsSuccess) {
        return { success: false, msg: 'getSettingsByShopName failed' };
      }
      const { success: getDepartmentsSuccess, departments } = await this.getDepartments(shopName);
      const { success: getPositionsSuccess, positions } = await this.getPositions(shopName);
      const { success: getLocationsSuccess, locations } = await this.getLocationsData(shopName);
      generalData = {
        departments,
        positions,
        settings,
        locations,
        currencies: allCurrencies
      };
      return generalData;
    } catch (ex) {
      console.log('ERROR! getGeneralData threw an exception:', ex);
      return generalData;
    }
  }

  async updateUserData(userEmail: any, userData: any) {
    try {
      delete userData.email;
      await Models.users.update({ ...clean(userData) }, {where: {email: {[Op.iLike]: userEmail }}});
      if (userData.name || userData.phone) {
        await Models.personnel.update(clean({ name: userData.name, phone: userData.phone }), {where: {email: {[Op.iLike]: userEmail }}});
      }
      return { success: true, msg: 'user data updated successfully' }; // update was successful
    } catch (ex) {
      console.log('ERROR! updateUserData threw an exception:', ex);
      return { success: false, msg: 'updateUserData failed' };
    }
  }

  async updateDefaultShop(userEmail: any, shopName: string) {
    try {
      await Models.users.update({ defaultShop: shopName }, {where: {email: {[Op.iLike]: userEmail }}, logging: false});
      return { success: true, msg: 'user data updated successfully' };
    } catch (ex) {
      console.log('ERROR! updateUserData threw an exception:', ex);
      return { success: false, msg: 'updateUserData failed' };
    }
  }

  async feedbackReceived(shopName: string, userEmail: string, userName: string, rating: string, message: string) {
    try {
      const submittedAt = moment(); // now
      await Models.userFeedback.create({shopName, userEmail, userName, rating, message, submittedAt});
      await new DiscordService().sendUserFeedbackToChannel(shopName, userEmail, userName, rating, message);
      return {success: true, msg: 'feedbackReceived OK' };
    } catch (ex) {
      console.log('ERROR! feedbackReceived threw an exception:', ex);
      return { success: false, msg: 'feedbackReceived failed' };
    }
  }

  async getLocationsData(shopName: any) {
    try {
      const shopData = await Models.shops.findOne({where:{shopName}, logging: false});
      if (!shopData) {
        return { success: false };
      }
      const locationsData = shopData.locationsData.filter((locationData: any) => locationData.active == true).map((locationData: any) => ({
        id: locationData.id,
        name: locationData.name
      }));
      const locations = [{id: 1, name: 'Back Office'}, ...locationsData];
      return { success: true, locations };
    } catch (ex) {
      console.log('ERROR! getLocationsData threw an exception:', ex);
      return { success: false };
    }
  }

  async refreshShopLocations(shopName: any) {
    try {
      const tokenData = await Models.accessTokens.findOne({where:{shopName}, logging: false});
      if (tokenData) {
        const { success: getShopLocationsSuccess, locations: locationsData } = await new NewShopifyAPI(tokenData.token, tokenData.shopName).getLocations();
        if (!getShopLocationsSuccess) {
          return {success: false, msg: 'error while fetching locations from Shopify'};
        }
        await Models.shops.update({locationsData}, {where:{shopName}, logging: false});
        const activelocationsData = locationsData.filter((locationData: any) => locationData.active == true).map((locationData: any) => ({
          id: locationData.id,
          name: locationData.name
        }));
        // const inActiveLocations = locationsData.filter((location: any) => !activelocationsData.find((loc: any) => loc.id == location.id));
        // logInspect('inActiveLocations', inActiveLocations);
        // console.log('fetched locations', {allLocationsCount: locationsData.length, activeLocationsCount: activelocationsData.length, inActiveLocationsCount: inActiveLocations});
        const locations = [{id: 1, name: 'Back Office'}, ...activelocationsData];
        return {success: true, locations, msg: 'refreshed locations OK'};
      } else {
        return {success: false, msg: 'no token data'};
      }
    } catch (ex) {
      console.log('ERROR! pagesService - refreshShopLocations threw an exception!', ex);
      return {success: false, msg: 'refreshShopLocations failed'};
    }
  }

  async getPositions(shopName: any) {
    let positions: any = [];
    try {
      const shopPositionsData = await Models.positions.findOne({where: {shopName}, logging: false});
      if (shopPositionsData) {
        positions = shopPositionsData.positions;
        return {success: true, positions};
      } else {
        return {success: true, msg: 'no positions found', positions};
      }
    } catch (ex) {
      console.log('ERROR! getPositions threw an exception', ex);
      return {success: false, msg: 'getPositions failed'};
    }
  }

  async getDepartments(shopName: any) {
    let departments: any = [];
    try {
      const shopDepartmentsData = await Models.departments.findOne({where: {shopName}, logging: false});
      if (shopDepartmentsData) {
        departments = shopDepartmentsData.departments;
        return {success: true, departments};
      } else {
        return {success: true, msg: 'no departments found', departments};
      }
    } catch (ex) {
      console.log('ERROR! getDepartments threw an exception', ex);
      return {success: false, msg: 'getDepartments failed'};
    }
  }

  async getShop(email: string, shopName: string, oldToken: IMGMTOKEN) {
    try {
      const { success: getPersonnelSuccess, personnel: personnelData } = await new PersonnelDao().getPersonnelByEmailAndShopName(email, shopName);
      if (!getPersonnelSuccess) {
        return ({success: false, msg: 'personnel not found' });
      }
      const { success: getShopSuccess, shop: shopData } = await new ShopDao().getShopByName(shopName);
      if (!getShopSuccess) {
        return ({success: false, msg: 'shop not found' });
      }
      const shop = {
        shopName: shopData.shopName,
        ownerName: shopData.ownerName,
        ownerEmail: shopData.ownerEmail,
        status: shopData.status,
        locationsData: shopData.locationsData,
        currency: shopData.shopifyData.currency
      };
      const personnel = personnelData; // TODO CLEAN IRRELEVENT DATA!
      const newToken = createToken(clean({
        ...oldToken,
        permissions: {
          permissionLevel: personnel.permissionLevel,
          visibility: personnel.permissions.visibility,
          actions: personnel.permissions.actions
        }}));
      await redisClient.delete(hashString(email));
      await redisClient.saveUserToken(hashString(email), newToken);
      return {success: true, msg: 'getShop OK', shop, personnel, newToken };
    } catch (ex) {
      console.log('ERROR! getShop threw an exception', ex);
      return {success: false, msg: 'getShop failed!' };
    }
  }
}
