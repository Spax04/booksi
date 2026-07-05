'use strict';
module.exports = (sequelize: any, DataTypes: any) => {
  const accessTokens = sequelize.define('accessTokens', {
      shopName: {
        type: DataTypes.STRING,
        primaryKey: true
      },
      token: DataTypes.STRING,
      code: DataTypes.STRING,
      createdAt: DataTypes.DATE
  }, {freezeTableName: true, timestamps: false});
  accessTokens.associate = function(models: any) {
    // associations can be defined here
  };
  return accessTokens;
};
