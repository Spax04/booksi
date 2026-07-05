import { getDateRangeMomentOrCurrentMonth } from '../common';
const { Op } = require('@sequelize/core');
const Models = require('../db/models/');

export interface ISchedule {
  shopName: string;
  name?: string;
  email: string;
  avatarFile?: string;
  start: string;
  end: string;
  timezone: string;
  timeInSeconds?: number;
  department?: string;
  position?: string;
  location: Array<{name: string, id: string}>;
  note?: string;
  tasks?: any;
  breaks?: Array<{index: number, breakStart: string, breakEnd: string}>; // [{index, breakStart, breakEnd}, ...]
  type?: string; // "Shift" / "Vacation" / "Sick leave" / "Demand"
  subType?: string; // no subTypes yet
  creator: {name: string, email: string, avatarFile?: string};
  comment?: string; // for time off / sick leave requests
  approved?: boolean; // for time off / sick leave requests
  assigned?: boolean; // for demands, to avoid double assigning
  notifiedEmployees?: any; // [{name: string, email: string, avatarFile: string}]
}
export class SchedulesDao {

  async getScheduleByShopNameAndId(shopName: string, scheduleId: number) {
    try {
      const schedule = await Models.schedules.findOne({where:{shopName, id: scheduleId}, logging: false});
      if (schedule) {
        return {success: true, schedule};
      } else {
        return {success: false};
      }
    } catch (ex) {
      console.log('ERROR! getScheduleByShopNameAndId threw an exception', ex);
      return {success: false};
    }
  }

  async getSchedulesInDateRangeByShopNameAndEmail(shopName: any, fromDate: string, toDate: string, timezone: string, email: string) {
    const { getFromDate, getToDate, isDefault } = getDateRangeMomentOrCurrentMonth(fromDate, toDate, timezone);
    try {
      const schedulesArray = await Models.schedules.findAll({
        where: {
          start: {
            [Op.between]: [getFromDate, getToDate]
          },
          email: { [Op.iLike]: email },
          shopName
        },
        logging: false
      });
      const schedules = schedulesArray.map((schedule: any) => schedule.dataValues);
      return { success: true, schedules, isDefault };
    } catch (ex) {
      console.log('ERROR! getSchedulesInDateRangeByShopNameAndEmail threw an exception:', ex);
      return {success: false};
    }
  }

  async getSchedulesInDateRangeByShopName(shopName: any, fromDate: string, toDate: string, timezone: string) {
    const { getFromDate, getToDate, isDefault } = getDateRangeMomentOrCurrentMonth(fromDate, toDate, timezone);
    try {
      const schedulesArray = await Models.schedules.findAll({
        where: {
          start: {
            [Op.between]: [getFromDate, getToDate]
          },
          shopName
        },
        logging: false
      });
      const schedules = schedulesArray.map((schedule: any) => schedule.dataValues);
      return { success: true, schedules, isDefault };
    } catch (ex) {
      console.log('ERROR! getSchedulesInDateRangeByShopName threw an exception:', ex);
      return {success: false};
    }
  }

  async getSchedulesInDateRangeByShopNameAndLocationIds(shopName: any, fromDate: string, toDate: string, timezone: string, locationIds: string[]) {
    const { getFromDate, getToDate, isDefault } = getDateRangeMomentOrCurrentMonth(fromDate, toDate, timezone);
    try {
      const orConditions = [];
      for (let i = 0; i < locationIds.length; i++) {
        orConditions.push({ [Op.contains]: { id: locationIds[i] } });
      }
      const schedulesArray = await Models.schedules.findAll({
        where: {
          start: {
            [Op.between]: [getFromDate, getToDate]
          },
          location: {
            [Op.or]: orConditions
          },
          shopName
        },
        logging: false
      });
      const schedules = schedulesArray.map((schedule: any) => schedule.dataValues);
      return { success: true, schedules, isDefault };
    } catch (ex) {
      console.log('ERROR! getSchedulesInDateRangeByShopNameAndLocationIds threw an exception:', ex);
      return {success: false};
    }
  }

  async deleteEmployeeShiftsAfter(shopName: string, email: string, afterDate: any) {
    try {
      const rowsAffected = await Models.schedules.destroy({
        where: {
          start: {
            [Op.gte]: afterDate
          },
          shopName,
          email: {[Op.iLike]: email}
        },
        logging: false
      });
      return { success: true, msg: 'deleted ' + rowsAffected + ' future schedule shifts for email: ' + email };
    } catch (ex) {
      console.log('ERROR! deleteEmployeeShiftsAfter threw an exception:', ex);
      return {success: false};
    }
  }
}
