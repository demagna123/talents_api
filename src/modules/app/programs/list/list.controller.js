const listService = require("./list.service")


async function listController(req,res) {
    try {
        await listService(req,res)
    } catch (error) {
        console.log(error)
    }
}

module.exports = listController