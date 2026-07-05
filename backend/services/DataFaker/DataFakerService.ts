import { DashboardDataFaker } from '../../Api/Dashboard/DashboardDataFaker';
import { SheetsDataFaker } from '../../Api/Sheets/SheetsDataFaker';
import { SchedulesDataFaker } from '../../Api/Schedules/SchedulesDataFaker';
import { TasklistsDataFaker } from '../../Api/Tasks/TasklistsDataFaker';
import { AttributedOrdersDataFaker } from '../../Api/Orders/AttributedOrdersDataFaker';
import { TeamDataFaker } from '../../Api/Team/TeamDataFaker';
import { DashboardService } from '../../Api/Dashboard/DashboardService';
const Models = require('../../db/models/');

export class DataFakerService {
   /*
   IMPORTANT!!
   ALL FAKERS ASSUME PERSONNEL EXISTS AND TASKLISTS EXIST, FAKE THEM BEFORE FAKING OTHER DATA!!!
   * */


  // Fake All Data
  async generateFakeDataForShop(shopName: string, cleanup: boolean = true) {
    try {
      await this.generateFakePersonnelForShop(shopName, cleanup);
      await this.generateFakeTasklistsForShop(shopName, cleanup);
      await this.generateFakeTasklistsSubmissionsToDB(shopName, 'Universal', 4, true, cleanup);
      await this.generateFakeShiftsToDB(shopName, 'Universal', 4, true, cleanup);
      await this.generateFakeSchedulesToDB(shopName, 'Universal', 4, 2, true, cleanup);
      await this.generateFakeAttributedOrdersToDB(shopName, 'Universal', 4, true, cleanup);
      if (cleanup) {
        await Models.aggregatedMonthlyData.destroy({where: {shopName}});
      }
      await new DashboardService().aggregatePreviousMonthsToDB(shopName, 'Universal', 4);
    } catch (ex) {
      console.log('ERROR! generateFakeDataForShop threw an exception', ex);
      return { success: false, msg: 'generateFakeDataForShop failed!' };
    }
  }

  // Fake Personnel Data
  async generateFakePersonnelForShop(shopName: string, cleanup: boolean = false) {
    try {
      await new TeamDataFaker().generateFakePersonnelForShop(shopName, cleanup);
    } catch (ex) {
      console.log('ERROR! aggregatePreviousYearToDB threw an exception', ex);
      return { success: false, msg: 'aggregatePreviousYearToDB failed!' };
    }
  }

  // // Fake Dashboard Data
  // async aggregateFakePreviousYearToDB(shopName: string, timezone: string) {
  //   try {
  //     const {success, msg} = await new DashboardDataFaker().aggregateFakePreviousMonthsToDB(shopName, timezone, 12);
  //     return { success, msg };
  //   } catch (ex) {
  //     console.log('ERROR! aggregatePreviousYearToDB threw an exception', ex);
  //     return { success: false, msg: 'aggregatePreviousYearToDB failed!' };
  //   }
  // }

  // Fake Sheets Data
  async generateFakeShiftsToDB(shopName: string, timezone: string, previousMonthsCount: number = 3, generateCurrentMonth: boolean = false, cleanPreviousData: boolean = false) {
    try {
      const {success, msg} = await new SheetsDataFaker().generateFakePreviousMonthsToDB(shopName, timezone, previousMonthsCount, generateCurrentMonth, cleanPreviousData);
      return { success, msg };
    } catch (ex) {
      console.log('ERROR! generateFakeShiftsToDB - generateFakePreviousMonthsToDB threw an exception', ex);
      return { success: false, msg: 'generateFakeShiftsToDB - generateFakePreviousMonthsToDB failed!' };
    }
  }

  // Fake Schedules Data
  async generateFakeSchedulesToDB(shopName: string, timezone: string, previousMonthsCount: number = 3, nextMonthsCount: number = 3, generateCurrentMonth: boolean = false, cleanPreviousData: boolean = false) {
    try {
      const {success, msg} = await new SchedulesDataFaker().generateFakeMonthsToDB(shopName, timezone, previousMonthsCount, nextMonthsCount, generateCurrentMonth, cleanPreviousData);
      return { success, msg };
    } catch (ex) {
      console.log('ERROR! aggregatePreviousYearToDB threw an exception', ex);
      return { success: false, msg: 'aggregatePreviousYearToDB failed!' };
    }
  }
  // Fake Tasklists
  async generateFakeTasklistsForShop(shopName: string, cleanup: boolean = false) {
    try {
      await new TasklistsDataFaker().generateFakeTasklistsForShop(shopName, cleanup);
    } catch (ex) {
      console.log('ERROR! generateFakeTasklistsForShop threw an exception', ex);
      return { success: false, msg: 'generateFakeTasklistsForShop failed!' };
    }
  }
  // Fake Tasklists Data
  async generateFakeTasklistsSubmissionsToDB(shopName: string, timezone: string, previousMonthsCount: number = 3, generateCurrentMonth: boolean = false, cleanPreviousData: boolean = false) {
    try {
      const {success, msg} = await new TasklistsDataFaker().generateFakePreviousMonthsToDB(shopName, timezone, previousMonthsCount, generateCurrentMonth, cleanPreviousData);
      return { success, msg };
    } catch (ex) {
      console.log('ERROR! generateFakeTasklistsSubmissionsToDB threw an exception', ex);
      return { success: false, msg: 'generateFakeTasklistsSubmissionsToDB failed!' };
    }
  }

  // Fake AttributedOrders Data
  async generateFakeAttributedOrdersToDB(shopName: string, timezone: string, previousMonthsCount: number = 3, generateCurrentMonth: boolean = false, cleanPreviousData: boolean = false) {
    try {
      const {success, msg} = await new AttributedOrdersDataFaker().generateFakePreviousMonthsToDB(shopName, timezone, previousMonthsCount, generateCurrentMonth, cleanPreviousData);
      return { success, msg };
    } catch (ex) {
      console.log('ERROR! aggregatePreviousYearToDB threw an exception', ex);
      return { success: false, msg: 'aggregatePreviousYearToDB failed!' };
    }
  }
}
