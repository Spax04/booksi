'use strict';
module.exports = (sequelize: any, DataTypes: any) => {
  const userFeedback = sequelize.define('userFeedback', {
      shopName: DataTypes.STRING,
      userEmail: DataTypes.STRING,
      userName: DataTypes.STRING,
      rating: DataTypes.STRING,
      message: DataTypes.STRING,
      submittedAt: DataTypes.DATE,
      payload: DataTypes.JSON,
}, {timestamps: false, freezeTableName: true});
  userFeedback.associate = function(models: any) {
    // associations can be defined here
  };
  return userFeedback;
};
