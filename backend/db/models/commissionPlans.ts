'use strict';
module.exports = (sequelize: any, DataTypes: any) => {
  const commissionPlans = sequelize.define('commissionPlans', {
    shopName: DataTypes.STRING,
    uuid: DataTypes.STRING, // universal unique identifier
    name: DataTypes.STRING, // plan name
    description: DataTypes.STRING, // plan description
    type: DataTypes.STRING, // 'Fixed'/'Steps'
    fixedCommission: DataTypes.JSON, // {fixedType: 'flat' | 'percent', fixedAmount: float <if percent float is 0.1 - 100>}
    commissionSteps: DataTypes.JSON, // [{index: integer, from: integer, to: any, amount: float}]
    bonuses: DataTypes.JSON, // [{name: string, from: integer, fixedType: 'flat' | 'percent', fixedAmount: float <if percent float is 0.1 - 100>}]
    bonusBase: DataTypes.STRING, // 'Locations' | 'Personal'
    bonusLocations: DataTypes.JSON, // [{name: string, id: string}]
    productCategories: DataTypes.JSON, // String[]
    creator: DataTypes.JSON,
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
    updatedBy: DataTypes.JSON,
  }, {timestamps: false, freezeTableName: true});
  commissionPlans.associate = function(models: any) {
    // associations can be defined here
  };
  return commissionPlans;
};
