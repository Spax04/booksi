'use strict';
module.exports = (sequelize: any, DataTypes: any) => {
  const departments = sequelize.define('departments', {
    shopName: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    departments: DataTypes.JSON, // [{name: string, color: string}]
  }, {timestamps: false, freezeTableName: true});
  departments.associate = function(models: any) {
    // associations can be defined here
  };
  return departments;
};
