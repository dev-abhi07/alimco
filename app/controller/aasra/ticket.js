const Helper = require('../../helper/helper');
const users = require('../../model/users');
const ticket = require('../../model/ticket');
const aasra = require('../../model/aasra');
const otp = require('../../model/otp');
const grievance = require('../../model/grievance');
const repair = require('../../model/repair');
const stock = require('../../model/stock');
const spareParts = require('../../model/spareParts');
const repairPayment = require('../../model/repairPayment');
const { error } = require('console');
const validator = require('validator');
const customer = require('../../model/customer');
const jwt = require("jsonwebtoken");
const items = require('../../model/items');
const problem = require('../../model/problem');


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
            Helper.response("success", "Record found Successfully", data, res, 200)
        }
    } catch (error) {
        console.log(error)
        Helper.response("failed", "No Record found ", {}, res, 200)
    }
}


exports.ticketList = async (req, res) => {
    try {
        const token = req.headers["authorization"];
        const string = token.split(" ");
        var tickets = await ticket.findAll({
            where: {
                aasraId: user.ref_id
            }
        })
        const ticketData = [];
        await Promise.all(
            tickets.map(async (record, count = 1) => {
                const getUser = await users.findByPk(record.userId)
                const getAasra = await aasra.findByPk(record.aasraId)

                const repairData = await repair.findAll({
                    where: {
                        ticket_id: record.ticket_id
                    }
                })

                const repairPayments = await repairPayment.count({
                    where: {
                        ticket_id: record.ticket_id
                    }
                })

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
                    sr_no: count + 1,
                    ticketDetail: record.status == 2 ? repairData : null,
                    payment_status: repairPayments == 0 ? false : true
                }
                ticketData.push(dataValue)
            })
        )
        Helper.response(
            "success",
            "Record Found Successfully!",
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
            "failed",
            "Something went wrong!",
            { error },
            res,
            200
        );
    }
}

