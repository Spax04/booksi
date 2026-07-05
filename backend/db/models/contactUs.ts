'use strict';
module.exports = (sequelize: any, DataTypes: any) => {
  const contactUs = sequelize.define('contactUs', {
      email: DataTypes.STRING,
      subject: DataTypes.STRING,
      message: DataTypes.STRING,
      submittedAt: DataTypes.DATE,
      payload: DataTypes.JSON,
}, {timestamps: false, freezeTableName: true});
  contactUs.associate = function(models: any) {
    // associations can be defined here
  };
  return contactUs;
};
