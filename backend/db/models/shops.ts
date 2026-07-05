'use strict';
module.exports = (sequelize: any, DataTypes: any) => {
    const shops = sequelize.define('shops', {
      shopName: {
        type: DataTypes.STRING,
        primaryKey: true
      },
      createdAt: DataTypes.DATE,
      ownerName: DataTypes.STRING,
      ownerEmail: DataTypes.STRING,
      shopifyData: DataTypes.JSON,
      hasPOS: DataTypes.STRING,
      status: DataTypes.STRING,
      locationsData: DataTypes.JSON
    }, {});
    shops.associate = function (models: any) {
        // associations can be defined here
    };
    return shops;
};
