import { ICommissionPlan } from './CommissionPlansDao';

const { Op } = require('@sequelize/core');
import {
  installation_defaultOwnerPersonnelData
} from '../common/defaults';
import { ShopDao } from './ShopDao';
const Models = require('../db/models/');
const moment = require('moment-timezone');


export class PersonnelDao {

  async getAllPersonnel() {
    try {
      const personnelArray = await Models.personnel.findAll({ where: {}, logging: false });
      const personnel = personnelArray.map((personnel: any) => personnel.dataValues);
      if (personnel && personnel.length > 0) {
        return personnel;
      } else {
        return [];
      }
    } catch (ex) {
      console.log('ERROR! getAllPersonnel threw an exception', ex);
      return {};
    }
  }

  async getAllPersonnelCount() {
    try {
      const personnelCount = await Models.personnel.count({ where: {}, logging: false });
      if (personnelCount) {
        return {success: true, personnelCount};
      } else {
        return {success: false};
      }
    } catch (ex) {
      console.log('ERROR! getAllPersonnelCount threw an exception', ex);
      return {success: false};
    }
  }

  async getPersonnelCountByShopName(shopName: string) {
    try {
      const personnelCount = await Models.personnel.count({ where: {shopName}, logging: false });
      if (personnelCount) {
        return {success: true, personnelCount};
      } else {
        return {success: false};
      }
    } catch (ex) {
      console.log('ERROR! getPersonnelCountByShopName threw an exception', ex);
      return {success: false};
    }
  }

  async getOnePersonnelByEmail(email: string) {
    try {
      const personnel = await Models.personnel.findOne({where:{email: {[Op.iLike]: email}}, logging: false});
      if (personnel) {
        return {success: true, personnel};
      } else {
        return {success: false};
      }
    } catch (ex) {
      console.log('ERROR! getOnePersonnelByEmail threw an exception', ex);
      return {success: false};
    }
  }

  async getPersonnelByEmailAndShopName(email: string, shopName: string) {
    try {
      const personnel = await Models.personnel.findOne({where:{shopName, email: {[Op.iLike]: email}}, logging: false});
      if (personnel) {
        return {success: true, personnel};
      } else {
        return {success: false};
      }
    } catch (ex) {
      console.log('ERROR! getPersonnelByEmailAndShopName threw an exception', ex);
      return {success: false};
    }
  }

  async getPersonnelByPinCodeAndShopName(pinCode: string, shopName: string) {
    try {
      const personnel = await Models.personnel.findOne({where:{shopName, pinCode}, logging: false});
      if (personnel) {
        return {success: true, personnel};
      } else {
        return {success: false};
      }
    } catch (ex) {
      console.log('ERROR! getPersonnelByPinCodeAndShopName threw an exception', ex);
      return {success: false};
    }
  }

  async getPersonnelByEmailsAndShopName(emails: string[], shopName: string) {
    try {
      const personnelArray = await Models.personnel.findAll({where:{shopName, email: emails}, logging: false});
      const personnel = personnelArray.map((personnel: any) => personnel.dataValues);
      if (personnel) {
        return {success: true, personnel};
      } else {
        return {success: false};
      }
    } catch (ex) {
      console.log('ERROR! getPersonnelByEmailsAndShopName threw an exception', ex);
      return {success: false};
    }
  }

  async getAllPersonnelByShopName(shopName: string) {
    try {
      const personnelArray = await Models.personnel.findAll({ where: {shopName} , logging: false });
      const personnel = personnelArray.map((personnel: any) => personnel.dataValues);
      if (personnel) {
        return { success: true, personnel };
      } else {
        return { success: false };      }
    } catch (ex) {
      console.log('ERROR! getAllPersonnelByShopName threw an exception', ex);
      return { success: false };
    }
  }

