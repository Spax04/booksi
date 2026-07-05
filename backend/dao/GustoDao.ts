import { IGustoAccessTokenResult, IGustoRefreshTokenResult } from '../ExternalAPI/GustoApi/GustoTypes';
const moment = require('moment-timezone');
const Models = require('../db/models/');


export class GustoDao {

  async getAccessTokenByShopName(shopName: string) {
    try {
      const accessToken = await Models.gusto.findOne({where: { shopName }, logging: false});
      if (accessToken) {
        return {success: true, accessToken};
      } else {
        return {success: false};
      }
    } catch (ex) {
      console.log('ERROR! GustoDao - getAccessTokenByShopName threw an exception', ex);
      return {success: false};
    }
  }

  async getAllAccessTokensByShopNames(shopNames: string[]) {
    try {
      const accessTokensArray = await Models.gusto.findAll({ where: { shopName: shopNames}, logging: false });
      const accessTokens = accessTokensArray.map((accessToken: any) => accessToken.dataValues);
      if (accessTokens && accessTokens.length > 0) {
        return {success: true, accessTokens};
      } else {
        return {success: false};
      }
    } catch (ex) {
      console.log('ERROR! GustoDao - getAllAccessTokensByShopNames threw an exception', ex);
      return {success: false};
    }
  }

  async saveAccessToken(shopName: string, accessTokenData: IGustoAccessTokenResult) {
    try {
      const shopGustoAccessToken = {
        shopName,
        createdAt: moment(),
        accessToken: accessTokenData.access_token,
        refreshToken: accessTokenData.refresh_token,
        companyUuid: accessTokenData.company_uuid,
        expiresIn: accessTokenData.expires_in
      };
      await Models.gusto.create(shopGustoAccessToken);
      return {success: true};
    } catch (ex) {
      console.log('ERROR! GustoDao - saveAccessToken threw an exception', ex);
      return {success: false};
    }
  }

  async updateRefreshToken(shopName: string, refreshTokenData: IGustoRefreshTokenResult) {
    try {
      const shopGustoRefreshToken = {
        accessToken: refreshTokenData.access_token,
        refreshToken: refreshTokenData.refresh_token,
        expiresIn: refreshTokenData.expires_in,
        tokenType: refreshTokenData.token_type
      };
      await Models.gusto.update(shopGustoRefreshToken, { where: { shopName } } );
    } catch (ex) {
      console.log('ERROR! GustoDao - updateRefreshToken threw an exception', ex);
      return {success: false};
    }
  }
}
