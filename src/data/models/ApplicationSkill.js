module.exports = (sequelize, DataTypes) => {
  const ApplicationSkill = sequelize.define(
    "applicationskills",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      applicationId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      skillId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      level: {
        type: DataTypes.ENUM("beginner", "intermediate", "advanced"),
        allowNull: false,
        defaultValue: "beginner",
      },
    },
    {
      tableName: "applicationskills",
      timestamps: false,
      indexes: [
        {
          unique: true,
          fields: ["applicationId", "skillId"],
          name: "unique_skill_per_application",
        },
      ],
    }
  );

  return ApplicationSkill;
};