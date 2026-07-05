import { IGustoIPersonnelIntegrationsData } from '../Api/Payroll/PayrollService';
const Models = require('../db/models/');

export class GustoPersonnelIntegrationsDao {

  async getGustoPersonnelIntegrationsDataByShopName(shopName: string) {
    try {
      const personnelIntegrationData = await Models.gustoPersonnelIntegration.findAll({ where: { shopName }, attributes: ['email', 'ssn', 'gusto_employee_id'], logging: false });
      const gustoIntegrationData = personnelIntegrationData.map((accessToken: any) => accessToken.dataValues);
      return {success: true, gustoIntegrationData};
    } catch (ex) {
      console.log('ERROR! GustoPersonnelIntegrationsDao - getGustoPersonnelIntegrationsDataByShopName threw an exception', ex);
      return {success: false};
    }
  }

  async updatePersonnelIntegrationData(shopName: string, integrationData: IGustoIPersonnelIntegrationsData[]) {
    try {
      const updateRequests = [];
      for (let i = 0; i < integrationData.length; i++) {
        const personnelIntegrationData = integrationData[i];
        const {email, ssn, gusto_employee_id} = personnelIntegrationData;
        updateRequests.push(Models.gustoPersonnelIntegration.upsert({ssn, gusto_employee_id, shopName, email}, {logging: false}));
      }
      await Promise.allSettled(updateRequests);
      return {success: true, msg: 'update OK'};
    } catch (ex) {
      console.log('ERROR! GustoPersonnelIntegrationsDao - updatePersonnelIntegrationData threw an exception', ex);
      return {success: false};
    }
  }
}
