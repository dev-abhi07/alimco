const Helper = require('../../helper/helper')
const city = require('../../model/city')
const states = require('../../model/state')
exports.Dashboard = (req, res) => {

}


exports.states = async (req, res) => {
    try {
        const state = await states.findAll({
            order:[
                ['name','ASC']
            ]
        })
        const stateData = [];
        state.map( async (record) => {
            const values = {
                value:record.id,
                label:record.name
            }
            stateData.push(values)
        })
        Helper.response(
            "success",
            "Login Successful",
            {stateData},
            res,
            200
        );
    } catch (error) {
        Helper.response(
            "failed",
            "Something went wrong!",
            {error},
            res,
            200
        );
    }
}

exports.cities = async (req ,res) => {
    try {
        const cities = await city.findAll({
            where:{
                state_id:req.body.id
            },
            order:[
                ['city','ASC']
            ]
        })
        const cityData = [];
        cities.map( async (record) => {
            const values = {
                value:record.id,
                label:record.city
            }
            cityData.push(values)
        })
        Helper.response(
            "success",
            "Login Successful",
            {cityData},
            res,
            200
        );
    } catch (error) {
        console.log(error)
    }
}