import {
  defaultInstallationShopDepartments,
  defaultInstallationShopPositions,
  installation_defaultCurrentPersonnelStatus,
  installation_defaultShopData, installation_defaultSubscriptionData
} from '../../common/defaults';
const { Op } = require('@sequelize/core');
import { hashString, logInspect, safeParseInt } from '../../common';
import { ShopifyAPI } from '../../ExternalAPI/ShopifyApi/ShopifyAPI';
import { UserDao } from '../../dao/UserDao';
import { PersonnelDao } from '../../dao/PersonnelDao';
import { SubscriptionsDao } from '../../dao/SubscriptionsDao';
import { toLower } from 'lodash';
import { MailingService } from '../Mailing/MailingService';
import { PreferencesDao } from '../../dao/PreferencesDao';
import {
  baseApplicationCharge, mgmCustomLicenseCharge,
  mgmFreeLicenseCharge,
  mgmLiteLicenseCharge,
  mgmStandardLicenseCharge
} from '../../common/subscriptionPlans';
import { NewShopifyAPI } from '../../ExternalAPI/ShopifyApi/NewShopifyAPI';
import { DiscordService } from '../Discord/DiscordService';
import { StorageService } from '../Storage/StorageService';
const Models = require('../../db/models');
const moment = require('moment-timezone');

const appChargeRedirectUrl = process.env.BACKEND_BASE_URL + '/installation/usageChargeApproved';
const appChargeUpdateRedirectUrl = process.env.BACKEND_BASE_URL + '/installation/updatedUsageChargeApproved';
const pricingPlansRedirectUrl = process.env.FRONTEND_BASE_DOMAIN + '/onboarding/pricing';
const uninstallsChannel = process.env.DISCORD_CHANNEL_UNINSTALLS_P;
const subscriptionsChannel = process.env.DISCORD_CHANNEL_NEW_SUBSCRIPTIONS_P;

export class InstallationService {
  async createNewShop(shopName: string, ownerName: string, ownerEmail: string, shopifyData: any, locationsData: any) {
    try {
      const preExistingShop = await Models.shops.findOne({ where: { shopName }, logging: false });
      // create shop
      if (!preExistingShop) {
        console.log('install - creating new shop');
        const newShop = await Models.shops.create({
          ...installation_defaultShopData,
          shopName,
          ownerName,
          ownerEmail,
          shopifyData,
          locationsData
        }, { logging: false });
        if (newShop) {
          return ({ success: true, msg: 'createNewShop ok' });
        } else {
          return ({ success: false, msg: 'createNewShop failed' });
        }
      } else {
        console.log('WARNING! install - shop already exist, updating', { shopName });
        await Models.shops.update({
          ...installation_defaultShopData,
          shopName,
          ownerName,
          ownerEmail,
          shopifyData,
          locationsData
        }, { where: { shopName }, logging: false });
        return ({
          success: true,
          msg: 'createNewShopUninstallWebhook - updated to defaults'
        });
      }
    } catch (ex) {
      console.log('ERROR! createNewShop threw an exception', ex);
      return ({ success: false, msg: 'createNewShop failed' });
    }
  }

  async createNewShopTrialDays(shopName: string) {
    try {
      const preExistingTrialDays = await Models.trialDays.findOne({ where: { shopName }, logging: false });
      // create site trial days
      if (!preExistingTrialDays) {
        console.log('install - creating new shop trial days');
        let trialDays = safeParseInt(process.env.APP_TRIAL_DAYS);
        const trialEnds = moment().add(trialDays, 'days');
        if (trialEnds.day() == 1) { // if trial ends on the 1st of a month - we give an extra day to avoid no/double billing after the trial
          trialDays++;
        }
        await Models.trialDays.create({ shopName, trialDays }, { logging: false });
        return ({ success: true, msg: 'createNewShopTrialDays ok', trialDays });
      } else {
        const trialDays = safeParseInt(preExistingTrialDays.trialDays);
        const trialEnds = moment().add(trialDays, 'days');
        console.log('install - existing shop trial days, amount:', { trialDays, trialEnds });
        return ({ success: true, msg: 'createNewShopTrialDays - already exists', trialDays });
      }
    } catch (ex) {
      console.log('ERROR! createNewShopTrialDays threw an exception', ex);
      return ({ success: false, msg: 'createNewShopTrialDays failed', trialDays: -1 });
    }
  }

