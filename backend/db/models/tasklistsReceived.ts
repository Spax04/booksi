'use strict';
module.exports = (sequelize: any, DataTypes: any) => {
  const tasklistsReceived = sequelize.define('tasklistsReceived', {
    shopName: DataTypes.STRING,
    tasklistId: DataTypes.INTEGER,
    tasklistName: DataTypes.STRING,
    submittedAt: DataTypes.DATE,
    timezone: DataTypes.STRING,
    submitterEmail: DataTypes.STRING,
    submitterName: DataTypes.STRING,
    avatarFile: DataTypes.STRING,
    note: DataTypes.STRING,
    location: DataTypes.JSONB, // [{id: integer, name: string}, ...]
    tasks: DataTypes.JSON, // [{taskName: string, isDone: boolean}]
    isAssigned: DataTypes.BOOLEAN,
    isDated: DataTypes.BOOLEAN
  }, {timestamps: false, freezeTableName: true});
  tasklistsReceived.associate = function(models: any) {
    // associations can be defined here
  };
  return tasklistsReceived;
};

