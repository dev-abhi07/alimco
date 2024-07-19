const { where } = require("sequelize");
const sequelize = require("../../connection/conn");
const ticket = require("../../model/ticket");
const Helper = require("../../helper/helper");
const users = require("../../model/users");



exports.createCustomerTicket = async (req, res) => {
    try {

        // console.log(await Helper.getUserId(req))
        // return false
        var ticketId = await Helper.generateNumber(100000, 999999);
        const checkTicketId = await ticket.count({
            where: {
                ticket_id: ticketId
            }
        });
        if (checkTicketId == 0) {
            ticketId = await Helper.generateNumber(10000, 99999);
        }

        aasraUniqueId = await Helper.getAasra(req.body.aasraId)
        const createRecord = await ticket.create({
            ticket_id: ticketId+'-'+aasraUniqueId,
            appointment_date: req.body.appointment_date,
            appointment_time: req.body.appointment_time,
            itemName: req.body.itemName,
            itemId: req.body.itemId,
            description: req.body.description,
            userId: await Helper.getUserId(req),
            aasraId: req.body.aasraId

        });
        Helper.response(
            "success",
            "Ticket Created Successfully!",
            {},
            res,
            200
        );

    } catch (error) {
        // console.log(error)
        Helper.response(
            "failed",
            "Something went wrong!",
            {error},
            res,
            200
        );
    }
}

exports.ticketList = async (req ,res) => {
    // console.log(req)
    try {
        const userId = await Helper.getUserId(req)
        //console.log(userId)
        const tickets = await ticket.findAll({
            where:{
                userId:userId
            }
        })
        const ticketData = [];
        tickets.map(async(record) => {
            const getUser = await users.findByPk(record.userId)            
            const data = {
                aasraId:record.aasraId,
                customerName:getUser.name,                                                                                                                                                                                                                                                                                                                            
                itemName:record.itemName,
                itemId:record.itemId,
                description:record.description,
                appointment_date:record.appointment_date,
                appointment_time:record.appointment_time
                
            }
            console.log(data)
        })
        
    } catch (error) {
        
    }
}