  async createNewPositions(shopName: string) {
    try {
      const preExistingPositions = await Models.positions.findOne({ where: { shopName }, logging: false });
      // create site positions
      if (!preExistingPositions) {
        console.log('install - creating new shop positions');
        await Models.positions.create({ shopName, ...defaultInstallationShopPositions }, { logging: false });
        return ({ success: true, msg: 'createNewPositions ok' });
      } else {
        console.log('WARNING! install - shop positions already exist, updating to defaults', shopName);
        await Models.positions.update({ ...defaultInstallationShopPositions }, { where: { shopName }, logging: false });
        return ({ success: true, msg: 'createNewPositions - updated to defaults' });
      }
    } catch (ex) {
      console.log('ERROR! createNewPositions threw an exception', ex);
      return ({ success: false, msg: 'createNewPositions failed' });
    }
  }

  async createNewDepartments(shopName: string) {
    try {
      const preExistingDepartments = await Models.departments.findOne({ where: { shopName }, logging: false });
      // create site departments
      if (!preExistingDepartments) {
        console.log('install - creating new shop departments');
        await Models.departments.create({ shopName, ...defaultInstallationShopDepartments }, { logging: false });
        return ({ success: true, msg: 'createNewDepartments ok' });
      } else {
        console.log('WARNING! install - shop departments already exist, updating to defaults', shopName);
        await Models.departments.update({ ...defaultInstallationShopDepartments }, {
          where: { shopName },
          logging: false
        });
        return ({ success: true, msg: 'createNewDepartments - updated to defaults' });
      }
    } catch (ex) {
      console.log('ERROR! createNewDepartments threw an exception', ex);
      return ({ success: false, msg: 'createNewDepartments failed' });
    }
  }

  async createNewSettings(shopName: string) {
    try {
      return await new PreferencesDao().createNewDefaultSettings(shopName);
    } catch (ex) {
      console.log('ERROR! createNewSettings threw an exception', ex);
      return ({ success: false, msg: 'createNewSettings failed' });
    }
  }

  async createNewLastLogin(shopName: string) {
    try {
      const preExistingShopLastLogin = await Models.lastLogin.findOne({ where: { shopName }, logging: false });
      // create shop lastLogin
      if (!preExistingShopLastLogin) {
        console.log('install - creating new shop positions');
        const newLastLogin = {
          shopName,
          lastLoginDate: moment(),
          lastLoginEmail: 'system',
          lastLoginName: 'system'
        };
        await Models.lastLogin.create(newLastLogin, { logging: false });
        return ({ success: true, msg: 'createNewLastLogin ok' });
      } else {
        console.log('WARNING! install - shop lastLogin already exists, updating to defaults', shopName);
        await Models.lastLogin.update({
          lastLoginDate: moment(),
          lastLoginEmail: 'system',
          lastLoginName: 'system'
        }, { where: { shopName }, logging: false });
        return ({ success: true, msg: 'createNewLastLogin - updated to defaults' });
      }
    } catch (ex) {
      console.log('ERROR! createNewLastLogin threw an exception', ex);
      return ({ success: false, msg: 'createNewLastLogin failed' });
    }
  }

  async createNewPersonnelStatus(personnelName: string, personnelEmail: string, shopName: string) {
    try {
      const preExistingPersonnelStatus = await Models.personnelStatus.findOne({
        where: {
          shopName,
          email: { [Op.iLike]: personnelEmail }
        }, logging: false
      });
      // create currentPersonnelStatus
      if (!preExistingPersonnelStatus) {
        console.log('install - creating new personnelStatus');
        await Models.personnelStatus.create({
          shopName,
          email: personnelEmail,
          name: personnelName,
          status: installation_defaultCurrentPersonnelStatus
        }, { logging: false });
        return ({ success: true, msg: 'personnelStatus ok' });
      } else {
        console.log('WARNING! install - personnelStatus already exist, updating to defaults', {
          shopName,
          personnelEmail
        });
        await Models.personnelStatus.update({ status: installation_defaultCurrentPersonnelStatus }, {
          where: {
            shopName,
            email: { [Op.iLike]: personnelEmail }
          }, logging: false
        });
        return ({ success: true, msg: 'personnelStatus - updated to defaults' });
      }
    } catch (ex) {
      console.log('ERROR! personnelStatus threw an exception', ex);
      return ({ success: false, msg: 'personnelStatus failed' });
    }
  }

