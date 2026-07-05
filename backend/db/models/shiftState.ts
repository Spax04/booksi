'use strict';
module.exports = (sequelize: any, DataTypes: any) => {
  const shiftState = sequelize.define('shiftState', {
    shopName: DataTypes.STRING,
    email: DataTypes.STRING,
    start: DataTypes.DATE,
    end: DataTypes.DATE,
    timezone: DataTypes.STRING,
    timeInSeconds: DataTypes.INTEGER,
    location: DataTypes.JSONB, // {name, id}
    breaks: DataTypes.JSON, // [{breakStart: <moment>, breakEnd: <moment>, breakTime: integer, breakIndex: integer}]
    breakTime: DataTypes.INTEGER,
    clockInVia: DataTypes.STRING,
  }, {timestamps: false, freezeTableName: true});
  shiftState.associate = function(models: any) {
    // associations can be defined here
  };
  return shiftState;
};
