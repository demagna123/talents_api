const dbConfig = require("../../configs/db.config.js");
const { Sequelize, DataTypes } = require("sequelize");

const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle,
  },
});

sequelize
  .authenticate()
  .then(() => {
    console.log("Database connected ...");
  })
  .catch((err) => {
    console.log("Error to connect DB " + err);
  });

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// ---------- Modèles ----------
db.users = require("./User.js")(sequelize, DataTypes);
db.candidates = require("./Candidate.js")(sequelize, DataTypes);
db.programs = require("./Program.js")(sequelize, DataTypes);
db.applications = require("./Application.js")(sequelize, DataTypes);
db.skills = require("./Skill.js")(sequelize, DataTypes);
db.applicationskills = require("./ApplicationSkill.js")(sequelize, DataTypes);
db.programskills = require("./ProgramSkill.js")(sequelize, DataTypes);
db.otpCodes = require("./OtpCode.js")(sequelize, DataTypes);
db.loginAttemps = require("./LoginAttempt.js")(sequelize, DataTypes);
db.histories = require("./History.js")(sequelize, DataTypes);

// ---------- Associations ----------

// Candidate 1 --- N Application
db.candidates.hasMany(db.applications, {
  foreignKey: "candidateId",
  as: "applications",
  onDelete: "CASCADE",
});
db.applications.belongsTo(db.candidates, {
  foreignKey: "candidateId",
  as: "candidate",
});

// Program 1 --- N Application
db.programs.hasMany(db.applications, {
  foreignKey: "programId",
  as: "applications",
  onDelete: "RESTRICT",
});
db.applications.belongsTo(db.programs, {
  foreignKey: "programId",
  as: "program",
});

// Application N --- N Skill (via ApplicationSkill)
db.applications.belongsToMany(db.skills, {
  through: db.applicationskills,
  foreignKey: "applicationId",
  otherKey: "skillId",
  as: "skills",
});
db.skills.belongsToMany(db.applications, {
  through: db.applicationskills,
  foreignKey: "skillId",
  otherKey: "applicationId",
  as: "applications",
});

// Accès direct à la table de liaison (pour lire `level`)
db.applications.hasMany(db.applicationskills, {
  foreignKey: "applicationId",
  as: "applicationSkills",
  onDelete: "CASCADE",
});
db.applicationskills.belongsTo(db.applications, {
  foreignKey: "applicationId",
});
db.skills.hasMany(db.applicationskills, {
  foreignKey: "skillId",
  as: "applicationSkills",
});
db.applicationskills.belongsTo(db.skills, {
  foreignKey: "skillId",
  as: "skill",
});

// Program N --- N Skill (via ProgramSkill)
db.programs.belongsToMany(db.skills, {
  through: db.programskills,
  foreignKey: "programId",
  otherKey: "skillId",
  as: "skills",
});
db.skills.belongsToMany(db.programs, {
  through: db.programskills,
  foreignKey: "skillId",
  otherKey: "programId",
  as: "programs",
});

// Accès direct à la table de liaison (pour lire `weight` et `isRequired`)
db.programs.hasMany(db.programskills, {
  foreignKey: "programId",
  as: "programskills",
  onDelete: "CASCADE",
});
db.programskills.belongsTo(db.programs, {
  foreignKey: "programId",
});
db.skills.hasMany(db.programskills, {
  foreignKey: "skillId",
  as: "programskills",
});
db.programskills.belongsTo(db.skills, {
  foreignKey: "skillId",
  as: "skill",
});

module.exports = db;