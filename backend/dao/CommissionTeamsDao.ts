import { ICommissionPlan } from './CommissionPlansDao';
const { Op } = require('@sequelize/core');
const Models = require('../db/models/');

export interface ICommissionTeam {
  id: number;
  shopName: string;
  teamName: string;
  members: Array<{name: string, email: string, avatarFile?: string, locale: string, shopifyId: string }>; // [{name, email, avatarFile?, locale, shopifyId}]
  commissionPlan: ICommissionPlan;
  commissionModel: ICommissionModel;
  locationTag: { name: string, id: string }; // only for display
}

export interface ICommissionModel {
  compensation: string; // 'split', 'duplicate', 'team steps',
  goalsBase?: string; // 'location', 'team'
  baseLocation?: {
    id: string, name: string
  };
}


export class CommissionTeamsDao {

  async getAllCommissionTeamsByShopName(shopName: string) {
    try {
      const commissionTeamsArray = await Models.commissionTeams.findAll({ where: { shopName }, logging: false });
      const commissionTeams: ICommissionTeam[] = commissionTeamsArray.map((commissionTeam: any) => commissionTeam.dataValues);
      return { success: true, commissionTeams };
    } catch (ex) {
      console.log('ERROR! CommissionTeamsDao - getAllCommissionTeamsByShopName threw an exception:', ex);
      return { success: false };
    }
  }

  async getCommissionTeamById(teamId: number) {
    try {
      const commissionTeam = await Models.commissionTeams.findOne({ where: { id: teamId }, logging: false });
      if (commissionTeam) {
        return { success: true, commissionTeam };
      } else {
        return { success: false };
      }
    } catch (ex) {
      console.log('ERROR! CommissionTeamsDao - getCommissionTeamById threw an exception:', ex);
      return { success: false };
    }
  }

  async getCommissionTeamsByMemberEmails(shopName: string, memberEmails: string[]) {
    try {
      const orConditions = [];
      for (let i = 0; i < memberEmails.length; i++) {
        orConditions.push({ [Op.contains]: [{ email: memberEmails[i] }] });
      }
      const commissionTeamsArray = await Models.commissionTeams.findAll({
        where: {
          shopName,
          members: {
            [Op.or]: orConditions
          }
        },
        logging: false
      });
      const commissionTeams = commissionTeamsArray.map((commissionTeam: any) => commissionTeam.dataValues);
      return {success: true, msg: 'getCommissionTeamsByMemberEmails OK', commissionTeams};
    } catch (ex) {
      console.log('ERROR! getCommissionTeamsByMemberEmails threw an exception', shopName, memberEmails, ex);
      return {success: false, msg: 'getCommissionTeamsByMemberEmails failed'};
    }
  }
}
