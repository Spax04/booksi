const Models = require('../db/models/');

export interface IBillingData {
  shopName: string;
  monthYear: string;
  amount: number;
  chargePer: string;
  chargedPersonnelCount: number;
  chargeData: any;
  chargeResult: {
    msg?: string;
    chargeResultData?: any;
  };
  success: boolean;
  createdAt: Date;
}

export class BillingDao {

  async getAllBillingDataByShopName(shopName: string) {
    try {
      const billingDataArray = await Models.billing.findAll({ where: { shopName }, logging: false });
      const billingData: IBillingData[] = billingDataArray.map((accessToken: any) => accessToken.dataValues);
      return {success: true, billingData};
    } catch (ex) {
      console.log('ERROR! BillingDao - getAllBillingDataByShopName threw an exception', ex);
      return {success: false};
    }
  }

  async getBillingDataByShopNameAndMonthYear(shopName: string, monthYear: string) {
    try {
      const billingDataArray = await Models.billing.findAll({ where: { shopName, monthYear }, logging: false });
      const billingData: IBillingData = billingDataArray.map((accessToken: any) => accessToken.dataValues);
      return {success: true, billingData};
    } catch (ex) {
      console.log('ERROR! BillingDao - getBillingDataByShopNameAndMonthYear threw an exception', ex);
      return {success: false};
    }
  }

  async getAllBillingDataByShopNames(shopNames: string[]) {
    try {
      const billingDataArray = await Models.billing.findAll({ where: { shopName: shopNames}, logging: false });
      const billingData: IBillingData[] = billingDataArray.map((accessToken: any) => accessToken.dataValues);
      return {success: true, billingData};
    } catch (ex) {
      console.log('ERROR! BillingDao - getAllBillingDataByShopNames threw an exception', ex);
      return {success: false};
    }
  }

  async getAllBillingDataByMonthYears(monthYears: string[]) {
    try {
      const billingDataArray = await Models.billing.findAll({ where: { monthYear: monthYears}, logging: false });
      const billingData: IBillingData[] = billingDataArray.map((accessToken: any) => accessToken.dataValues);
      return {success: true, billingData};
    } catch (ex) {
      console.log('ERROR! BillingDao - getAllBillingDataByMonthYears threw an exception', ex);
      return {success: false};
    }
  }

}