  async createNewShopUninstallWebhook(shopName: string, webhookId: string, subToken: string) {
    try {
      // console.log('ERROR! - createNewShopUninstallWebhook - received', { shopName, webhookId, subToken });
      const preExistingShopUninstallWebhook = await Models.uninstallWebhooks.findOne({
        where: { shopName },
        logging: false
      });
      if (!preExistingShopUninstallWebhook) {
        console.log('install - creating new shop UninstallWebhook');
        await Models.uninstallWebhooks.create({
          shopName,
          webhookId,
          subToken
        }, { logging: false }, { logging: false });
        return ({ success: true, msg: 'createNewShopUninstallWebhook ok' });
      } else {
        console.log('WARNING! install - shop UninstallWebhook already exist, updating', { shopName });
        await Models.uninstallWebhooks.update({ webhookId, subToken }, { where: { shopName }, logging: false });
        return ({ success: true, msg: 'createNewShopUninstallWebhook - updated to defaults' });
      }
    } catch (ex) {
      console.log('ERROR! createNewShopUninstallWebhook threw an exception', ex);
      return ({ success: false, msg: 'createNewShopUninstallWebhook failed' });
    }
  }

  async createNewShopAccessTokens(shopName: string, code: string, token: string) {
    try {
      const preExistingShopTokens = await Models.accessTokens.findOne({ where: { shopName }, logging: false });
      const createdAt = moment(); // now
      // create site departments
      if (!preExistingShopTokens) {
        console.log('install - creating new shop access tokens record');
        await Models.accessTokens.create({
          code,
          token,
          shopName,
          createdAt
        }, { logging: false });
        return ({ success: true, msg: 'createNewShopAccessTokens ok' });
      } else {
        console.log('WARNING! install - shop access tokens already exist, updating', shopName);
        await Models.accessTokens.update({
          code,
          token,
          shopName,
          createdAt
        }, { where: { shopName } }, { logging: false });
        return ({ success: true, msg: 'createNewShopAccessTokens - updated to defaults' });
      }
    } catch (ex) {
      console.log('ERROR! createNewShopAccessTokens threw an exception', ex);
      return ({ success: false, msg: 'createNewShopAccessTokens failed' });
    }
  }

  async createNewShopSubscription(shopName: string, chargeId: string, planName: string, planDisplayName: string, subscriptionPlanName: string) { // TODO WIP
    try {
      const preExistingSubscription = await Models.subscriptions.findOne({ where: { shopName }, logging: false });
      // create site subscriptions
      let isDev = false;
      if (process.env.NODE_ENV == 'development' || process.env.NODE_ENV == 'staging') {
        isDev = true;
      }
      if (process.env.NODE_ENV == 'production') {
        if (planName == 'partner_test' || planName == 'affiliate') {
          isDev = true;
        }
        if (planDisplayName == 'Developer Preview' || planDisplayName == 'Development') {
          isDev = true;
        }
      }
      const now = moment();
      const {pricePerEmployee, capped_amount: billingCap, team_cap: teamCap} = this.getChargeByPlanName(subscriptionPlanName);
      if (!preExistingSubscription) {
        console.log('install - creating new shop subscription');
        await Models.subscriptions.create({
          ...installation_defaultSubscriptionData,
          shopName,
          chargeId,
          installedAt: now,
          planName,
          planDisplayName,
          isDev,
          subscriptionPlanName,
          billingCap,
          teamCap,
          pricePerEmployee,
          installationStatus: 'onboarding'
        }, { logging: false });
        return ({ success: true, msg: 'createNewSubscription ok' });
      } else {
        console.log('WARNING! install - site subscription already exists:', preExistingSubscription, 'updating to trial', shopName);
        const license = preExistingSubscription.license;
        license.managemate = true;
        await Models.subscriptions.update({
          installationStatus: preExistingSubscription.installationStatus,
          subscribed: true,
          chargeStatus: 'active',
          inTrial: preExistingSubscription.inTrial,
          nextRefund: preExistingSubscription.nextRefund || 0.0,
          chargePer: 'Employee',
          unInstalled: false,
          chargeId,
          installedAt: now,
          planName,
          planDisplayName,
          license,
          isDev,
          subscriptionPlanName,
          billingCap,
          teamCap,
          pricePerEmployee
        }, { where: { shopName }, logging: false });
        return ({ success: true, msg: 'createNewSubscription - updated to defaults' });
      }
    } catch (ex) {
      console.log('ERROR! createNewSubscription threw an exception', ex);
      return ({ success: false, msg: 'createNewSubscription failed' });
    }
  }

  async createAppCharge(shopName: string, chargeData: string) {
    try {
      const api = new NewShopifyAPI();
      await api.initWithShopName(shopName);
      const { success, recurringAppCharge } = await api.createRecurringCharge(chargeData);
      return { success: true, usageChargeData: recurringAppCharge.recurring_application_charge };
    } catch (ex) {
      console.log('ERROR! - createAppCharge threw an exception!', ex);
      return { success: false, msg: 'createAppCharge - createAppCharge failed' };
    }
  }

