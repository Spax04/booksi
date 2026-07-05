'use strict';
module.exports = (sequelize: any, DataTypes: any) => {
    const users = sequelize.define('users', {
        email: {
          type: DataTypes.STRING,
          primaryKey: true
        },
        name: DataTypes.STRING,
        password: DataTypes.STRING,
        avatarFile: DataTypes.STRING,
        ukey: DataTypes.STRING,
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
        defaultShop: DataTypes.STRING,
        shops: DataTypes.JSON, // [string]
        settings: DataTypes.JSON, // {...}
        ownedShops: DataTypes.JSON, // [string]
        phone: DataTypes.JSONB, // {...}}
    }, {freezeTableName: true, timestamps: false});
  users.associate = function (models: any) {
        // associations can be defined here
    };
    return users;
};
