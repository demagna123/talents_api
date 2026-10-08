const { OTP_CODE_SOURCES } = require("../constants.js")

module.exports = (sequelize, DataTypes) => {
    const OtpCode = sequelize.define(
        "otpcodes",
        {
            id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
            email: { type: DataTypes.STRING(255), allowNull: false },
            code: { type: DataTypes.STRING(255), allowNull: false }, // code hashé, jamais en clair
            source: { type: DataTypes.ENUM(...Object.values(OTP_CODE_SOURCES)), allowNull: false },
            attempts: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 }, // essais ratés sur ce code
        },
        { tableName: "otpcodes", timestamps: true, indexes: [{ fields: ["email"] }] }
    );
    return OtpCode;
};