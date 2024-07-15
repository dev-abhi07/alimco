const Helper = require('../../helper/helper')
const states = require('../../model/state')
exports.Dashboard = (req, res) => {

}


exports.states = async (req, res) => {
    try {
        const state = await states.findAll()
        const states = [];
        state.map((record) => {
            const value = {
                value:record.id,
                label:record.name
            }
            states.push(value)
        })

    } catch (error) {

    }
}