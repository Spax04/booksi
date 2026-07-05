export const baseApplicationCharge = {
  price: 0.00,
  trial_days: process.env.APP_TRIAL_DAYS
};
export const mgmFreeLicenseCharge = {
  name: 'ManageMate Free Plan',
  terms: 'Free for one team member',
  pricePerEmployee: 0.0,
  capped_amount: 0.0,
  team_cap: 1
};
export const mgmLiteLicenseCharge = {
  name: 'ManageMate Lite Plan',
  terms: '$1.99 Per team member - up to 20 members',
  pricePerEmployee: 1.99,
  capped_amount: 199.0,
  team_cap: 20
};
export const mgmStandardLicenseCharge = {
  name: 'ManageMate Standard Plan',
  terms: '$3.99 Per team member',
  pricePerEmployee: 3.99,
  capped_amount: 399.0,
  team_cap: 100
};
export const mgmProfessionalLicenseCharge = {
  name: 'ManageMate Professional Plan',
  terms: '10$ Base + $4.99 Per team member',
  pricePerEmployee: 4.99,
  capped_amount: 520.0,
  team_cap: 100
};
export const mgmCustomLicenseCharge = {
  name: 'ManageMate Custom Plan',
  terms: '$3.99 Per team member',
  pricePerEmployee: 3.99,
  capped_amount: 399.0,
  team_cap: 100
};
