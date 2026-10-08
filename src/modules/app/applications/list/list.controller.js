const responses = require("../../../../data/responses.js")
const listService = require("./list.service.js")

async function listController(req,res) {
    try {
        await listService(req,res)
    } catch (error) {
        
    }
}

module.exports = listController