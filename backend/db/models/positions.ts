'use strict';
module.exports = (sequelize: any, DataTypes: any) => {
  const positions = sequelize.define('positions', {
    shopName: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    positions: DataTypes.JSON, // String[]
  }, {timestamps: false, freezeTableName: true});
  positions.associate = function(models: any) {
    // associations can be defined here
  };
  return positions;
};
