const { Op } = require('@sequelize/core');

const Models = require('../db/models/');


export class ShopDao {

  async getAllShops() {
    try {
      const shopsArray = await Models.shops.findAll({ where: {}, logging: false });
      const shops = shopsArray.map((shop: any) => shop.dataValues);
      if (shops && shops.length > 0) {
        return {success: true, shops};
      } else {
        return {success: false};
      }
    } catch (ex) {
      console.log('ERROR! getAllShops threw an exception', ex);
      return {success: false};
    }
  }

  async getAllShopsByOwnerEmail(ownerEmail: string) {
    try {
      const shopsArray = await Models.shops.findAll({ where: { ownerEmail: {[Op.iLike]: ownerEmail }}, logging: false });
      const shops = shopsArray.map((shop: any) => shop.dataValues);
      if (shops && shops.length > 0) {
        return {success: true, shops};
      } else {
        return {success: false};
      }
    } catch (ex) {
      console.log('ERROR! getAllShopsByOwnerEmail threw an exception', ex);
      return {success: false};
    }
  }

  async getAllShopsCount() {
    try {
      const shopsCount = await Models.shops.count({ where: {}, logging: false });
      if (shopsCount) {
        return {success: true, shopsCount};
      } else {
        return {success: false};
      }
    } catch (ex) {
      console.log('ERROR! getAllShopsCount threw an exception', ex);
      return {success: false};
    }
  }

  async getShopByName(shopName: string) {
    try {
      const shop = await Models.shops.findOne({where: { shopName }, logging: false});
      if (shop) {
        return { success: true, shop: shop.dataValues };
      } else {
        return {success: false};
      }
    } catch (ex) {
      console.log('ERROR! getShopByName threw an exception', ex);
      return {success: false};
    }
  }
}
