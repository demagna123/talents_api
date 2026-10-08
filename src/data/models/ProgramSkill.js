module.exports = (sequelize, DataTypes) => {
  const ProgramSkill = sequelize.define(
    "programskills",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      programId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      skillId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      weight: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        validate: { min: 1, max: 5 },
        comment: "Importance de cette compétence pour ce programme (1 à 5)",
      },
      isRequired: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: "Compétence indispensable ou simplement appréciée",
      },
    },
    {
      tableName: "programskills",
      timestamps: false,
      indexes: [
        {
          unique: true,
          fields: ["programId", "skillId"],
          name: "unique_skill_per_program",
        },
      ],
    }
  );

  return ProgramSkill;
};