  async permissionsApproved(shopName: string, code: string) {
    try {
      // create permanent access token
      const {
        success: getAccessTokenSuccess,
        accessTokenResult
      } = await new NewShopifyAPI().getPermanentAccessTokenForShop(shopName, code);
      if (!getAccessTokenSuccess) {
        return { success: false, msg: 'permissionsApproved - getPermanentAccessTokenForShop failed' };
      }
      console.log('permissionsApproved - getPermanentAccessTokenForShop', accessTokenResult);
      const accessToken = accessTokenResult.access_token;
      const accessScope = accessTokenResult.scope;
      const requestedScopes = process.env.APP_PERMISSION_SCOPES;
      console.log('permissionsApproved - shop granted permissions for scopes', {requested: requestedScopes, received: accessScope, matching: accessScope == requestedScopes});
      // create AccessTokens
      const { success: createAccessTokensSuccess } = await this.createNewShopAccessTokens(shopName, code, accessToken);
      if (!createAccessTokensSuccess) {
        console.log('ERROR! - permissionsApproved - createNewShopAccessTokens failed', shopName);
        return { success: false, msg: 'permissionsApproved - createNewShopAccessTokens failed' };
      }
      // support pricing plans
      // const {success: selectPlanSuccess, msg, redirectUrl} = await this.planSelected(shopName, 'standard');
      // console.log('permissionsApproved - planSelected - {success, msg, redirectUrl}', {msg, redirectUrl});
      // if (!selectPlanSuccess) {
      //   console.log('ERROR! - permissionsApproved - selectPlanSuccess failed', { shopName, msg });
      //   return { success: false, msg: 'permissionsApproved - createNewShopAccessTokens failed' };
      // }
      // return {success: true, msg, redirectUrl};
      // // redirect to select pricing plan page in our front
      const redirectUrl = pricingPlansRedirectUrl + '?shopName=' + shopName;
      return {success: true, msg: 'permissionsApproved OK', redirectUrl};
    } catch (ex) {
      console.log('ERROR! - permissionsApproved threw an exception!', ex);
      return { success: false, msg: 'permissionsApproved failed' };
    }
  }

  async planSelected(shopName: string, planName: string = 'standard', isPlanChange: boolean = false) {
    try {
      // get relevant charge data
      const chargeData: any = this.getChargeDataByLicensePlan(shopName, planName, true, isPlanChange);
      console.log('InstallationService - selected plan:', {planName, chargeData});
      if (isPlanChange) {
        const {success: getSubscriptionSuccess, subscription} = await new SubscriptionsDao().getSubscriptionByShopName(shopName);
        if (!getSubscriptionSuccess) {
          console.log('ERROR! InstallationService - planSelected - upgrade - getSubscriptionByShopName failed', {shopName, planName});
          return { success: false, msg: 'subscription not found' };
        }
        if (subscription.subscriptionPlanName == planName) {
          console.log('WARNING! InstallationService - planSelected - plan already set, nothing to upgrade', {shopName, planName});
          return { success: true, msg: 'plan already set, nothing to upgrade' };
        }
        if (subscription.subscriptionPlanName != 'free' && planName == 'free') {
          // TODO redo this logic and return error if employee count is higher than the teamCap
          const teamCap = subscription.team;
          const {success: getPersonnelCountSuccess, personnelCount} = await new PersonnelDao().getPersonnelCountByShopName(shopName);
          const newTeamCap = chargeData.recurring_application_charge ? chargeData.recurring_application_charge.team_cap : 100;
          if (personnelCount > newTeamCap) {
            console.log('WARNING! InstallationService - planSelected - employee count exceeds new plan team cap', {shopName, newPlan: planName, newCap: newTeamCap, oldPlan: subscription.subscriptionPlanName, oldCap: subscription.teamCap, personnelCount});
            return { success: false, status: 406, msg: 'employee count exceeds new plan team cap' };
          }
        }
      }
      if (planName == 'free' && !isPlanChange) { // if new free installation
        const {success: setupShopSuccess, msg: setupShopMsg, redirectURL} = await this.setupNewShopData(shopName, 'free', 'free');
        if (!setupShopSuccess) {
          console.log('ERROR! InstallationService - planSelected - setupNewShopData failed', {shopName, planName});
          return {success: false, msg: 'setup shop failed'};
        }
        return {success: true, msg: 'free plan selected OK', redirectUrl: redirectURL};
      }
      // create app charge
      const {
        success: createUsageChargeSuccess,
        usageChargeData
      }: any = await this.createAppCharge(shopName, chargeData); // check
      if (!createUsageChargeSuccess) {
        console.log('ERROR! InstallationService - planSelected - createAppCharge failed', shopName);
        return { success: false, msg: 'planSelected - createAppCharge failed' };
      }
      // return redirect url to approve charge page
      const { id: chargeId, confirmation_url } = usageChargeData;
      return { success: true, msg: 'planSelected OK', redirectUrl: String(confirmation_url) };
    } catch (ex) {
      console.log('ERROR! InstallationService - planSelected threw an exception!', ex);
      return { success: false, msg: 'planSelected failed' };
    }
  }

