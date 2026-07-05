import { DiscordService, maintenanceUserName } from '../Discord/DiscordService';
const moment = require('moment-timezone');
const Models = require('../../db/models');
const { Op } = require('@sequelize/core');

interface IEnforceRetention {
  success: boolean;
  msg?: string;
  results?: Array<{ name: string; records: number }>;
}

const MAX_RETENTION_PERIOD = '24';
const MIN_RETENTION_PERIOD = '2';
const YEAR_IN_MONTHS = '12';
const QUARTER_IN_WEEKS = '14';

const ENFORCE_RETENTION_TABLES = [
  { tableName: 'tasklistsReceived', timeField: 'submittedAt', retentionPeriod: YEAR_IN_MONTHS },
  { tableName: 'schedules', timeField: 'start', retentionPeriod: MAX_RETENTION_PERIOD },
  { tableName: 'shifts', timeField: 'start', retentionPeriod: MAX_RETENTION_PERIOD }
];

const RETENTION_ACTION_PER_ENV: { [key: string]: string } = {
  production: 'destroy',
  development: 'count',
  staging: 'count'
};
const utilsChannel = process.env.DISCORD_CHANNEL_UTILS_P;

export class MaintenanceService {
  async enforceRetention(): Promise<IEnforceRetention> {
    await new DiscordService().sendGeneralTextNotificationToDiscordChannel(utilsChannel, 'Retention Enforcement Started', {}, maintenanceUserName);
    const results = [];
    try {
    for (const key in ENFORCE_RETENTION_TABLES) {
      const pastDate = moment().subtract(ENFORCE_RETENTION_TABLES[key].retentionPeriod, 'months').format('YYYY-MM-DD HH:mm:ss.SSS Z');
      const retentionActionPerEnv = RETENTION_ACTION_PER_ENV[process.env.NODE_ENV];
      const records = await Models[ENFORCE_RETENTION_TABLES[key].tableName][retentionActionPerEnv || 'count']({ where: { [ENFORCE_RETENTION_TABLES[key].timeField]: { [Op.lt]: pastDate } } });
      results.push({ name: ENFORCE_RETENTION_TABLES[key].tableName, records });
    }
    const deleteSchedulesDemandsResult = await this.removeScheduleDemands();
    results.push(deleteSchedulesDemandsResult);
    const deleteSchedulesTradesResult = await this.removeScheduleTrades();
    results.push(deleteSchedulesTradesResult);
    const deleteSchedulesTimeoffsResult = await this.removeScheduleTimeoffs();
    results.push(deleteSchedulesTimeoffsResult);
    await new DiscordService().sendEnforceRetentionReport(results);
    return { success: true, results };
    } catch (ex) {
      console.log(`ERROR! MaintenanceService - enforceRetention threw an exception! ${ex}`);
      await new DiscordService().sendErrorNotificationToDiscordChannel(utilsChannel, 'enforceRetention threw an exception', {ex}, maintenanceUserName);
      return { success: false, msg: `ERROR! MaintenanceService threw an exception! ${ex}` };
    }
  }

  async removeScheduleDemands() {
    const retentionActionPerEnv = RETENTION_ACTION_PER_ENV[process.env.NODE_ENV];
    const pastDate = moment().subtract(MIN_RETENTION_PERIOD, 'months').format('YYYY-MM-DD HH:mm:ss.SSS Z');
    const records = await Models.schedules[retentionActionPerEnv || 'count']({where:{type: 'Demand', start: { [Op.lt]: pastDate }}});
    return {name: 'schedules[Demand]', records};
  }
  async removeScheduleTrades() {
    const retentionActionPerEnv = RETENTION_ACTION_PER_ENV[process.env.NODE_ENV];
    const pastDate = moment().subtract(MIN_RETENTION_PERIOD, 'weeks').format('YYYY-MM-DD HH:mm:ss.SSS Z');
    const records = await Models.schedulesTrades[retentionActionPerEnv || 'count']({where:{
      [Op.or]: [
        { tradedStart: { [Op.lt]: pastDate } },
        { requestedStart: { [Op.lt]: pastDate } }
      ]}});
    return {name: 'schedules[Trades]', records};
  }
  async removeScheduleTimeoffs() {
    const retentionActionPerEnv = RETENTION_ACTION_PER_ENV[process.env.NODE_ENV];
    // all unapproved requests for periods that has start/end older than 14 weeks (even if approved the start/end date has already passed)
    let pastDate = moment().subtract(QUARTER_IN_WEEKS, 'weeks').format('YYYY-MM-DD HH:mm:ss.SSS Z');
    let records = await Models.schedulesTimeoffs[retentionActionPerEnv || 'count']({where:{
        approved: false,
        [Op.or]: [
          { start: { [Op.lt]: pastDate } },
          { end: { [Op.lt]: pastDate } }
        ]}});
    // everything older than 2 years
    pastDate = moment().subtract(MAX_RETENTION_PERIOD, 'months').format('YYYY-MM-DD HH:mm:ss.SSS Z');
    records += await Models.schedulesTimeoffs[retentionActionPerEnv || 'count']({where:{
        [Op.or]: [
          { createdAt: { [Op.lt]: pastDate } },
        ]}});
    return {name: 'schedules[Timeoffs]', records};
  }
  async removeDevSubscriptions() { // TODO
    const pastDate = moment().subtract(3, 'months').format('YYYY-MM-DD HH:mm:ss.SSS Z');
    const subs = await Models.subscriptions.findAll({where:{isDev: true, installedAt: { [Op.lt]: pastDate }}});
    for (let i = 0; i < subs.length; i++) {
      // await new InstallationService().unInstall();
    }
  }
}
