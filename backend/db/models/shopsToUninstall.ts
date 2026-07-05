'use strict';
module.exports = (sequelize: any, DataTypes: any) => {
  const shopsToUninstall = sequelize.define('shopsToUninstall', {
    shopName: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    uninstalledAt: DataTypes.DATE,
    subToken: DataTypes.STRING,
    unInstallData: DataTypes.JSONB,
    cleared: DataTypes.BOOLEAN
  }, {freezeTableName: true, timestamps: false});
  shopsToUninstall.associate = function(models: any) {
    // associations can be defined here
  };
  return shopsToUninstall;
};