  async usageChargeApproved(shopName: string, planName: string, chargeId: string) {
    try {
      if (process.env.NODE_ENV != 'production') {
        console.log('usageChargeApproved', {shopName, planName, chargeId});
      }
      return await this.setupNewShopData(shopName, planName, chargeId);
    } catch (ex) {
      console.log('ERROR! - usageChargeApproved - setupNewShopData failed', {shopName, planName, chargeId});
      return { success: false, msg: 'usageChargeApproved - setupNewShopData failed' };
    }
  }

  async updatedUsageChargeApproved(shopName: string, planName: string, chargeId: string) {
    try {
      if (process.env.NODE_ENV != 'production') {
        console.log('updatedUsageChargeApproved', {shopName, planName, chargeId});
        // TODO for prod - Discord notification for upgrade here?
      }
      // get subscription data
      const {pricePerEmployee, capped_amount: billingCap, team_cap: teamCap} = this.getChargeByPlanName(planName);
      // update subscription
      await new SubscriptionsDao().updateSubscriptionByShopName(shopName, {chargeId, billingCap, teamCap, pricePerEmployee, subscriptionPlanName: planName});
      return { success: true, msg: 'plan updated OK' };
    } catch (ex) {
      console.log('ERROR! - updatedUsageChargeApproved - updateSubscriptionByShopName failed', {shopName, planName, chargeId});
      return { success: false, msg: 'updatedUsageChargeApproved - updateSubscriptionByShopName failed' };
    }
  }

