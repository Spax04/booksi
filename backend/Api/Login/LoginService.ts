import { clean, createToken, hashString } from '../../common';
const Models = require('../../db/models');
const { Op } = require('@sequelize/core');
import { toLower } from 'lodash';
const moment = require('moment-timezone');
import { PersonnelDao } from '../../dao/PersonnelDao';
import { ShopDao } from '../../dao/ShopDao';
import { UserDao } from '../../dao/UserDao';
import { SubscriptionsDao } from '../../dao/SubscriptionsDao';
import { MailingService } from '../Mailing/MailingService';
import { AdminsDao } from '../../dao/AdminsDao';
import { LastLoginDao } from '../../dao/LastLoginDao';
const redisClient = require('../../db/redisClient');

export interface IBKSTOKEN {
  userName: string;
  avatarFile: string;
  defaultShop: string;
  shops: Array<string>;
  email: string;
  password: string;
  expiration: string;
  issuedAt?: string;
  settings: any;
  permissions: {
   permissionLevel: string;
   visibility: any;
   actions: any;
  };
  subscription: any;
}

interface IAUTHENTICATERESULT {
  user: any;
  personnel: any;
  shop: {
    shopName: string;
    ownerName: string;
    ownerEmail: string;
    status: string;
    locationsData: any[];
  };
  subscription: string;
  authToken: string;
}

export class LoginService {

