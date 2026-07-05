'use strict';
module.exports = (sequelize: any, DataTypes: any) => {
  const personnelStatus = sequelize.define('personnelStatus', {
    shopName: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    updatedAt: DataTypes.DATE,
    status: DataTypes.STRING,
    shiftStart: DataTypes.DATE,
    breakStart: DataTypes.DATE,
    location: DataTypes.JSONB, // {name: string; id: number}
    clockInVia: DataTypes.STRING,
  }, {freezeTableName: true, timestamps: false});
  personnelStatus.associate = function(models: any) {
    // associations can be defined here
  };
  return personnelStatus;
};