  async setupNewShopData(shopName: string, subscriptionPlanName: string, chargeId: string) {
    try {
      const newShopifyAPIInstance = new NewShopifyAPI();
      const shopifyAPIInstance = new ShopifyAPI();
      await shopifyAPIInstance.initWithShopName(shopName);
      await newShopifyAPIInstance.initWithShopName(shopName);
      // get shop data
      const { success: getShopDataSuccess, shopData } = await newShopifyAPIInstance.getShop();
      if (!getShopDataSuccess) {
        console.log('ERROR! - setupNewShopData - getShop failed', shopName);
        return { success: false, msg: 'error while fetching shop data from Shopify' };
      }
      // TODO remove this log inspect..
      logInspect(shopData, 'SHOPIFY SHOP DATA:');
      const shopifyData = shopData.shop;
      const { plan_name: planName, plan_display_name: planDisplayName, shop_owner: ownerName, email: ownerEmail} = shopData.shop;
      if (process.env.APP_DENY_TRIAL === 'true') {
        if (planName == 'trial' || planDisplayName == 'trial') {
          console.log('ERROR! - setupNewShopData - trial shop detected, rejecting & destroying', {shopName, planName, planDisplayName, ownerName, ownerEmail});
          await new DiscordService().sendGeneralTextNotificationToDiscordChannel(subscriptionsChannel, 'Installation - rejected trial shop', shopData.shop, 'Security');
          await this.destroyAllByShopName(shopName);
          return {success: false, msg: 'trial', isTrialShop: true};
        }
      }
      const subToken = hashString(shopName);
      // get shop locations
      const { success: getShopLocationsSuccess, locations: locationsData } = await newShopifyAPIInstance.getLocations();
      if (!getShopLocationsSuccess) {
        console.log('ERROR! - setupNewShopData - getLocations failed', shopName);
        return {success: false, msg: 'error while fetching locations from Shopify'};
      }
      // create shop
      const { success: createNewShopSuccess } = await this.createNewShop(shopName, ownerName, ownerEmail, shopifyData, locationsData);
      if (!createNewShopSuccess) {
        console.log('ERROR! - setupNewShopData - createNewShop failed', shopName);
        return { success: false, msg: 'error while creating new shop' };
      }
      // create trialDays
      const { success: createNewShopTrialDaysSuccess} = await this.createNewShopTrialDays(shopName);
      if (!createNewShopTrialDaysSuccess) {
        console.log('ERROR! - setupNewShopData - createNewShopTrialDays failed', shopName);
        return { success: false, msg: 'error while creating trial' };
      }
      // create subscription
      const { success: createNewShopSubscriptionSuccess } = await this.createNewShopSubscription(shopName, chargeId, planName, planDisplayName, subscriptionPlanName);
      if (!createNewShopSubscriptionSuccess) {
        console.log('ERROR! - setupNewShopData - createNewShopSubscription failed', shopName);
        return { success: false, msg: 'error while creating subscription' };
      }
      // create settings
      await this.createNewSettings(shopName);
      // create departments
      await this.createNewDepartments(shopName);
      // create positions
      await this.createNewPositions(shopName);
      // create uninstall Webhook
      const { success: subToWebhookSuccess, webhook, webhookExists } = await shopifyAPIInstance.subscribeToUnInstallHook(subToken);
      console.log('setupNewShopData - subscribeToUnInstallHook', { subToWebhookSuccess, webhook, webhookExists });
      if (subToWebhookSuccess) {
        if (!webhookExists) {
          const { success: createWebhookSuccess } = await this.createNewShopUninstallWebhook(shopName, String(webhook.id), subToken);
          if (!createWebhookSuccess) {
            console.log('ERROR! - setupNewShopData - createNewShopUninstallWebhook failed', shopName);
            return { success: false, msg: 'error while creating webhook' };
          }
        }
      } else {
        console.log('ERROR! - setupNewShopData - subscribeToUnInstallHook failed', { subToWebhookSuccess, shopName, webhook });
        return { success: false, msg: 'error while subscribing to Shopify webhook' };
      }

      // TODO move to setup owner user and personnel
      // const { success: createLastLoginSuccess } = await this.createNewLastLogin(shopName);
      // if (!createLastLoginSuccess) {
      //   console.log('ERROR! - setupNewShopData - createNewLastLogin failed', shopName);
      //   // return {success: false, msg: 'setupNewShopData - createNewLastLogin failed'};
      // }
      await new DiscordService().sendNewSubscriptionNotificationToDiscordChannel({planName, planDisplayName, shopName, ownerName, ownerEmail, mgmSubscriptionName: subscriptionPlanName});
      const redirectURL = encodeURI(process.env.FRONTEND_BASE_DOMAIN + '/onboarding?shopName=' + shopName + '&ownerName=' + ownerName + '&ownerEmail=' + ownerEmail);
      if (process.env.NODE_ENV != 'production') {
        console.log('setupNewShopData - redirectURL', {redirectURL});
      }
      return { success: true, redirectURL };
    } catch (ex) {
      console.log('ERROR! setupNewShopData threw an exception', ex);
      return { success: false, msg: 'setupNewShopData failed' };
    }
  }

  async uninstallFromWebhook(shopifyShopId: number, shopName: string) {
    try {
      // get shop data by subToken
        //
        const uninstalledAt = moment();
        await Models.shopsToUninstall.upsert({shopName, uninstalledAt});
        //
        const personnelDataArray = await Models.personnel.findAll({ where: { shopName }, logging: false });
        const personnelEmails = personnelDataArray.map((personnelEntry: any) => personnelEntry.email);
        await new UserDao().removeShopByName(personnelEmails, shopName);
        // get access token
        // const tokenData = await Models.accessTokens.findOne({where:{shopName}, logging: false});
        // removing uninstall webhook subscription
        // await new NewShopifyAPI(tokenData.token, tokenData.shopName).deleteWebhook(unInstallWebhookId);
        const {success: getSubSuccess, subscription} = await new SubscriptionsDao().getSubscriptionByShopName(shopName);
        // const {success: getShopSuccess, shop} = await new ShopDao().getShopByName(shopName);
        await this.destroyAllByShopName(shopName);
        await new DiscordService().sendGeneralTextNotificationToDiscordChannel(uninstallsChannel, 'GDPR - Shop Uninstalled: ' + shopName, subscription, 'user retention');
        return { success: true, msg: 'deleted shop records' };
    } catch (ex) {
      console.log('ERROR! uninstallFromWebhook threw an exception', ex);
      return {success: false, msg: 'uninstallFromWebhook failed'};
    }
  }

