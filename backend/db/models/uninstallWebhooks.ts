'use strict';
module.exports = (sequelize: any, DataTypes: any) => {
  const uninstallWebhooks = sequelize.define('uninstallWebhooks', {
    shopName: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    webhookId: DataTypes.STRING,
    subToken: DataTypes.STRING
  }, {freezeTableName: true, timestamps: false});
  uninstallWebhooks.associate = function(models: any) {
    // associations can be defined here
  };
  return uninstallWebhooks;
};
