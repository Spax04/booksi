import axios from 'axios';
import { toFixedString } from '../../common';
import { StatisticsService } from '../Statistics/StatisticsService';
const fs = require('fs');
const { Webhook } = require('discord-webhook-node');

export const trialsUserName = 'Daily Trials';
export const maintenanceUserName = 'DB Maintenance';
export const serverNotificationUserName = 'Server Notification';
export const dashboardAggregationUserName = 'Dashboard Aggregation';

export class DiscordService {
  // new subscriptions, done mgm
  async sendNewSubscriptionNotificationToDiscordChannel(content: {planName: string, planDisplayName: string, shopName: string, ownerName: string, ownerEmail: string, mgmSubscriptionName: string}, userName: string = 'New Subscription! 🤘') {
    const requestURL = process.env.DISCORD_CHANNEL_NEW_SUBSCRIPTIONS_P;
    const discordHeaders = {
      'Content-Type': 'application/json'
    };
    try {
        let msgContent =
          '🥳 New shop subscribed! 🎉' + '\n' +
          '💵💵💵💵💵💵💵💵💵' + '\n' +
          'shop:\t' + content.shopName + '\n' +
          'owner:\t' + content.ownerName + '\n' +
          'email:\t' + content.ownerEmail + '\n' +
          'plan name:\t' + content.planName + '\n' +
          'plan display name:\t' + content.planDisplayName + '\n' +
          'MGM Subscription name:\t' + content.mgmSubscriptionName;
        if (process.env.NODE_ENV != 'production') {
          msgContent = '\n\tFROM TEST ENV:\n' + msgContent;
        }
        await axios.post(requestURL, {username: userName, content: msgContent}, { headers: discordHeaders });
    } catch (ex) {
      console.log('ERROR! DISCORD - sendNewSubscriptionNotificationToDiscordChannel threw an exception', ex);
    }
  }
  // daily stats, done mgm
  async sendDailyStats(userName: string = 'Daily Status 🧐') {
    const requestURL = process.env.DISCORD_CHANNEL_DAILY_STATS_P;
    const { success, msg, dailyStats, billingSummary } = await new StatisticsService().getDailyStats();
    if (!success) {
      console.log('ERROR! DiscordService - sendDailyStats failed!', msg);
      return;
    }
    const discordHeaders = {
      'Content-Type': 'application/json'
    };
    try {
        let msgContent =
          'General' + '\n' +
          '----------------------' + '\n';
        const generalStats: any = dailyStats.general;
        for (const key in generalStats) {
          msgContent += '\t' + key + ': ' + generalStats[key] + '\n';
        }
        msgContent +=
          'Trials' + '\n' +
          '----------------------' + '\n';
      const trialsStats: any = dailyStats.trials;
      for (const key in trialsStats) {
          msgContent += '\t' + key + ': ' + trialsStats[key] + '\n';
        }
      msgContent +=
        'Subscriptions' + '\n' +
        '----------------------' + '\n';
      const subscriptionsStats: any = dailyStats.subscriptions;
      for (const key in subscriptionsStats) {
        msgContent += '\t' + key + ': ' + subscriptionsStats[key] + '\n';
      }
      msgContent +=
        'Monetization' + '\n' +
        '----------------------' + '\n';
      const monetizationStats: any = dailyStats.monetization;
      for (const key in monetizationStats) {
        msgContent += '\t' + key + ': ' + monetizationStats[key] + '\n';
      }
      msgContent +=
        'Billing Simulation' + '\n' +
        '----------------------' + '\n';
      const billingStats: any = billingSummary;
      for (const key in billingStats) {
        msgContent += '\t' + key + ': ' + billingStats[key] + '\n';
      }
        if (process.env.NODE_ENV != 'production') {
          msgContent = '\n\tFROM TEST ENV:\n' + msgContent;
        }
        await axios.post(requestURL, {username: userName, content: msgContent}, { headers: discordHeaders });
    } catch (ex) {
      console.log('ERROR! DISCORD - sendDailyStats threw an exception', ex);
    }
  }
  // general text message, done mgm
  async sendGeneralTextNotificationToDiscordChannel(channelURL: string, msgText: any, msgObject: any = {}, userName: string = undefined) {
    const notificationUserName = userName ? userName : serverNotificationUserName;
    // console.log('sendGeneralTextNotificationToDiscordChannel received', { channelURL, msgText, msgObject, userName});
    const discordMsgHeaders = {
      'Content-Type': 'application/json'
    };
    try {
        let msgContent = msgText + '\n';
        for (const key in msgObject) {
          msgContent += key + '\t' + msgObject[key] + '\n';
        }
        if (process.env.NODE_ENV != 'production') {
          msgContent = '\n\tFROM TEST ENV:\n' + msgContent;
        }
      await axios.post(channelURL, {username: notificationUserName, content: msgContent}, { headers: discordMsgHeaders });
    } catch (ex) {
      console.log('ERROR! DISCORD - sendGeneralTextNotificationToDiscordChannel threw an exception', ex);
    }
  }
  // general error message, done mgm
  async sendErrorNotificationToDiscordChannel(channelURL: string, errorMsg: any, errObject: any = {}, userName: string = undefined) {
    const errorUserName = userName ? '‼️ ' + userName + ' ERROR ‼️' : '‼️ERROR ‼️';
    const discordMsgHeaders = {
      'Content-Type': 'application/json'
    };

    try {
        let msgContent = errorMsg + '\n';
        for (const key in errObject) {
          msgContent += key + '\t' + errObject[key] + '\n';
        }
        if (process.env.NODE_ENV != 'production') {
          msgContent = '\n\tFROM TEST ENV:\n' + msgContent;
        }
      await axios.post(channelURL, {username: errorUserName, content: msgContent}, { headers: discordMsgHeaders });
    } catch (ex) {
      console.log('ERROR! DISCORD - sendErrorNotificationToDiscordChannel threw an exception', ex);
    }
  }
  // trial updates report, done mgm
  async sendDailyTrialUpdateResultsNotificationToDiscordChannel(shopsInTrial: any, shopsTrialEnded: any, updateTrialStatusResultCSVString: string, userName: string = trialsUserName) {
    const requestURL = process.env.DISCORD_CHANNEL_DAILY_STATS_P;
    const discordMsgHeaders = {
      'Content-Type': 'application/json'
    };
    try {
      fs.writeFile('trialUpdateResults.csv', updateTrialStatusResultCSVString, (err: any) => {
        if (err) {
          console.log('err', err);
        }
        console.log('trialUpdateResults.csv is saved.');
      });
      let msgContent =
          'Trial Days Update Results' + '\n' +
          '----------------------' + '\n' +
          'Shops in trial:\t' + shopsInTrial + '\n' +
          'Ended Trials:\t' + shopsTrialEnded;
        if (process.env.NODE_ENV != 'production') {
          msgContent = '\n\tFROM TEST ENV:\n' + msgContent;
        }
      await axios.post(requestURL, {username: userName, content: msgContent}, { headers: discordMsgHeaders });
      const hook = new Webhook(process.env.DISCORD_CHANNEL_DAILY_STATS_P);
      hook.setUsername(userName);
      await hook.sendFile('trialUpdateResults.csv');
    } catch (ex) {
      console.log('ERROR! DISCORD - sendTotalChargedAMountFromDailyTrialUpdateNotificationToDiscordChannel threw an exception', ex);
    }
  }
  // TODO billing report, not done mgm
  async sendBillingResultsNotificationToDiscordChannel(
    title: string,
    billingResultsCSVString: string,
    totalChargedShopsAmount: number,
    failedChargesCount: number,
    byPersonnelCount: number,
    totalPersonnelCharged: number,
    byPersonnelAmount: number,
    byMonthlyFeeCount: number,
    byMonthlyFeeAmount: number,
    totalChargedAmount: number,
    failedOperationsCount: number,
    userName: string = 'Billing Summary 💰') {
    const requestURL = process.env.DISCORD_CHANNEL_MONEYINTHEBAG_P;
    const discordMsgHeaders = {
      'Content-Type': 'application/json'
    };

    try {
      fs.writeFile('billingResults.csv', billingResultsCSVString, (err: any) => {
        if (err) {
          console.log('err', err);
        }
        console.log('billingResults.csv is saved.');
      });

      let msgContent =
        title + '\n' +
        '----------------------' + '\n' +
        'Shops charged by Personnel:\t' + byPersonnelCount + '\n' +
        'Total Personnel charged:\t' + totalPersonnelCharged + '\n' +
        'Total charges by Personnel:\t' + toFixedString(byPersonnelAmount, 3) + '\n' +
        'Shops charged by Monthly Fee:\t' + byMonthlyFeeCount + '\n' +
        'Total charges by Monthly Fee:\t' + toFixedString(byMonthlyFeeAmount, 3) + '\n' +
        'Shops charged in total:\t' + totalChargedShopsAmount + '\n' +
        'Charged Amount:\t' + toFixedString(totalChargedAmount, 3) + '\n' +
        'Failed Charges:\t' + failedChargesCount + '\n' +
        'Failed Calculations:\t' + failedOperationsCount;
      if (process.env.NODE_ENV != 'production') {
        msgContent = '\n\tFROM TEST ENV:\n' + msgContent;
      }
      await axios.post(requestURL, {username: userName, content: msgContent}, { headers: discordMsgHeaders });
      const hook = new Webhook(process.env.DISCORD_CHANNEL_MONEYINTHEBAG_P);
      hook.setUsername(userName);
      await hook.sendFile('billingResults.csv');
    } catch (ex) {
      console.log('ERROR! DISCORD - sendTotalChargedAMountFromDailyTrialUpdateNotificationToDiscordChannel threw an exception', ex);
    }
  }
  // TODO not done mgm
  async sendTotalChargedAmountMonthlyChargesNotificationToDiscordChannel(byPersonnelCount: any, totalPersonnelCharged: any, byPersonnelAmount: any, byMonthlyFeeCount: any, byMonthlyFeeAmount: any, totalChargedShopsAmount: any, totalChargedAmount: any, failedChargesCount: any, userName: string = 'Monthly Charges 💰') {
    const requestURL = process.env.DISCORD_CHANNEL_MONEYINTHEBAG_P;
    const discordMsgHeaders = {
      'Content-Type': 'application/json'
    };

    try {
      let msgContent =
        'Monthly Charges Results' + '\n' +
        '----------------------' + '\n' +
        'Shops charged by Personnel:\t' + byPersonnelCount + '\n' +
        'Total Personnel charged:\t' + totalPersonnelCharged + '\n' +
        'Total charges by Personnel:\t' + byPersonnelAmount.toFixed(3) + '\n' +
        'Shops charged by Monthly Fee:\t' + byMonthlyFeeCount + '\n' +
        'Total charges by Monthly Fee:\t' + byMonthlyFeeAmount.toFixed(3) + '\n' +
        'Shops charged in total:\t' + totalChargedShopsAmount + '\n' +
        'Charged Amount:\t' + totalChargedAmount.toFixed(3) + '\n' +
        // 'Net Amount:\t' + (parseFloat(totalChargedAmount) * 0.8).toFixed(3) + '\n' +
        'Failed Charges:\t' + failedChargesCount;
      if (process.env.NODE_ENV != 'production') {
        msgContent = '\n\tFROM TEST ENV:\n' + msgContent;
      }
      await axios.post(requestURL, {username: userName, content: msgContent}, { headers: discordMsgHeaders });
      const hook = new Webhook(process.env.DISCORD_CHANNEL_MONEYINTHEBAG_P);
      hook.setUsername(userName);
      await hook.sendFile('trialUpdateResultCharges.csv');
    } catch (ex) {
      console.log('ERROR! DISCORD - sendTotalChargedAMountFromDailyTrialUpdateNotificationToDiscordChannel threw an exception', ex);
    }
  }
  // retention report, done mgm
  async sendEnforceRetentionReport(results: Array<{name: string, records: number}>, userName = maintenanceUserName) {
    const requestURL = process.env.DISCORD_CHANNEL_UTILS_P;
    const discordMsgHeaders = {
      'Content-Type': 'application/json'
    };

    try {
      let msgContent =
        `Enforcing Retention - ${process.env.NODE_ENV}` + '\n' +
        '-------------------' + '\n';
      (results || []).forEach((result) => {
        msgContent += `${result.name}: ${result.records}` + '\n' ;
      });

      if (process.env.NODE_ENV != 'production') {
        msgContent = '\n\tFROM TEST ENV:\n' + msgContent;
      }
      await axios.post(requestURL, {username: userName, content: msgContent}, { headers: discordMsgHeaders });
    } catch (ex) {
      console.log('ERROR! DISCORD - sendEnforceRetentionReport threw an exception', ex);
    }
  }
  // user feedback, done mgm
  async sendUserFeedbackToChannel(shopName: string, email: string, name: string, rating: string, message: string, payload: any = {}, userName = 'User Feedback') {
    const requestURL = process.env.DISCORD_CHANNEL_USER_FEEDBACK_SUBMISSIONS;
    const discordMsgHeaders = {
      'Content-Type': 'application/json'
    };

    try {
      let msgContent =
        `New User Feedback` + '\n' +
        '-----------------' + '\n' +
        'Shop: ' + shopName + '\n' +
        'Email: ' + email + '\n' +
        'Name: ' + name + '\n' +
        'Rating: ' + rating + '\n' +
        'Message: ' + message + '\n';
      if (payload) {
        msgContent += 'Payload:' + '\n';
        for (const key in payload) {
          msgContent += '\t' + key + ': ' + payload[key] + '\n';
        }
      }


      if (process.env.NODE_ENV != 'production') {
        msgContent = '\n\tFROM TEST ENV:\n' + msgContent;
      }
      await axios.post(requestURL, {username: userName, content: msgContent}, { headers: discordMsgHeaders });
    } catch (ex) {
      console.log('ERROR! DISCORD - sendUserFeedbackToChannel threw an exception', ex);
    }
  }
  // contact us, done mgm
  async sendContactUsToChannel(email: string, subject: string, message: string, payload: any, userName = 'Contact Us') {
    const requestURL = process.env.DISCORD_CHANNEL_CONTACT_US_SUBMISSIONS;
    const discordMsgHeaders = {
      'Content-Type': 'application/json'
    };

    try {
      let msgContent =
        `New User Inquiry` + '\n' +
        '-----------------' + '\n' +
        'Email: ' + email + '\n' +
        'Subject: ' + subject + '\n' +
        'Message: ' + message + '\n';
      if (payload) {
        msgContent += 'Payload:' + '\n';
        for (const key in payload) {
          msgContent += '\t' + key + ': ' + payload[key] + '\n';
        }
      }


      if (process.env.NODE_ENV != 'production') {
        msgContent = '\n\tFROM TEST ENV:\n' + msgContent;
      }
      await axios.post(requestURL, {username: userName, content: msgContent}, { headers: discordMsgHeaders });
    } catch (ex) {
      console.log('ERROR! DISCORD - sendContactUsToChannel threw an exception', ex);
    }
  }
  async sendCSVToDiscordChannel(channel: string, fileName: string, csvString: string, userName: string = 'MGM File Utils') {
    try {
      fs.writeFile(`${fileName}.csv`, csvString, (err: any) => {
        if (err) {
          console.log('err', err);
        }
        console.log(`${fileName}.csv is saved.`);
      });
      const discordMsgHeaders = {
        'Content-Type': 'application/json'
      };
      await axios.post(channel, {username: userName, content: 'file attachment'}, { headers: discordMsgHeaders });
      const hook = new Webhook(channel);
      hook.setUsername(userName);
      await hook.sendFile(`${fileName}.csv`);
    } catch (ex) {
      console.log('ERROR! DISCORD - sendCSVToDiscordChannel threw an exception', ex);
    }
  }

}
