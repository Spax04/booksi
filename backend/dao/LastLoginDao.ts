import { clean } from '../common';
const moment = require('moment-timezone');
const Models = require('../db/models/');


export class LastLoginDao {

  async getAllLastLogins() {
    try {
      const lastLoginArray = await Models.lastLogin.findAll({ where: {}, logging: false });
      const lastLogins = lastLoginArray.map((lastLoginData: any) => lastLoginData.dataValues);
      if (lastLogins) {
        return {success: true, lastLogins};
      } else {
        return {success: false};
      }
    } catch (ex) {
      console.log('ERROR! getAllLastLogins threw an exception', ex);
      return {success: false};
    }
  }

  async getAllLastLoginsCount() {
    try {
      const lastLoginsCount = await Models.lastLogin.count({ where: {}, logging: false });
      if (lastLoginsCount) {
        return lastLoginsCount;
        return {success: true, lastLoginsCount};
      } else {
        return {success: false};
      }
    } catch (ex) {
      console.log('ERROR! getAllLastLoginsCount threw an exception', ex);
      return {success: false};
    }
  }


  async getLastLoginByShopName(shopName: string) {
    try {
      const lastLogin = await Models.lastLogin.findOne({where: { shopName }, logging: false});
      if (lastLogin) {
        return {success: true, lastLogin: lastLogin.dataValues};
      } else {
        return {success: false};
      }
    } catch (ex) {
      console.log('ERROR! getLastLoginByShopName threw an exception', ex);
      return {success: false};
    }
  }

  async updateLastLoginByShopName(shopName: string, updateData: any) {
    try {
      await Models.lastLogin.update({...clean(updateData)}, {where: { shopName }, logging: false});
      return {success: true};
    } catch (ex) {
      console.log('ERROR! updateLastLoginByShopName threw an exception', ex);
      return {success: false};
    }
  }

  async upsertLastLoginByShopName(shopName: string, email: string, loginVia: string) {
    try {
      await Models.lastLogin.upsert({
        shopName,
        email,
        loginVia,
        loginDate: moment()
      }, {where: { shopName }, logging: false});
      return {success: true};
    } catch (ex) {
      console.log('ERROR! upsertLastLoginByShopName threw an exception', ex);
      return {success: false};
    }
  }

}
