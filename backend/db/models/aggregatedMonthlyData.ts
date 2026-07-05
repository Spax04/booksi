'use strict';
module.exports = (sequelize: any, DataTypes: any) => {
  const aggregatedMonthlyData = sequelize.define('aggregatedMonthlyData', {
    shopName: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true
    },
    monthYear: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true
    },
    monthName: DataTypes.STRING,
    year: DataTypes.INTEGER,
    week: DataTypes.INTEGER,
    monthStart: DataTypes.STRING,
    monthEnd: DataTypes.STRING,
    shifts: DataTypes.INTEGER,
    hoursWorked: DataTypes.DECIMAL,
    hoursCost: DataTypes.DECIMAL,
    employeeCount: DataTypes.INTEGER,
    ordersCount: DataTypes.INTEGER,
    productsCount: DataTypes.INTEGER,
    salesTotal: DataTypes.DECIMAL,
    salesByLocationId: DataTypes.JSONB,
    salesByEmployee: DataTypes.JSONB,
    positiveTransactionsCount: DataTypes.INTEGER,
    negativeTransactionsCount: DataTypes.INTEGER,
    saleTransactions: DataTypes.DECIMAL,
    refundTransactions: DataTypes.DECIMAL,
    subtotalTransactions: DataTypes.DECIMAL,
    incomeByCurrency: DataTypes.JSONB,
    incomeByPaymentMethod: DataTypes.JSONB,
  }, {freezeTableName: true, timestamps: false});
  aggregatedMonthlyData.associate = function(models: any) {
    // associations can be defined here
  };
  return aggregatedMonthlyData;
};
