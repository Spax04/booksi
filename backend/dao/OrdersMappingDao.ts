import { ICommissionPlan } from './CommissionPlansDao';
import { clean } from '../common';
const Models = require('../db/models/');

export interface IOrderMapping {
  orderId: string;
  commissionPlan?: ICommissionPlan;
  team?: string;
}
export interface IOrdersMappingRecord {
  shopName: string;
  email: string;
  monthYear: string;
  orders: IOrderMapping[];
  createdAt?: Date;
  updatedAt?: Date;
}
export interface IOrdersMappingInputPayload {
  shopName: string;
  monthYear: string;
  orders: {
    [email: string]: Array<IOrderMapping>;
  };
}
export interface IOrdersMappingReassignPayload {
  shopName: string;
  monthYear: string;
  orderId: string;
  previousEmail: string;
  mapping: {
    email: string;
    commissionPlan: ICommissionPlan
  };
}

export class OrdersMappingDao {

  // tslint:disable-next-line:no-null-keyword
  async getOrdersMappingByShopName(shopName: string) {
    try {
      const ordersMappingArray = await Models.ordersMapping.findAll({where:{shopName}, logging: false});
      const ordersMapping: IOrdersMappingRecord[] = ordersMappingArray.map((orderMapping: any) => orderMapping.dataValues);
      if (ordersMapping) {
        return {success: true, msg: 'getOrdersMappingByShopName OK', ordersMapping};
      } else {
        return {success: false};
      }
    } catch (ex) {
      console.log('ERROR! OrdersMappingDao - getOrdersMappingByShopName threw an exception', {shopName, ex});
      return {success: false};
    }
  }

  async getOrdersMappingByEmailsAndMonthYears(shopName: string, monthYears: string[], emails: string[] = null) {
    try {
      const where = {shopName, monthYear: monthYears, email: emails};
      // tslint:disable-next-line:no-null-keyword
      if (emails == null) {
        delete where.email;
      }
      const ordersMappingArray = await Models.ordersMapping.findAll({where, logging: false});
      const ordersMapping: IOrdersMappingRecord[] = ordersMappingArray.map((orderMapping: any) => orderMapping.dataValues);
      if (ordersMapping) {
        return {success: true, msg: 'getOrdersMappingByEmailsAndMonthYears OK', ordersMapping};
      } else {
        return {success: false};
      }
    } catch (ex) {
      console.log('ERROR! OrdersMappingDao - getOrdersMappingByEmailsAndMonthYears threw an exception', ex);
      return {success: false};
    }
  }

  async upsertOrdersMappingByEmailsAndMonthYear(shopName: string, updateObject: any) {
    try {
      const newMapping = {
        shopName,
        ...clean(updateObject)
      };
      const ordersMappingData = await Models.ordersMapping.upsert(newMapping, {logging: false});
      const ordersMapping = ordersMappingData.dataValues;
      if (ordersMapping) {
        return {success: true, msg: 'upsertOrdersMappingByEmailsAndMonthYear OK', ordersMapping};
      } else {
        return {success: false};
      }
    } catch (ex) {
      console.log('ERROR! OrdersMappingDao - upsertOrdersMappingByEmailsAndMonthYear threw an exception', ex);
      return {success: false};
    }
  }
}