  async unInstall(subToken: any, unInstallData: any) {
    try {
      const uninstallsChannel = process.env.DISCORD_CHANNEL_UNINSTALLS_P;
      // get shop data by subToken
      const shopUninstallWebhookData = await Models.uninstallWebhooks.findOne({where: {subToken}});
      if (shopUninstallWebhookData) {
        const { webhookId: unInstallWebhookId, shopName } = shopUninstallWebhookData;
        //
        const uninstalledAt = moment();
        await Models.shopsToUninstall.upsert({shopName, subToken, uninstalledAt, unInstallData});
        //
        const personnelDataArray = await Models.personnel.findAll({ where: { shopName }, logging: false });
        const personnel = personnelDataArray.map((personnelEntry: any) => personnelEntry.dataValues);
        const personnelAvatars = personnel.map((personnelEntry: any) => personnelEntry.avatarFile);
        const personnelEmails = personnel.map((personnelEntry: any) => personnelEntry.email);
        const {success, usersWithoutShops} = await new UserDao().removeShopByName(personnelEmails, shopName);
        const userAvatars = usersWithoutShops.map((user: any) => user.avatarFile);
        const avatarsToDelete = [...personnelAvatars, ...userAvatars];
        for (let i = 0; i < avatarsToDelete.length; i++) {
          if (avatarsToDelete[i] && avatarsToDelete[i].length > 0) {
            console.log('deleting avatar file', {shopName, fileName: avatarsToDelete[i]});
            await new StorageService().deleteAvatarPhoto(avatarsToDelete[i]);
          }
        }
        // get access token
        // const tokenData = await Models.accessTokens.findOne({where:{shopName}, logging: false});
        // removing uninstall webhook subscription
        // await new NewShopifyAPI(tokenData.token, tokenData.shopName).deleteWebhook(unInstallWebhookId);
        const {success: getSubSuccess, subscription} = await new SubscriptionsDao().getSubscriptionByShopName(shopName);
        // const {success: getShopSuccess, shop} = await new ShopDao().getShopByName(shopName);
        await this.destroyAllByShopName(shopName);
        await new DiscordService().sendGeneralTextNotificationToDiscordChannel(uninstallsChannel, 'Shop Uninstalled', subscription, 'user retention');

        return { success: true, msg: 'deleted shop records' };
      } else {
        return { success: true, msg: 'no shop records' };
      }
    } catch (ex) {
      console.log('ERROR! unInstall threw an exception', ex);
      return {success: false, msg: 'unInstall failed'};
    }
  }

  async destroyAllByShopName(shopName: string) {
    try {
      const deleteRequests: any = [
        Models.shopsToUninstall.destroy({ where: { shopName } }),
        Models.shops.destroy({ where: { shopName } }),
        Models.personnel.destroy({ where: { shopName }, logging: false }),
        Models.personnelStatus.destroy({ where: { shopName }, logging: false }),
        Models.accessTokens.destroy({ where: { shopName }, logging: false }),
        Models.uninstallWebhooks.destroy({ where: { shopName }, logging: false }),
        Models.tasklists.destroy({ where: { shopName }, logging: false }),
        Models.tasklistsReceived.destroy({ where: { shopName }, logging: false }),
        Models.preferences.destroy({ where: { shopName }, logging: false }),
        Models.positions.destroy({ where: { shopName }, logging: false }),
        Models.departments.destroy({ where: { shopName }, logging: false }),
        Models.shifts.destroy({ where: { shopName }, logging: false }),
        Models.shiftState.destroy({ where: { shopName }, logging: false }),
        Models.schedules.destroy({ where: { shopName }, logging: false }),
        Models.schedulesTimeoffs.destroy({ where: { shopName }, logging: false }),
        Models.schedulesTrades.destroy({ where: { shopName }, logging: false }),
        Models.subscriptions.destroy({ where: { shopName }, logging: false }),
        Models.attributedOrders.destroy({ where: { shopName }, logging: false }),
        Models.schedulesTimeoffs.destroy({ where: { shopName }, logging: false }),
        Models.schedulesTrades.destroy({ where: { shopName }, logging: false }),
        Models.gustoPersonnelIntegration.destroy({ where: { shopName }, logging: false }),
        Models.aggregatedMonthlyData.destroy({ where: { shopName }, logging: false }),
        Models.commissionPlans.destroy({ where: { shopName }, logging: false }),
        Models.commissionTeams.destroy({ where: { shopName }, logging: false }),
        Models.ordersMapping.destroy({ where: { shopName }, logging: false }),
        Models.lastLogin.destroy({ where: { shopName }, logging: false }),
        // Models.dorIntegration.destroy({ where: { shopName }, logging: false }),
        Models.users.destroy({ where: { defaultShop: shopName }, logging: false })
      ];
      await Promise.all(deleteRequests).then((response: any) => {
        // tslint:disable-next-line:no-null-keyword
        // console.log(util.inspect(response, false, null, true));
        console.log('deleted', response);
      });
      return {success: true, msg: 'deleted shop ' + shopName};
    } catch (ex) {
      console.log('ERROR! destroyAllByShopName threw an exception', {shopName, ex});
      return {success: false, msg: 'failed to delete shop ' + shopName};
    }
  }

