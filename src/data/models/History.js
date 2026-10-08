module.exports = (sequelize, DataTypes) => {
  const History = sequelize.define(
    "histories",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      wording: { type: DataTypes.TEXT, allowNull: false },
      userId: { type: DataTypes.INTEGER, allowNull: true },
    },
    { tableName: "histories", timestamps: true }
  );
  return History;
};