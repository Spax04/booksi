import {
  defaultPugVariables,
  demandAcceptedEmailDefaultOptions,
  demandAcceptedEmailPugPath,
  demandRaisedEmailDefaultOptions,
  demandRaisedEmailPugPath,
  inviteStaffEmailDefaultOptions,
  inviteStaffEmailPugPath,
  notifyTasklistAssignedEmailDefaultOptions,
  notifyTasklistAssignedEmailPugPath,
  postInstallationEmailDefaultOptions,
  postInstallationEmailPugPath,
  resetEmailDefaultOptions,
  resetEmailPugPath, schedulesPublishedEmailDefaultOptions, schedulesPublishedEmailPugPath,
  timeoffRequestApprovedEmailDefaultOptions,
  timeoffRequestApprovedEmailPugPath,
  timeoffRequestDeclinedEmailDefaultOptions, timeoffRequestDeclinedEmailPugPath,
  timeoffRequestEmailDefaultOptions,
  timeoffRequestEmailPugPath,
  timeoffRequestReceivedEmailDefaultOptions,
  timeoffRequestReceivedEmailPugPath,
  tradeAcceptedEmailDefaultOptions,
  tradeAcceptedEmailPugPath,
  tradeDeclinedEmailDefaultOptions,
  tradeDeclinedEmailPugPath,
  tradeRequestEmailDefaultOptions,
  tradeRequestEmailPugPath
} from './emailDefaults';
import { IUserContact } from '../../Types/common';

const nodemailer = require('nodemailer');
const pug = require('pug');
const i18n = require('i18n');
const moment = require('moment-timezone');

interface IEmailOptions {
  to: string;
  subject: string;
  text?: string;
  alternatives?: Array<string>;
  from?: string;
  html: string;
}
let infoTransporter: any;
try {
  infoTransporter = nodemailer.createTransport({
    service: 'gmail',
    secure: false,
    auth: {
      user: process.env.INFO_EMAIL_USERNAME,
      pass: process.env.INFO_EMAIL_PASSWORD,
    },
  });
} catch (ex) {
  console.log('SEVERE ERROR! MailingService - infoTransporter init threw an exception:', ex);
}

export class MailingService {

  async sendInfoEmail(from: string, to: string, subject: string, text: string, pugPath: string, pugVariables: any) {
    try {
      const email: IEmailOptions = {
        from, to, subject, text, html: this.renderPugFileWithI18nUtil(pugPath, { ...defaultPugVariables, ...pugVariables })
      };
      infoTransporter.sendMail(email);
      return { success: true, msg: 'sendInfoEmail OK'};
    } catch (ex) {
      console.log('ERROR! MailingService - sendInfoEmail threw an exception:', ex);
      return { success: false, msg: 'sendInfoEmail failed!' };
    }
  }

  // Team, locale done
  async sendInviteEmail(invitorName: string, inviteeName: string, shopName: string, inviteeEmail: string, inviteKey: string, locale: string = 'en') {
    const [inviteeFirstName] = inviteeName.split(' ');

    try {
      const registrationLink = process.env.FRONTEND_BASE_DOMAIN + '/register?inviteKey=' + inviteKey;
      console.log('sendInviteEmail', {shopName, inviteeEmail, registrationLink});
      console.log('registrationLink', registrationLink);
      const inviteEmail: IEmailOptions = {
        ...inviteStaffEmailDefaultOptions,
        subject: `${i18n.__({ phrase: 'welcomeToMgm', locale })}, ${inviteeFirstName} – ${i18n.__({ phrase: 'yourJourneyBeginsHere', locale })}`,
        to: inviteeEmail,
        registrationLink,
        html: this.renderPugFileWithI18nUtil(inviteStaffEmailPugPath, { ...defaultPugVariables, invitorName, inviteeFirstName, shopName, registrationLink, locale })
      };
      infoTransporter.sendMail(inviteEmail);
      return { success: true, msg: 'sendInviteEmail OK'};
    } catch (ex) {
      console.log('ERROR! MailingService - sendInviteEmail threw an exception:', ex);
      return { success: false, msg: 'sendInviteEmail failed!' };
    }
  }