  async createNewOwnerPersonnel(shopName: string, personnelName: string, ownerEmail: string) {
    try {
      const ownerPersonnelData = {
        name: personnelName,
        email: ownerEmail,
        shopName
      };
      const preExistingOwnerPersonnel = await Models.personnel.findOne({ where: { shopName, email: {[Op.iLike]: ownerEmail} }, logging: false });
      // create site positions
      if (!preExistingOwnerPersonnel) {
        console.log('install - creating new owner personnel');
        await Models.personnel.create({ ...installation_defaultOwnerPersonnelData, ...ownerPersonnelData }, { logging: false });
        return ({ success: true, msg: 'createNewOwnerPersonnel ok' });
      } else {
        console.log('WARNING! install - owner personnel already exist, updating to defaults', { shopName, ownerEmail });
        await Models.personnel.update({ ...installation_defaultOwnerPersonnelData }, { where: { shopName, email: {[Op.iLike]: ownerEmail } }, logging: false });
        return ({ success: true, msg: 'createNewOwnerPersonnel - updated to defaults' });
      }
    } catch (ex) {
      console.log('ERROR! createNewOwnerPersonnel threw an exception', ex);
      return ({ success: false, msg: 'createNewOwnerPersonnel failed' });
    }
  }

  async createNewStaffPersonnel(shopName: string, email: string, personnelData: any) {
    try {
      const preExistingStaffPersonnel = await Models.personnel.findOne({ where: { shopName, email: {[Op.iLike]: email } }, logging: false });
      if (personnelData.pinCode) {
        // fail everything if duplicates or existing pincodes found
        const {success, pinCodeCount, exists} = await new PersonnelDao().isPinCodesAssigned(shopName, [personnelData.pinCode]);
        if (success) {
          if (exists) {
            return {success: false, msg: 'pinCode already assigned' }; // update was successful
          }
        }
      }
      // create staff personnel
      if (!preExistingStaffPersonnel) {
        console.log('install - creating new staff personnel');
        const createdAt = moment().tz();
        await Models.personnel.create({ ...personnelData, createdAt }, { logging: false });
        return ({ success: true, msg: 'createNewStaffPersonnel ok' });
      } else {
        console.log('WARNING! install - staff personnel already exist, updating to defaults', { shopName, email });
        await Models.personnel.update({ ...personnelData }, { where: { shopName, email: {[Op.iLike]: email } }, logging: false });
        return ({ success: true, msg: 'createNewStaffPersonnel - updated to defaults' });
      }
    } catch (ex) {
      console.log('ERROR! createNewStaffPersonnel threw an exception', ex);
      return ({ success: false, msg: 'createNewStaffPersonnel failed' });
    }
  }

  async getStaffByLocationIdsForPOS(shopName: string, locationIds: string[]) {
    try {
      const orConditions = [];
      for (let i = 0; i < locationIds.length; i++) {
        orConditions.push({ [Op.contains]: [{ id: locationIds[i] }] });
      }
      const staffArray = await Models.personnel.findAll({
        where: {
          shopName,
          locations: {
            [Op.or]: orConditions
          }
        },
        attributes: ['name', 'email', 'position', 'department', 'avatarFile', 'locations', 'shopifyId'],
        logging: false
      });
      const staff = staffArray.map((personnel: any) => personnel.dataValues);
      return {success: true, msg: 'getStaffByLocationId OK', staff};
    } catch (ex) {
      console.log('ERROR! getStaffByLocationIds threw an exception', shopName, locationIds, ex);
      return {success: false, msg: 'getStaffByLocationIds failed'};
    }
  }

  async getAllPersonnelByLocationIds(shopName: string, locationIds: string[], attributes: string[] = undefined) {
    try {
      const orConditions = [];
      for (let i = 0; i < locationIds.length; i++) {
        orConditions.push({ [Op.contains]: [{ id: locationIds[i] }] });
      }
      const query: any = {
        where: {
          shopName,
          locations: {
            [Op.or]: orConditions
          }
        },
        attributes
      };
      if (!attributes || attributes.length == 0) {
        delete query.attributes;
      }
      const personnelArray = await Models.personnel.findAll({
        ...query
      });
      const personnel = personnelArray.map((personnel: any) => personnel.dataValues);
      return {success: true, msg: 'getStaffByLocationId OK', personnel};
    } catch (ex) {
      console.log('ERROR! getStaffByLocationIds threw an exception', shopName, locationIds, ex);
      return {success: false, msg: 'getStaffByLocationIds failed'};
    }
  }

