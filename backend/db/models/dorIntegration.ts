'use strict';
module.exports = (sequelize: any, DataTypes: any) => {
  const dorIntegration = sequelize.define('dorIntegration', {
    shopName: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true
    },
    teamId: DataTypes.STRING,
    apiKey: DataTypes.STRING,
    locationsMapping: DataTypes.JSONB, // [{shopifyId: string, shopifyName: string, dorLocationId: string, dorLocationName: string}]
  }, {freezeTableName: true, timestamps: false});
  dorIntegration.associate = function(models: any) {
    // associations can be defined here
  };
  return dorIntegration;
};
