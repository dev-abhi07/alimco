const Helper = require('../../helper/helper');
const users = require('../../model/users');
const ticket = require('../../model/ticket');
const aasra = require('../../model/aasra');
exports.ticketListDetails =async (req,res)=>{
    try {
        const token = req.headers["authorization"];
        const string = token.split(" ");
        const user = await users.findOne({
            include:[{
                model:aasra,
                as:'aasra',
                attributes:['email']
            },{
                model:ticket,
                as:'ticket',
                
            }],
            where: {
                token:string[1] 
            }
        });
        console.log(user)
    } catch (error) {
        console.log(error)
    }
}