'use strict';
module.exports = (sequelize: any, DataTypes: any) => {
  const commissionTeams = sequelize.define('commissionTeams', {
    shopName: DataTypes.STRING,
    teamName: DataTypes.STRING,
    members: DataTypes.JSONB, // [{email, name, avatar}]
    commissionPlan: DataTypes.JSONB, // ICommissionPlan
    commissionModel: DataTypes.JSONB, // 'split' / 'duplicate'
    locationTag: DataTypes.JSONB,
  }, {timestamps: false, freezeTableName: true});
  commissionTeams.associate = function(models: any) {
    // associations can be defined here
  };
  return commissionTeams;
};
