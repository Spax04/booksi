import { clean } from '../common';
import { IUserContact } from '../Types/common';

const Models = require('../db/models/');

export interface ICommissionPlan {
  id: number;
  shopName: string;
  uuid: string; // universal unique identifier
  name: string; // plan name
  description: string; // plan description
  type: string; // 'Fixed'/'Steps'
  fixedCommission: { // { fixedType: 'flat' | 'percent', fixedAmount: float <if percent float is 0.1 - 100> }
    fixedType: string;
    fixedAmount: number;
  };
  commissionSteps: Array<{index: number, from: number, to: number, amount?: number, isPercentage?: boolean, percent?: number}>; // [{index: integer, from: integer, to: integer, amount?: float, percent?: float}] // 5 steps max
  bonusBase: string; // 'Locations' | 'Personal'
  bonusLocations: Array<{name: string, id: string}>;
  bonuses: Array<{name: string, from: number, fixedType: string, fixedAmount: number}>; // [{name: string, from: integer, fixedType: 'flat' | 'percent', fixedAmount: float <if percent float is 0.1 - 100>}] // 3 bonuses max
  productCategories: string[]; // string[]
  creator: IUserContact; // name, email, avatarFile?, locale
  createdAt: string;
  updatedAt: string;
  updatedBy: IUserContact; // name, email, avatarFile?, locale
}

export interface IBulkAssignPlanData {
  shopName: string;
  assignData: Array<{commissionPlan: ICommissionPlan, memberEmails: string[]}>; // [{index: integer, from: integer, amount: float}] // 5 steps max
}

export class CommissionPlansDao {

  async getAllCommissionPlansByShopName(shopName: string) {
    try {
      const commissionPlansArray = await Models.commissionPlans.findAll({ where: { shopName }, logging: false });
      const commissionPlans: ICommissionPlan[] = commissionPlansArray.map((commissionPlan: any) => commissionPlan.dataValues);
      return { success: true, commissionPlans };
    } catch (ex) {
      console.log('ERROR! CommissionPlansDao - getAllCommissionPlans threw an exception:', ex);
      return { success: false };
    }
  }

  async getCommissionPlanByShopNameAndId(shopName: string, id: number) {
    try {
      const commissionPlan: ICommissionPlan = await Models.commissionPlans.findOne({where:{shopName, id}, logging: false});
      if (commissionPlan) {
        return {success: true, commissionPlan};
      } else {
        return {success: false};
      }
    } catch (ex) {
      console.log('ERROR! CommissionPlansDao - getCommissionPlansByShopNameAndId threw an exception:', ex);
      return { success: false };
    }
  }

  async updateCommissionPlanByShopNameAndId(shopName: string, planId: string, updateData: any) {
    try {
      await Models.commissionPlans.update({...clean(updateData)}, { where: { shopName, id: planId }, logging: false });
      return { success: true, msg: 'Successfully updated commission plan' };
    } catch (ex) {
      console.log('ERROR! CommissionPlansDao - updateCommissionPlanById threw an exception:', ex);
      return { success: false };
    }
  }

}