  // Login, mail updated, locale done
  async sendResetPasswordEmail(userName: string, email: string, link: any, locale: string = 'en') {
    const [firstName] = userName.split(' ');

    try {
      const resetEmail: IEmailOptions = {
        ...resetEmailDefaultOptions,
        subject: `${i18n.__({ phrase: 'quickReset', locale })}, ${firstName} - ${i18n.__({ phrase: 'yourManageMateAccountAwaits', locale })}`,
        to: email,
        html: this.renderPugFileWithI18nUtil(resetEmailPugPath, { ...defaultPugVariables, firstName, link, locale })
      };
      infoTransporter.sendMail(resetEmail);
      return { success: true, msg: 'sendResetPasswordEmail OK'};
    } catch (ex) {
      console.log('ERROR! MailingService - sendResetPasswordEmail threw an exception:', { userName, email, link, locale });
      return { success: false, msg: 'sendResetPasswordEmail failed!' };
    }
  }

  // Tasklists, locale done
  async sendTasklistAssignedEmailNotification(shopName: string, assigneeEmail: string, assigneeName: string, creatorName: string, title: string, description: string, isDated: boolean, date: string, timezone: string, locale: string = 'en') {
    try {
      const notificationEmail: IEmailOptions = {
        ...notifyTasklistAssignedEmailDefaultOptions,
        to: assigneeEmail,
        html: this.renderPugFileWithI18nUtil(notifyTasklistAssignedEmailPugPath, {
          ...defaultPugVariables,
          shopName,
          userName: assigneeName,
          creatorName,
          title,
          description,
          isDated,
          date: this.formatMomentStringToTimeString(date, timezone),
          locale
        })
      };
      infoTransporter.sendMail(notificationEmail);
      return { success: true, msg: 'sendTasklistAssignedEmailNotification OK'};
    } catch (ex) {
      console.log('ERROR! MailingService - sendTasklistAssignedEmailNotification threw an exception:', { shopName, assigneeEmail, creatorName, locale });
      return { success: false, msg: 'sendTasklistAssignedEmailNotification failed!' };
    }
  }

  // Installation, locale done
  async sendPostInstallationEmail(shopName: string, ownerName: string, ownerEmail: string, locale: string = 'en') {
    try {
      const postInstallationEmail: IEmailOptions = {
        ...postInstallationEmailDefaultOptions,
        subject: `A Warm Welcome from ManageMate's CEO!`,
        to: ownerEmail,
        html: this.renderPugFileWithI18nUtil(postInstallationEmailPugPath, {
          ...defaultPugVariables,
          shopName,
          trialdays: process.env.APP_TRIAL_DAYS,
          userName: ownerName,
          locale
        })
      };
      infoTransporter.sendMail(postInstallationEmail);
      return { success: true, msg: 'sendPostInstallationEmail OK'};
    } catch (ex) {
      console.log('ERROR! MailingService - sendPostInstallationEmail threw an exception:', { shopName, ownerName, ownerEmail, locale });
      return { success: false, msg: 'sendPostInstallationEmail failed!' };
    }
  }

  // schedules, locale done
  async sendSchedulesPublishedEmail(shopName: string, creator: any, receiverEmail: string, schedules: any, locale: string = 'en') {
    try {
      let schedulesLink = `${process.env.FRONTEND_BASE_DOMAIN}/?goTo=schedules`;
      if (schedules && schedules.length > 0) {
        schedulesLink += `&from=${schedules[0].start}`;
      }
      console.log('sendSchedulesPublishedEmail - shopName, creator, receiverEmail, schedules, locale, schedulesLink', shopName, creator, receiverEmail, schedules, locale, schedulesLink);
      try {
        schedules = schedules.map((schedule: any) => ({
          ...schedule,
          start: this.formatMomentStringToTimeString(schedule.start, schedule.timezone),
          end: this.formatMomentStringToTimeString(schedule.end, schedule.timezone),
          breaks: schedule.breaks.map((breakData: any) => ({
            ...breakData,
            breakStart: this.formatMomentStringToTimeString(breakData.breakStart, schedule.timezone),
            breakEnd: this.formatMomentStringToTimeString(breakData.breakEnd, schedule.timezone),
          }))
        }));
      } catch (ex) {
        console.log('ERROR! sendSchedulesPublishedEmail - failed to formatMomentStringToTimeString!', schedules);
      }
      const schedulesPublishedEmail: IEmailOptions = {
        ...schedulesPublishedEmailDefaultOptions,
        subject: i18n.__({ phrase: 'newSchedulePublished', locale }),
        to: receiverEmail,
        html: this.renderPugFileWithI18nUtil(schedulesPublishedEmailPugPath, {
          ...defaultPugVariables,
          shopName,
          receiverName: schedules[0].name,
          creatorName: creator.name,
          creatorEmail: creator.email,
          schedules,
          schedulesLink,
          locale
        })
      };
      infoTransporter.sendMail(schedulesPublishedEmail);
      return { success: true, msg: 'sendSchedulesPublishedEmail OK'};
    } catch (ex) {
      console.log('ERROR! MailingService - sendSchedulesPublishedEmail threw an exception:', { ex, shopName, creator, receiverEmail, locale });
      return { success: false, msg: 'sendSchedulesPublishedEmail failed!' };
    }
  }

