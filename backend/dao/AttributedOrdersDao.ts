import { getDateRangeMomentOrCurrentMonth, safeParseFloat } from '../common';
const { Op } = require('@sequelize/core');
import { toLower } from 'lodash';
import { IOrderData } from '../ExternalAPI/ShopifyApi/NewShopifyAPI';
import { ICommissionPlan } from './CommissionPlansDao';
import { CommissionsService } from '../Api/Commissions/CommissionsService';

const Models = require('../db/models/');
const moment = require('moment-timezone');

export interface IAttributedOrder {
  shopName: string;
  email: string;
  orderId: string;
  locationId: string;
  userId: string;
  timezone: string;
  team: string;
  createdAt: string;
  processedAt: string;
  orderData: IOrderData;
  productsTotal: number;
  subTotal: number;
  shopifyUser: any;
  orderStatusUrl: string;
  commissionPlanName: string;
  commissionPlan: any;
  commissionData: any;
  commission: number;
}

export class AttributedOrdersDao {

  async reAssignOrder(shopName: string, orderId: string, email: string, employee: any) {
    try {
      const attributedOrder: IAttributedOrder = await Models.attributedOrders.findOne({
        shopName,
        orderId
      }, {logging: false});
      if (attributedOrder) {
        let commissionPlan: ICommissionPlan;
        let commissionPlanName =  '';
        let commission = 0.0;
        let commissionData = {};
        if (employee.commissionPlan) {
          commissionPlan = employee.commissionPlan;
          commissionPlanName = commissionPlan.name || '';
          const {totalCommission, commissionData: calculationData} = new CommissionsService().calculateOrderCommissionByPlan(attributedOrder.subTotal, commissionPlan);
          commission = totalCommission;
          commissionData = calculationData;
        }
        await Models.attributedOrders.update({email, commissionPlan, shopifyId: employee.shopifyId, team: employee.team, commissionPlanName, commission, commissionData}, {where:{shopName, orderId}});
        return {success: true, msg: 'reAssignOrder OK'};
      } else {
        return {success: false, msg: 'order not found'};
      }
    } catch (ex) {
      console.log('ERROR! AttributedOrdersDao - reAssignOrder threw an exception', ex);
      return {success: false, msg: 'exception'};
    }
  }

  async createAttributedOrder(shopName: string, email: string, orderId: string, locationId: string, timezone: string, orderData: IOrderData, userId: string, commissionPlan: ICommissionPlan, commissionPlanName: string, commission: number, commissionData: any, team: string = '') {
    try {
      const attributedOrder = await Models.attributedOrders.create({
        shopName,
        email,
        orderId,
        locationId,
        timezone,
        team,
        createdAt: moment().tz(timezone),
        processedAt: moment(orderData.processedAt),
        orderData,
        productsTotal: orderData.productsTotal,
        subTotal: orderData.subTotal,
        userId,
        orderStatusUrl: orderData.orderStatusUrl,
        commissionPlan,
        commissionPlanName,
        commission,
        commissionData
      }, {logging: false});
      if (attributedOrder) {
        return {success: true, attributedOrder};
      } else {
        return {success: false, msg: 'createAttributedOrder failed!'};
      }
    } catch (ex) {
      if (ex.name == 'SequelizeUniqueConstraintError') {
        // const msg = ex.errors.map((err: any) => err.message).join();
        return { success: true, msg: 'already created!' };
      } else {
        console.log('ERROR! AttributedOrdersDao - createAttributedOrder threw an exception', ex);
        return { success: false, msg: 'createAttributedOrder failed!' };
      }
    }
  }

