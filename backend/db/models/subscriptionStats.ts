'use strict';
module.exports = (sequelize: any, DataTypes: any) => {
  const subscriptionStats = sequelize.define('subscriptionStats', {
    dateRecorded: {
      type: DataTypes.DATE,
      primaryKey: true
    },
    appName: DataTypes.STRING,
    shopsCount: DataTypes.INTEGER,
    devShopsCount: DataTypes.INTEGER,
    personnelCount: DataTypes.INTEGER,
    devPersonnelCount: DataTypes.INTEGER,
    basicLicenseCount: DataTypes.INTEGER,
    standardLicenseCount: DataTypes.INTEGER,
    ultimateLicenseCount: DataTypes.INTEGER,
    customLicenseCount: DataTypes.INTEGER,
    basicLicensePersonnelCount: DataTypes.INTEGER,
    standardLicensePersonnelCount: DataTypes.INTEGER,
    ultimateLicensePersonnelCount: DataTypes.INTEGER,
    customLicensePersonnelCount: DataTypes.INTEGER,
    basicLicenseExpectedCharge: DataTypes.DECIMAL,
    standardLicenseExpectedCharge: DataTypes.DECIMAL,
    ultimateLicenseExpectedCharge: DataTypes.DECIMAL,
    customLicenseExpectedCharge: DataTypes.DECIMAL,
    extraData: DataTypes.JSONB,
  }, {timestamps: false, freezeTableName: true});
  subscriptionStats.associate = function(models: any) {
    // associations can be defined here
  };
  return subscriptionStats;
};
