module.exports = (sequelize, DataTypes) => {
  const Skill = sequelize.define(
    "skills",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        validate: { notEmpty: true },
      },
      category: {
        type: DataTypes.ENUM("frontend", "backend", "database", "tools", "other"),
        allowNull: false,
        defaultValue: "other",
      },
      weight: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        validate: { min: 1, max: 5 },
        comment: "Importance de la compétence dans le scoring (1 à 5)",
      },
    },
    {
      tableName: "skills",
      timestamps: false,
    }
  );

  return Skill;
};