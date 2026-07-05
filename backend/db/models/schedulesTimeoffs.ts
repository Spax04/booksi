'use strict';
module.exports = (sequelize: any, DataTypes: any) => {
  const schedulesTimeoffs = sequelize.define('schedulesTimeoffs', {
    shopName: DataTypes.STRING,
    createdAt: DataTypes.DATE,
    status: DataTypes.STRING, // "Pending" / "Approved" / "Declined"
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    avatarFile: DataTypes.STRING,
    start: DataTypes.DATE,
    end: DataTypes.DATE,
    dateString: DataTypes.STRING,
    timezone: DataTypes.STRING,
    timeInSeconds: DataTypes.INTEGER,
    timeInDays: DataTypes.DECIMAL,
    note: DataTypes.STRING,
    type: DataTypes.STRING, // "Vacation" / "Sick leave"
    subType: DataTypes.STRING, // no subTypes yet
    responder: DataTypes.JSON, // IUserContact: {name: string, email: string, avatarFile: string} must be Manager in location / Admin
    responderComment: DataTypes.STRING,
    approved: DataTypes.BOOLEAN,
    answered: DataTypes.BOOLEAN
  }, {timestamps: false, freezeTableName: true});
  schedulesTimeoffs.associate = function(models: any) {
    // associations can be defined here
  };
  return schedulesTimeoffs;
};
