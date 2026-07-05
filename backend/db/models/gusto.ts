'use strict';
module.exports = (sequelize: any, DataTypes: any) => {
  const gusto = sequelize.define('gusto', {
    shopName: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true
    },
    email: DataTypes.STRING,
    name: DataTypes.STRING,
    createdAt: DataTypes.DATE,
    accessToken: DataTypes.STRING,
    refreshToken: DataTypes.STRING,
    companyUuid: DataTypes.STRING,
    tokenType: DataTypes.STRING,
    expiresIn: DataTypes.INTEGER,
  }, {freezeTableName: true, timestamps: false});
  gusto.associate = function(models: any) {
    // associations can be defined here
  };
  return gusto;
};
