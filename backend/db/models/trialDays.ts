'use strict';
module.exports = (sequelize: any, DataTypes: any) => {
  const trialDays = sequelize.define('trialDays', {
    shopName: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    trialDays: DataTypes.INTEGER
  }, {freezeTableName: true, timestamps: false});
  trialDays.associate = function(models: any) {
    // associations can be defined here
  };
  return trialDays;
};
