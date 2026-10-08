module.exports = (sequelize, DataTypes) => {
  const LoginAttempt = sequelize.define(
    "loginattemps",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      email: { type: DataTypes.STRING(255), allowNull: false, unique: true },
      attemps: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
    },
    { tableName: "loginattemps", timestamps: true }
  );
  return LoginAttempt;
};