const { Op } = require('@sequelize/core');
const moment = require('moment-timezone');
const Models = require('../db/models/');


export class PersonnelStatusDao {

  async getAllPersonnelStatusByShop(shopName: string) {
    try {
      const personnelStatusArray = await Models.personnelStatus.findAll({ where: {shopName}, logging: false });
      const personnelStatus =  personnelStatusArray.map((personnelStatus: any) => {
        const {email, name, avatarFile, updatedAt, status, shiftStart, breakStart, location, clockInVia} = personnelStatus.dataValues;
        return {email, name, avatarFile, updatedAt, status, shiftStart, breakStart, location, clockInVia};
      });
      return {success: true, personnelStatus};
    } catch (ex) {
      console.log('ERROR! PersonnelStatusDao - getAllPersonnelStatusByShop threw an exception', ex);
      return {success: false};
    }
  }

  async updatePersonnelStatusByShopAndEmail(shopName: string, email: string, timezone: string, status: string, shiftStart: string = undefined, breakStart: string = undefined, location: {id: number, name: string} = undefined, clockInVia: string = undefined) {
    try {
      const newPersonnelStatus: any = {status, updatedAt: moment().tz(timezone)};
      if (shiftStart) {
        newPersonnelStatus.shiftStart = shiftStart;
      }
      if (breakStart) {
        newPersonnelStatus.breakStart = breakStart;
      }
      if (location) {
        newPersonnelStatus.location = location;
      }
      if (clockInVia) {
        newPersonnelStatus.clockInVia = clockInVia;
      }
      await Models.personnelStatus.update(newPersonnelStatus, {where:{shopName, email: { [Op.iLike]: email }}, logging: false});
      return {success: true};
    } catch (ex) {
      console.log('ERROR! PersonnelStatusDao - updatePersonnelStatusByShopAndEmail threw an exception', ex);
      return {success: false};
    }
  }
}
