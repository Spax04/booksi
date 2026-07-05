import { getDateRangeMomentForCurrentYear, getDateRangeMomentOrCurrentMonth } from '../common';
import { IUserContact } from '../Types/common';

const { Op } = require('@sequelize/core');
const moment = require('moment-timezone');

const Models = require('../db/models/');

interface ISchedulesTimeoffs {
  shopName: string;
  createdAt: string;
  status: string; // "Pending" / "Approved" / "Declined"
  name: string;
  email: string;
  avatarFile: string;
  start: string;
  end: string;
  dateString: string;
  timezone: string;
  timeInSeconds: number;
  timeInDays: number;
  note: string;
  type: string; // "Vacation" / "Sick leave" / "Other"
  subType: string;
  responder: IUserContact;
  responderComment: string;
  approved: boolean;
  answered: boolean;
}
export class SchedulesTimeoffsDao {

  async getSchedulesTimeoffsInDateRangeByShopName(shopName: any, fromDate: string, toDate: string, timezone: string) {
    const { getFromDate, getToDate, isDefault: isDefaultRange } = getDateRangeMomentOrCurrentMonth(fromDate, toDate, timezone);
    try {
      const timeoffsArray = await Models.schedulesTimeoffs.findAll({
        where: {
          start: {
            [Op.between]: [getFromDate, getToDate]
          },
          shopName
        },
        logging: false
      });
      const timeoffs: ISchedulesTimeoffs[] = timeoffsArray.map((timeoff: any) => timeoff.dataValues);
      return { success: true, msg: 'get timeoffs OK', timeoffs, isDefaultRange };
    } catch (ex) {
      console.log('ERROR! getSchedulesTimeoffsInDateRangeByShopName threw an exception:', ex);
      return {success: false, msg: 'get timeoffs failed'};
    }
  }

  async getSchedulesTimeoffsInDateRangeByShopNameAndEmails(shopName: any, fromDate: string, toDate: string, timezone: string, emails: string[]) {
    const { getFromDate, getToDate, isDefault: isDefaultRange } = getDateRangeMomentOrCurrentMonth(fromDate, toDate, timezone);
    try {
      const timeoffsArray = await Models.schedulesTimeoffs.findAll({
        where: {
          start: {
            [Op.between]: [getFromDate, getToDate]
          },
          email: emails,
          shopName
        },
        logging: false
      });
      const timeoffs: ISchedulesTimeoffs[] = timeoffsArray.map((timeoff: any) => timeoff.dataValues);
      return { success: true, msg: 'get timeoffs OK', timeoffs, isDefaultRange };
    } catch (ex) {
      console.log('ERROR! getSchedulesTimeoffsInDateRangeByShopNameAndEmails threw an exception:', ex);
      return {success: false, msg: 'get timeoffs failed'};
    }
  }

  parseTimeoffsCounts(timeoffs: ISchedulesTimeoffs[]) {
    const approvedTimeoffs = timeoffs.filter((timeoff: ISchedulesTimeoffs) => timeoff.answered && timeoff.approved);

    const sickLeaveTimeoffs = approvedTimeoffs.filter((timeoff: ISchedulesTimeoffs) => timeoff.type == 'Sick leave');
    const sickLeaveDaysCount = sickLeaveTimeoffs.reduce((accumulator, object) => accumulator + object.timeInDays, 0);

    const vacationTimeoffs = approvedTimeoffs.filter((timeoff: ISchedulesTimeoffs) => timeoff.type == 'Vacation');
    const vacationDaysCount = vacationTimeoffs.reduce((accumulator, object) => accumulator + object.timeInDays, 0);

    const otherTimeoffs = approvedTimeoffs.filter((timeoff: ISchedulesTimeoffs) => timeoff.type == 'Other');
    const otherDaysCount = otherTimeoffs.reduce((accumulator, object) => accumulator + object.timeInDays, 0);
    return {approvedTimeoffsCount: approvedTimeoffs.length, sickLeaveDaysCount, vacationDaysCount, otherDaysCount};
  }

  async getApprovedTimeoffsThisYear(shopName: string, email: string, timezone: string) {
    const { getFromDate, getToDate } = getDateRangeMomentForCurrentYear(timezone);
    try {
      const timeoffsArray = await Models.schedulesTimeoffs.findAll({
        where: {
          start: {
            [Op.between]: [getFromDate, getToDate]
          },
          email: { [Op.iLike]: email },
          approved: true,
          answered: true,
          shopName
        },
        logging: false
      });
      const timeoffs: ISchedulesTimeoffs[] = timeoffsArray.map((timeoff: any) => timeoff.dataValues);
      return { success: true, timeoffs };
    } catch (ex) {
      console.log('ERROR! getApprovedTimeoffsThisYear threw an exception:', ex);
      return {success: false};
    }
  }

