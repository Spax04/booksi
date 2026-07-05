import { clean, getDateRangeMoment, getDateRangeMomentOrCurrentMonth } from '../common';
const { Op } = require('@sequelize/core');
const Models = require('../db/models/');


export class ShiftsDao {

  async getShiftsInDateRangeByEmailAndShop(shopName: string, fromDate: string, toDate: string, timezone: string, email: string) {
    const { getFromDate, getToDate } = getDateRangeMomentOrCurrentMonth(fromDate, toDate, timezone);
    try {
      const shiftsArray = await Models.shifts.findAll({
        where: {
          start: {
            [Op.between]: [getFromDate, getToDate]
          },
          end: {
            // tslint:disable-next-line:no-null-keyword
            [Op.ne]: null
          },
          email: { [Op.iLike]: email },
          shopName
        },
        logging: false
      });
      const shifts = shiftsArray.map((shift: any) => shift.dataValues);
      return { success: true, msg: 'get shifts OK', shifts: shifts ? shifts : [] };
    } catch (ex) {
      console.log('ERROR! getShiftsInDateRangeByEmailAndShop threw an exception:', ex);
      return {success: false, msg: 'get shifts failed!'};
    }
  }

  async getAllShiftsInDateRangeForShopName(shopName: any, fromDate: string, toDate: string, timezone: string) {
    const { success: parseDateRangeSuccess, getFromDate, getToDate } = getDateRangeMoment(fromDate, toDate, timezone);
    if (!parseDateRangeSuccess) {
      return {success: false};
    }
    try {
      const shiftsArray = await Models.shifts.findAll({
        where: {
          start: {
            [Op.between]: [getFromDate, getToDate]
          },
          shopName
        },
        logging: false
      });
      const shifts = shiftsArray.map((shift: any) => shift.dataValues);
      if (shifts) {
        return { success: true, shifts };
      } else {
        return {success: false};
      }
    } catch (ex) {
      console.log('ERROR! getAllShiftsInDateRangeForShopName threw an exception:', ex);
      return {success: false};
    }
  }

  async getAllShiftsInDateRangeForShopNameAndEmails(shopName: any, fromDate: string, toDate: string, timezone: string, emails: string[]) {
    const { success: parseDateRangeSuccess, getFromDate, getToDate } = getDateRangeMoment(fromDate, toDate, timezone);
    if (!parseDateRangeSuccess) {
      return {success: false};
    }
    try {
      const shiftsArray = await Models.shifts.findAll({
        where: {
          start: {
            [Op.between]: [getFromDate, getToDate]
          },
          email: emails,
          shopName
        },
        logging: false
      });
      const shifts = shiftsArray.map((shift: any) => shift.dataValues);
      if (shifts) {
        return { success: true, shifts };
      } else {
        return {success: false};
      }
    } catch (ex) {
      console.log('ERROR! getAllShiftsInDateRangeForShopNameAndEmails threw an exception:', ex);
      return {success: false};
    }
  }

  async getShiftById(shiftId: any) {
    try {
      const shift = await Models.shifts.findOne({
        where: {
          id: shiftId
        },
        logging: false
      });
      if (shift) {
        return { success: true, shift };
      } else {
        return {success: false};
      }
    } catch (ex) {
      console.log('ERROR! getShiftById threw an exception:', ex);
      return {success: false};
    }
  }

  async getLatestShift(shopName: string, email: string) {
    try {
      const shift = await Models.shifts.findOne({
        where: {
          shopName,
          email: { [Op.iLike]: email },
        }, order: [['id', 'DESC']],
        logging: false
      });
      if (!shift) {
        return { success: true, msg: 'no shifts yet prbbly', shift };
      } else {
        return { success: true, msg: 'getLatestShift OK', shift };
      }
    } catch (ex) {
      console.log('ERROR! getLatestShift threw an exception:', ex);
      return {success: false};
    }
  }

  async updateShiftById(shiftId: any, updateData: any) {
    try {
      await Models.shifts.update({...clean(updateData)}, {
        where: {
          id: shiftId
        },
        logging: false
      });
      return { success: true };
    } catch (ex) {
      console.log('ERROR! getShiftById threw an exception:', ex);
      return {success: false};
    }
  }
}