  async getOrdersInDateRangeByEmailsAndShop(shopName: string, fromDate: string, toDate: string, timezone: string, emails: string[], attributes: string[] = undefined) {
    // console.log('dates received:', { fromDate, toDate });
    const { getFromDate, getToDate, isDefault } = getDateRangeMomentOrCurrentMonth(fromDate, toDate, timezone);
    // console.log('dates parsed:', { getFromDate, getToDate, isDefault });
    try {
      const query = {
        where: {
          shopName,
          processedAt: {
            [Op.between]: [getFromDate, getToDate]
          },
          email: emails
        },
        attributes
      };
      if (emails.length == 1 && toLower(emails[0]) == 'all') {
        delete query.where.email;
      }
      if (!attributes || attributes.length == 0) {
         delete query.attributes;
      }
      const ordersArray = await Models.attributedOrders.findAll({
        ...query,
        logging: false
      });
      const orders = ordersArray.map((order: any) => order.dataValues);
      return { success: true, msg: 'get orders OK' + isDefault ? ', defaulted to current month' : '', orders };
    } catch (ex) {
      console.log('ERROR! getOrdersInDateRangeByEmailAndShop threw an exception:', ex);
      return {success: false, msg: 'get orders failed!'};
    }
  }

  async getOrdersInDateRangeByShop(shopName: string, fromDate: string, toDate: string, timezone: string, attributes: string[] = undefined): Promise<{ success: boolean, msg: string, orders?: IAttributedOrder[] }>  {
    const { getFromDate, getToDate, isDefault } = getDateRangeMomentOrCurrentMonth(fromDate, toDate, timezone);
    try {
      const query = {
        where: {
          shopName,
          processedAt: {
            [Op.between]: [getFromDate, getToDate]
          }
        },
        attributes
      };
      if (!attributes || attributes.length == 0) {
         delete query.attributes;
      }
      const ordersArray = await Models.attributedOrders.findAll({
        ...query,
        logging: false
      });
      const orders = ordersArray.map((order: any) => order.dataValues);
      return { success: true, msg: 'get orders OK' + isDefault ? ', defaulted to current month' : '', orders };
    } catch (ex) {
      console.log('ERROR! getOrdersInDateRangeByShop threw an exception:', ex);
      return {success: false, msg: 'get orders failed!'};
    }
  }

  async sumTotalsForTimeSheets(orders: IOrderData[]) {
    const totals = { fulfilled: 0, products: 0, sales: 0 };
    // if (!orders || orders.length <= 0) {
    //   return totals;
    // }
    totals.fulfilled = orders.length;
    for (let i = 0; i < orders.length; i++) {
      totals.products += orders[i].productsTotal;
      totals.sales += safeParseFloat(orders[i].subTotal);
    }
    return totals;
  }

  async getAttributedOrdersByShopNameAndOrderIds( shopName: string, orderIds: string[]) {
    try {
      const attributedOrdersArray = await Models.attributedOrders.findAll({where:{shopName, orderId: orderIds}, logging: false});
      const attributedOrders = attributedOrdersArray.map((attributedOrder: any) => attributedOrder.dataValues);
      if (attributedOrders) {
        return {success: true, attributedOrders};
      } else {
        return {success: false};
      }
    } catch (ex) {
      console.log('ERROR! getAttributedOrdersByShopNameAndOrderIds threw an exception', ex);
      return {success: false};
    }
  }

  async updateOrderCommissionByShopNameAndOrderId(shopName: string, orderId: string, commissionPlan: ICommissionPlan, commissionPlanName: string, commissionData: any, commission: number) {
    try {
      await Models.attributedOrders.update({commissionPlan, commissionPlanName, commissionData, commission}, {where: {shopName, orderId}});
      return {success: true};
    } catch (ex) {
      console.log('ERROR! PersonnelStatusDao - updatePersonnelStatusByShopAndEmail threw an exception', ex);
      return {success: false};
    }
  }

  async getUnCommissionedOrdersCountByShopName(shopName: string) {
    try {
      const unCommissionedOrdersCount = await Models.attributedOrders.count({ where: {
        shopName,
        commissionPlanName: {
          // tslint:disable-next-line:no-null-keyword
          [Op.or]: ['', null]
        }
        }, logging: false });
      if (unCommissionedOrdersCount != undefined) {
        return {success: true, msg: 'count uncommissioned orders OK', unCommissionedOrders: unCommissionedOrdersCount};
      } else {
        return {success: false, msg: 'count uncommissioned orders failed!'};
      }
    } catch (ex) {
      console.log('ERROR! getUnCommissionedOrdersCountByShopName threw an exception', ex);
      return {success: false, msg: 'getUnCommissionedOrdersCountByShopName failed!' };
    }
  }

}