  // timeoffs
  // locale done
  async sendTimeoffRequestedEmail(shopName: string, creator: any, receiver: {email: string, name: string}, timeoffs: any, timezone: string, locale: string = 'en') {
    try {
      const timeoffRequestedEmail: IEmailOptions = {
        ...timeoffRequestEmailDefaultOptions,
        subject: i18n.__({ phrase: 'timeoffRequestNotification', locale }),
        to: receiver.email,
        html: this.renderPugFileWithI18nUtil(timeoffRequestEmailPugPath, {
          ...defaultPugVariables,
          shopName,
          receiverName: receiver.name,
          creatorName: creator.name,
          creatorEmail: creator.email,
          timeoffs,
          timeInDays: timeoffs.length,
          locale
        })
      };
      infoTransporter.sendMail(timeoffRequestedEmail);
      return { success: true, msg: 'sendTimeoffRequestedEmail OK'};
    } catch (ex) {
      console.log('ERROR! MailingService - sendTimeoffRequestedEmail threw an exception:', { ex, shopName, creator, receiver, locale });
      return { success: false, msg: 'sendTimeoffRequestedEmail failed!' };
    }
  }
  // locale done
  async sendTimeoffRequestReceivedEmail(shopName: string, creator: any, timeoffs: any, timezone: string, locale: string = 'en') {
    try {
      const timeoffRequestedEmail: IEmailOptions = {
        ...timeoffRequestReceivedEmailDefaultOptions,
        subject: i18n.__({ phrase: 'timeoffRequestSent', locale }),
        to: creator.email,
        html: this.renderPugFileWithI18nUtil(timeoffRequestReceivedEmailPugPath, {
          ...defaultPugVariables,
          shopName,
          creatorName: creator.name,
          timeoffs,
          timeInDays: timeoffs.length,
          locale
        })
      };
      infoTransporter.sendMail(timeoffRequestedEmail);
      return { success: true, msg: 'sendTimeoffRequestReceivedEmail OK'};
    } catch (ex) {
      console.log('ERROR! MailingService - sendTimeoffRequestReceivedEmail threw an exception:', { ex, shopName, creator, locale });
      return { success: false, msg: 'sendTimeoffRequestReceivedEmail failed!' };
    }
  }
  // locale done
  async sendTimeoffRequestApprovedEmail(shopName: string, approver: any, creator: any, type: string, start: string, end: string, timezone: string, timeInDays: number, dateString: string, locale: string = 'en') {
    try {
      const timeoffRequestedEmail: IEmailOptions = {
        ...timeoffRequestApprovedEmailDefaultOptions,
        subject: i18n.__({ phrase: 'timeoffRequestApproved', locale }),
        to: creator.email,
        html: this.renderPugFileWithI18nUtil(timeoffRequestApprovedEmailPugPath, {
          ...defaultPugVariables,
          shopName,
          creatorName: creator.name,
          approverName: approver.name,
          approverEmail: approver.email,
          type,
          start: this.formatMomentStringToTimeString(start, timezone),
          end: this.formatMomentStringToTimeString(end, timezone),
          timeInDays,
          dateString,
          locale
        })
      };
      infoTransporter.sendMail(timeoffRequestedEmail);
      return { success: true, msg: 'sendTimeoffRequestApprovedEmail OK'};
    } catch (ex) {
      console.log('ERROR! MailingService - sendTimeoffRequestApprovedEmail threw an exception:', { ex, approver, creator, locale });
      return { success: false, msg: 'sendTimeoffRequestApprovedEmail failed!' };
    }
  }
  // locale done
  async sendTimeoffRequestDeclinedEmail(shopName: string, approver: any, creator: any, type: string, start: string, end: string, timezone: string, timeInDays: number, dateString: string, locale: string = 'en') {
    try {
      const timeoffRequestedEmail: IEmailOptions = {
        ...timeoffRequestDeclinedEmailDefaultOptions,
        subject: i18n.__({ phrase: 'timeoffRequestDeclined', locale }),
        to: creator.email,
        html: this.renderPugFileWithI18nUtil(timeoffRequestDeclinedEmailPugPath, {
          ...defaultPugVariables,
          shopName,
          creatorName: creator.name,
          approverName: approver.name,
          approverEmail: approver.email,
          type,
          start: this.formatMomentStringToTimeString(start, timezone),
          end: this.formatMomentStringToTimeString(end, timezone),
          timeInDays,
          locale
        })
      };
      infoTransporter.sendMail(timeoffRequestedEmail);
      return { success: true, msg: 'sendTimeoffRequestDeclinedEmail OK'};
    } catch (ex) {
      console.log('ERROR! MailingService - sendTimeoffRequestDeclinedEmail threw an exception:', { ex, approver, creator, locale });
      return { success: false, msg: 'sendTimeoffRequestDeclinedEmail failed!' };
    }
  }

