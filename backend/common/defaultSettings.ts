import { IPersonnelPermissions } from '../Types/common';

export interface IShopSettings { // TODO make all mandatory (add defaults and fix usages if needed)
    payroll: {
      weekStart: string; // 'sunday', 'monday'
      defaultProvider?: string; // one of our providers
      integrations?: any;
    };
    tasks: {
    };
    sheets: {
    };
    clock: {
      enforceBreaksLimit: boolean;
      maxBreaks: number;
    };
    schedules: {
      weekStart: string; // 'sunday', 'monday'
      timeoff: {
        enforceYearlyLimit: boolean;
        notifyRequests: {
          managers: boolean;
          admins: boolean;
        }
      }
    };
}
export interface IPreferences {
  shopName?: string;
  updatedAt?: Date;
  settings: IShopSettings;
  employeePermissions: IPersonnelPermissions;
  managerPermissions: IPersonnelPermissions;
  adminPermissions: IPersonnelPermissions;
}