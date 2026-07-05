'use strict';
module.exports = (sequelize: any, DataTypes: any) => {
  const preferences = sequelize.define('preferences', {
    shopName: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    updatedAt: DataTypes.DATE,
    settings: DataTypes.JSONB,
    integrations: DataTypes.JSONB,
    employeePermissions: DataTypes.JSON,
    managerPermissions: DataTypes.JSON,
    adminPermissions: DataTypes.JSON,
  }, {timestamps: false, freezeTableName: true});
  preferences.associate = function(models: any) {
    // associations can be defined here
  };
  return preferences;
};
