import { getDateRangeMomentOrCurrentMonth } from '../common';
const { Op } = require('@sequelize/core');
import { toLower } from 'lodash';
const moment = require('moment-timezone');
const Models = require('../db/models/');


export class TasklistsDao {

  async getAllTasklists(shopName: string) {
    try {
      const tasklistsArray = await Models.tasklists.findAll({ where: { shopName }, logging: false });
      const tasklists = tasklistsArray.map((tasklist: any) => tasklist.dataValues);
      if (tasklists) {
        return { success: true, tasklists };
      } else {
        return { success: false };
      }
    } catch (ex) {
      console.log('ERROR! TasklistsDao - getAllTasklists threw an exception:', ex);
      return { success: false };
    }
  }

  async getSubmissionsInRange(shopName: any, fromDate: string, toDate: string, timezone: string) {
    const { getFromDate, getToDate, isDefault: isDefaultDate } = getDateRangeMomentOrCurrentMonth(fromDate, toDate, timezone);
    try {
      const where = {
        submittedAt: {
          [Op.between]: [getFromDate, getToDate]
        },
        shopName
      };
      const tasklistSubmissionsArray = await Models.tasklistsReceived.findAll({
        where,
        logging: false
      });
      const submissions = tasklistSubmissionsArray.map((submission: any) => submission.dataValues);
      if (submissions) {
        return { success: true, submissions, msg: 'get submissions OK', isDefaultDate };
      } else {
        return { success: false, msg: 'no submissions' };
      }
    } catch (ex) {
      console.log('ERROR! TasklistsDao - getSubmissionsInRangeByEmails threw an exception:', ex);
      return { success: false, msg: 'get submissions failed' };
    }
  }

  async getSubmissionsInRangeByEmails(shopName: any, fromDate: string, toDate: string, timezone: string, emails: string[]) {
    const { getFromDate, getToDate, isDefault: isDefaultDate } = getDateRangeMomentOrCurrentMonth(fromDate, toDate, timezone);
    try {
      const where = {
        submittedAt: {
          [Op.between]: [getFromDate, getToDate]
        },
        submitterEmail: emails,
        shopName
      };
      if (emails.length == 1 && toLower(emails[0]) == 'all') {
        delete where.submitterEmail; // to get all - don't filter on any emails
      }
      const tasklistSubmissionsArray = await Models.tasklistsReceived.findAll({
        where,
        logging: false
      });
      const submissions = tasklistSubmissionsArray.map((submission: any) => submission.dataValues);
      if (submissions) {
        return { success: true, submissions, msg: 'get submissions OK', isDefaultDate };
      } else {
        return { success: false, msg: 'no submissions' };
      }
    } catch (ex) {
      console.log('ERROR! TasklistsDao - getSubmissionsInRangeByEmails threw an exception:', ex);
      return { success: false, msg: 'get submissions failed' };
    }
  }

  async getDailySubmissionsByEmailAndShop(shopName: any, timezone: string, email: string) {
    try {
      const startOfDay = moment().tz(timezone).startOf('day');
      const endOfDay = moment().tz(timezone).endOf('day');
      const where = {
        submittedAt: {
          [Op.between]: [startOfDay, endOfDay]
        },
        submitterEmail: { [Op.iLike]: email },
        shopName
      };
      const tasklistSubmissionsArray = await Models.tasklistsReceived.findAll({
        where,
        logging: false
      });
      const submissions = tasklistSubmissionsArray.map((submission: any) => submission.dataValues);
      return { success: true, submissions, msg: 'get daily submissions OK' };
    } catch (ex) {
      console.log('ERROR! TasklistsDao - getDailySubmissionsByEmail threw an exception:', ex);
      return { success: false, msg: 'get daily submissions failed' };
    }
  }

  async getSubmissionsInRangeByLocationIds(shopName: any, fromDate: string, toDate: string, timezone: string, locationIds: string[]) {
    const { getFromDate, getToDate, isDefault: isDefaultDate } = getDateRangeMomentOrCurrentMonth(fromDate, toDate, timezone);
    try {
      const orConditions = [];
      for (let i = 0; i < locationIds.length; i++) {
        orConditions.push({ [Op.contains]: [{ id: locationIds[i] }] });
      }
      const where = {
        submittedAt: {
          [Op.between]: [getFromDate, getToDate]
        },
        location: {
          [Op.or]: orConditions
        },
        shopName
      };
      const tasklistSubmissionsArray = await Models.tasklistsReceived.findAll({
        where,
        logging: false
      });
      const submissions = tasklistSubmissionsArray.map((submission: any) => submission.dataValues);
      if (submissions) {
        return { success: true, submissions, msg: 'get submissions OK', isDefaultDate };
      } else {
        return { success: false, msg: 'no submissions' };
      }
    } catch (ex) {
      console.log('ERROR! TasklistsDao - getSubmissionsInRangeByLocationIds threw an exception:', ex);
      return { success: false, msg: 'get submissions failed' };
    }
  }
}