  async register(shopName: string, userName: string, email: string, password: string, timezone: string = 'Universal') {
    try {
      if (!email || !(email.length > 0)) {
        return {success: false , msg: 'no email'};
      }
      const ownerEmail = toLower(email);
      // create new user
      const {success: createNewUserSuccess} = await new UserDao().createNewUser(shopName, ownerEmail, userName, password, true);
      if (!createNewUserSuccess) {
        console.log('ERROR! Installation - register - createNewUser failed', shopName);
        return {success: false, msg: 'Installation - register - createNewUser failed'};
      }
        // create owner personnel
        const {success: createOwnerPersonnelSuccess} = await new PersonnelDao().createNewOwnerPersonnel(shopName, userName, ownerEmail);
        if (!createOwnerPersonnelSuccess) {
          console.log('ERROR! Installation - register - createNewOwnerPersonnel failed', shopName);
          return {success: false, msg: 'Installation - register - createNewOwnerPersonnel failed'};
        }
      // create currentPersonnelStatus
      const { success: createCurrentPersonnelStatusSuccess } = await this.createNewPersonnelStatus(userName, ownerEmail, shopName);
      if (!createCurrentPersonnelStatusSuccess) {
        console.log('ERROR! Installation - register - createNewPersonnelStatus failed', shopName);
        return { success: false, msg: 'Installation - register - createNewPersonnelStatus failed' };
      }

      // new DashboardService().aggregatePreviousYearToDB(shopName, timezone);
      // const { success: aggregateDashboardSuccess } = await new DashboardService().aggregatePreviousYearToDB(shopName, timezone);
      // if (!aggregateDashboardSuccess) {
      //   console.log('ERROR! Installation - register - aggregatePreviousYearToDB failed', shopName);
      //   return { success: false, msg: 'Installation - register - aggregatePreviousYearToDB failed' };
      // }
      const { success: updateSubscriptionsSuccess } = await new SubscriptionsDao().updateSubscriptionByShopName(shopName, {subscribed: true, installationStatus: 'installed'});
      if (!updateSubscriptionsSuccess) {
        console.log('ERROR! Installation - register - updateSubscriptionByShopName failed', shopName);
        return { success: false, msg: 'Installation - register - updateSubscriptionByShopName failed' };
      }
      await new MailingService().sendPostInstallationEmail(shopName, userName, ownerEmail);
      return {success: true, msg: 'owner registration OK'};
    } catch (ex) {
      console.log('ERROR! Installation - register threw an exception:', ex);
      return {success: false , msg: 'register failed'};
    }
  }

  getChargeDataByLicensePlan(shopName: string, planName: string, isTestCharge: boolean = true, isPlanChange: boolean = false) {
    const testShops = [
      'temofo-shop.myshopify.com',
      'prod-tester.myshopify.com',
      'mgm-demo.myshopify.com',
      'mgm-test-store.myshopify.com',
      'temofo-shop-1.myshopify.com',
      'monica-shop-1.myshopify.com',
      'monica-shop1.myshopify.com',
      'mgm-leonisa-shop.myshopify.com',
      'mgm-leonisa.myshopify.com'
    ];
    if (process.env.NODE_ENV == 'production') {
      isTestCharge = false;
      if (testShops.includes(shopName)) {
        console.log('getChargeDataByLicensePlan - mgm dev store detected, overriding test charge to true even though its prod env');
        isTestCharge = true;
      }
    }
    return {
      recurring_application_charge: {
        ...baseApplicationCharge,
        ...this.getChargeByPlanName(planName),
        return_url: (isPlanChange ? appChargeUpdateRedirectUrl : appChargeRedirectUrl) + '/?shopName=' + shopName + '&planName=' + planName,
        test: isTestCharge
      }
    };
  }

  getChargeByPlanName = (planName: string) => {
    if (toLower(planName) == 'free') {
      return mgmFreeLicenseCharge;
    }
    if (toLower(planName) == 'lite') {
      return mgmLiteLicenseCharge;
    }
    if (toLower(planName) == 'standard') {
      return mgmStandardLicenseCharge;
    }
    // if (toLower(planName) == 'professional') {
    //   return mgmProfessionalLicenseCharge;
    // }
    if (toLower(planName) == 'custom/enterprise') {
      return mgmCustomLicenseCharge;
    }
  }
}
