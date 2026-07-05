import { SubscriptionsDao } from '../dao/SubscriptionsDao';
import { logInspect } from '../common';
import { DorAPI } from '../ExternalAPI/DorApi/DorAPI';
//import { BillingService } from '../Api/Billing/BillingService';
const moment = require('moment-timezone');
const Models = require('../db/models');

export class DevService {


  async getBillingSummary() {
    // get current charges summary
    const {success, subscriptions} = await new SubscriptionsDao().getAllChargeableSubscriptions();
    // logInspect(subscriptions, 'subscriptions to charge');
    const shopNames = subscriptions.map((sub: any) => sub.shopName);
    const personnelCounts = await Models.personnel.count({where:{shopName: shopNames}, group: ['shopName'] });
    for (let i = 0; i < personnelCounts.length; i++) {
      const subscription = subscriptions.find((subscription: any) => subscription.shopName == personnelCounts[i].shopName);
      if (subscription.shopName == 'igold-inc.myshopify.com') {
        personnelCounts[i].count += 10;
      }
      personnelCounts[i].mgmPlan = subscription.subscriptionPlanName;
      personnelCounts[i].pricePerEmployee = subscription.pricePerEmployee;
      personnelCounts[i].billingCap = subscription.billingCap;
      const chargedAmount = personnelCounts[i].count * subscription.pricePerEmployee;
      personnelCounts[i].charged = chargedAmount;
      personnelCounts[i].exceededCap = chargedAmount > subscription.billingCap;
      personnelCounts[i].installedAt = subscription.installedAt;
      const todaysDate = moment();
      const instDate = moment(subscription.installedAt);
      // console.log('todaysDate', todaysDate);
      // console.log('instDate', instDate);
      const daysInstalled = Math.abs(instDate.diff(todaysDate, 'days'));
      // console.log('diff', daysLeftInMonth);
      personnelCounts[i].daysInstalled = daysInstalled;
    }
    logInspect(personnelCounts, 'personnelCounts');
    const sum = personnelCounts.reduce((accumulator: number, object: any) => accumulator + object.charged, 0.0);
    console.log('subscriptions', subscriptions.length);
    console.log('Total Charges:', sum);
  }

  // async monthlyBillingTestRun() {
  //   const { success: chargeAllShopsSuccess, billingResultsCSVString, msg } = await new BillingService().chargeALLActiveShopsForUpcomingMonth(false);
  //   logInspect(billingResultsCSVString, 'billing csv');
  // }

  async getLinkToReapprovePermissions(shop: string) {
    // create url to re approve permissions and go back to front
      const approvePermissionsPageUrl =
        'https://' + shop +
        '/admin/oauth/authorize' +
        '?client_id=' + process.env.SHOPIFY_API_KEY +
        '&scope=' + process.env.APP_PERMISSION_SCOPES +
        '&state=' + encodeURIComponent('state') +
        '&redirect_uri=' + process.env.FRONTEND_BASE_DOMAIN;
      console.log('approvePermissionsPageUrl', approvePermissionsPageUrl);
      return approvePermissionsPageUrl;
  }

  // async monthlyBillingPerEmployeeTestRun() {
  //   await new BillingService().monthlyChargeAllChargeableShopsPerEmployee(true);
  // }

  async forceMigrateAllPermissionsToCurrentModelByPermissionLevel() {

  }
}
