'use strict';
module.exports = (sequelize: any, DataTypes: any) => {
  const schedulesTrades = sequelize.define('schedulesTrades', {
    shopName: DataTypes.STRING,
    status: DataTypes.STRING, // "Pending" / "Accepted" / "Declined"
    createdAt: DataTypes.DATE,
    creatorName: DataTypes.STRING,
    creatorEmail: DataTypes.STRING,
    receiverName: DataTypes.STRING,
    receiverEmail: DataTypes.STRING,
    creatorNote: DataTypes.STRING,
    tradedShiftId: DataTypes.INTEGER,
    tradedStart: DataTypes.DATE,
    tradedEnd: DataTypes.DATE,
    tradedTimezone: DataTypes.STRING,
    tradedTimeInSeconds: DataTypes.INTEGER,
    tradedLocation: DataTypes.JSONB, // [{name, id}, ...]
    requestedShiftId: DataTypes.INTEGER,
    requestedStart: DataTypes.DATE,
    requestedEnd: DataTypes.DATE,
    requestedTimezone: DataTypes.STRING,
    requestedTimeInSeconds: DataTypes.INTEGER,
    requestedLocation: DataTypes.JSONB, // [{name, id}, ...]
  }, {timestamps: false, freezeTableName: true});
  schedulesTrades.associate = function(models: any) {
    // associations can be defined here
  };
  return schedulesTrades;
};
