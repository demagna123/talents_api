module.exports = {
    maxPoints: {
        skills: 35,
        experience: 20,
        links: 15,
        availability: 15,
        motivation: 15,
    },

    skillLevelFactor: { beginner: 0.4, intermediate: 0.7, advanced: 1 },

    // Si le programme n'a défini aucune compétence attendue :
    // on note le nombre de compétences déclarées (plafonné)
    fallbackSkillsCap: 5,

    experience: { yearsCap: 5, projectsCap: 5, yearsPoints: 10, projectsPoints: 10 },

    links: { github: 10, portfolio: 5 },

    availabilityPoints: { full_time: 15, part_time: 9, weekends: 5 },

    motivation: {
        minLength: 30,
        goodLength: 300,
        lengthPoints: 8,
        keywordPoints: 7,
        keywordsForFull: 3,
        // Sans accents ni majuscules (le texte est normalisé avant comparaison)
        keywords: [
            "apprendre", "projet", "equipe", "contribuer",
            "formation", "developpement", "communaute", "evoluer",
        ],
    },

    defaultThresholds: { priority: 70, review: 40 },
}