  // tslint:disable-next-line:no-null-keyword
  async authenticate(email: string, password: string, inputShopName: string = null) {
    const data = {
        personnel: {},
        shop: {},
        authToken: ''
      };

      const { success: getUserSuccess, user } = await new UserDao().getUserByEmailAndPassword(email, password);
      if (getUserSuccess) {
        if (inputShopName && inputShopName.length > 0) {
          if (!user.shops.includes(inputShopName)) {
            return ({success: false, status: 401, msg: 'shop not listed for user' });
          }
        }
        let defaultShop = inputShopName;
        if (!defaultShop) {
          defaultShop = user.defaultShop;
          if (!defaultShop) {
            const userShops = user.shops || [];
            if (userShops.length > 0) {
              defaultShop = userShops[0];
            } else {
              // try migration fix?
              return ({success: false, status: 401, msg: 'no default shop nor shops' });
            }
          }
        }

        const { success: getPersonnelSuccess, personnel } = await new PersonnelDao().getPersonnelByEmailAndShopName(email, defaultShop);
        if (!getPersonnelSuccess) {
          return ({success: false, msg: 'Personnel not found' });
        }
        // delete personnel.; // TODO remove useless data
        data.personnel = personnel;

        const {success: getShopSuccess, shop: shopData} = await new ShopDao().getShopByName(defaultShop);
        if (!getShopSuccess) {
          return ({success: false, msg: 'Shop not found' });
        }
        const shopLocations = shopData.locationsData.filter((locationData: any) => locationData.active == true).map((locationData: any) => ({
          id: locationData.id,
          name: locationData.name
        }));
        const locationsData = [{id: 1, name: 'Back Office'}, ...shopLocations];
        data.shop = {
          shopName: shopData.shopName,
          ownerName: shopData.ownerName,
          ownerEmail: shopData.ownerEmail,
          status: shopData.status,
          locationsData,
          currency: shopData.shopifyData.currency
        };

        // // check redis for token and return it if exists
        // const {success: redisGetSuccess, value: userToken} = await redisClient.get(hashString(personnel.email));
        // if (redisGetSuccess && userToken && userToken.length > 0) {
        //   data.authToken = userToken;
        //   return ({success: true, data, msg: 'login OK' });
        // }

        let permissionLevel = personnel.permissionLevel;
        if (!personnel || !personnel.permissionLevel) {
          const isOwner = user.ownedShops.includes(defaultShop);
          if (isOwner) {
            permissionLevel = 'Admin';
          }
        }

        const { success: getSubscriptionSuccess, subscription: subscriptionData } = await new SubscriptionsDao().getSubscriptionByShopName(defaultShop);
        if (!getSubscriptionSuccess) {
          console.log('ERROR! authenticate - getSubscriptionByShopName - subscription not found!', {defaultShop: shopData.shopName, user, inputShopName});
          return ({success: false, msg: 'Subscription not found' });
        }

        data.authToken = createToken(clean({
          userName: user.name,
          avatarFile: personnel && personnel.avatarFile ? personnel.avatarFile : user.avatarFile, // get avatar from shop personnel if possible, otherwise from user, should be the same anyways
          defaultShop,
          shops: user.shops,
          email,
          password,
          expiration: moment().add(2, 'days'),
          issuedAt: moment(),
          settings: {
            ...user.settings,
            locale: personnel.locale ? personnel.locale : 'en'
          },
          permissions: {
            permissionLevel,
            visibility: personnel.permissions.visibility,
            actions: personnel.permissions.actions
          },
          subscription: {
            installedAt: subscriptionData.installedAt,
            installationStatus: subscriptionData.installationStatus,
            chargeStatus: subscriptionData.chargeStatus,
            subscribed: subscriptionData.subscribed,
            inTrial: subscriptionData.inTrial,
            planName: subscriptionData.planName,
            planDisplayName: subscriptionData.planDisplayName,
            isDev: subscriptionData.isDev,
            subscriptionPlanName: subscriptionData.subscriptionPlanName,
            teamCap: subscriptionData.teamCap,
            chargePer: permissionLevel == 'Admin' ? subscriptionData.chargePer : '',
            pricePerEmployee: permissionLevel == 'Admin' ? subscriptionData.pricePerEmployee : '',
            pricePerMonth: permissionLevel == 'Admin' ? subscriptionData.pricePerMonth : '',
          }
        }));
        await redisClient.saveUserToken(hashString(email), data.authToken);
        await new LastLoginDao().upsertLastLoginByShopName(defaultShop, email, 'web');
        return ({success: true, data, msg: 'login OK' });
      } else {
        return ({success: false, status: 406, msg: 'Please check your credentials and try again.' });
      }
  }
  // tslint:disable-next-line:no-null-keyword
  async authenticatePos(pinCode: string, inputShopName: string = null) {
    const data = {
        personnel: {},
        shop: {},
        subscription: '',
        authToken: ''
      };

    const { success: getPersonnelSuccess, personnel } = await new PersonnelDao().getPersonnelByPinCodeAndShopName(pinCode, inputShopName);
    if (!getPersonnelSuccess) {
      return ({success: false, status: 406, msg: 'Please check your credentials and try again.' });
    }
    // delete personnel.; // TODO remove useless data
    data.personnel = personnel;

    const {success: getShopSuccess, shop: shopData} = await new ShopDao().getShopByName(inputShopName);
    if (!getShopSuccess) {
      return ({success: false, status: 406, msg: 'Shop not found' });
    }
    const shopLocations = shopData.locationsData.filter((locationData: any) => locationData.active == true).map((locationData: any) => ({
      id: locationData.id,
      name: locationData.name
    }));
    const locationsData = [{id: 1, name: 'Back Office'}, ...shopLocations];
    data.shop = {
      shopName: shopData.shopName,
      ownerName: shopData.ownerName,
      ownerEmail: shopData.ownerEmail,
      status: shopData.status,
      locationsData,
      currency: shopData.shopifyData.currency
    };


    // // check redis for token and return it if exists
    // const {success: redisGetSuccess, value: userToken} = await redisClient.get(hashString(personnel.email));
    // if (redisGetSuccess && userToken && userToken.length > 0) {
    //   data.authToken = userToken;
    //   return ({success: true, data, msg: 'login OK' });
    // }

    const { success: getUserSuccess, user } = await new UserDao().getUserByEmail(personnel.email);
    if (!getUserSuccess) {
      return ({success: false, status: 406, msg: 'user not found.' });
    }

    let permissionLevel = personnel.permissionLevel;
    if (!personnel || !personnel.permissionLevel) {
      const isOwner = user.ownedShops.includes(inputShopName);
      if (isOwner) {
        permissionLevel = 'Admin';
      }
    }

    const { success: getSubscriptionSuccess, subscription: subscriptionData } = await new SubscriptionsDao().getSubscriptionByShopName(inputShopName);
    if (!getSubscriptionSuccess) {
      console.log('ERROR! authenticatePos - getSubscriptionByShopName - subscription not found!', {defaultShop: shopData.shopName, user, inputShopName});
      return ({success: false, msg: 'Subscription not found' });
    }

      data.authToken = createToken(clean({
        userName: user.name,
        avatarFile: personnel && personnel.avatarFile ? personnel.avatarFile : user.avatarFile, // get avatar from shop personnel if possible, otherwise from user, should be the same anyways
        defaultShop: inputShopName,
        shops: user.shops,
        email: user.email,
        password: user.password,
        expiration: moment().add(2, 'days'),
        issuedAt: moment(),
        settings: {
          ...user.settings,
          locale: personnel.locale ? personnel.locale : 'en'
        },
        permissions: {
          permissionLevel,
          visibility: personnel.permissions.visibility,
          actions: personnel.permissions.actions
        },
        subscription: {
          installedAt: subscriptionData.installedAt,
          installationStatus: subscriptionData.installationStatus,
          chargeStatus: subscriptionData.chargeStatus,
          subscribed: subscriptionData.subscribed,
          inTrial: subscriptionData.inTrial,
          planName: subscriptionData.planName,
          planDisplayName: subscriptionData.planDisplayName,
          isDev: subscriptionData.isDev,
          subscriptionPlanName: subscriptionData.subscriptionPlanName,
          teamCap: subscriptionData.teamCap,
          chargePer: permissionLevel == 'Admin' ? subscriptionData.chargePer : '',
          pricePerEmployee: permissionLevel == 'Admin' ? subscriptionData.pricePerEmployee : '',
          pricePerMonth: permissionLevel == 'Admin' ? subscriptionData.pricePerMonth : '',
        }
      }));
      await redisClient.saveUserToken(hashString(user.email), data.authToken);
      await new LastLoginDao().upsertLastLoginByShopName(inputShopName, user.email, 'pos');

    return ({success: true, data, msg: 'login OK' });
  }
  // tslint:disable-next-line:no-null-keyword
  async authenticateAdmin(email: string, password: string = '') {
    const data = {
        user:{},
        authToken: ''
      };

    const { success: getUserSuccess, user } = await new AdminsDao().getAdminByEmailAndPassword(email, password);
    if (!getUserSuccess) {
      return ({success: false, status: 406, msg: 'admin not found.' });
    }
    data.user = {
      email: user.email,
      password: user.password
    };
    data.authToken = createToken(clean({
      email: user.email,
      password: user.password,
      expiration: moment().add(2, 'hours'),
      issuedAt: moment(),
      permissions: user.permissions
    }));
    return ({success: true, data, msg: 'admin login OK' });
  }
  // tslint:disable-next-line:no-null-keyword
  async authenticateForAdminImpersonation(user: any, inputShopName: string) {
    const data = {
      personnel: {},
      shop: {},
      authToken: ''
    };

      if (inputShopName && inputShopName.length > 0) {
        if (!user.shops.includes(inputShopName)) {
          return ({success: false, status: 401, msg: 'shop not listed for user' });
        }
      }
      let defaultShop = inputShopName;
      if (!defaultShop) {
        defaultShop = user.defaultShop;
        if (!defaultShop) {
          const userShops = user.shops || [];
          if (userShops.length > 0) {
            defaultShop = userShops[0];
          } else {
            // try migration fix?
            return ({success: false, status: 401, msg: 'no default shop nor shops' });
          }
        }
      }
      // data.user = {
      //   settings: user.settings
      // };
      const { success: getPersonnelSuccess, personnel } = await new PersonnelDao().getPersonnelByEmailAndShopName(user.email, defaultShop);
      if (!getPersonnelSuccess) {
        return ({success: false, msg: 'Personnel not found' });
      }
      // delete personnel.; // TODO remove useless data
      data.personnel = personnel;

      const {success: getShopSuccess, shop: shopData} = await new ShopDao().getShopByName(defaultShop);
      if (!getShopSuccess) {
        return ({success: false, msg: 'Shop not found' });
      }
      const shopLocations = shopData.locationsData.filter((locationData: any) => locationData.active == true).map((locationData: any) => ({
        id: locationData.id,
        name: locationData.name
      }));
      const locationsData = [{id: 1, name: 'Back Office'}, ...shopLocations];
      data.shop = {
        shopName: shopData.shopName,
        ownerName: shopData.ownerName,
        ownerEmail: shopData.ownerEmail,
        status: shopData.status,
        locationsData,
        currency: shopData.shopifyData.currency
      };

      let permissionLevel = personnel.permissionLevel;
      if (!personnel || !personnel.permissionLevel) {
        const isOwner = user.ownedShops.includes(defaultShop);
        if (isOwner) {
          permissionLevel = 'Admin';
        }
      }

      const { success: getSubscriptionSuccess, subscription: subscriptionData } = await new SubscriptionsDao().getSubscriptionByShopName(defaultShop);
      if (!getSubscriptionSuccess) {
        console.log('ERROR! authenticateForAdminImpersonation - getSubscriptionByShopName - subscription not found!', {defaultShop, user, inputShopName});
        return ({success: false, msg: 'Subscription not found' });
      }

      // await new LastLoginDao().updateLastLoginByShopName(defaultShop, {lastLoginDate: moment(), lastLoginEmail: email, lastLoginName: personnel.name});

            // const {success, msg, value} = await redisClient.get(hashString(user.email));
            // if (success && value) {
            //   data.authToken = value;
            // } else {
            //   data.authToken = createToken(clean({
            //     userName: user.name,
            //     avatarFile: personnel && personnel.avatarFile ? personnel.avatarFile : user.avatarFile, // get avatar from shop personnel if possible, otherwise from user, should be the same anyways
            //     defaultShop,
            //     shops: user.shops,
            //     email: user.email,
            //     password: user.password,
            //     expiration: moment().add(1, 'hours'),
            //     settings: user.settings,
            //     permissions: {
            //       permissionLevel,
            //       visibility: personnel.permissions.visibility,
            //       actions: personnel.permissions.actions
            //     }
            //   }));
            // }
    data.authToken = 'MGM8AD_' + createToken(clean({
      userName: user.name,
      avatarFile: personnel && personnel.avatarFile ? personnel.avatarFile : user.avatarFile, // get avatar from shop personnel if possible, otherwise from user, should be the same anyways
      defaultShop,
      shops: user.shops,
      email: user.email,
      password: user.password,
      expiration: moment().add(1, 'hours'),
      issuedAt: moment(),
      settings: {
        ...user.settings,
        locale: personnel.locale ? personnel.locale : 'en'
      },
      permissions: {
        permissionLevel,
        visibility: personnel.permissions.visibility,
        actions: personnel.permissions.actions
      },
      subscription: {
        installedAt: subscriptionData.installedAt,
        installationStatus: subscriptionData.installationStatus,
        chargeStatus: subscriptionData.chargeStatus,
        subscribed: subscriptionData.subscribed,
        inTrial: subscriptionData.inTrial,
        planName: subscriptionData.planName,
        planDisplayName: subscriptionData.planDisplayName,
        isDev: subscriptionData.isDev,
        subscriptionPlanName: subscriptionData.subscriptionPlanName,
        license: subscriptionData.license,
        installation: subscriptionData.installation,
        teamCap: subscriptionData.teamCap
      }
    }));
    // await redisClient.saveUserToken(hashString(user.email), data.authToken);
    return ({success: true, data, msg: 'login OK' });
  }

