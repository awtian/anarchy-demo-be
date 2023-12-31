'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Logs extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Logs.belongsTo(models.User, {
        foreignKey: 'userId',
        onDelete: 'CASCADE'
      })

      Logs.hasMany(models.Chat, {
        foreignKey: 'logId',
      })
    }
  }
  Logs.init({
    userId: DataTypes.INTEGER,
    isShared: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    title: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Logs',
  });
  return Logs;
};