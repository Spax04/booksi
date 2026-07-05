import { clean } from '../common';
const { Op } = require('@sequelize/core');
import { toLower } from 'lodash';
const Models = require('../db/models/');


export class AdminsDao {

  async getAllAdmins() {
    try {
      const adminsArray = await Models.admins.findAll({ where: {}, logging: false });
      const admins = adminsArray.map((user: any) => user.dataValues);
      if (admins && admins.length > 0) {
        return {success: true, users: admins};
      } else {
        return { success: false, users: [] };
      }
    } catch (ex) {
      console.log('ERROR! getAllAdmins threw an exception', ex);
      return {};
    }
  }

  async getAdminByEmail(email: string) {
    try {
      const admin = await Models.admins.findOne({where: { email: {[Op.iLike]: email } }, logging: false});
      if (admin) {
        return { success: true, user: admin.dataValues };
      } else {
        return { success: false };
      }
    } catch (ex) {
      console.log('ERROR! getAdminByEmail threw an exception', ex);
      return { success: false };
    }
  }

  async getAdminByEmailAndPassword(email: string, password: string) {
    try {
      const admin = await Models.admins.findOne({where: { email: {[Op.iLike]: toLower(email) }, password }, logging: false});
      if (admin) {
        return {success: true, user: admin.dataValues};
      } else {
        console.log('WARNING! ADMINS DAO - NO USER FOUND!', { email, password });
        return {success: false};
      }
    } catch (ex) {
      console.log('ERROR! getAdminByEmailAndPassword threw an exception', ex);
      return {success: false};
    }
  }

  async updateAdminByEmail(email: any, updateData: any) {
    try {
      await Models.admins.update({...clean(updateData)}, {
        where: {
          email: {[Op.iLike]: toLower(email) }
        },
        logging: false
      });
      return { success: true, msg: 'updateAdminByEmail OK' };
    } catch (ex) {
      console.log('ERROR! updateAdminByEmail threw an exception:', ex);
      return { success: false };
    }
  }
}