  // demand
  async sendDemandAcceptedEmailNotification(shopName: string, creator: any, acceptingEmployeeName: string, acceptingEmployeeEmail: string, shiftStart: string, shiftEnd: string, locale: string = 'en') {
    try {
      const demandAcceptedEmail: IEmailOptions = {
        ...demandAcceptedEmailDefaultOptions,
        subject: i18n.__({ phrase: 'managemateShiftDemandAccepted', locale }),
        to: creator.email,
        html: this.renderPugFileWithI18nUtil(demandAcceptedEmailPugPath, {
          ...defaultPugVariables,
          shopName,
          creatorName: creator.name,
          acceptingEmployeeName,
          acceptingEmployeeEmail,
          shiftStart,
          shiftEnd,
          locale })
      };
      infoTransporter.sendMail(demandAcceptedEmail);
      return { success: true, msg: 'sendDemandAcceptedEmailNotification OK'};
    } catch (ex) {
      console.log('ERROR! MailingService - sendDemandAcceptedEmailNotification threw an exception:', ex);
      return { success: false, msg: 'sendDemandAcceptedEmailNotification failed!' };
    }
  }

  async sendDemandRaisedEmailNotification(shopName: string, creatorName: string, employeeName: string, employeeEmail: string, shiftStartArray: string[] = [], locale: string = 'en') {
    try {
      const demandRaisedEmail: IEmailOptions = {
        ...demandRaisedEmailDefaultOptions,
        subject: i18n.__({ phrase: 'managemateNewOpenShiftsPublished', locale }),
        to: employeeEmail,
        html: this.renderPugFileWithI18nUtil(demandRaisedEmailPugPath, {
          ...defaultPugVariables,
          shopName,
          creatorName,
          employeeName,
          shiftStartArray,
          locale })
      };
      infoTransporter.sendMail(demandRaisedEmail);
      return { success: true, msg: 'sendDemandRaisedEmailNotification OK'};
    } catch (ex) {
      console.log('ERROR! MailingService - sendDemandRaisedEmailNotification threw an exception:', ex);
      return { success: false, msg: 'sendDemandRaisedEmailNotification failed!' };
    }
  }
  // trades
  async sendTradeRequestEmail(shopName: string, creator: IUserContact, receiver: IUserContact, tradedShift: any, requestedShift: any, locale: string = 'en') {
    try {
      const tradeRequestEmail: IEmailOptions = {
        ...tradeRequestEmailDefaultOptions,
        subject: `${i18n.__({ phrase: 'managemateNewShiftTradeRequest', locale })} creator.name`,
        to: receiver.email,
        html: this.renderPugFileWithI18nUtil(tradeRequestEmailPugPath, {
          ...defaultPugVariables,
          shopName,
          receiverName: receiver.name,
          creatorName: creator.name,
          requestedShiftStart: requestedShift.start,
          requestedShiftEnd: requestedShift.end,
          requestedLocation: requestedShift.location[0].name,
          tradedShiftStart: tradedShift.start,
          tradedShiftEnd: tradedShift.end,
          tradedLocation: tradedShift.location[0].name,
          locale })
      };
      infoTransporter.sendMail(tradeRequestEmail);
      return { success: true, msg: 'sendTradeRequestEmail OK'};
    } catch (ex) {
      console.log('ERROR! MailingService - sendTradeRequestEmail threw an exception:', ex);
      return { success: false, msg: 'sendTradeRequestEmail failed!' };
    }
  }

