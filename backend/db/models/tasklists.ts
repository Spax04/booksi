'use strict';
module.exports = (sequelize: any, DataTypes: any) => {
  const tasklists = sequelize.define('tasklists', {
    shopName: DataTypes.STRING,
    title: DataTypes.STRING, // tasklist name
    description: DataTypes.STRING, // tasklist description
    recurrence: DataTypes.STRING, // 'Daily'/'Weekly'/'Monthly'/'General' - one of
    visibility: DataTypes.JSON, // ['Admin'/'Manager'/'Employee'] - multiple
    tasks: DataTypes.JSON, // [{taskName: string, index: integer, isDone: boolean}]
    locations: DataTypes.JSONB, // [locations array relevant for this tasklist] - multiple [{id: string, name: string}],
    creator: DataTypes.JSON,
    isAssigned: DataTypes.BOOLEAN,
    assigneeName: DataTypes.STRING,
    assigneeEmail: DataTypes.STRING,
    assigneeAvatar: DataTypes.STRING,
    isDated: DataTypes.BOOLEAN,
    date: DataTypes.DATE,
    timezone: DataTypes.STRING,
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
    updatedBy: DataTypes.STRING,
  }, {timestamps: false, freezeTableName: true});
  tasklists.associate = function(models: any) {
    // associations can be defined here
  };
  return tasklists;
};
