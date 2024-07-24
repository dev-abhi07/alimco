const Helper = require('../../helper/helper');
const users = require('../../model/users');
const ticket = require('../../model/ticket');
const aasra = require('../../model/aasra');
const grieance =  require('../../model/grievance');
const otp = require("../../model/otp");
exports.ticketListDetails = async (req, res) => {
    try {
        const token = req.headers["authorization"];
        const string = token.split(" ");
        const user = await users.findAll({
            include: [{
                model: aasra,
                as: 'aasra',

                include: [{
                    model: ticket,
                    as: 'aasra_ticket'
                }]
            }],
            where: {
                token: string[1]
            }
        });
        if (user) {
            const customer_name = user[0]?.name
            const data = user[0]?.aasra?.aasra_ticket.map((f) => {

                const user = {
                    ticket_id: f.id,
                    customer_name: customer_name,
                    status: f.status,
                    description: f.description,
                    product_name: f.product_name,
                    appointment_date: Helper.formatDateTime(f.createdAt),
                    percentage: (f.status == 'Done') ? 100 : (f.status == 'Pending') ? 10 : (f.status == 'Open') ? 50 : 0
                }
                return user
            })
            Helper.response("Success", "Record found Successfully", data, res, 200)
        }
    } catch (error) {
        console.log(error)
        Helper.response("Failed", "No Record found ", {}, res, 200)
    }
}   

exports.aasraMessage = async (req, res) => {
    
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
            descriptionAasra: req.body.message,
            aasraId: userId,
            ticket_id:getTicket.dataValues.ticket_id
        }
    
        const create = grieance.create(data);
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

exports.aasraChatList = async (req, res) => {
    
    try {
     
        //console.log(userId)
        const tickets = await grieance.findAll({
            where: {
                ticket_id: req.body.ticket_id
            }
        })
        if (!tickets) {
            // If no ticket is found, respond with an error
            return Helper.response(
                "failed",
                "Ticket not found!",
                {},
                res,
                200
            );
        }
        const ticketData = [];
        await Promise.all(
            tickets.map(async (record) => {

            if (record.descriptionUser) {
                ticketData.push({
                  id: record.ticket_id,
                  sender: "admin",
                  time: record.createdAt,
                  message: record.descriptionUser
                });
              }
          
              if (record.descriptionAasra) {
                ticketData.push({
                  id: record.ticket_id,
                  sender: "self",
                  time: record.createdAt,
                  message: record.descriptionAasra
                });
              }
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


exports.ticketSendOtp = async (req, res) => {
    
    try {
        const userId = await Helper.getUserDetails(req)
       
        const getTicket = await ticket.findOne({
            where: {
                ticket_id: req.body.ticket_id
            }
        })
        if (!getTicket) {
            return Helper.response(
                "failed",
                "Ticket not found!",
                {},
                res,
                200
            );
        }
  
        if (getTicket) {
            const data = otp.create({
                mobile: userId.mobile,
                otp: 1234
            })
            Helper.response('success', 'OTP Sent Successfully', {}, res, 200);
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

exports.ticketOtpVerify = async (req, res) => {
    try {
        const userId = await Helper.getUserDetails(req)

    const verify = otp.findOne({
        where: {
            mobile: userId.mobile,
            status: 1
        }
       })
    
        if (verify) {
            const update = await otp.update({
                status: 0,
            },
                {
                    where: {
                        mobile: userId.mobile,
                        otp: req.body.otp,
                        status: 1
                    }
                }
            )
            if (update) {
                const update = await ticket.update({
                    status:2
                }, {
                    where: {
                        ticket_id: req.body.ticket_id,
                    }
                })
                Helper.response('success', 'Ticket Closed!', {  }, res, 200);
            }

        } else {
            Helper.response('failed', 'OTP does not match!', { error }, res, 200);
        }
    } catch (error) {
        Helper.response('failed', 'Something went wrong!', { error }, res, 200);
    }
    

}