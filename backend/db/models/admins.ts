'use strict';
module.exports = (sequelize: any, DataTypes: any) => {
    const admins = sequelize.define('admins', {
        name: DataTypes.STRING,
        email: {
          type: DataTypes.STRING,
          allowNull: false,
          primaryKey: true
        },
        password: DataTypes.STRING,
        permissions: DataTypes.JSON
    }, {freezeTableName: true, timestamps: false});
  admins.associate = function (models: any) {
        // associations can be defined here
    };
    return admins;
};