  async getAllEmployeesByLocationIds(shopName: string, locationIds: string[], attributes: string[] = undefined, staffOnly: boolean = true) {
    try {
      const orConditions = [];
      for (let i = 0; i < locationIds.length; i++) {
        orConditions.push({ [Op.contains]: [{ id: locationIds[i] }] });
      }
      const query: any = {
        where: {
          shopName,
          locations: {
            [Op.or]: orConditions
          }
        },
        attributes
      };
      if (!attributes || attributes.length == 0) {
        delete query.attributes;
      }
      if (staffOnly) {
        query.where.permissionLevel = 'Employee';
      }
      const personnelArray = await Models.personnel.findAll({
        ...query
      });
      const personnel = personnelArray.map((personnel: any) => personnel.dataValues);
      return {success: true, msg: 'getStaffByLocationId OK', personnel};
    } catch (ex) {
      console.log('ERROR! getStaffByLocationIds threw an exception', shopName, locationIds, ex);
      return {success: false, msg: 'getStaffByLocationIds failed'};
    }
  }

  async getAdminsAndManagersByLocationIds(shopName: any, locationIds: string[]) {
    try {
      const orConditions = [];
      for (let i = 0; i < locationIds.length; i++) {
        orConditions.push({ [Op.contains]: [{ id: locationIds[i] }] });
      }
      const where = {
        permissionLevel: {
          [Op.or]: ['Admin', 'Manager']
        },
        locations: {
          [Op.or]: orConditions
        },
        shopName
      };
      const adminsManagersArray = await Models.personnel.findAll({
        where
      });
      const admins = adminsManagersArray.filter((personnel: any) => personnel.permissionLevel == 'Admin').map((p: any) => p.dataValues);
      const managers = adminsManagersArray.filter((personnel: any) => personnel.permissionLevel == 'Manager').map((p: any) => p.dataValues);
      return { success: true, admins, managers };
    } catch (ex) {
      console.log('ERROR! PeronnelDao - getAdminsAndManagersByLocationIds threw an exception:', ex);
      return { success: false, msg: 'get managers failed' };
    }
  }

  async setPersonnelShopLocation(shopName: string, personnelEmail: string) {
    try {
      const {success: getShopSuccess, shop} = await new ShopDao().getShopByName(shopName);
      if (getShopSuccess) {
        const locations = shop.locationsData ? shop.locationsData : [];
        if (locations.length > 0) {
          const location = locations[0].name || '';
          const locationId = locations[0].id || '';
          await Models.personnel.update({location, locationId}, {where: {shopName, email: {[Op.iLike]: personnelEmail}}});
        }
      }
    } catch (ex) {
      console.log('ERROR! setPersonnelShopLocation threw an exception', ex);
    }
  }

  async getShopChargeablePersonnelAmount(shopName: string) {
    try {
      const personnelCount = await Models.personnel.count({ where: {
          shopName
        }, logging: false });
      // personnelCount = personnelCount - 1 > 0 ? personnelCount - 1 : 0;
      return { success: true, personnelCount, shouldCharge: personnelCount > 0 };
    } catch (ex) {
      console.log('ERROR! getShopChargeablePersonnelAmount threw an exception', ex);
      return { success: false };
    }
  }

  async isPinCodesAssigned(shopName: string, pinCodes: string[]) {
    try {
      const pinCodeCount = await Models.personnel.count({ where: {
          shopName,
          pinCode: pinCodes
        }});
      return { success: true, pinCodeCount, exists: pinCodeCount > 0 };
    } catch (ex) {
      console.log('ERROR! isPinCodeAssigned threw an exception', ex);
      return { success: false };
    }
  }

  async assignCommissionPlan(shopName: string, commissionPlan: ICommissionPlan, emails: string[]) {
    try {
      await Models.personnel.update({ commissionPlan }, { where: { shopName, email: emails }, logging: false });
      return { success: true, msg: 'assign commission plan OK' };
    } catch (ex) {
      console.log('ERROR! assignCommissionPlan threw an exception', ex);
      return { success: false, msg: 'assign personnel commission plan failed!' };
    }
  }
}