  async countApprovedTimeoffsThisYear(shopName: string, email: string, timezone: string) {
    const { getFromDate, getToDate } = getDateRangeMomentForCurrentYear(timezone);
    try {
      const timeoffsCount = await Models.schedulesTimeoffs.count({
        where: {
          start: {
            [Op.between]: [getFromDate, getToDate]
          },
          email: { [Op.iLike]: email },
          [Op.or]: [
            { type: 'Vacation' },
            { type: 'Other' }
          ],
          approved: true,
          answered: true,
          shopName
        },
        logging: false
      });
      return { success: true, timeoffsCount };
    } catch (ex) {
      console.log('ERROR! countApprovedTimeoffsThisYear threw an exception:', ex);
      return {success: false};
    }
  }

  async countApprovedSickLeavesThisYear(shopName: string, email: string, timezone: string) {
    const { getFromDate, getToDate } = getDateRangeMomentForCurrentYear(timezone);
    try {
      const sickLeaveCount = await Models.schedulesTimeoffs.count({
        where: {
          start: {
            [Op.between]: [getFromDate, getToDate]
          },
          email: { [Op.iLike]: email },
          type: 'Sick leave',
          approved: true,
          answered: true,
          shopName
        },
        logging: false
      });
      return { success: true, sickLeaveCount };
    } catch (ex) {
      console.log('ERROR! countApprovedSickLeavesThisYear threw an exception:', ex);
      return {success: false};
    }
  }

  async hasTimeoffsByDateStrings(shopName: any, dates: string[], email: string) {
    try {
      const timeoffsCount = await Models.schedulesTimeoffs.count({
        where: {
          dateString: dates,
          email: { [Op.iLike]: email },
          shopName
        },
        logging: false
      });
      return { success: true, hasTimeoffs: timeoffsCount > 0, count: timeoffsCount };
    } catch (ex) {
      console.log('ERROR! hasTimeoffsByDateString threw an exception:', ex);
      return {success: false};
    }
  }

  async hasTimeoffInDayDate(shopName: any, momentDayStart: string, momentDayEnd: string, email: string) {
    try {
      const timeoffsCount = await Models.schedulesTimeoffs.count({
        where: {
          [Op.or]: [
            { start: { [Op.gte]: momentDayStart } },
            { end: { [Op.lte]: momentDayEnd } }
          ],
          email: { [Op.iLike]: email },
          shopName
        },
        logging: false
      });
      return { success: true, hasTimeoffs: timeoffsCount > 0, count: timeoffsCount };
    } catch (ex) {
      console.log('ERROR! hasTimeoffInDayDate threw an exception:', ex);
      return {success: false};
    }
  }

  async hasTimeoffsInDateRange(shopName: any, fromDate: string, toDate: string, timezone: string, email: string) {
    const { getFromDate, getToDate, isDefault } = getDateRangeMomentOrCurrentMonth(fromDate, toDate, timezone);
    try {
      const timeoffsCount = await Models.schedulesTimeoffs.count({
        where: {
          start: {
            [Op.between]: [getFromDate, getToDate]
          },
          email: { [Op.iLike]: email },
          shopName
        },
        logging: false
      });
      return { success: true, hasTimeoffs: timeoffsCount > 0, count: timeoffsCount, isDefault };
    } catch (ex) {
      console.log('ERROR! hasTimeoffsInDateRange threw an exception:', ex);
      return {success: false};
    }
  }

  async getTimeoffById(shopName: string, timeoffId: number) {
    try {
      const timeoff = await Models.schedulesTimeoffs.findOne({where:{shopName, id: timeoffId}, logging: false});
      if (timeoff) {
        return {success: true, timeoff};
      } else {
        return {success: false};
      }
    } catch (ex) {
      console.log('ERROR! getTimeoffById threw an exception', ex);
      return {success: false};
    }
  }

  // async countAppprovedDaysOffThisYear(shopName: string, email: string, timezone: string) {
  //   try {
  //     const { getFromDate, getToDate } = getDateRangeMomentForCurrentYear(timezone);
  //     await Models.schedulesTimeoffs.findAll({
  //       attributes: [[sequelize.fn('sum', sequelize.col('timeInDays')), 'totalDays']],
  //       where: {
  //         start: {
  //           [Op.between]: [getFromDate, getToDate]
  //         },
  //         email: { [Op.iLike]: email },
  //         approved: true,
  //         answered: true,
  //         shopName },
  //       raw: true,
  //     });
  //     return {success: false};
  //   } catch (ex) {
  //     console.log('ERROR! countAppprovedDaysOffThisYear threw an exception', ex);
  //     return {success: false};
  //   }
  // }

