const { Op } = require('@sequelize/core');
const moment = require('moment-timezone');

const Models = require('../db/models/');


export class SchedulesTradesDao {

  async getTradeById(shopName: string, tradeId: number) {
    try {
      const trade = await Models.schedulesTrades.findOne({where:{shopName, id: tradeId}, logging: false});
      if (trade) {
        return {success: true, trade};
      } else {
        return {success: false};
      }
    } catch (ex) {
      console.log('ERROR! getTradeById threw an exception', ex);
      return {success: false};
    }
  }

  async createNewTradeRequest(shopName: string, creator: any, receiver: any, tradedShift: any, requestedShift: any) {
    try {
      const createdAt = moment(); // now
      const newTradeRequest = {
        shopName,
        status: 'Pending',
        createdAt,
        creatorName: creator.name,
        creatorEmail: creator.email,
        receiverName: receiver.name,
        receiverEmail: receiver.email,
        creatorNote: '',
        tradedShiftId: tradedShift.id,
        tradedStart: tradedShift.start,
        tradedEnd: tradedShift.end,
        tradedTimezone: tradedShift.timezone,
        tradedTimeInSeconds: tradedShift.timeInSeconds,
        tradedLocation: tradedShift.location,
        requestedShiftId: tradedShift.id,
        requestedStart: tradedShift.start,
        requestedEnd: tradedShift.end,
        requestedTimezone: tradedShift.timezone,
        requestedTimeInSeconds: tradedShift.timeInSeconds,
        requestedLocation: tradedShift.location,
      };
      await Models.schedulesTrades.create(newTradeRequest);
      return { success: true };
    } catch (ex) {
      console.log('ERROR! getSchedulesInDateRangeByShopNameAndEmail threw an exception:', ex);
      return {success: false};
    }
  }

  async deleteSchedulesTradeRequestById(shopName: string, tradeRequestId: any, email: string) {
    try {
      const {success: getTradeByIdSuccess, trade} = await this.getTradeById(shopName, tradeRequestId);
      if (!getTradeByIdSuccess) {
        return {success: false, msg: 'no timeoff request found for this id'};
      }
      if (trade.email == email) {
        return {success: false, msg: 'cant only delete your own requests'};
      }
      if (trade.status != 'Pending') {
        return {success: false, msg: 'cant delete request after it has been answered'};
      }
      const numAffectedRows = await Models.schedulesTrades.destroy({
        where: {
          shopName,
          id: tradeRequestId
        }
      });
      return {success: true, msg: 'deleted ' + numAffectedRows + ' records'};
    } catch (ex) {
      console.log('ERROR! deleteSchedulesTradeRequestById threw an exception', ex);
      return {success: false, msg: 'deleteSchedulesTradeRequestById failed'};
    }
  }

  async deleteSchedulesTradesByIds(shopName: string, tradeRequestIds: any) {
    try {
      const numAffectedRows = await Models.schedulesTrades.destroy({
        where: {
          shopName,
          id: tradeRequestIds
        }
      });
      return {success: true, msg: 'deleted ' + numAffectedRows + ' records'};
    } catch (ex) {
      console.log('ERROR! deleteSchedulesTradeRequestByIds threw an exception', ex);
      return {success: false, msg: 'deleteSchedulesTradeRequestByIds failed'};
    }
  }

  async deleteSchedulesTradeRequestBySchedulesIds(shopName: string, schedulesIds: any) {
    try {
      const numAffectedRows = await Models.schedulesTrades.destroy({
        where: {
          shopName,
          [Op.or]: [
            { tradedShiftId: schedulesIds },
            { requestedShiftId: schedulesIds }
          ]
        }
      });
      return {success: true, msg: 'deleted ' + numAffectedRows + ' records'};
    } catch (ex) {
      console.log('ERROR! deleteSchedulesTradeRequestByIds threw an exception', ex);
      return {success: false, msg: 'deleteSchedulesTradeRequestByIds failed'};
    }
  }

  async getSchedulesTradesByShopNameAndEmail(shopName: any, email: string) {
    try {
      const schedulesTradesArray = await Models.schedulesTrades.findAll({
        where: {
          shopName,
          [Op.or]: [
            { creatorEmail: { [Op.iLike]: email } },
            { receiverEmail: { [Op.iLike]: email } }
          ]
        },
        logging: false
      });
      const schedulesTrades = schedulesTradesArray.map((schedule: any) => schedule.dataValues);
      return { success: true, tradeRequests: schedulesTrades };
    } catch (ex) {
      console.log('ERROR! getSchedulesTradesByShopNameAndEmail threw an exception:', ex);
      return {success: false};
    }
  }

}
