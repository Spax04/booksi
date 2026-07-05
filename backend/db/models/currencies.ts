'use strict';
module.exports = (sequelize: any, DataTypes: any) => {
  const currencies = sequelize.define('currencies', {
      name: DataTypes.STRING,
      mark: DataTypes.STRING,
      code: DataTypes.STRING
  }, {timestamps: false});
  currencies.associate = function(models: any) {
    // associations can be defined here
  };
  return currencies;
};
