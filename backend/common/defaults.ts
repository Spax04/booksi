

export const installation_defaultSubscriptionData: any = {
  installation: {}, // TODO not sure this is needed
  installationStatus: 'onboarding',
  subscribed: true,
  chargeStatus: 'active',
  inTrial: true,
  pricePerMonth: 0.00,
  nextRefund: 0.00,
  chargePer: 'Employee',
  license: { managemate: true },
  unInstalled: false
};

// default personnel data
export const installation_defaultOwnerPersonnelData: any = {
  position: 'Owner',
  department: 'Management',
  permissionLevel: 'Admin',
  status: 'Active',
  paymentAmount: 0.0,
  paymentType: 'Hourly Wage',
  paymentCurrencyId: 2,
  locations: [{name: 'Back Office', id: 1}],
  timeoffLimit: 0,
  sickLeaveLimit: 0,
  locale: 'en'
};

export const installation_defaultCurrentPersonnelStatus: string = 'inActive';

export const mailRegister_defaultNewStaffPersonnelData: any = {
  permissionLevel: 'Employee',
  department: 'Staff',
  position: 'Staff',
  status: 'Pending',
  paymentAmount: 0.0,
  paymentType: 'Hourly Wage',
  paymentCurrencyId: 2,
  locations: [{name: 'Back Office', id: 1}],
  shopName: '',
  timeoffLimit: 0,
  sickLeaveLimit: 0,
  locale: 'en'
};

export const personnelPermissions: string[] = ['Employee', 'Manager', 'Admin'];

// default user data
export const defaultUserSettings: any = {
  ui: {
    theme: 'light'
  }
};

export const installation_defaultOwnerUserData: any = {
  settings: defaultUserSettings
};

export const defaultNewStaffUserData: any = {
  settings: defaultUserSettings,
  ownedShops: []
};

// default admin data
export const adminPermissions: string[] = ['cs', 'qa'];
