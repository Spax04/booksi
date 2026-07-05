'use strict';
module.exports = (sequelize: any, DataTypes: any) => {
  const schedules = sequelize.define('schedules', {
    shopName: DataTypes.STRING,
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    avatarFile: DataTypes.STRING,
    start: DataTypes.DATE,
    end: DataTypes.DATE,
    timezone: DataTypes.STRING,
    timeInSeconds: DataTypes.INTEGER,
    department: DataTypes.STRING,
    position: DataTypes.STRING,
    location: DataTypes.JSONB, // [{name, id}, ...]
    note: DataTypes.STRING,
    tasks: DataTypes.JSON,
    breaks: DataTypes.JSON, // [{index, breakStart, breakEnd}, ...]
    type: DataTypes.STRING, // "Shift" / "Vacation" / "Sick leave" / "Demand"
    subType: DataTypes.STRING, // no subTypes yet
    creator: DataTypes.JSON, // {name: string, email: string, avatarFile: string}
    comment: DataTypes.STRING, // for time off / sick leave requests  //TODO see if can delete coz already in timeoff model
    approved: DataTypes.BOOLEAN, // for time off / sick leave requests //TODO see if can delete coz already in timeoff model
    assigned: DataTypes.BOOLEAN, // for demands, to avoid double assigning  //TODO see if can delete coz already in timeoff model
    notifiedEmployees: DataTypes.JSON // [{name: string, email: string, avatarFile: string}]
  }, {timestamps: false, freezeTableName: true});
  schedules.associate = function(models: any) {
    // associations can be defined here
  };
  return schedules;
};
