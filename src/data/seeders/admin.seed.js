require("dotenv").config()
const bcrypt = require("bcrypt")
const db = require("../models/index.js")

async function seedAdmin() {
    const { ADMIN_EMAIL, ADMIN_PASSWORD, BCRYPT_SALT } = process.env
    if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
        console.error("Définissez ADMIN_EMAIL et ADMIN_PASSWORD dans le .env")
        process.exit(1)
    }

    const existing = await db.users.findOne({ where: { email: ADMIN_EMAIL } })
    if (existing) {
        console.log("Ce compte existe déjà.")
        process.exit(0)
    }

    await db.users.create({
        firstName: "Admin",
        lastName: "SKULLVI",
        email: ADMIN_EMAIL, // une vraie adresse : le code de connexion y sera envoyé
        role: "admin",
        password: await bcrypt.hash(ADMIN_PASSWORD, parseInt(BCRYPT_SALT, 10) || 10),
    })
    console.log("Compte créé :", ADMIN_EMAIL)
    process.exit(0)
}

seedAdmin().catch((err) => {
    console.error(err)
    process.exit(1)
})