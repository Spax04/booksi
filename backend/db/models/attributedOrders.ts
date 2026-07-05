'use strict';
module.exports = (sequelize: any, DataTypes: any) => {
  const attributedOrders = sequelize.define('attributedOrders', {
    shopName: DataTypes.STRING,
    email: DataTypes.STRING,
    orderId: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true
    },
    locationId: DataTypes.STRING,
    userId: DataTypes.STRING,
    timezone: DataTypes.STRING,
    team: DataTypes.STRING,
    createdAt: DataTypes.DATE,
    processedAt: DataTypes.DATE,
    orderData: DataTypes.JSONB,
    productsTotal: DataTypes.INTEGER,
    subTotal: DataTypes.DOUBLE,
    shopifyUser: DataTypes.JSONB,
    orderStatusUrl: DataTypes.STRING,
    commissionPlanName: DataTypes.STRING,
    commissionPlan: DataTypes.JSONB,
    commissionData: DataTypes.JSONB,
    commission: DataTypes.DOUBLE,
  }, {freezeTableName: true, timestamps: false});
  attributedOrders.associate = function(models: any) {
    // associations can be defined here
  };
  return attributedOrders;
};
