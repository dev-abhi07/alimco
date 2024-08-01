const { Op } = require('sequelize')
const Helper = require('../../helper/helper')
const city = require('../../model/city')
const repair = require('../../model/repair')
const states = require('../../model/state')
const ticket = require('../../model/ticket')
const aasras = require('../../model/aasra')
const order = require('../../model/order')
const spareParts = require('../../model/spareParts')

exports.Dashboard = (req, res) => {

}


exports.states = async (req, res) => {
    try {
        const state = await states.findAll()
        const stateData = [];
        state.map(async (record) => {
            const values = {
                value: record.id,
                label: record.name
            }
            stateData.push(values)
        })
        Helper.response(
            "success",
            "Login Successful",
            { stateData },
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

exports.cities = async (req, res) => {
    try {
        const cities = await city.findAll({
            where: {
                state_id: req.body.id
            }
        })
        const cityData = [];
        cities.map(async (record) => {
            const values = {
                value: record.id,
                label: record.city
            }
            cityData.push(values)
        })
        Helper.response(
            "success",
            "Login Successful",
            { cityData },
            res,
            200
        );
    } catch (error) {
        console.log(error)
    }
}

exports.repair = async (req, res) => {
    try {

        const aasra = req.body.aasra_id;
        const warranty = req.body.warranty;
        const ticketDetails = await ticket.findAll({
            where: {
                aasra_id: aasra,
                status: 2
            }
        })
        if (ticketDetails.length === 0) {
            Helper.response(
                "success",
                "Record Not Found!",
                {},
                res,
                200
            );
            return;
        }

        const ticketIds = ticketDetails.map(ticket => ticket.ticket_id);
        if (warranty) {
            var repairs = await repair.findAll({
                where: {
                    warranty: warranty,
                    ticket_id: ticketIds
                }
            });
        }

        Helper.response(
            "success",
            "Record Found Successfully!",
            { repairs },
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
exports.revenueReport = async (req, res) => {
    try {

        const aasra = req.body.aasra_id !== undefined && req.body.aasra_id !== null
            ? req.body.aasra_id
            : await Helper.getAasraId(req);
        //console.log(aasra);

        if (req.body.type == 2) {
            const startDate = await Helper.formatDate(new Date(req.body.startDate));
            const endDate = await Helper.formatDate(new Date(req.body.endDate));
            const start = await Helper.getMonth(req.body.startDate);
            const end = await Helper.getMonth(req.body.endDate);


            const ticketDetails = await ticket.findAll({
                where: {
                    aasra_id: aasra,
                    status: 2                    
                }
            })

            if (ticketDetails.length === 0) {
                Helper.response(
                    "failed",
                    "Record Not Found!",
                    {},
                    res,
                    200
                );
                return;
            }

            const ticketIds = ticketDetails.map(ticket => ticket.ticket_id);

            var repairs = await repair.findAll({
                where: {
                    ticket_id: ticketIds,
                    createdAt: {
                        [Op.between]: [startDate, endDate]
                    },
                }
            });

            if (repairs.length === 0) {
                Helper.response(
                    "failed",
                    "Record Not Found!",
                    {},
                    res,
                    200
                );
                return;
            }
            const getAasra = await aasras.findByPk(aasra)
            const dates = `${start} - ${end}`;
            const totalAmount = repairs.reduce((sum, record) => sum + record.amount, 0);
            const labourDetails = {
                total_amount: totalAmount,
                taxable_amount: 0,
                aasra_name: getAasra.name_of_org,
                month: dates,
                type: 2,
                rate_gst: 0,
                gst: 0,
                invoice_value: totalAmount,
            };

            Helper.response(
                "success",
                "Record Found Successfully",
                [labourDetails],
                res,
                200
            );
        }
        else if (req.body.type == 1) {
            const startDate = await Helper.formatDate(new Date(req.body.startDate));
            const endDate = await Helper.formatDate(new Date(req.body.endDate));
            const start = await Helper.getMonth(req.body.startDate);
            const end = await Helper.getMonth(req.body.endDate);


            const ticketDetails = await ticket.findAll({
                where: {
                    aasra_id: aasra,
                    status: 2
                }
            })

            if (ticketDetails.length === 0) {
                Helper.response(
                    "failed",
                    "Record Not Found!",
                    {},
                    res,
                    200
                );
                return;
            }

            const ticketIds = ticketDetails.map(ticket => ticket.ticket_id);

            var repairs = await repair.findAll({
                where: {
                    ticket_id: ticketIds,
                    createdAt: {
                        [Op.between]: [startDate, endDate]
                    },
                }
            });
            console.log(repairs);
            if (repairs.length === 0) {
                Helper.response(
                    "failed",
                    "Record Not Found!",
                    {},
                    res,
                    200
                );
                return;
            }
            const getAasra = await aasras.findByPk(aasra)
            const dates = `${start} - ${end}`;
            var total_amount = 0

            await Promise.all(repairs.map(async (f) => {
                const price = (await spareParts.findByPk(f.productValue)).unit_price
                total_amount += price * f.qty

            }))
            var gst_amount = 0.18 * total_amount
            
            const sellDetails = {
                total_amount: total_amount,
                taxable_amount: total_amount,
                rate_gst: 18,
                gst: gst_amount,
                invoice_value: gst_amount + total_amount,
                aasra_name: getAasra.name_of_org,
                month: dates,
                type: 1
            };
            Helper.response(
                "success",
                "Record Found Successfully",
                [sellDetails],
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

exports.paymentReport = async (req, res) => {
    try {
        const aasra = req.body.aasra_id !== undefined && req.body.aasra_id !== null
            ? req.body.aasra_id
            : await Helper.getAasraId(req);
        const startDate = await Helper.formatDate(new Date(req.body.startDate));
        const endDate = await Helper.formatDate(new Date(req.body.endDate));
        const start = await Helper.getMonth(req.body.startDate);
        const end = await Helper.getMonth(req.body.endDate);
        // const aasra = req.body.aasra_id;

        const orders = await order.findAll({
            where: {
                aasra_id: aasra,
                createdAt: {
                    [Op.between]: [startDate, endDate]
                },
            }
        })

        if (orders.length === 0) {
            Helper.response(
                "failed",
                "Record Not Found!",
                {},
                res,
                200
            );
            return;
        }

        const paymentDetails = [];
        let serial_no = 1 ;
        orders.map(order => {
            paymentDetails.push({
                serial_no:serial_no++,
                order_date: order.order_date,
                order_status: order.order_status,
                order_amount: order.grand_total,
                paid_amount: order.paid_amount,
                balance: order.grand_total - order.paid_amount,
                payment_date: Helper.formatDateTime(order.createdAt),
                payment_method: order.payment_method,
                payment_status: order.payment_status,
                transaction_id: order.transaction_id,
                dps_value: order.dps_value,
                dps_date: order.dps_date,
                dps_no: order.dps_no,
            });
        });


        Helper.response(
            "success",
            "Record Found Successfully",
            paymentDetails,
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