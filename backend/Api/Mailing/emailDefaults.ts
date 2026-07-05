// common defaults
export const defaultPugVariables: any = {
  promotionalSite: 'managematereactdev.z13.web.core.windows.net/',
  appName: 'ManageMate',
  tutorialsLink: process.env.FRONTEND_BASE_DOMAIN + '/help', // TODO must put real link here
  serviceEmail: 'support@managemate.org' // support email to contact us
};

// Reset Password Email
export const resetEmailDefaultOptions: any = {
  from: process.env.INFO_EMAIL_USERNAME,
  subject: 'Reset Your ManageMate Password'
};
export const resetEmailPugPath = 'Api/Mailing/EmailTemplates/resetPassword.pug';

// Invite Staff / Employee Email
export const inviteStaffEmailDefaultOptions: any = {
  from: process.env.INFO_EMAIL_USERNAME,
  subject: 'Invitation to collaborate on ManageMate'
};
export const inviteStaffEmailPugPath = 'Api/Mailing/EmailTemplates/staffInvite.pug';

// Notify tasklist assigned Email
export const notifyTasklistAssignedEmailDefaultOptions: any = {
  from: process.env.INFO_EMAIL_USERNAME,
  subject: 'You have been assigned tasks'
};
export const notifyTasklistAssignedEmailPugPath = 'Api/Mailing/EmailTemplates/tasklistAssigned.pug';

// Post installation email
export const postInstallationEmailDefaultOptions: any = {
  from: process.env.INFO_EMAIL_USERNAME,
  subject: 'A Warm Welcome from ManageMate\'s CEO!'
};
export const postInstallationEmailPugPath = 'Api/Mailing/EmailTemplates/postInstallation.pug';

// Schedules
export const schedulesPublishedEmailDefaultOptions: any = {
  from: process.env.INFO_EMAIL_USERNAME
};
export const schedulesPublishedEmailPugPath = 'Api/Mailing/EmailTemplates/Schedules/schedulesPublished.pug';
// Timeoff Request
export const timeoffRequestEmailDefaultOptions: any = {
  from: process.env.INFO_EMAIL_USERNAME
};
export const timeoffRequestEmailPugPath = 'Api/Mailing/EmailTemplates/Schedules/timeoffRequest.pug';
// Timeoff Request Received
export const timeoffRequestReceivedEmailDefaultOptions: any = {
  from: process.env.INFO_EMAIL_USERNAME
};
export const timeoffRequestReceivedEmailPugPath = 'Api/Mailing/EmailTemplates/Schedules/timeoffRequestReceived.pug';
// Timeoff Request Approved
export const timeoffRequestApprovedEmailDefaultOptions: any = {
  from: process.env.INFO_EMAIL_USERNAME
};
export const timeoffRequestApprovedEmailPugPath = 'Api/Mailing/EmailTemplates/Schedules/timeoffRequestApproved.pug';
// Timeoff Request Declined
export const timeoffRequestDeclinedEmailDefaultOptions: any = {
  from: process.env.INFO_EMAIL_USERNAME
};
export const timeoffRequestDeclinedEmailPugPath = 'Api/Mailing/EmailTemplates/Schedules/timeoffRequestDeclined.pug';
// Demand Raised
export const demandRaisedEmailDefaultOptions: any = {
  from: process.env.INFO_EMAIL_USERNAME
};
export const demandRaisedEmailPugPath = 'Api/Mailing/EmailTemplates/Schedules/demandRaised.pug';
// Demand Accepted
export const demandAcceptedEmailDefaultOptions: any = {
  from: process.env.INFO_EMAIL_USERNAME
};
export const demandAcceptedEmailPugPath = 'Api/Mailing/EmailTemplates/Schedules/demandAccepted.pug';
// Trade Request
export const tradeRequestEmailDefaultOptions: any = {
  from: process.env.INFO_EMAIL_USERNAME
};
export const tradeRequestEmailPugPath = 'Api/Mailing/EmailTemplates/Schedules/tradeRequest.pug';
// Trade Accepted
export const tradeAcceptedEmailDefaultOptions: any = {
  from: process.env.INFO_EMAIL_USERNAME
};
export const tradeAcceptedEmailPugPath = 'Api/Mailing/EmailTemplates/Schedules/tradeAccepted.pug';
// Trade Declined
export const tradeDeclinedEmailDefaultOptions: any = {
  from: process.env.INFO_EMAIL_USERNAME
};
export const tradeDeclinedEmailPugPath = 'Api/Mailing/EmailTemplates/Schedules/tradeDeclined.pug';
