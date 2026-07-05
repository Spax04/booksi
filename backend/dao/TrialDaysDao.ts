const Models = require('../db/models/');


export class TrialDaysDao {

  async getAllShopsTrialDaysForShopNames(shopsNames: string[]) {
    try {
      const shopsTrialDaysArray = await Models.trialDays.findAll({
        where: {
          shopName: shopsNames
        },
        logging: false
      });
      const shopsTrialDays = shopsTrialDaysArray.map((shopTrialDays: any) => shopTrialDays.dataValues);
      if (shopsTrialDays) {
        return { success: true, shopsTrialDays };
      } else {
        return {success: false};
      }
    } catch (ex) {
      console.log('ERROR! getAllShopsTrialDaysForShopNames threw an exception:', ex);
      return {success: false};
    }
  }

  async getTrialDaysByShopName(shopName: string) {
    try {
      const trialDays = await Models.trialDays.findOne({ where: { shopName }, logging: false });
      if (trialDays) {
        return { success: true, trialDays };
      } else {
        return {success: false};
      }
    } catch (ex) {
      console.log('ERROR! getTrialDaysByShopName threw an exception:', ex);
      return {success: false};
    }
  }

  async updateTrialDaysLeftByShopName(shopName: string, trialDaysLeft: number) {
    try {
      await Models.trialDays.update({trialDaysLeft}, {where: { shopName }, logging: false});
      return {success: true};
    } catch (ex) {
      console.log('ERROR! updateTrialDaysByShopName threw an exception', ex);
      return {success: false};
    }
  }
}
