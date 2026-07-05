'use strict';
module.exports = (sequelize: any, DataTypes: any) => {
  const ordersMapping = sequelize.define('ordersMapping', {
    shopName:  {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true
    },
    monthYear: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true
    },
    orders: DataTypes.JSONB, // [{orderId: string, commissionPlan: any, team: string}]
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  }, {freezeTableName: true, timestamps: false});
  ordersMapping.associate = function(models: any) {
    // associations can be defined here
  };
  return ordersMapping;
};
