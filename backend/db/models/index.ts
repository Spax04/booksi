'use strict';
const fs = require('fs');
const path = require('path');
const basename = path.basename(__filename);
const { Sequelize, DataTypes } = require('@sequelize/core');
const { PostgresDialect } = require('@sequelize/postgres');


let db = {
  sequelize: {},
  Sequelize: {}
};

// connect to db
let connectionString = process.env.DB_CONNECTION_STRING || '';
const sequelize = new Sequelize({
  dialect: PostgresDialect,
  url: connectionString
});

const modelsDirectory = fs.readdirSync(__dirname);

const modelsFiles = modelsDirectory.filter((file: any) => {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  });

 // load all models
  modelsFiles.forEach((file: any) => {
    // const model = sequelize['import'](path.join(__dirname, file));
    const model = require(path.join(__dirname, file))(sequelize, DataTypes);
    // @ts-ignore
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  // @ts-ignore
  if (db[modelName].associate) {
    // @ts-ignore
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
