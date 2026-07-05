const Models = require('../db/models/');


export class AccessTokenDao {

  async getAllShopsAccessTokens() {
    try {
      const accessTokensArray = await Models.accessTokens.findAll({ where: {}, logging: false });
      const accessTokens = accessTokensArray.map((accessToken: any) => accessToken.dataValues);
      if (accessTokens && accessTokens.length > 0) {
        return {success: true, accessTokens};
      } else {
        return {success: false};
      }
    } catch (ex) {
      console.log('ERROR! getAllShopsAccessTokens threw an exception', ex);
      return {success: false};
    }
  }

  async getAllAccessTokensByShopNames(shopNames: string[]) {
    try {
      const accessTokensArray = await Models.accessTokens.findAll({ where: { shopName: shopNames}, logging: false });
      const accessTokens = accessTokensArray.map((accessToken: any) => accessToken.dataValues);
      if (accessTokens && accessTokens.length > 0) {
        return {success: true, accessTokens};
      } else {
        return {success: false};
      }
    } catch (ex) {
      console.log('ERROR! getAllAccessTokensByShopNames threw an exception', ex);
      return {success: false};
    }
  }

  async getAccessTokenByShopName(shopName: string) {
    try {
      const accessToken = await Models.accessTokens.findOne({where: { shopName }, logging: false});
      if (accessToken) {
        return {success: true, accessToken};
      } else {
        return {success: false};
      }
    } catch (ex) {
      console.log('ERROR! getAccessTokenByShopName threw an exception', ex);
      return {success: false};
    }
  }
}
