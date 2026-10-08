
const config = require("../configs/scoring.config")

const round2 = (n) => Math.round(n * 100) / 100
const clamp01 = (n) => Math.min(Math.max(n, 0), 1)

function normalize(text = "") {
    return String(text)
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
}

// ---------- Compétences ----------
function scoreSkills(declaredSkills, programSkills) {
    const max = config.maxPoints.skills
    const declared = new Map(declaredSkills.map((s) => [Number(s.skillId), s.level]))

    // Programme sans compétences attendues : on note le nombre de compétences déclarées
    if (programSkills.length === 0) {
        const ratio = clamp01(declared.size / config.fallbackSkillsCap)
        return { points: ratio * max, max, matched: [...declared.keys()], missingRequired: [] }
    }

    let totalWeight = 0
    let earned = 0
    const matched = []
    const missingRequired = []

    for (const ps of programSkills) {
        const skillId = Number(ps.skillId)
        const weight = Number(ps.weight) || 1
        totalWeight += weight

        if (declared.has(skillId)) {
            const factor =
                config.skillLevelFactor[declared.get(skillId)] ?? config.skillLevelFactor.beginner
            earned += weight * factor
            matched.push(skillId)
        } else if (ps.isRequired) {
            missingRequired.push(skillId)
        }
    }

    return { points: (earned / totalWeight) * max, max, matched, missingRequired }
}

// ---------- Expérience ----------
function scoreExperience(application) {
    const { yearsCap, projectsCap, yearsPoints, projectsPoints } = config.experience
    const years = clamp01((Number(application.yearsOfExperience) || 0) / yearsCap) * yearsPoints
    const projects = clamp01((Number(application.projectsCount) || 0) / projectsCap) * projectsPoints
    return { points: years + projects, max: config.maxPoints.experience }
}

// ---------- Liens ----------
function scoreLinks(candidate) {
    const points =
        (candidate.githubUrl ? config.links.github : 0) +
        (candidate.portfolioUrl ? config.links.portfolio : 0)
    return { points, max: config.maxPoints.links }
}

// ---------- Disponibilité ----------
function scoreAvailability(application) {
    return {
        points: config.availabilityPoints[application.availability] ?? 0,
        max: config.maxPoints.availability,
    }
}

// ---------- Motivation ----------
function scoreMotivation(application) {
    const cfg = config.motivation
    const text = String(application.motivation || "")

    const lengthRatio = clamp01((text.length - cfg.minLength) / (cfg.goodLength - cfg.minLength))
    const lengthPoints = lengthRatio * cfg.lengthPoints

    const normalized = normalize(text)
    const found = cfg.keywords.filter((k) => normalized.includes(k)).length
    const keywordPoints = clamp01(found / cfg.keywordsForFull) * cfg.keywordPoints

    return { points: lengthPoints + keywordPoints, max: config.maxPoints.motivation }
}

// ---------- Niveau ----------
function determineLevel(total, program = {}) {
    const priority = program.priorityThreshold ?? config.defaultThresholds.priority
    const review = program.reviewThreshold ?? config.defaultThresholds.review

    if (total >= priority) return "priority"
    if (total >= review) return "to_review"
    return "low"
}

// ---------- Fonction principale ----------
function calculateScore({
    application = {},
    candidate = {},
    skills = [],
    programSkills = [],
    program = {},
}) {
    const skillsResult = scoreSkills(skills, programSkills)
    const experience = scoreExperience(application)
    const links = scoreLinks(candidate)
    const availability = scoreAvailability(application)
    const motivation = scoreMotivation(application)

    const rawTotal =
        skillsResult.points + experience.points + links.points +
        availability.points + motivation.points

    const total = Math.round(Math.min(Math.max(rawTotal, 0), 100))

    let level = determineLevel(total, program)
    let cappedByRequiredSkills = false
    if (level === "priority" && skillsResult.missingRequired.length > 0) {
        level = "to_review"
        cappedByRequiredSkills = true
    }

    return {
        total,
        level,
        breakdown: {
            skills: {
                points: round2(skillsResult.points),
                max: skillsResult.max,
                matched: skillsResult.matched,
                missingRequired: skillsResult.missingRequired,
            },
            experience: { points: round2(experience.points), max: experience.max },
            links: { points: round2(links.points), max: links.max },
            availability: { points: round2(availability.points), max: availability.max },
            motivation: { points: round2(motivation.points), max: motivation.max },
            cappedByRequiredSkills,
        },
    }
}

module.exports = { calculateScore, determineLevel }