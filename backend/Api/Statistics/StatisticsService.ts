import { logInspect, toFixedFloat } from '../../common';
import { SubscriptionsDao } from '../../dao/SubscriptionsDao';
const moment = require('moment-timezone');

const Models = require('../../db/models');
interface IDailyStats {
  general: {
    allSubs: number;
    allPersonnel: number;
    // INACTIVE
    inActiveSubs: number;
    inActivePersonnel: number;
    // ACTIVE
    activeSubs: number;
    activePersonnel: number;
    // dev
    devSubs: number;
    devPersonnel: number;
  };
  trials: {
    // NON-TRIAL
    allNonTrialSubs: number;
    allNonTrialPersonnel: number;
    // IN TRIAL
    allTrialSubs: number;
    allTrialPersonnel: number;
    // free
    trialFreeSubs: number;
    trialFreePersonnel: number;
    // lite
    trialLiteSubs: number;
    trialLitePersonnel: number;
    // standard
    trialStandardSubs: number;
    trialStandardPersonnel: number;
    // professional
    trialProfessionalSubs: number;
    trialProfessionalPersonnel: number;
    // enterprise
    trialEnterpriseSubs: number;
    trialEnterprisePersonnel: number;
  };
  subscriptions: {
    // free
    freeSubs: number;
    freePersonnel: number;
    // lite
    liteSubs: number;
    litePersonnel: number;
    // standard
    standardSubs: number;
    standardPersonnel: number;
    // professional
    professionalSubs: number;
    professionalPersonnel: number;
    // enterprise
    enterpriseSubs: number;
    enterprisePersonnel: number;
  };
  monetization: {
    // summary
    monetizedSubs: number;
    monetizedPersonnel: number;
    monetizedTrialSubs: number;
    monetizedTrialPersonnel: number;
  };
}
export class StatisticsService {