  async reset(email: string) {
    try {
      const resetToken = hashString(email + moment().format());

      const { success: getUserSuccess, user } = await new UserDao().getUserByEmail(email);
      if (!getUserSuccess) {
        return { success: false, status: 401, msg: 'user not found for this email address:' + email };
      }
      await Models.users.update({ukey: resetToken}, {where: {email: {[Op.iLike]: email}}, logging: false});
      const resetLink = process.env.FRONTEND_BASE_DOMAIN + '/reset-pass?resetToken=' + resetToken;
      const { success: getPersonnelSuccess, personnel } = await new PersonnelDao().getOnePersonnelByEmail(email);
      const locale = getPersonnelSuccess && personnel.locale ? personnel.locale : 'en';
      return await new MailingService().sendResetPasswordEmail(user.name, email, resetLink, locale);
    } catch (ex) {
      console.log('ERROR! reset password threw an exception', ex);
      return { success: false, msg: 'reset exception' };
    }
  }

  async deAuthenticate(email: string) {
    try {
      const redisKey = hashString(email);
      const { success, result } = await redisClient.set(redisKey, 'deAuth');
      if (!success) {
        return { success: false, msg: 'deAuthenticate user failed' };
      }
      return { success: true, msg: 'deAuthenticate user OK' };
    } catch (ex) {
      console.log('ERROR! deAuthenticate threw an exception', ex);
      return { success: false, msg: 'deAuthenticate exception' };
    }
  }

