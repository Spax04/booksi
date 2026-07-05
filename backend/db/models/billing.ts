'use strict';
module.exports = (sequelize: any, DataTypes: any) => {
  const billing = sequelize.define('billing', {
    shopName: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true
    },
    monthYear: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true
    },
    amount: DataTypes.DECIMAL,
    chargePer: DataTypes.STRING,
    chargedPersonnelCount: DataTypes.INTEGER,
    chargeData: DataTypes.JSONB,
    chargeResult: DataTypes.JSONB,
    success: DataTypes.BOOLEAN,
    createdAt: DataTypes.DATE,
  }, {freezeTableName: true, timestamps: false});
  billing.associate = function(models: any) {
    // associations can be defined here
  };
  return billing;
};
