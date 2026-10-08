module.exports = (sequelize, DataTypes) => {
  const Application = sequelize.define(
    "applications",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      candidateId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      programId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      motivation: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: { len: [30, 3000] },
      },
      availability: {
        type: DataTypes.ENUM("full_time", "part_time", "weekends"),
        allowNull: false,
      },
      yearsOfExperience: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: { min: 0, max: 50 },
      },
      projectsCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: { min: 0 },
      },
      status: {
        type: DataTypes.ENUM(
          "new",
          "under_review",
          "shortlisted",
          "rejected",
          "accepted"
        ),
        allowNull: false,
        defaultValue: "new",
      },
      score: {
        type: DataTypes.INTEGER,
        allowNull: true, // null tant que le score n'est pas calculé
        validate: { min: 0, max: 100 },
      },
      priorityLevel: {
        type: DataTypes.ENUM("priority", "to_review", "low"),
        allowNull: true,
      },
      scoreBreakdown: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: "Détail des points par critère, pour expliquer le score",
      },
    },
    {
      tableName: "applications",
      timestamps: true, // createdAt = date de soumission
      indexes: [
        {
          unique: true,
          fields: ["candidateId", "programId"],
          name: "unique_candidate_per_program",
        },
        {
          fields: ["programId", "score"],
          name: "idx_program_score",
        },
      ],
    }
  );

  return Application;
};