const updateStatusService = require("./updateStatus.service")

async function updateStatusController(req, res) {
    await updateStatusService(req, res)
}

module.exports = updateStatusController