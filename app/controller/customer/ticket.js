const { where } = require("sequelize");
const sequelize = require("../../connection/conn");
const ticket = require("../../model/ticket");
const Helper = require("../../helper/helper");
const users = require("../../model/users");
const aasra = require('../../model/aasra');
const grievance = require('../../model/grievance');

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
            ticket_id: ticketId + '-' + aasraUniqueId,
            appointment_date: req.body.appointment_date,
            appointment_time: req.body.appointment_time,
            itemName: req.body.itemName,
            itemId: req.body.itemId,
            itemExpiry: req.body.itemExpiry,
            description: req.body.description,
            userId: await Helper.getUserId(req),
            aasraId: req.body.aasraId

        });
        Helper.response(
            "success",
            "Ticket Created Successfully!",
            { createRecord },
            res,
            200
        );

    } catch (error) {

        Helper.response(
            "failed",
            "Something went wrong!",
            { error },
            res,
            200
        );
    }
}

exports.ticketList = async (req, res) => {
    try {
        const token = req.headers['authorization'];
        const string = token.split(" ");
        const user = await users.findOne({ where: { token: string[1] } });
        if(user.user_type=='S'){
            var tickets = await ticket.findAll()
            var ticketData = [];
            await Promise.all(
                tickets.map(async (record, count = 1) => {
                    const getUser = await users.findByPk(record.userId)
                    const getAasra = await aasra.findByPk(record.aasraId)
                    const dataValue = {
                        aasraId: record.aasraId,
                        customer_name: getUser.name,
                        product_name: record.itemName,
                        itemId: record.itemId,
                        description: record.description,
                        appointment_date: record.appointment_date,
                        appointment_time: record.appointment_time,
                        ticket_id: record.ticket_id,
                        aasraName: getAasra.name_of_org,
                        status: record.status == 0 ? 'Pending' : record.status == 1 ? 'Open' : 'Closed',
                        sr_no: count + 1
                    }
                    ticketData.push(dataValue)
                })
            )
        }else{
        var tickets = await ticket.findAll({
            where: {
                aasraId: user.ref_id
            }
        })
        console.log(tickets)
        var ticketData = [];
        await Promise.all(
            tickets.map(async (record, count = 1) => {
                const getUser = await users.findByPk(record.userId)
                const getAasra = await aasra.findByPk(record.aasraId)
                const dataValue = {
                    aasraId: record.aasraId,
                    customer_name: getUser.name,
                    product_name: record.itemName,
                    itemId: record.itemId,
                    description: record.description,
                    appointment_date: record.appointment_date,
                    appointment_time: record.appointment_time,
                    ticket_id: record.ticket_id,
                    aasraName: getAasra.name_of_org,
                    status: record.status == 0 ? 'Pending' : record.status == 1 ? 'Open' : 'Closed',
                    sr_no: count + 1
                }
                ticketData.push(dataValue)
            })
        )
    }
        Helper.response(
            "success",
            "Welcome to Dashboard",
            {
                cardData: data,
                tableData: ticketData,
                sideBar: res.filteredMenu
            },
            res,
            200
        );
    } catch (error) {
        Helper.response(
            "success",
            "Something went wrong!",
            {error},
            res,
            200
        );
    }
}

exports.customerMessage = async (req, res) => {

    try {

        const userId = await Helper.getUserId(req)

        const getTicket = await ticket.findOne({
            where: {
                ticket_id: req.body.ticket_id
            }
        })
        if (!getTicket) {
            // If no ticket is found, respond with an error
            return Helper.response(
                "failed",
                "Ticket not found!",
                {},
                res,
                200
            );
        }

        // console.log(getTicket.dataValues.ticket_id);
        // return false ;
        const data = {
            descriptionUser: req.body.descriptionUser,
            userId: userId,
            ticket_id: getTicket.dataValues.ticket_id
        }

        const create = grievance.create(data);
        if (create) {
            Helper.response(
                "success",
                "Record Created Successfully",
                {},
                res,
                200
            );
        } else {
            Helper.response(
                "failed",
                "Something went wrong!",
                {},
                res,
                200
            );
        }

    } catch (error) {
        Helper.response(
            "failed",
            "Something went wrong!",
            {},
            res,
            200
        );
    }
}

exports.chatList = async (req, res) => {

    try {

        //console.log(userId)
        const tickets = await grievance.findAll({
            where: {
                ticket_id: req.body.ticket_id
            }
        })
        const ticketData = [];
        await Promise.all(
            tickets.map(async (record) => {

                // const getUser = await users.findByPk(record.userId)

                // const getAasra = await aasra.findByPk(record.aasraId)

                const data = {
                    aasraId: record.aasraId,
                    ticket_id: record.ticket_id,
                    userId: record.userId,
                    descriptionUser: record.descriptionUser,
                    descriptionAasra: record.descriptionAasra,
                    createdAt: record.createdAt
                }
                ticketData.push(data)

            })
        )
        Helper.response(
            "success",
            "Chat List",
            {
                ticketData
            },
            res,
            200
        );

    } catch (error) {
        Helper.response(
            "failed",
            "Something went wrong!",
            {},
            res,
            200
        );
    }
}

exports.chatHistory = async (req, res) => {

    try {

        //console.log(userId)
        const userId = await Helper.getUserId(req)

        const tickets = await ticket.findAll({
            where: {
                userId: userId
            }
        })
        const ticketData = [];
        await Promise.all(
            tickets.map(async (record) => {

                const getUser = await users.findByPk(record.userId)

                const getAasra = await aasra.findByPk(record.aasraId)

                const data = {
                    aasraId: record.aasraId,
                    customerName: getUser.name,
                    itemName: record.itemName,
                    itemId: record.itemId,
                    description: record.description,
                    appointment_date: record.appointment_date,
                    appointment_time: record.appointment_time,
                    aasraName: getAasra.name_of_org,
                    ticketId: record.ticket_id,
                    status: record.status

                }
                ticketData.push(data)

            })
        )
        Helper.response(
            "success",
            "Chat Hisotry",
            {
                ticketData
            },
            res,
            200
        );

    } catch (error) {
        Helper.response(
            "failed",
            "Something went wrong!",
            {},
            res,
            200
        );
    }
}