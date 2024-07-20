const sequelize = require("../../connection/conn");
const spareParts = require("../../model/spareParts");
const Helper = require('../../helper/helper')
exports.productApi = async (req,res) => {

    try {
        const parts = await spareParts.findAll()
        const partsData = [];
        //console.log(parts)
        parts.map((record) => {
            const values = {
                value:record.id,                
                label:record.part_number+'-'+record.part_name,
                itemPrice:record.unit_price,                
            }
            partsData.push(values)
        })
        Helper.response("success","record found successfully",{partsData},res,200)
    } catch (error) {
        Helper.response("success","Something went wrong!",{error},res,200)
    }
}

