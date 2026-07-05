'use strict';
module.exports = (sequelize: any, DataTypes: any) => {
  const gustoPersonnelIntegration = sequelize.define('gustoPersonnelIntegration', {
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
    ssn: DataTypes.STRING,
    gusto_employee_id: DataTypes.STRING,
  }, {freezeTableName: true, timestamps: false});
  gustoPersonnelIntegration.associate = function(models: any) {
    // associations can be defined here
  };
  return gustoPersonnelIntegration;
};
