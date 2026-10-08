module.exports = (sequelize, DataTypes) => {
  const Candidate = sequelize.define(
    "candidates",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      firstName: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: { notEmpty: true },
      },
      lastName: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: { notEmpty: true },
      },
      email: {
        type: DataTypes.STRING(150),
        allowNull: false,
        unique: true,
        validate: { isEmail: true },
      },
      phone: {
        type: DataTypes.STRING(30),
        allowNull: true,
      },
      country: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      city: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      educationLevel: {
        type: DataTypes.ENUM("bac", "licence", "master", "doctorat", "autre"),
        allowNull: false,
        defaultValue: "autre",
      },
      fieldOfStudy: {
        type: DataTypes.STRING(150),
        allowNull: true,
      },
      githubUrl: {
        type: DataTypes.STRING(255),
        allowNull: true,
        validate: { isUrl: true },
      },
      portfolioUrl: {
        type: DataTypes.STRING(255),
        allowNull: true,
        validate: { isUrl: true },
      },
    },
    {
      tableName: "candidates",
      timestamps: true, // createdAt et updatedAt automatiques
    }
  );

  return Candidate;
};