const readService = require("./read.service")

async function readController(req,res) {
    try {
        await readService(req,res)
    } catch (error) {
        console.log(error)
    }
}

module.exports = readController