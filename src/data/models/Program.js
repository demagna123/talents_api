module.exports = (sequelize, DataTypes) => {
  const Program = sequelize.define(
    "programs",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      title: {
        type: DataTypes.STRING(150),
        allowNull: false,
        unique: true,
        validate: { notEmpty: true },
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM("draft", "open", "closed"),
        allowNull: false,
        defaultValue: "draft",
      },
      startDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      deadline: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        comment: "Date limite de dépôt des candidatures",
      },
      maxSeats: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: { min: 1 },
      },
      priorityThreshold: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 70,
        validate: { min: 0, max: 100 },
        comment: "Score minimum pour être classé 'prioritaire'",
      },
      reviewThreshold: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 40,
        validate: { min: 0, max: 100 },
        comment: "Score minimum pour être classé 'à examiner'",
      },
    },
    {
      tableName: "programs",
      timestamps: true,
      validate: {
        thresholdsOrder() {
          if (this.reviewThreshold >= this.priorityThreshold) {
            throw new Error(
              "reviewThreshold doit être inférieur à priorityThreshold",
            );
          }
        },
      },
    },
  );

  return Program;
};
