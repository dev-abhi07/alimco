const { where } = require("sequelize");
const sequelize = require("../../connection/conn");
const ticket = require("../../model/ticket");
const Helper = require("../../helper/helper");
const users = require("../../model/users");
const aasra = require('../../model/aasra');
const grievance = require('../../model/grievance');
const { error } = require("console");
const repairPayment = require("../../model/repairPayment");
const spareParts = require("../../model/spareParts");
const repair = require("../../model/repair");
const manufacturer = require("../../model/manufacturer");
const problem = require("../../model/problem");
const items = require("../../model/items");


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
            ticket_id: ticketId,
            appointment_date: req.body.appointment_date,
            appointment_time: req.body.appointment_time,
            itemName: req.body.itemName,
            itemId: req.body.itemId,
            itemExpiry: req.body.itemExpiry,
            description: req.body.description,
            user_id: await Helper.getUserId(req),
            aasra_id: req.body.aasraId,
            problem: req.body.id,

        });
        Helper.response(
            "success",
            "Ticket Created Successfully!",
            { createRecord },
            res,
            200
        );

    } catch (error) {
        console.log(error)
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

      
       
        const userId = await Helper.getUserId(req)
        
        const tickets = await ticket.findAll({
            order:[
                ['id','DESC']
            ],
            where: {
                user_id: userId
            }
        })


        

        const ticketData = [];
        await Promise.all(
            tickets.map(async (record) => {
                // const getUser = await users.findByPk(record.user_id)
                const getUser = await users.findOne({
                    where: {
                        ref_id: record.user_id,
                        user_type: 'C'
                    }
                })

                const getAasra = await aasra.findByPk(record.aasra_id)
                const data = {
                    id:record.id,
                    aasraId: record.aasraId,
                    customerName: getUser?.name,
                    itemName: record.itemName,
                    itemId: record.itemId,
                    description: record.description,
                    appointment_date: record.appointment_date,
                    appointment_time: record.appointment_time,
                    aasraName: getAasra?.name_of_org,
                    ticketId: record.ticket_id,
                    status: record.status


                }
                ticketData.push(data)

            })
        )
        const ticketDataset = ticketData != '' ? ticketData.sort((a, b) => b.id - a.id) : null
        if (ticketDataset != null) {
            Helper.response(
                "success",
                "Ticket List Found Successfully!",
                {
                    ticketData: ticketDataset
                },
                res,
                200
            );
        } else {
            console.log(error)
            Helper.response(
                "success",
                "No Ticket Found!",
                {
                },
                res,
                200
            );
        }


    } catch (error) {
        console.log(error)
        Helper.response(
            "failed",
            "Something went wrong!",
            {},
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

        const dataset = ticketData != null ? ticketData : null
        if (ticketData != null) {
            Helper.response(
                "success",
                "New Chat Found!",
                {
                    ticketData: dataset
                },
                res,
                200
            );
        } else {
            Helper.response(
                "success",
                "No Chat Found!",
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

exports.chatHistory = async (req, res) => {

    try {

        //console.log(userId)
        const userId = await Helper.getUserId(req)

        const tickets = await ticket.findAll({
            where: {
                user_id: userId
            }
        })
        const ticketData = [];
        await Promise.all(
            tickets.map(async (record) => {

                // const getUser = await users.findByPk(record.user_id)
                const getUser = await users.findOne({
                    where: {
                        ref_id: record.user_id,
                        user_type: 'C'
                    }
                })
                const getAasra = await aasra.findByPk(record.aasra_id)

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
            "Chat History",
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


exports.ticketCustomerdetails = async (req, res) => {
    const ticketid = req.body.ticket_id;
    const user_id  = await Helper.getUserId(req);
    
    try {
        
        const ticketData = await ticket.findOne({
            where: {
                ticket_id: ticketid,
                status: 2,
                user_id: user_id

            }
        });
      
       
        
        let ticketDetail = await repair.findAll({
            where: {
                ticket_id: ticketid
            }
        })

        const getUser = await users.findOne({
            where: {
                ref_id: ticketData.user_id,
                user_type: "C"
            }
        })
        const getAasra = await aasra.findByPk(ticketData.aasra_id)

        const repairPayments = await repairPayment.count({
            where: {
                ticket_id: ticketid
            }
        })

        const itemDetails = await items.findOne({
            where: {
                user_id: ticketData.user_id
            }
        })
        const getProblem = await problem.findOne({
            where: {
                id: ticketData.problem
            }
        })
        const warranty = Helper.compareDate(itemDetails?.expire_date);

        var subtotal = 0
        var serviceCharge = 0
        var gst = 0
        var discount = 0

        ticketDetail = await Promise.all(ticketDetail.map(async (t) => {
            const oldManufacture = await manufacturer.findOne({
                where: {
                    id: t.old_manufacturer_id
                }
            });

            const newManufacture = await manufacturer.findOne({
                where: {
                    id: t.new_manufacturer_id
                }
            });

            subtotal += t.productPrice * t.qty;
            serviceCharge += t.repairServiceCharge + t.repairPrice;
            gst = subtotal * 18 / 100;
            discount = t.record == 1 ? 100 : 0;

            return {
                ...t.dataValues,
                old_manufacture_name: oldManufacture?.manufacturer_code ?? null,
                new_manufacture_name: newManufacture?.manufacturer_code ?? null,
                old_manufacture_id: oldManufacture?.id ?? null,
                new_manufacture_id: newManufacture?.id ?? null,
            };
        }));


        const data = {
            customer_name: getUser.name,
            fixedCharge : 45 ,
            ticket_id: ticketid,
            mobile: getUser.mobile,
            product_name: ticketData.itemName,
            itemId: ticketData.itemId,
            description: ticketData.description,
            appointment_date: ticketData.appointment_date,
            appointment_time: ticketData.appointment_time,
            status: ticketData.status == 0 ? 'Pending' : ticketData.status == 1 ? 'Open' : 'Closed',
            aasraName: getAasra.name_of_org,
            subtotal: subtotal,
            serviceCharge: serviceCharge,
            gst: process.env.SERVICE_GST,
            totalAmount: subtotal,
            discount: 0,
            createdDate: ticketData.createdAt,
            payment_status: repairPayments == 0 ? false : true,
            warranty: warranty,
            gst: process.env.SERVICE_GST,
            dstDate: itemDetails?.distributed_date ?? null,
            expire_date: itemDetails?.expire_date ?? null,
            problem: getProblem?.problem_name ?? null,
            ticketDetail: ticketDetail ? ticketDetail : null,
            paymentData:await repairPayment.findOne({ where:{ticket_id: ticketid}}) || ''

        }
        Helper.response(
            "success",
            "",
            {
                tableData: data
            },
            res,
            200
        );

       
    } catch (error) {
        Helper.response('failed', 'Something went wrong!', { error: error.message }, res, 500);
    }
}