exports.createRepair = async (req, res) => {
    try {
        const token = req.headers['authorization'];
        const string = token.split(" ");
        const user = await users.findOne({ where: { token: string[1] } });
        const aasras = await aasra.findOne({ where: { id: user.ref_id } })

        const data = req.body;

        var discount = 0
        var totalAmount = 0
        var serviceCharge = 0
        var mode = []
        var ticketId = ''
        var stocks = true
        const create = await Promise.all(
            data.map(async (record) => {
                const item_id = await spareParts.findByPk(record.productValue)
                const stockData = await stock.findAll({ where: { item_id: item_id.id, aasra_id: user.ref_id } })
                if (stock)
                    if (stockData.length > 0) {

                        totalAmount += record.price * record.qty
                        serviceCharge += record.repairServiceCharge
                        mode.push(record.mode)
                        ticketId = record.ticket_id
                        if (record.warranty == true) {
                            const values = {
                                warranty: record.warranty,
                                categoryValue: record.categoryValue,
                                categoryLabel: record.categoryLabel,
                                productValue: record.productValue,
                                productLabel: record.productLabel,
                                repairValue: record.repairValue,
                                repairLabel: record.repairLabel,
                                repairServiceCharge: record.repairServiceCharge,
                                repairTime: record.repairTime,
                                repairPrice: record.repairPrice,
                                repairGst: record.repairGst,
                                qty: record.qty,
                                price: record.price,
                                serviceCharge: record.serviceCharge,
                                gst: record.gst,
                                amount: record.amount,
                                ticket_id: record.ticket_id,
                                discount: discount,
                                old_serial_number: record.old_sr_no,
                                new_serial_number: record.new_sr_no,
                                old_manufacturer_id: record.old_manufacturer_id,
                                new_manufacturer_id: record.new_manufacturer_id
                            }
                            repairsCreate = await repair.create(values)

                        }
                        else {
                            const values = {
                                warranty: record.warranty,
                                categoryValue: record.categoryValue,
                                categoryLabel: record.categoryLabel,
                                productValue: record.productValue,
                                productLabel: record.productLabel,
                                repairValue: record.repairValue,
                                repairLabel: record.repairLabel,
                                repairServiceCharge: record.repairServiceCharge,
                                repairTime: record.repairTime,
                                repairPrice: record.repairPrice,
                                repairGst: record.repairGst,
                                qty: record.qty,
                                price: record.price,
                                serviceCharge: record.serviceCharge,
                                gst: record.gst,
                                amount: record.amount,
                                ticket_id: record.ticket_id,
                                old_serial_number: record.old_sr_no,
                                new_serial_number: record.new_sr_no,
                                old_manufacturer_id: record.old_manufacturer_id,
                                new_manufacturer_id: record.new_manufacturer_id
                            }
                            repairsCreate = await repair.create(values)

                        }
                        //return false
                        const stockDetails = await stock.findAll({
                            where: {
                                item_id: record.productValue,
                                aasra_id: user.ref_id
                            }

                        })
                        if (stockDetails.length > 0) {
                            // await stock.create({
                            //     item_id: record.productValue,
                            //     item_name: record.productLabel,
                            //     aasra_id: user.ref_id,
                            //     quantity: 0,
                            //     price: item_id.unit_price,
                            //     stock_in: stockDetails.stock_in - record.qty,
                            //     stock_out: record.qty
                            // })
                           
                            await Promise.all(stockDetails.map(async (stockDetail) => {
                                await stock.create({
                                    item_id: record.productValue,
                                    item_name: record.productLabel,
                                    aasra_id: user.ref_id,
                                    quantity: 0,
                                    price: item_id.unit_price, // Use unit_price from the current stockDetail
                                    stock_in: stockDetail.stock_in - record.qty,
                                    stock_out: record.qty
                                });
                            }));
                        }

                    }
                    else {
                        return false
                    }
            })

        )

        if (create[0] != false) {

            await repairPayment.create({
                ticket_id: ticketId,
                discount: totalAmount + serviceCharge,
                total_amount: totalAmount,
                aasra_id: aasras.id,
                payment_mode: mode[0] ? mode[0] : null

            }).catch((error) => {
                console.log(error)
            })
            Helper.response(
                "success",
                "Repair Created Successfully!",
                {},
                res,
                200
            );
        } else {

            Helper.response(
                "failed",
                "Stocks are Not available",
                {},
                res,
                200
            );
        }
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

exports.ticketOtpVerify = async (req, res) => {
    try {
        const userId = await Helper.getUserDetails(req)
        const verify = await otp.findOne({
            where: {
                mobile: userId.mobile,
                status: 1
            }
        })

        if (verify != null && verify.otp == req.body.otp) {
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
                    status: 2
                }, {
                    where: {
                        ticket_id: req.body.ticket_id,
                    }
                })
                Helper.response('success', 'Ticket Closed Successfully!', {}, res, 200);
            }

        } else {
            Helper.response('failed', 'OTP does not match!', { error }, res, 200);
        }
    } catch (error) {
        Helper.response('failed', 'Something went wrong!', { error }, res, 200);
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

exports.aasraChatList = async (req, res) => {

    try {

        //console.log(userId)
        const tickets = await grievance.findAll({
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
                        time: Helper.formatDateTime(record.createdAt),
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
exports.openTicket = async (req, res) => {
    try {
        const tickets = ticket.update({
            status: 1,
        },
            {
                where: {
                    ticket_id: req.body.ticket_id
                }
            }
        )
        Helper.response(
            "success",
            "Ticket Open Successfully!",
            {
            },
            res,
            200
        );
    } catch (error) {
        Helper.response(
            "failed",
            "Something went wrong!",
            {
            },
            res,
            200
        );
    }
}

exports.sentOtpWeb = async (req, res) => {
    try {
        const checkUdid = await users.count({
            where: {
                udid: req.body.udid
            }
        })
        if (checkUdid == 1) {
            const mobile = await users.findOne({
                where: {
                    udid: req.body.udid
                }
            })
            if (mobile.mobile != req.body.mobile) {
                Helper.response('failed', 'Please enter registered no.', {}, res, 200);
            } else {
                const mobile = validator.isMobilePhone(req.body.mobile, 'en-IN');
                const udid = validator.isAlphanumeric(req.body.udid, 'en-IN');
                if (mobile === true && udid === true) {
                    const data = otp.create({
                        mobile: req.body.mobile,
                        otp: 1234
                    })
                    Helper.response('success', 'OTP Sent Successfully', {}, res, 200);
                }
            }
        } else {
            const mobile = validator.isMobilePhone(req.body.mobile, 'en-IN');
            const udid = validator.isAlphanumeric(req.body.udid, 'en-IN');
            if (mobile === true && udid === true) {
                const data = otp.create({
                    mobile: req.body.mobile,
                    otp: 1234
                })
                Helper.response('success', 'OTP Sent Successfully', {}, res, 200);
            }
        }
    } catch (error) {
        console.log(error)
        Helper.response('failed', 'Something went wrong!', { error }, res, 200);
    }
}

exports.getUser = async (req, res) => {

    try {

        if (res.data.length === 0) {
            return Helper.response('failed', 'Invalid Udid!', {}, res, 200);
        }

        const verify = await otp.findOne({
            where: {
                mobile: req.body.mobile,
                otp: req.body.otp,
                status: 1
            }
        })
        const beneficiaryId = res.data.res[0].beneficiaryName;
        const beneficiary = beneficiaryId.split("-");

        const userItem = [];
        res.data.res.map(async (record) => {
            const dataItem = {
                itemName: record.itemName,
                itemId: record.itemId,
                expiryDate: await Helper.addYear(record.dstDate),
                dstDate: record.dstDate,
                amount: record.amount,
                rate: record.rate
            }

            userItem.push(dataItem)
        })

        if (verify != null) {
            console.log("sssssssssss", verify)
            const update = await otp.update({
                status: 0,
            },
                {
                    where: {
                        mobile: req.body.mobile,
                        otp: req.body.otp,
                        status: 1
                    }
                }
            )
            if (update) {
                const slots = await Helper.createTimeSlots('09:00', '18:00', '13:00', '14:00', '40')
                const userData = { beneficiary_id: beneficiary[1], name: beneficiary[0], father_name: res.data.res[0].fatherName, dob: res.data.res[0].dob, gender: res.data.res[0].gender, district: res.data.res[0].campVenueDistrict, state: res.data.res[0].campVenueState, aadhaar: res.data.res[0].aadhaar, udid: req.body.udid, userItem: userItem };
                Helper.response('success', 'OTP Verified Successfully!', { mobile: req.body.mobile, userData: [userData], slots: slots }, res, 200);
            }

        } else {
            Helper.response('failed', 'Invalid  OTP', {}, res, 200);
        }
    } catch (error) {

        Helper.response('failed', 'Something went wrong!', { error }, res, 200);
    }
}
exports.getRegisteredData = async (req, res) => {

}

exports.createCustomerTicketAasraAndSaveUser = async (req, res) => {
    try {


        const checkUser = await customer.findOne({ where: { beneficiary_id: req.body.userData[0].beneficiary_id } })

        const AasraId = await Helper.getAasraId(req)
        let userdetails = 0;
        if (!checkUser) {
            const createCustomer = await customer.create({
                beneficiary_id: req.body.userData[0].beneficiary_id,
                father_name: req.body.userData[0].father_name,
                dob: req.body.userData[0].dob,
                gender: req.body.userData[0].gender,
                district: req.body.userData[0].district,
                state: req.body.userData[0].state,
                aadhaar: req.body.userData[0].aadhaar,
                udid: req.body.userData[0].udid,
            })
            if (createCustomer) {
                const user = await users.create({
                    name: req.body.userData[0].name,
                    mobile: req.body.mobile,
                    user_type: 'C',
                    udid: req.body.userData[0].udid,
                    ref_id: createCustomer.id
                })
                let token = jwt.sign({ id: user.id }, process.env.SECRET_KEY, {
                    expiresIn: "365d",
                });
                await users.update({ token: token, ref_id: createCustomer.id }, { where: { id: user.id } });
                userdetails = createCustomer.id
            }


        }

        var ticketId = await Helper.generateNumber(100000, 999999);
        const checkTicketId = await ticket.count({
            where: {
                ticket_id: ticketId
            }
        });

        if (checkTicketId == 0) {
            ticketId = await Helper.generateNumber(10000, 99999);
        }

        aasraUniqueId = await Helper.getAasra(AasraId)
        const createRecord = await ticket.create({
            ticket_id: ticketId + '-' + aasraUniqueId,
            appointment_date: req.body.appointment_date,
            appointment_time: req.body.userData.appointment_time.split('-')[1].trim(),
            itemName: req.body.product.name,
            itemId: req.body.product.label,
            itemExpiry: req.body.product.value,
            description: req.body.description ?? '-',
            user_id: checkUser?.dataValues?.id ?? userdetails,
            aasra_id: await Helper.getAasraId(req),
            problem: req.body.problem.id,

        });
        if (createRecord) {
            const checkItem = items.findOne({
                where: {
                    user_id: checkUser?.dataValues?.id ?? userdetails
                }
            })
            if (checkItem != null) {
                const createItem = await items.create({
                    item_name: req.body.userData[0].userItem[0].itemName,
                    item_id: req.body.userData[0].userItem[0].itemId,
                    rate: req.body.userData[0].userItem[0].rate,
                    amount: req.body.userData[0].userItem[0].amount,
                    user_id: checkUser?.dataValues?.id ?? userdetails,
                    distributed_date: req.body.userData[0].userItem[0].dstDate,
                    expire_date: req.body.userData[0].userItem[0].expiryDate,
                })

            }

        }

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

exports.ticketDetails = async (req, res) => {

    try {
        const ticketId = req.body.ticket_id
        const ticketData = await ticket.findOne(
            {
                where: {
                    ticket_id: ticketId
                }
            }
        )

        console.log(ticketData)
        const ticketDetail = await repair.findAll({
            where: {
                ticket_id: ticketId
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
                ticket_id: ticketId
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
        ticketDetail.map((t) => {
            subtotal += t.price * t.qty
            serviceCharge += t.repairPrice
            gst = subtotal * 18 / 100
            discount = t.record == 1 ? 100 : 0
        })
        console.log(subtotal)
        const data = {
            customer_name: getUser.name,
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
            totalAmount: subtotal + serviceCharge + gst,
            discount: 0,
            createdDate: ticketData.createdAt,
            payment_status: repairPayments == 0 ? false : true,
            warranty: warranty,
            gst: process.env.SERVICE_GST,
            dstDate: itemDetails?.distributed_date ?? null,
            expire_date: itemDetails?.expire_date ?? null,
            problem: getProblem?.problem_name ?? null,
            ticketDetail: ticketDetail ? ticketDetail : null,

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
        console.log(error)
    }
}