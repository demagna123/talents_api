const db = require("../models")

require("dotenv").config()

const SKILLS = [
    { name: "HTML/CSS", category: "frontend" },
    { name: "JavaScript", category: "frontend" },
    { name: "TypeScript", category: "frontend" },
    { name: "React", category: "frontend" },
    { name: "Next.js", category: "frontend" },
    { name: "Flutter", category: "frontend" },
    { name: "Node.js", category: "backend" },
    { name: "Express", category: "backend" },
    { name: "Python", category: "backend" },
    { name: "Django", category: "backend" },
    { name: "PHP/Laravel", category: "backend" },
    { name: "Java", category: "backend" },
    { name: "MySQL", category: "database" },
    { name: "PostgreSQL", category: "database" },
    { name: "Git/GitHub", category: "tools" },
    { name: "REST API", category: "tools" },
]

async function seed() {
    try {
        await db.sequelize.sync()

        let created = 0
        for (const skill of SKILLS) {
            // findOrCreate : on peut relancer le script sans créer de doublons
            const [, isNew] = await db.skills.findOrCreate({
                where: { name: skill.name },
                defaults: skill,
            })
            if (isNew) created++
        }

        console.log(`Seed terminé : ${created} nouvelle(s) compétence(s), ${SKILLS.length - created} déjà présente(s)`)
    } catch (error) {
        console.error("Erreur pendant le seed :", error)
        process.exitCode = 1
    } finally {
        await db.sequelize.close()
    }
}

seed()