  async sendTradeDeclinedEmail(shopName: string, email: string, name: string, trade: any, locale: string = 'en') {
    try {
      const tradeRequestEmail: IEmailOptions = {
        ...tradeDeclinedEmailDefaultOptions,
        subject: `${i18n.__({ phrase: 'managemateShiftTradeRequestDeclined', locale })} ${name}`,
        to: trade.creatorEmail,
        html: this.renderPugFileWithI18nUtil(tradeDeclinedEmailPugPath, {
          ...defaultPugVariables,
          shopName,
          receiverName: trade.creatorName,
          senderName: name,
          requestedShiftStart: trade.requestedStart,
          requestedShiftEnd: trade.requestedEnd,
          requestedLocation: trade.requestedLocation[0].name,
          tradedShiftStart: trade.tradedStart,
          tradedShiftEnd: trade.tradedEnd,
          tradedLocation: trade.tradedLocation[0].name,
          locale })
      };
      infoTransporter.sendMail(tradeRequestEmail);
      return { success: true, msg: 'sendTradeDeclinedEmail OK'};
    } catch (ex) {
      console.log('ERROR! MailingService - sendTradeDeclinedEmail threw an exception:', ex);
      return { success: false, msg: 'sendTradeDeclinedEmail failed!' };
    }
  }

  async sendTradeAcceptedEmail(shopName: string, email: string, name: string, trade: any, locale: string = 'en') {
    try {
      const tradeRequestEmail: IEmailOptions = {
        ...tradeAcceptedEmailDefaultOptions,
        subject: `${i18n.__({ phrase: 'managemateShiftTradeRequestAccepted', locale })} ${name}`,
        to: trade.creatorEmail,
        html: this.renderPugFileWithI18nUtil(tradeAcceptedEmailPugPath, {
          ...defaultPugVariables,
          shopName,
          receiverName: trade.creatorName,
          senderName: name,
          requestedShiftStart: trade.requestedStart,
          requestedShiftEnd: trade.requestedEnd,
          requestedLocation: trade.requestedLocation[0].name,
          tradedShiftStart: trade.tradedStart,
          tradedShiftEnd: trade.tradedEnd,
          tradedLocation: trade.tradedLocation[0].name,
          locale })
      };
      infoTransporter.sendMail(tradeRequestEmail);
      return { success: true, msg: 'sendTradeAcceptedEmail OK'};
    } catch (ex) {
      console.log('ERROR! MailingService - sendTradeAcceptedEmail threw an exception:', ex);
      return { success: false, msg: 'sendTradeAcceptedEmail failed!' };
    }
  }

  renderPugFileWithI18nUtil(templateFile: string, options: { [key: string]: string }) {
    i18n.setLocale(options.locale);
    return pug.renderFile(templateFile, {
      ...options,
      i18n: i18n.__,
    });
  }
  formatMomentStringToTimeString(momentString: string, timezone: string): string {
    try {
      if (timezone) {
        const humanString = moment(momentString).tz(timezone).format('ddd, MMM DD YYYY, h:mm A');
        return humanString;
      } else {
        console.log('ERROR! Mailing Service - no time zone provided! sending moment string!');
        return momentString;
      }
    } catch (ex) {
      console.log('ERROR! Mailing Service - formatMomentStringToTimeString threw an exception', ex);
      return momentString;
    }
  }
  // TODO un-installation email
}
