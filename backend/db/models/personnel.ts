'use strict';
module.exports = (sequelize: any, DataTypes: any) => {
  const personnel = sequelize.define('personnel', {
    shopName: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true
    },
    createdAt: DataTypes.DATE,
    name: DataTypes.STRING,
    permissionLevel: DataTypes.STRING, // 'Admin' / 'Manager' / 'Employee'
    permissions: DataTypes.JSON,
    position: DataTypes.STRING,
    department: DataTypes.STRING,
    paymentAmount: DataTypes.DOUBLE,
    paymentType: DataTypes.STRING,
    paymentCurrencyId: DataTypes.INTEGER,
    status: DataTypes.STRING,
    avatarFile: DataTypes.STRING,
    inviteKey: DataTypes.STRING,
    locations: DataTypes.JSONB,
    phone: DataTypes.JSON,
    shopifyId: DataTypes.STRING,
    timeoffLimit: DataTypes.INTEGER,
    sickLeaveLimit: DataTypes.INTEGER,
    integrations: DataTypes.JSONB,
    pinCode: DataTypes.STRING,
    locale: DataTypes.STRING,
    commissionPlan: DataTypes.JSON, // {planName: string, planId: number} // TODO send nam+id summary to team / general data, add assignPlan EP to team? or simply update in personnel
  }, {freezeTableName: true, timestamps: false});
  personnel.associate = function(models: any) {
    // associations can be defined here
  };
  return personnel;
};
