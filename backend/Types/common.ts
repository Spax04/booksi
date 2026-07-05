import { IMGMTOKEN } from '../Api/Login/LoginService';

export interface IUserContact {
  name: string;
  email: string;
  avatarFile?: string;
  locale?: string;
}

export function extractIUserContactFromCtxToken(ctx: any): IUserContact {
  const token: IMGMTOKEN = ctx.mmtoken;
  const { email, userName: name, avatarFile, settings } = token;
  let locale = settings.ui && settings.ui.locale ? settings.ui.locale : 'en';
  locale = settings.locale ? settings.locale : locale;
  return { name, email, avatarFile, locale };
}

// default staff permission levels
export interface IPersonnelPermissions {
  permissionLevel?: string;
  visibility: {
    sheets: {
      view: boolean;
      salaryData: boolean;
    },
    team: {
      view: boolean;
      salaryData: boolean;
    },
    tasklists: {
      view: boolean;
    },
    schedules: {
      view: boolean;
      salaryData: boolean;
    },
    dashboard: {
      view: boolean,
    },
    payroll: {
      view: boolean,
    },
    commissionPlans: {
      view: boolean;
    },
    commissionSales: {
      view: boolean;
    },
    posClock: {
      view: boolean;
    },
    posSchedules: {
      view: boolean;
    },
    posDailyOrders: {
      view: boolean;
    },
    posWorkForce: {
      view: boolean;
    },
    posAdmin: {
      view: boolean;
    }
  };
  actions: {
    sheets: {
      manage: boolean;
    },
    team: {
      manage: boolean;
    },
    tasklists: {
      manage: boolean;
    },
    schedules: {
      manage: boolean;
    },
    timeoff: {
      manage: boolean;
    },
    payroll: {
      manage: boolean;
    },
    dashboard: {
      manage: boolean;
    },
    commissionPlans: {
      manage: boolean;
    },
    commissionSales: {
      manage: boolean;
    },
    posClock: {
      manage: boolean;
    },
    posSchedules: {
      manage: boolean;
    },
    posDailyOrders: {
      manage: boolean;
    },
    posWorkForce: {
      manage: boolean;
    },
    posAdmin: {
      manage: boolean;
    }
  };
}

export function extractIPersonnelPermissionsFromCtxToken(ctx: any): IPersonnelPermissions {
  const token: IMGMTOKEN = ctx.mmtoken;
  const { permissions } = token;
  const { permissionLevel, actions, visibility } = permissions;
  return { permissionLevel, actions, visibility };
}

export function extractUserDataFromCtxToken(ctx: any) {
  const token: IMGMTOKEN = ctx.mmtoken;
  const { permissions, email, userName: name, avatarFile, settings } = token;
  const { permissionLevel, actions, visibility } = permissions;
  const locale = settings.ui.locale;
  return { name, email, avatarFile, locale, permissionLevel, actions, visibility };
}

export interface IUserPhone {
  formatInternational: string;
  isPossible?: boolean;
  type?: string;
  uri?: string;
  rfc3966?: string;
  e164: string;
  countryCode: string;
  isValid: boolean;
}

export interface IShopLocation {
  id: number;
  name: string;
}
