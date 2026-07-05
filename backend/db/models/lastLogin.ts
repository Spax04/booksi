'use strict';
module.exports = (sequelize: any, DataTypes: any) => {
  const lastLogin = sequelize.define('lastLogin', {
    shopName: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    email: DataTypes.STRING,
    loginVia: DataTypes.STRING,
    loginDate: DataTypes.DATE,
  }, {timestamps: false, freezeTableName: true});
  lastLogin.associate = function(models: any) {
    // associations can be defined here
  };
  return lastLogin;
};
