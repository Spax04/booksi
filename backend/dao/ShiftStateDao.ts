import { clean } from '../common';
const { Op } = require('@sequelize/core');
const Models = require('../db/models/');


export class ShiftStateDao {

  async getShiftStateByShopAndEmail(shopName: string, email: string) {
    try {
      const shiftStateData = await Models.shiftState.findOne({
        where: {
          shopName,
          email: { [Op.iLike]: email },
        },
        logging: false
      });
      // tslint:disable-next-line:no-null-keyword
      const shiftState = shiftStateData ? shiftStateData.dataValues : null;
      if (shiftState && shiftState.breaks && shiftState.breaks.length > 0) {
        shiftState.breaks = shiftState.breaks.sort((breakA: any, breakB: any) => breakA.index - breakB.index);
      }
      const started = shiftState && shiftState.start && !shiftState.end;
      return { success: true, shiftState, started };
    } catch (ex) {
      console.log('ERROR! getShiftStateByShopAndEmail threw an exception:', ex);
      return {success: false};
    }
  }

  async updateShiftStateByShopNameAndEmail(shopName: string, email: string, updateData: any) {
    try {
      await Models.shiftState.update(updateData, {
        where: {
          shopName,
          email: { [Op.iLike]: email },
        },
        logging: false
      });
      return { success: true };
    } catch (ex) {
      console.log('ERROR! updateShiftStateByShopNameAndEmail threw an exception:', ex);
      return {success: false};
    }
  }

  async createTestRecord(shopName: string, email: string, stateData: any) {
    try {
      await Models.shiftState.create({shopName, email, ...stateData}, {
        logging: false
      });
      return { success: true };
    } catch (ex) {
      console.log('ERROR! ShiftStateDao - createTestRecord threw an exception:', ex);
      return {success: false};
    }
  }
}