  async getDailyStats() {
    try {
      const dailyStats: IDailyStats = {
        general: {
          allSubs: 0,
          allPersonnel: 0,
          // INACTIVE
          inActiveSubs: 0,
          inActivePersonnel: 0,
          // ACTIVE
          activeSubs: 0,
          activePersonnel: 0,
          // dev
          devSubs: 0,
          devPersonnel: 0,
        },
        trials: {
          // NON-TRIAL
          allNonTrialSubs: 0,
          allNonTrialPersonnel: 0,
          // IN TRIAL
          allTrialSubs: 0,
          allTrialPersonnel: 0,
          // free
          trialFreeSubs: 0,
          trialFreePersonnel: 0,
          // lite
          trialLiteSubs: 0,
          trialLitePersonnel: 0,
          // standard
          trialStandardSubs: 0,
          trialStandardPersonnel: 0,
          // professional
          trialProfessionalSubs: 0,
          trialProfessionalPersonnel: 0,
          // enterprise
          trialEnterpriseSubs: 0,
          trialEnterprisePersonnel: 0,
        },
        subscriptions: {
          // free
          freeSubs: 0,
          freePersonnel: 0,
          // lite
          liteSubs: 0,
          litePersonnel: 0,
          // standard
          standardSubs: 0,
          standardPersonnel: 0,
          // professional
          professionalSubs: 0,
          professionalPersonnel: 0,
          // enterprise
          enterpriseSubs: 0,
          enterprisePersonnel: 0,
        },
        monetization: {
          // summary
          monetizedSubs: 0,
          monetizedPersonnel: 0,
          monetizedTrialSubs: 0,
          monetizedTrialPersonnel: 0,
        }
      };
      // 1.Update all charge statuses
      // TODO

      // 2.Count all subscriptions and personnel
      dailyStats.general.allPersonnel = await Models.personnel.count({ where: {}, logging: false });

      let allSubscriptions = await Models.subscriptions.findAll({ where: {}, logging: false });
      allSubscriptions = allSubscriptions.map((subscription: any) => subscription.dataValues);
      dailyStats.general.allSubs = allSubscriptions.length;

      const devSubscriptions = allSubscriptions.filter((subscription: any) => subscription.isDev == true);
      dailyStats.general.devSubs = devSubscriptions.length;
      const devShopNames = devSubscriptions.map((sub: any) => sub.shopName);
      if (devShopNames && devShopNames.length > 0) {
        dailyStats.general.devPersonnel = await Models.personnel.count({where:{shopName: devShopNames}});
      }

      const activeSubscriptions = allSubscriptions.filter((subscription: any) => subscription.isDev == false && subscription.chargeStatus == 'active');
      dailyStats.general.activeSubs = activeSubscriptions.length;
      const activeShopNames = activeSubscriptions.map((sub: any) => sub.shopName);
      if (activeShopNames && activeShopNames.length > 0) {
        dailyStats.general.activePersonnel = await Models.personnel.count({where:{shopName: activeShopNames}});
      }

      const inActiveSubscriptions = allSubscriptions.filter((subscription: any) => subscription.isDev == false && subscription.chargeStatus != 'active');
      dailyStats.general.inActiveSubs = inActiveSubscriptions.length;
      const inActiveShopNames = inActiveSubscriptions.map((sub: any) => sub.shopName);
      if (inActiveShopNames && inActiveShopNames.length > 0) {
        dailyStats.general.inActivePersonnel = await Models.personnel.count({where:{shopName: inActiveShopNames}});
      }

      // in trial
      const trialSubscriptions = activeSubscriptions.filter((subscription: any) => subscription.inTrial == true);
      dailyStats.trials.allTrialSubs = trialSubscriptions.length;
      const trialShopNames = trialSubscriptions.map((sub: any) => sub.shopName);
      if (trialShopNames && trialShopNames.length > 0) {
        dailyStats.trials.allTrialPersonnel = await Models.personnel.count({where:{shopName: trialShopNames}});
      }

      const trialFreeSubscriptions = activeSubscriptions.filter((subscription: any) => subscription.inTrial == true && subscription.subscriptionPlanName == 'free');
      dailyStats.trials.trialFreeSubs = trialFreeSubscriptions.length;
      const trialFreeShopNames = trialFreeSubscriptions.map((sub: any) => sub.shopName);
      if (trialFreeShopNames && trialFreeShopNames.length > 0) {
        dailyStats.trials.trialFreePersonnel = await Models.personnel.count({where:{shopName: trialFreeShopNames}});
      }

      const trialLiteSubscriptions = activeSubscriptions.filter((subscription: any) => subscription.inTrial == true && subscription.subscriptionPlanName == 'lite');
      dailyStats.trials.trialLiteSubs = trialLiteSubscriptions.length;
      const trialLiteShopNames = trialLiteSubscriptions.map((sub: any) => sub.shopName);
      if (trialLiteShopNames && trialLiteShopNames.length > 0) {
        dailyStats.trials.trialLitePersonnel = await Models.personnel.count({where:{shopName: trialLiteShopNames}});
      }

      const trialStandardSubscriptions = activeSubscriptions.filter((subscription: any) => subscription.inTrial == true && subscription.subscriptionPlanName == 'standard');
      dailyStats.trials.trialStandardSubs = trialStandardSubscriptions.length;
      const trialStandardShopNames = trialStandardSubscriptions.map((sub: any) => sub.shopName);
      if (trialStandardShopNames && trialStandardShopNames.length > 0) {
        dailyStats.trials.trialStandardPersonnel = await Models.personnel.count({where:{shopName: trialStandardShopNames}});
      }

      const trialProfessionalSubscriptions = activeSubscriptions.filter((subscription: any) => subscription.inTrial == true && subscription.subscriptionPlanName == 'professional');
      dailyStats.trials.trialProfessionalSubs = trialProfessionalSubscriptions.length;
      const trialProfessionalShopNames = trialProfessionalSubscriptions.map((sub: any) => sub.shopName);
      if (trialProfessionalShopNames && trialProfessionalShopNames.length > 0) {
        dailyStats.trials.trialProfessionalPersonnel = await Models.personnel.count({where:{shopName: trialProfessionalShopNames}});
      }

      const trialEnterpriseSubscriptions = activeSubscriptions.filter((subscription: any) => subscription.inTrial == true && subscription.subscriptionPlanName == 'custom/enterprise');
      dailyStats.trials.trialEnterpriseSubs = trialEnterpriseSubscriptions.length;
      const trialEnterpriseShopNames = trialEnterpriseSubscriptions.map((sub: any) => sub.shopName);
      if (trialEnterpriseShopNames && trialEnterpriseShopNames.length > 0) {
        dailyStats.trials.trialEnterprisePersonnel = await Models.personnel.count({where:{shopName: trialEnterpriseShopNames}});
      }

      // not in trial
      const nonTrialSubscriptions = activeSubscriptions.filter((subscription: any) => subscription.inTrial == false);
      dailyStats.trials.allNonTrialSubs = nonTrialSubscriptions.length;
      const nonTrialShopNames = nonTrialSubscriptions.map((sub: any) => sub.shopName);
      if (nonTrialShopNames && nonTrialShopNames.length > 0) {
        dailyStats.trials.allNonTrialPersonnel = await Models.personnel.count({where:{shopName: nonTrialShopNames}});
      }
      // logInspect(xxx, 'xxx');
      const freeSubscriptions = activeSubscriptions.filter((subscription: any) => subscription.inTrial == false && subscription.subscriptionPlanName == 'free');
      dailyStats.subscriptions.freeSubs = freeSubscriptions.length;
      const freeShopNames = freeSubscriptions.map((sub: any) => sub.shopName);
      if (freeShopNames && freeShopNames.length > 0) {
        dailyStats.subscriptions.freePersonnel = await Models.personnel.count({where:{shopName: freeShopNames}});
      }

      const liteSubscriptions = activeSubscriptions.filter((subscription: any) => subscription.inTrial == false && subscription.subscriptionPlanName == 'lite');
      dailyStats.subscriptions.liteSubs = liteSubscriptions.length;
      const liteShopNames = liteSubscriptions.map((sub: any) => sub.shopName);
      if (liteShopNames && liteShopNames.length > 0) {
        dailyStats.subscriptions.litePersonnel = await Models.personnel.count({where:{shopName: liteShopNames}});
      }

      const standardSubscriptions = activeSubscriptions.filter((subscription: any) => subscription.inTrial == false &&  subscription.subscriptionPlanName == 'standard');
      dailyStats.subscriptions.standardSubs = standardSubscriptions.length;
      const standardShopNames = standardSubscriptions.map((sub: any) => sub.shopName);
      if (standardShopNames && standardShopNames.length > 0) {
        dailyStats.subscriptions.standardPersonnel = await Models.personnel.count({where:{shopName: standardShopNames}});
      }

      const professionalSubscriptions = activeSubscriptions.filter((subscription: any) => subscription.inTrial == false &&  subscription.subscriptionPlanName == 'professional');
      dailyStats.subscriptions.professionalSubs = professionalSubscriptions.length;
      const professionalShopNames = professionalSubscriptions.map((sub: any) => sub.shopName);
      if (professionalShopNames && professionalShopNames.length > 0) {
        dailyStats.subscriptions.professionalPersonnel = await Models.personnel.count({where:{shopName: professionalShopNames}});
      }

      const enterpriseSubscriptions = activeSubscriptions.filter((subscription: any) => subscription.inTrial == false &&  subscription.subscriptionPlanName == 'custom/enterprise');
      dailyStats.subscriptions.enterpriseSubs = enterpriseSubscriptions.length;
      const enterpriseShopNames = enterpriseSubscriptions.map((sub: any) => sub.shopName);
      if (enterpriseShopNames && enterpriseShopNames.length > 0) {
        dailyStats.subscriptions.enterprisePersonnel = await Models.personnel.count({where:{shopName: enterpriseShopNames}});
      }
      // summary
      dailyStats.monetization.monetizedSubs =
        dailyStats.subscriptions.liteSubs +
        dailyStats.subscriptions.standardSubs +
        dailyStats.subscriptions.professionalSubs +
        dailyStats.subscriptions.enterpriseSubs;

      dailyStats.monetization.monetizedPersonnel =
        dailyStats.subscriptions.litePersonnel +
        dailyStats.subscriptions.standardPersonnel +
        dailyStats.subscriptions.professionalPersonnel +
        dailyStats.subscriptions.enterprisePersonnel;

      dailyStats.monetization.monetizedTrialSubs =
        dailyStats.trials.trialLiteSubs +
        dailyStats.trials.trialStandardSubs +
        dailyStats.trials.trialProfessionalSubs +
        dailyStats.trials.trialEnterpriseSubs;

      dailyStats.monetization.monetizedTrialPersonnel =
        dailyStats.trials.trialLitePersonnel +
        dailyStats.trials.trialStandardPersonnel +
        dailyStats.trials.trialProfessionalPersonnel +
        dailyStats.trials.trialEnterprisePersonnel;

      const billingSummary = await this.getBillingSummary();
      return { success: true, msg: 'getDailyStats OK', dailyStats, billingSummary};
    } catch (ex) {
      console.log('ERROR! StatisticsService - getDailyStats threw an exception:', ex);
      return { success: false, msg: 'getDailyStats failed!' };
    }
  }
  async getBillingSummary() {
    try {
      // get current charges summary
      const {success, subscriptions: allSubs} = await new SubscriptionsDao().getAllChargeableSubscriptions();
      const perEmployeeSubscriptions = allSubs.filter((sub: any) => sub.chargePer == 'Employee');
      const perMonthSubscriptions = allSubs.filter((sub: any) => sub.chargePer == 'Month');
      let employeeCount = 0;
      const perEmployeeCharges = [];
      const perMonthCharges = [];

      // logInspect(perEmployeeSubscriptions, 'perEmployeeSubscriptions to charge');
      const shopNames = perEmployeeSubscriptions.map((sub: any) => sub.shopName);
      const personnelCounts = await Models.personnel.count({where:{shopName: shopNames}, group: ['shopName'] });
      for (let i = 0; i < personnelCounts.length; i++) {
        const subscription = perEmployeeSubscriptions.find((subscription: any) => subscription.shopName == personnelCounts[i].shopName);
        const newCharge: any = {};
        newCharge.shopName = subscription.shopName;
        newCharge.mgmPlan = subscription.subscriptionPlanName;
        newCharge.employeeCount = personnelCounts[i].count;
        newCharge.pricePerEmployee = subscription.pricePerEmployee;
        newCharge.billingCap = subscription.billingCap;
        newCharge.teamCap = subscription.teamCap;
        const chargedAmount = personnelCounts[i].count * subscription.pricePerEmployee;
        newCharge.charged = chargedAmount;
        newCharge.exceededCap = chargedAmount > subscription.billingCap;
        newCharge.installedAt = subscription.installedAt;
        const todaysDate = moment();
        const instDate = moment(subscription.installedAt);
        const daysInstalled = Math.abs(instDate.diff(todaysDate, 'days'));
        newCharge.daysInstalled = daysInstalled;
        employeeCount += personnelCounts[i].count;
        perEmployeeCharges.push(newCharge);
      }
      for (let i = 0; i < perMonthSubscriptions.length; i++) {
        const subscription = perMonthSubscriptions[i];
        const newCharge: any = {};
        newCharge.shopName = subscription.shopName;
        newCharge.pricePerMonth = subscription.pricePerMonth;
        newCharge.billingCap = subscription.billingCap;
        newCharge.teamCap = subscription.teamCap;
        const chargedAmount = subscription.pricePerMonth;
        newCharge.charged = chargedAmount;
        newCharge.exceededCap = chargedAmount > subscription.billingCap;
        newCharge.installedAt = subscription.installedAt;
        const todaysDate = moment();
        const instDate = moment(subscription.installedAt);
        const daysInstalled = Math.abs(instDate.diff(todaysDate, 'days'));
        newCharge.daysInstalled = daysInstalled;
        perMonthCharges.push(newCharge);
      }
      // logInspect(perEmployeeCharges, 'perEmployeeCharges');
      // logInspect(perMonthCharges, 'perMonthCharges');
      const perEmployeeSum = perEmployeeCharges.reduce((accumulator: number, object: any) => accumulator + object.charged, 0.0);
      const perMonthSum = perMonthCharges.reduce((accumulator: number, object: any) => accumulator + object.charged, 0.0);
      // console.log('total chargeable subs', allSubs.length);
      // console.log('perEmployee subs', perEmployeeSubscriptions.length);
      // console.log('employee count', employeeCount);
      // console.log('perMonth subs', perMonthSubscriptions.length);
      // console.log('perEmployee Charges:', perEmployeeSum);
      // console.log('perMonth Charges:', perMonthSum);
      // console.log('Total Charges:', perEmployeeSum + perMonthSum);
      const billingSimulationResult = {
        chargeableSubs: allSubs.length,
        chargePerEmployee: perEmployeeSubscriptions.length,
        employeeCount,
        chargePerMonth: perMonthSubscriptions.length,
        perEmployeeSum: toFixedFloat(perEmployeeSum),
        perMonthSum: toFixedFloat(perMonthSum),
        Total: toFixedFloat(perEmployeeSum + perMonthSum),
      };
      return billingSimulationResult;
    } catch (ex) {
      return { success: false, msg: 'getBillingSummary' };
    }
  }
}
