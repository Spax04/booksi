import { clean } from '../common';
const { Op } = require('@sequelize/core');

const Models = require('../db/models/');


export class SubscriptionsDao {

  async getAllSubscriptions() {
    try {
      const subscriptionsArray = await Models.subscriptions.findAll({ where: {}, logging: false });
      const subscriptions = subscriptionsArray.map((subscription: any) => subscription.dataValues);
      if (subscriptions) {
        return {success: true, subscriptions};
      } else {
        return {success: false};
      }
    } catch (ex) {
      console.log('ERROR! getAllSubscriptions threw an exception', ex);
      return {success: false};
    }
  }

  async getAllSubscriptionsCount() {
    try {
      const subscriptionsCount = await Models.subscriptions.count({ where: {}, logging: false });
      if (subscriptionsCount) {
        return {success: true, subscriptionsCount};
      } else {
        return {success: false};
      }
    } catch (ex) {
      console.log('ERROR! getAllSubscriptionsCount threw an exception', ex);
      return {success: false};
    }
  }

  async getSubscriptionByChargeId(chargeId: string) {
    if (!chargeId) {
      return {success: false};
    }
    try {
      const subscription = await Models.subscriptions.findOne({where: { chargeId }, logging: false});
      if (subscription) {
        return {success: true, subscription: subscription.dataValues};
      } else {
        return {success: false};
      }
    } catch (ex) {
      console.log('ERROR! getSubscriptionByChargeId threw an exception', ex);
      return {success: false};
    }
  }

  async getSubscriptionByShopName(shopName: string) {
    if (!shopName) {
      return {success: false};
    }
    try {
      const subscription = await Models.subscriptions.findOne({where: { shopName }, logging: false});
      if (subscription) {
        return {success: true, subscription: subscription.dataValues};
      } else {
        return {success: false};
      }
    } catch (ex) {
      console.log('ERROR! getSubscriptionByShopName threw an exception', ex);
      return {success: false};
    }
  }

  async getSubscriptionsByShopNames(shopNames: string[] = []) {
    if (!shopNames || shopNames.length == 0) {
      return {success: false};
    }
    try {
      const subscriptionsArray = await Models.subscriptions.findAll({where: { shopName: shopNames }, logging: false});
      const subscriptions = subscriptionsArray.map((subscription: any) => subscription.dataValues);
      if (subscriptions) {
        return {success: true, subscriptions};
      } else {
        return {success: false};
      }
    } catch (ex) {
      console.log('ERROR! getSubscriptionByShopName threw an exception', ex);
      return {success: false};
    }
  }

  async updateSubscriptionByShopName(shopName: string, updateData: any) {
    if (!shopName) {
      return {success: false, msg: 'no shop name'};
    }
    try {
      await Models.subscriptions.update({...clean(updateData)}, {where: { shopName }, logging: false});
      return {success: true};
    } catch (ex) {
      console.log('ERROR! updateSubscriptionByShopName threw an exception', ex);
      return {success: false};
    }
  }

  async getAllActiveSubscriptions(includeTrialSubs: boolean = false, includeDevSubs: boolean = false) {
    try {
      const subscriptionsData = await Models.subscriptions.findAll({
        where: { inTrial: includeTrialSubs, chargeStatus: 'active', isDev: includeDevSubs },
        logging: false
      });
      const subscriptions = subscriptionsData.map((subscriptionData: any) => subscriptionData.dataValues);
      return { success: true, subscriptions };
    } catch (ex) {
      console.log('ERROR! getAllChargeableSubscriptions threw an exception', ex);
      return { success: false };
    }
  }

  async getAllChargeableSubscriptions() {
    try {
      const subscriptionsData = await Models.subscriptions.findAll({
        where: { inTrial: false, chargeStatus: 'active', isDev: false,
          subscriptionPlanName: {
            [Op.ne]: 'free'
          },
          chargeId: {
            [Op.ne]: 'free'
          } },
        logging: false
      });
      const subscriptions = subscriptionsData.map((subscriptionData: any) => subscriptionData.dataValues);
      return { success: true, subscriptions };
    } catch (ex) {
      console.log('ERROR! getAllChargeableSubscriptions threw an exception', ex);
      return { success: false };
    }
  }

  async getAllSubscriptionsInTrial() {
    try {
      const subscriptionsArray = await Models.subscriptions.findAll({ where: { inTrial: true, chargeStatus: 'active', installationStatus: 'installed'}, logging: false });
      // const subscriptionsArray = await Models.subscriptions.findAll({ where: { inTrial: true, /*chargeStatus: 'active', */ installationStatus: 'installed'}, logging: false });
      const subscriptions = subscriptionsArray.map((subscription: any) => subscription.dataValues);
      if (subscriptions) {
        return {success: true, subscriptions};
      } else {
        return {success: false};
      }
    } catch (ex) {
      console.log('ERROR! getAllSubscriptionsInTrial threw an exception', ex);
      return {success: false};
    }
  }

  async getAllDevSubscriptions() {
    try {
      const subscriptionsArray = await Models.subscriptions.findAll({ where: {isDev: true}, logging: false });
      const subscriptions = subscriptionsArray.map((subscription: any) => subscription.dataValues);
      if (subscriptions) {
        return {success: true, subscriptions};
      } else {
        return {success: false};
      }
    } catch (ex) {
      console.log('ERROR! getAllDevSubscriptions threw an exception', ex);
      return {success: false};
    }
  }

  async countAllDevSubscriptions() {
    try {
      const subscriptionsCount = await Models.subscriptions.count({ where: {isDev: true}, logging: false });
      return {success: true, subscriptionsCount};
    } catch (ex) {
      console.log('ERROR! countAllDevSubscriptions threw an exception', ex);
      return {success: false};
    }
  }

}
