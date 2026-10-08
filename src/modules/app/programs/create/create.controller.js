const createService = require("./create.service")


async function createController(req,res) {
    try {
      await  createService(req,res)
    } catch (error) {
        console.log(error)
    }
}

module.exports = createController