  async createNewTimeoffRequest(shopName: string, creator: any, start: string, end: string, timezone: string, dateString: string, note: string, type: string, permissionLevel: string) {
    try {
      let adminOverride = {};
      if (permissionLevel == 'Admin') { // if admin request there's no need for the whole flow, just add an Approved request and it's done
        adminOverride = {
            status: 'Approved',
            approved: true,
            answered: true,
            responder: creator
          };
      }
      const createdAt = moment(); // now
      const newTimeoffRequest = {
        shopName,
        status: 'Pending',
        createdAt,
        name: creator.name,
        email: creator.email,
        avatarFile: creator.avatarFile,
        start,
        end,
        timezone,
        dateString,
        timeInSeconds: 86400, // 24 hrs
        timeInDays: 1,
        note,
        type, // "Vacation" / "Sick leave" / "Other"
        approved: false,
        answered: false,
        ...adminOverride // MUST BE LAST
      };
      await Models.schedulesTimeoffs.create(newTimeoffRequest);
      return { success: true };
    } catch (ex) {
      console.log('ERROR! createNewTimeoffRequest threw an exception:', ex);
      return {success: false};
    }
  }

  async deleteTimeoffRequestById(shopName: string, email: string, timeoffId: any) {
    try {
      const {success: getTimeoffByIdSuccess, timeoff} = await this.getTimeoffById(shopName, timeoffId);
      if (!getTimeoffByIdSuccess) {
        return {success: false, status: 400, msg: 'no timeoff request found for this id'};
      }
      if (timeoff.email == email) {
        return {success: false, status: 406, msg: 'can only delete your own requests'};
      }
      if (timeoff.answered == true) {
        return {success: false, status: 406, msg: 'cant delete request after it has been answered'};
      }
      const numAffectedRows = await Models.schedulesTimeoffs.destroy({
        where: {
          shopName,
          id: timeoffId
        }
      });
      return {success: true, msg: 'deleted ' + numAffectedRows + ' records'};
    } catch (ex) {
      console.log('ERROR! deleteTimeoffRequestById threw an exception', ex);
      return {success: false, msg: 'deleteTimeoffRequestById failed'};
    }
  }

  async deleteTimeoffById(shopName: string, email: string, timeoffId: any) {
    try {
      const numAffectedRows = await Models.schedulesTimeoffs.destroy({
        where: {
          shopName,
          id: timeoffId
        }
      });
      return {success: true, msg: 'deleted ' + numAffectedRows + ' records'};
    } catch (ex) {
      console.log('ERROR! deleteTimeoffById threw an exception', ex);
      return {success: false, msg: 'deleteTimeoffById failed'};
    }
  }

  async approveTimeoffRequestById(shopName: string, approver: any, timeoffId: any, comment: string) {
    try {
      const {success: getTimeoffByIdSuccess, timeoff} = await this.getTimeoffById(shopName, timeoffId);
      if (!getTimeoffByIdSuccess) {
        return {success: false, status: 406, msg: 'no timeoff request found for this id'};
      }
      if (timeoff.email == approver.email) {
        return {success: false, status: 406, msg: 'cant approve your own requests'};
      }
      if (timeoff.answered == true) {
        return {success: false, status: 406, msg: 'request has already been answered'};
      }
      const approvedTimeoffData = {
        status: 'Approved',
        answered: true,
        approved: true,
        responder: approver,
        responderComment: comment
      };
      await Models.schedulesTimeoffs.update({
        ...approvedTimeoffData,
      }, {
        where: {
          shopName,
          id: timeoffId
        }
      });
      return {success: true, msg: 'approveTimeoffRequestById OK', timeoff: {...timeoff, ...approvedTimeoffData}};
    } catch (ex) {
      console.log('ERROR! approveTimeoffRequestById threw an exception', ex);
      return {success: false, msg: 'approveTimeoffRequestById failed'};
    }
  }

  async declineTimeoffRequestById(shopName: string, approver: any, email: string, timeoffId: any, comment: string) {
    try {
      const {success: getTimeoffByIdSuccess, timeoff} = await this.getTimeoffById(shopName, timeoffId);
      if (!getTimeoffByIdSuccess) {
        return {success: false, status: 400, msg: 'no timeoff request found for this id'};
      }
      if (timeoff.email == approver.email) {
        return {success: false, status: 406, msg: 'cant decline your own requests'};
      }
      if (timeoff.answered == true) {
        return {success: false, status: 406, msg: 'request has already been answered'};
      }
      const declinedTimeoffData = {
        status: 'Declined',
        answered: true,
        approved: false,
        responder: approver,
        responderComment: comment
      };
      const numAffectedRows = await Models.schedulesTimeoffs.update({
        ...declinedTimeoffData,
      }, {
        where: {
          shopName,
          id: timeoffId
        }
      });
      return {success: true, msg: 'declineTimeoffRequestById OK', timeoff: {...timeoff, ...declinedTimeoffData}};
    } catch (ex) {
      console.log('ERROR! declineTimeoffRequestById threw an exception', ex);
      return {success: false, msg: 'declineTimeoffRequestById failed'};
    }
  }

}
