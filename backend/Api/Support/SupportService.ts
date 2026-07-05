import { DiscordService } from '../Discord/DiscordService';
const moment = require('moment-timezone');
const Models = require('../../db/models');

export class SupportService {
  async contactUs(email: string, subject: string, message: string, payload: any) {
      try {
        const submittedAt = moment();
        await new DiscordService().sendContactUsToChannel(email, subject, message, payload);
        await Models.contactUs.create({email, subject, message, payload, submittedAt}, {logging: false});
        return { success: true, msg: 'contactUs OK' };
      } catch (ex) {
        console.log(`ERROR! SupportService - contactUs threw an exception! ${ex}`);
        return { success: false, msg: `contactUs failed!` };
      }
  }
}
