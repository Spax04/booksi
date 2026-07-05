import { IAggregatedDataFromDB, IAggregatedMonthlyData } from '../Api/Dashboard/DashboardService';
const Models = require('../db/models/');


export class DashboardDao {

  async getAggregatedDataByShopName(shopName: string): Promise<{success: boolean, aggregatedMonthlyData?: IAggregatedMonthlyData[]}> {
    try {
      const aggregatedDataArray: IAggregatedDataFromDB[] = await Models.aggregatedMonthlyData.findAll({ where: { shopName }, logging: false });
      const aggregatedMonthlyData = aggregatedDataArray.map((monthlyData: any) => this.parseDBData(monthlyData.dataValues));
      return {success: true, aggregatedMonthlyData};
    } catch (ex) {
      console.log('ERROR! DashboardDao - getAggregatedDataByShopName threw an exception', ex);
      return {success: false};
    }
  }

  async getAggregatedDataByShopNameAndMonthYears(shopName: string, monthsToGet: string[]): Promise<{success: boolean, aggregatedMonthlyData?: IAggregatedMonthlyData[]}> {
    try {
      const aggregatedDataArray: IAggregatedDataFromDB[] = await Models.aggregatedMonthlyData.findAll({ where: { shopName, monthYear: monthsToGet}, logging: false });
      const aggregatedMonthlyData = aggregatedDataArray.map((monthlyData: any) => this.parseDBData(monthlyData.dataValues));
      return {success: true, aggregatedMonthlyData};
    } catch (ex) {
      console.log('ERROR! DashboardDao - getAggregatedDataByShopNameAndMonthYears threw an exception', ex);
      return {success: false};
    }
  }
 parseDBData(dbRecord: IAggregatedDataFromDB): IAggregatedMonthlyData {
   return {
   monthYear: dbRecord.monthYear,
   monthName: dbRecord.monthName,
   year: dbRecord.year,
   monthStart: dbRecord.monthStart,
   monthEnd: dbRecord.monthEnd,
   sheets: {
     shifts: dbRecord.shifts,
     hoursWorked: dbRecord.hoursWorked,
     hoursCost: dbRecord.hoursCost,
     employeeCount: dbRecord.employeeCount
   },
   orders: {
     ordersCount: dbRecord.ordersCount,
     productsCount: dbRecord.productsCount,
     salesTotal: dbRecord.salesTotal,
     salesByLocationId: dbRecord.salesByLocationId,
     salesByEmployee: dbRecord.salesByEmployee
   },
   transactions: {
     positiveTransactionsCount: dbRecord.positiveTransactionsCount,
     negativeTransactionsCount: dbRecord.negativeTransactionsCount,
     saleTransactions: dbRecord.saleTransactions,
     refundTransactions: dbRecord.refundTransactions,
     subtotalTransactions: dbRecord.subtotalTransactions,
     incomeByPaymentMethod: dbRecord.incomeByPaymentMethod,
     incomeByCurrency: dbRecord.incomeByCurrency
   }
 };
 }
}
