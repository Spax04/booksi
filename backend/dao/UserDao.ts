import { clean } from '../common';
const { Op } = require('@sequelize/core');
import { toLower } from 'lodash';
import {
  defaultNewStaffUserData,
  installation_defaultOwnerUserData
} from '../common/defaults';
import { IUserPhone } from '../Types/common';
const moment = require('moment-timezone');

const Models = require('../db/models/');


export class UserDao {

  async getAllUsers() {
    try {
      const usersArray = await Models.users.findAll({ where: {}, logging: false });
      const users = usersArray.map((user: any) => user.dataValues);
      if (users && users.length > 0) {
        return users;
      } else {
        return [];
      }
    } catch (ex) {
      console.log('ERROR! getAllUsers threw an exception', ex);
      return {};
    }
  }

  async getAllUsersCount() {
    try {
      const usersCount = await Models.users.count({ where: {}, logging: false });
      if (usersCount) {
        return usersCount;
      } else {
        return -1;
      }
    } catch (ex) {
      console.log('ERROR! getAllUsersCount threw an exception', ex);
      return -1;
    }
  }

  async getUserByEmail(email: string) {
    try {
      const user = await Models.users.findOne({where: { email: {[Op.iLike]: email } }, logging: false});
      if (user) {
        return { success: true, user: user.dataValues };
      } else {
        return { success: false };
      }
    } catch (ex) {
      console.log('ERROR! getUserByEmail threw an exception', ex);
      return { success: false };
    }
  }

  async getUsersByEmails(emails: string[]) {
    try {
      const usersArray = await Models.users.findAll({where: { email: emails  }, logging: false});
      const users = usersArray.map((user: any) => user.dataValues);
      if (users && users.length > 0) {
        return { success: true, users };
      } else {
        return { success: false };
      }
    } catch (ex) {
      console.log('ERROR! getUserByEmail threw an exception', ex);
      return { success: false };
    }
  }

  async getUserByEmailAndPassword(email: string, password: string) {
    try {
      const user = await Models.users.findOne({where: { email: {[Op.iLike]: toLower(email) }, password }, logging: false});
      if (user) {
        return {success: true, user: user.dataValues};
      } else {
        console.log('WARNING! USER DAO - NO USER FOUND!', { email, password });
        return {success: false};
      }
    } catch (ex) {
      console.log('ERROR! getUserByEmailAndPassword threw an exception', ex);
      return {success: false};
    }
  }

  async removeShopByName(userEmails: string[], shopName: string) {
    try {
      const { success: getUsersSuccess, users } = await this.getUsersByEmails(userEmails);
      const usersWithoutShops = [];
      if (!getUsersSuccess) {
        return {success: false, msg: 'removeShopByName OK'};
      }
      for (let i = 0; i < users.length; i++) {
        const updateObject: any = {};
        let shouldUpdate = false;
        const user = users[i];
        let userShops = user.shops;
        // update shops if needed
        if (userShops && userShops.includes(shopName)) {
          userShops = userShops.filter((record: any) => !userShops.includes(shopName));
          updateObject.shops = userShops;
          shouldUpdate = true;
        }
        // update default shop if needed
        if (user.defaultShop == shopName && userShops.length > 0) {
          updateObject.defaultShop = updateObject.shops[0] || '';
          shouldUpdate = true;
        }
        if (updateObject.shops.length == 0 || updateObject.defaultShop == '') {
          usersWithoutShops.push({email: user.email, avatarFile: user.avatarFile});
        }
        if (shouldUpdate) {
          await Models.users.update({...updateObject}, {where: {email: {[Op.iLike]: user.email}}});
        }
      }
      return {success: true, msg: 'removeShopByName OK', usersWithoutShops};
    } catch (ex) {
      console.log('ERROR! removeShopByName threw an exception', ex);
      return {success: false, msg: 'removeShopByName failed'};
    }
  }

  async createNewUser(shopName: string, userEmail: string, userName: string, password: string, isOwner: boolean = false) {
    try {
      const preExistingUser = await Models.users.findOne({where: { email: {[Op.iLike]: userEmail }}, logging: false});
      const userDefaults = isOwner ? installation_defaultOwnerUserData : defaultNewStaffUserData;
      const newUserData = {
        name: userName,
        password,
        defaultShop: shopName,
        ...userDefaults
      };
      if (!preExistingUser) {
        if (isOwner) {
          newUserData.ownedShops = [shopName];
        }
        // console.log('createNewUser - creating new user', { email: userEmail, ...newUserData, shops: [shopName] });
        const createdAt = moment();
        await Models.users.create({ createdAt, email: userEmail, ...newUserData, shops: [shopName] }, { logging: false });
        return ({ success: true, msg: 'createNewUser ok' });
      } else {
        console.log('WARNING! createNewUser - user already exists, updating to defaults', { userEmail });
        const currentShops = preExistingUser.shops || [];
        const newShopsData = [...currentShops.filter((name: any) => name != shopName), shopName];
        if (isOwner) {
          const currentOwnedShops = preExistingUser.ownedShops || [];
          const newOwnedShopsData = [...currentOwnedShops.filter((name: any) => name != shopName), shopName];
          newUserData.ownedShops = newOwnedShopsData;
        }
        await Models.users.update({ ...newUserData, shops: newShopsData }, { where: { email: {[Op.iLike]: userEmail }}, logging: false});
        return ({ success: true, msg: 'createNewUser - updated to defaults' });
      }
    } catch (ex) {
      console.log('ERROR! createNewUser threw an exception', ex);
      return ({ success: false, msg: 'createNewUser failed' });
    }
  }

  async updateUserByEmail(email: any, updateData: any) {
    try {
      await Models.users.update({...clean(updateData)}, {
        where: {
          email: {[Op.iLike]: toLower(email) }
        },
        logging: false
      });
      return { success: true, msg: 'updateUserByEmail OK' };
    } catch (ex) {
      console.log('ERROR! updateUserByEmail threw an exception:', ex);
      return { success: false };
    }
  }

  async updateUserPhoneByEmail(email: any, phone: IUserPhone) {
    try {
      await Models.users.update({...clean(phone)}, {
        where: {
          email: {[Op.iLike]: toLower(email) }
        },
        logging: false
      });
      return { success: true, msg: 'updateUserPhoneByEmail OK' };
    } catch (ex) {
      console.log('ERROR! updateUserPhoneByEmail threw an exception:', ex);
      return { success: false };
    }
  }
}