  async deAuthenticateShop(shopName: string, callerEmail: string = undefined) {
    try {
      const { success: getPersonnelSuccess, personnel } = await new PersonnelDao().getAllPersonnelByShopName(shopName);
      if (!getPersonnelSuccess) {
        return { success: false, msg: 'deAuthenticateShop - getAllPersonnelByShopName failed' };
      }
      const hashedPersonnelEmails = personnel.filter((personnel: any) => personnel.email != callerEmail).map((personnel: any) => hashString(personnel.email)); // removing caller email then mapping to hashed email strings
      const { success, result } = await redisClient.deleteKeys(hashedPersonnelEmails);
      if (!success) {
        return { success: false, msg: 'deAuthenticateShop failed' };
      }
      return { success: true, msg: 'deAuthenticateShop OK' };
    } catch (ex) {
      console.log('ERROR! deAuthenticateShop threw an exception', ex);
      return { success: false, msg: 'deAuthenticateShop exception' };
    }
  }

  async setPassword(resetToken: string, password: string) {
    try {
      const userToReset = await Models.users.findOne({where: {ukey: resetToken}, logging: false});
      if (!userToReset) {
        console.log('user not found', resetToken, password);
        return {success: false, msg: 'user not found'};
      }
      await Models.users.update({password, ukey: ''}, {where: {email: {[Op.iLike]: userToReset.email}}, logging: false});
      await this.deAuthenticate(userToReset.email);
      return {success: true, userEmail: userToReset.email, msg: 'setPassword OK'};
    } catch (ex) {
      console.log('ERROR! setPassword threw an exception', ex);
      return {success: false, msg: 'setPassword failed!'};
    }
  }

  async register(inviteKey: string, password: string) {
    try {
      const personnelData = await Models.personnel.findOne({where: {inviteKey}, logging: false});
      if (personnelData) {
        // create new user
        const {success: createNewUserSuccess} = await new UserDao().createNewUser(personnelData.shopName, toLower(personnelData.email), personnelData.name, password, false);
        if (!createNewUserSuccess) {
          console.log('Login - Register - createNewUser failed');
          return {success: false, msg: 'mailRegister - createNewUser failed'};
        }
        // update personnel status
        await Models.personnel.update({status: 'Active', inviteKey: ''}, {where: {inviteKey}, logging: false});
        return ({success: true, email: personnelData.email, msg: 'mailRegister success'});
      } else {
        console.log('Login - Register - personnel not found', { inviteKey });
        return ({success: false, msg: 'personnel not found'});
      }
    } catch (ex) {
      console.log('ERROR! mailRegister threw an exception', ex);
      return ({success: false, msg: 'mailRegister failed'});
    }
  }
}
