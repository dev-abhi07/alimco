const { Op } = require('sequelize')
const Helper = require('../../helper/helper')
const city = require('../../model/city')
const repair = require('../../model/repair')
const states = require('../../model/state')
const ticket = require('../../model/ticket')
const aasras = require('../../model/aasra')
const order = require('../../model/order')
const spareParts = require('../../model/spareParts')
const stock = require('../../model/stock')
const users = require('../../model/users')
const labour_charges = require('../../model/labour_charges')
const customer = require('../../model/customer')
const repairPayments = require('../../model/repairPayment')
const items = require('../../model/items')
const problem = require('../../model/problem')



exports.Dashboard = (req, res) => {

}


exports.states = async (req, res) => {
    try {
        const state = await states.findAll(
            {
                order: [
                    ['name', 'ASC']
                ]
            }
        )
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

        const aasra = req.body.aasra_id !== undefined && req.body.aasra_id !== null
            ? req.body.aasra_id
            : await Helper.getAasraId(req);

        const startDatesplit = await Helper.formatDate(new Date(req.body.startDate));
        const splitDate = await Helper.formatDate(new Date(req.body.endDate));
        const startDate = startDatesplit.split(" ")[0] + " " + "00:00:00";
        const endDate = splitDate.split(" ")[0] + " " + "23:59:59";


        const ticketDetails = await ticket.findAll({
            where: aasra == null
                ? {

                    status: 2
                } :
                {
                    aasra_id: aasra,
                    status: 2
                },
            createdAt: {
                [Op.between]: [startDate, endDate]
            },
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
        if (req.body.warranty == null && req.body.spare_id == null) {
            var repairs = await repair.findAll({
                where:
                {
                    ticket_id: ticketIds
                }
            });
        } else if (req.body.warranty != null && req.body.spare_id != null) {
            var repairs = await repair.findAll({
                where:
                {
                    ticket_id: ticketIds,
                    warranty: req.body.warranty,
                    productValue: req.body.spare_id,
                }

            });
        } else if (req.body.warranty != null) {
            var repairs = await repair.findAll({
                where:
                {
                    ticket_id: ticketIds,
                    warranty: req.body.warranty,
                }

            });
        } else if (req.body.spare_id != null) {
            var repairs = await repair.findAll({
                where:
                {
                    ticket_id: ticketIds,
                    productValue: req.body.spare_id,
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

        const warranty = req.body.warranty;
        const start = await Helper.getMonth(req.body.startDate);
        const end = await Helper.getMonth(req.body.endDate);

        const startDatesplit = await Helper.formatDate(new Date(req.body.startDate));
        const splitDate = await Helper.formatDate(new Date(req.body.endDate));
        const startDate = startDatesplit.split(" ")[0] + " " + "00:00:00";
        const endDate = splitDate.split(" ")[0] + " " + "23:59:59";
        let ticketDetails
        if (aasra == null) {
            ticketDetails = await ticket.findAll({
                where: {
                    status: 2,
                    createdAt: {
                        [Op.between]: [startDate, endDate]
                    },
                }
            });
        } else {
            ticketDetails = await ticket.findAll({
                where: {
                    status: 2,
                    aasra_id: aasra,
                    createdAt: {
                        [Op.between]: [startDate, endDate]
                    },
                }
            });
        }


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

        // Group tickets by aasra_id
        const ticketsGroupedByAasra = ticketDetails.reduce((acc, ticket) => {
            if (!acc[ticket.aasra_id]) {
                acc[ticket.aasra_id] = [];
            }
            acc[ticket.aasra_id].push(ticket);
            return acc;
        }, {});

        const aasraResponses = [];

        // Iterate over each group of aasra_id
        for (const [aasraId, tickets] of Object.entries(ticketsGroupedByAasra)) {
            const ticketIds = tickets.map(ticket => ticket.ticket_id);

            let repairs;
            if (warranty == null) {
                repairs = await repair.findAll({
                    where: {
                        ticket_id: ticketIds,
                        createdAt: {
                            [Op.between]: [startDate, endDate]
                        },
                    }
                });
            } else {
                repairs = await repair.findAll({
                    where: {
                        ticket_id: ticketIds,
                        warranty: warranty,
                        createdAt: {
                            [Op.between]: [startDate, endDate]
                        },
                    }
                });
            }

            if (repairs.length > 0) {
                const getAasra = await aasras.findByPk(aasraId);
                const dates = `${start} - ${end}`;

                if (req.body.type == 2) {
                    const totalAmount = repairs.reduce((sum, record) => sum + record.amount, 0);
                    const labourDetails = {
                        total_amount: totalAmount,
                        taxable_amount: 0,
                        aasra_name: getAasra.name_of_org,
                        month: dates,
                        type: 'Labour',
                        rate_gst: 0,
                        gst: 0,
                        invoice_value: totalAmount,
                    };
                    aasraResponses.push(labourDetails);
                } else if (req.body.type == 1) {
                    let total_amount = 0;
                    let price;
                    await Promise.all(repairs.map(async (f) => {
                        price = await spareParts.findByPk(f.productValue);
                        total_amount += price.unit_price * f.qty;
                    }));
                    const gst_amount = price.unit_price - price.base_price;
                    const sellDetails = {
                        total_amount: total_amount,
                        taxable_amount: total_amount,
                        rate_gst: 18,
                        gst: gst_amount,
                        invoice_value: gst_amount + total_amount,
                        aasra_name: getAasra.name_of_org,
                        month: dates,
                        type: 'Sales'
                    };
                    aasraResponses.push(sellDetails);
                }
            }
        }

        if (aasraResponses.length === 0) {
            Helper.response(
                "failed",
                "Record Not Found!",
                {},
                res,
                200
            );
            return;
        }

        Helper.response(
            "success",
            "Record Found Successfully",
            aasraResponses,
            res,
            200
        );

    } catch (error) {
        console.log(error);
        Helper.response(
            "failed",
            "Something went wrong!",
            { error },
            res,
            200
        );
    }
};





exports.paymentReport = async (req, res) => {
    try {

        const aasra = req.body.aasra_id !== undefined && req.body.aasra_id !== null
            ? req.body.aasra_id
            : await Helper.getAasraId(req);


        const startDatesplit = await Helper.formatDate(new Date(req.body.startDate));
        const splitDate = await Helper.formatDate(new Date(req.body.endDate));
        const startDate = startDatesplit.split(" ")[0] + " " + "00:00:00";
        const endDate = splitDate.split(" ")[0] + " " + "23:59:59";


        const orders = await order.findAll({
            where: aasra == null
                ? {
                    createdAt: { [Op.between]: [startDate, endDate] },
                    payment_status: 'Paid'
                }
                : {
                    aasra_id: aasra,
                    createdAt: { [Op.between]: [startDate, endDate] },
                    payment_status: 'Paid'
                }
        });


        if (orders.length === 0) {
            return Helper.response("failed", "Record Not Found!", {}, res, 200);
        }

        let serial_no = 1;

        const paymentDetails = await Promise.all(
            orders.map(async (order) => {
                const aasra = await aasras.findOne({ where: { id: order.aasra_id } });
                return {
                    serial_no: serial_no++,
                    aasraName: aasra ? aasra.name_of_org : null,
                    aasraCode: aasra ? aasra.unique_code : null,
                    order_date: order.order_date,
                    order_status: order.order_status,
                    order_amount: order.grand_total,
                    paid_amount: order.paid_amount,
                    balance: order.grand_total - order.paid_amount,
                    payment_date: Helper.formatISODateTime(order.createdAt),
                    payment_method: order.payment_method,
                    payment_status: order.payment_status,
                    transaction_id: order.transaction_id,
                    dps_value: order.dps_value,
                    dps_date: order.dps_date,
                    dps_no: order.dps_no,
                };
            })
        );


        Helper.response("success", "Record Found Successfully", paymentDetails, res, 200);

    } catch (error) {

        Helper.response("failed", "Something went wrong!", { error }, res, 200);
    }
};

exports.partReplacementReport = async (req, res) => {
    try {
        const aasra = req.body.aasra_id !== undefined && req.body.aasra_id !== null
            ? req.body.aasra_id
            : await Helper.getAasraId(req);


        const start = await Helper.getMonth(req.body.startDate);
        const end = await Helper.getMonth(req.body.endDate);

        const startDatesplit = await Helper.formatDate(new Date(req.body.startDate));
        const splitDate = await Helper.formatDate(new Date(req.body.endDate));
        const startDate = startDatesplit.split(" ")[0] + " " + "00:00:00";
        const endDate = splitDate.split(" ")[0] + " " + "23:59:59";


        const ticketDetails = await ticket.findAll({
            where: aasra == null
                ? {
                    status: 2
                } :
                {
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

        if (req.body.spare_id == null && req.body.warranty == null) {
            var repairs = await repair.findAll({
                where:
                {
                    ticket_id: ticketIds,
                    createdAt: {
                        [Op.between]: [startDate, endDate]
                    },
                }
            });
        }
        else if (req.body.spare_id != null && req.body.warranty != null) {
            var repairs = await repair.findAll({
                where:
                {
                    ticket_id: ticketIds,
                    productValue: req.body.spare_id,
                    warranty: req.body.warranty,
                    createdAt: {
                        [Op.between]: [startDate, endDate]
                    },
                }
            });
        }
        else if (req.body.spare_id != null) {
            var repairs = await repair.findAll({
                where:
                {
                    ticket_id: ticketIds,
                    productValue: req.body.spare_id,
                    createdAt: {
                        [Op.between]: [startDate, endDate]
                    },

                }
            });
        } else if (req.body.warranty != null) {
            var repairs = await repair.findAll({
                where:
                {
                    ticket_id: ticketIds,
                    warranty: req.body.warranty,
                    createdAt: {
                        [Op.between]: [startDate, endDate]
                    },
                }
            });
        }



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

        // const getAasra = await aasras.findByPk(aasra)
        var beneficery_name = 0;
        var labour_rate = 0;
        var labour_amount = 0;
        var quantity = 0;
        var warranty = 0;
        var madeby = 0;
        var date_of_replacement = 0;
        var serial_no = 0;

        const sparePartsDetails = await spareParts.findAll({
            where: { id: { [Op.in]: repairs.map(r => r.productValue) } }
        });
        const ticketsDetails = await ticket.findAll({
            where: { ticket_id: { [Op.in]: repairs.map(r => r.ticket_id) } }
        });
        const usersDetails = await users.findAll({
            where: { ref_id: { [Op.in]: ticketsDetails.map(t => t.user_id) } }
        });

        const aasrasDetails = await aasras.findAll({
            where: { id: { [Op.in]: ticketsDetails.map(t => t.aasra_id) } }
        });

        const partReplacements = [];
        await Promise.all(repairs.map(async (f) => {

            const madebydetail = sparePartsDetails.find(sp => sp.id === f.productValue);
            const customerDetails = ticketsDetails.find(t => t.ticket_id === f.ticket_id);
            const customerName = usersDetails.find(u => u.ref_id === customerDetails.user_id);
            const getAasra = aasrasDetails.find(a => a.id === customerDetails.aasra_id);

            beneficery_name = customerName.name;
            madeby = madebydetail.made_by;
            spares = madebydetail.part_name;
            serial_no = madebydetail.serial_no;
            labour_rate = f.price;
            labour_amount = f.amount || 0;
            quantity = f.qty || 0;
            warranty = f.warranty;

            const partReplacement = {
                aasra_name: getAasra?.name_of_org || '-',
                beneficery_name: customerName ? customerName.name : '-',
                serial_no_of_damaged_product: serial_no || '-',
                make: madeby || '-',
                old_material_code: f.old_serial_number || '-',
                sap_material_code_code: f.new_serial_number || '-',
                material_description: '-',
                unit_of_measurement: '-',
                date_of_replacement: Helper.formatISODateTime((f.createdAt)),
                labour_rate: labour_rate || '-',
                labour_amount: labour_amount || '-',
                quantity: quantity || '-',
                warranty: warranty,
                distributed_old_product_code: '-',
                distributed_sap_productcode: '-',
                Scheme_adip_rvy_cash: 'payment',
                date_of_distribution: '-',
                ticket: f.ticket_id || '-',
                spare_part: madebydetail ? madebydetail.part_name : '-',
            };

            partReplacements.push(partReplacement);
        }))


        Helper.response(
            "success",
            "Record Found Successfully",
            partReplacements,
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

// exports.inventoryWholeFormat = async (req, res) => {
//     try {
//         const aasra = req.body.aasra_id !== undefined && req.body.aasra_id !== null
//             ? req.body.aasra_id
//             : await Helper.getAasraId(req);

//         const startDatesplit = await Helper.formatDate(new Date(req.body.startDate));
//         const splitDate = await Helper.formatDate(new Date(req.body.endDate));
//         const startDate = startDatesplit.split(" ")[0] + " " + "00:00:00";
//         const endDate = splitDate.split(" ")[0] + " " + "23:59:59";
//         const dateCondition = {
//             createdAt: {
//                 [Op.between]: [startDate, endDate]
//             }
//         };


//         let stocks;
//         if (aasra == null) {
//             stocks = await stock.findAll({
//                 where: {
//                     ...dateCondition 
//                 }
//             });
//         } else {
//             stocks = await stock.findAll({
//                 where: {
//                     aasra_id: aasra,
//                     ...dateCondition 
//                 }
//             });
//         }



//         if (stocks.length === 0) {
//             Helper.response(
//                 "failed",
//                 "Record Not Found!",
//                 {},
//                 res,
//                 200
//             );
//             return;
//         }

//         // const getAasra = await aasras.findByPk(aasra)
//         const aasrasDetails = await aasras.findAll({
//             where: { id: { [Op.in]: stocks.map(t => t.aasra_id) } }
//         });
//         const repairAll = await repair.findAll({
//             where: { productValue: { [Op.in]: stocks.map(t => t.item_id) } }
//         });
//         var labour_amount = 0;
//         const wholeFormat = [];
//         await Promise.all(stocks.map(async (f) => {

//             const getAasra = aasrasDetails.find(a => a.id === f.aasra_id);

//             // repairDetails = await repair.findOne({
//             //     where: { : f. }
//             // });
//             const repairDetails = await repair.find(a => a.productValue === f.item_id);

//             // console.log(repairDetails)

//             const partReplacement = {
//                 aasra_name: getAasra.name_of_org || '-',
//                 old_material_code: repairDetails ? repairDetails.old_serial_number : '-',
//                 sap_material_code_code: repairDetails ? repairDetails.new_serial_number : '-',
//                 material_description: '-',
//                 unit_of_measurement: '-',
//                 date: Helper.formatISODateTime((f.createdAt)) || '-',
//                 opening_stock: labour_amount || '-',
//                 stock_in: f.stock_in || '-',
//                 stock_out: f.stock_out || '-',
//                 closing_stock: f.stock_in - f.stock_out || '-',
//                 shortage_excess: '-',
//                 physical_stock: f.stock_in + f.stock_out || '-',
//                 item_name: f.item_name

//             };

//             wholeFormat.push(partReplacement);
//         }))


//         Helper.response(
//             "success",
//             "Record Found Successfully",
//             wholeFormat,
//             res,
//             200
//         );
//     } catch (error) {
//         console.log(error)
//         Helper.response(
//             "failed",
//             "Something went wrong!",
//             { error },
//             res,
//             200
//         );
//     }
// }
exports.inventoryWholeFormat = async (req, res) => {
    try {
        const aasra = req.body.aasra_id !== undefined && req.body.aasra_id !== null
            ? req.body.aasra_id
            : await Helper.getAasraId(req);

        const startDatesplit = await Helper.formatDate(new Date(req.body.startDate));
        const splitDate = await Helper.formatDate(new Date(req.body.endDate));
        const startDate = startDatesplit.split(" ")[0] + " " + "00:00:00";
        const endDate = splitDate.split(" ")[0] + " " + "23:59:59";


        const dateCondition = {
            createdAt: {
                [Op.between]: [startDate, endDate]
            }
        };

        let stocks;


        if (aasra == null && req.body.spare_id == null) {
            stocks = await stock.findAll({
                where: {
                    ...dateCondition
                }
            });
        } else if (aasra != null && req.body.spare_id != null) {
            stocks = await stock.findAll({
                where: {
                    aasra_id: aasra,
                    item_id: req.body.spare_id,
                    ...dateCondition
                }
            });
        }
        else if (req.body.spare_id != null) {
            stocks = await stock.findAll({
                where: {
                    item_id: req.body.spare_id,
                    ...dateCondition
                }
            });
        }
        else if (aasra != null) {
            stocks = await stock.findAll({
                where: {
                    aasra_id: aasra,
                    ...dateCondition
                }
            });
        }

        if (stocks.length === 0) {
            Helper.response(
                "failed",
                "Record Not Found!",
                {},
                res,
                200
            );
            return;
        }


        const aasrasDetails = await aasras.findAll({
            where: { id: { [Op.in]: stocks.map(t => t.aasra_id) } }
        });


        const repairAll = await repair.findAll({
            where: { productValue: { [Op.in]: stocks.map(t => t.item_id) } }
        });
        const spareAll = await spareParts.findAll({
            where: { id: { [Op.in]: stocks.map(t => t.item_id) } }
        });

        const wholeFormat = [];
        var labour_amount = 0;
        await Promise.all(stocks.map(async (f) => {

            const getAasra = aasrasDetails.find(a => a.id === f.aasra_id);


            const repairDetails = repairAll.find(r => r.productValue === f.item_id);

            const spareDetails = spareAll.find(r => r.id === f.item_id);

            const closingStock = (f.stock_in || 0) - (f.stock_out || 0);
            const physicalStock = (f.stock_in || 0) + (f.stock_out || 0);

            const partReplacement = {
                aasra_name: getAasra ? getAasra.name_of_org : '-',
                old_material_code: repairDetails ? repairDetails.old_serial_number : '-',
                sap_material_code_code: repairDetails ? repairDetails.new_serial_number : '-',
                material_description: '-',
                unit_of_measurement: '-',
                date: Helper.formatISODateTime(f.createdAt) || '-',
                opening_stock: labour_amount || '-',
                stock_in: f.stock_in || '-',
                stock_out: f.stock_out || '-',
                closing_stock: closingStock || '-',
                shortage_excess: '-',
                physical_stock: physicalStock || '-',
                item_name: f.item_name || '-',
                spare_part: spareDetails.part_name,
            };

            wholeFormat.push(partReplacement);
        }));

        Helper.response(
            "success",
            "Record Found Successfully",
            wholeFormat,
            res,
            200
        );

    } catch (error) {
        console.log(error);
        Helper.response(
            "failed",
            "Something went wrong!",
            { error },
            res,
            200
        );
    }
};

exports.updateLabourCharges = async (req, res) => {

    try {
        const labourCharge = await labour_charges.update(
            req.body, {
            where: {
                id: req.body.id
            }
        }
        )
        Helper.response(
            "success",
            "Record Update Successfully",
            {},
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

exports.createLabourCharges = async (req, res) => {

    try {
        const labourCharge = await labour_charges.create(
            req.body
        )
        Helper.response(
            "success",
            "Record Created Successfully",
            {},
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

exports.destroyLabourCharges = async (req, res) => {
    try {
        const labourCharge = await labour_charges.destroy(
            {
                where: {
                    id: req.body.id
                }
            }
        )
        Helper.response(
            "success",
            "Record Deleted Successfully",
            {},
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

exports.generateNotes = async (req, res) => {
    try {
        // const startDate = Helper.formatDate(new Date(req.body.start_date))


        
        // const splitDate = Helper.formatDate(new Date(req.body.end_date))
        // const endDate = splitDate.split(" ")[0] + " " + "23:59:59";

        const startDatesplit = await Helper.formatDate(new Date(req.body.startDate));
        const splitDate = await Helper.formatDate(new Date(req.body.endDate));
        const startDate = startDatesplit.split(" ")[0] + " " + "00:00:00";
        const endDate = splitDate.split(" ")[0] + " " + "23:59:59";

        const getRepairs = await ticket.findAll({
            where: {
                status:2,
                aasra_id:req.body.aasra_id,
                createdAt: {
                    [Op.between]: [startDate, endDate]
                }
            }
        })

        
        const totalData = []
        await Promise.all(getRepairs.map(async (t) => {
            const ticketData = await repair.findOne({
                where: {
                    ticket_id: t.ticket_id,
                    warranty: req.body.warranty
                }
            })
           
            if (ticketData == null) {
                
                Helper.response(
                    "failed",
                    "Record Not Found!",
                    {},
                    res,
                    200
                );
                return;
            } else {
                const tickets = await ticket.findOne({ where: { ticket_id: t.ticket_id } })

                const item = await items.findOne({ where: { item_id: tickets.itemId, user_id: tickets.user_id } })

                const customers = await customer.findByPk(tickets.user_id)
                const user = await users.findOne({ where: { ref_id: tickets.user_id, user_type: 'C' } })
                const problems = await problem.findByPk(tickets.problem)

                const values = {
                    receipt_no: t.receipt_no,
                    user: { name: user.name, mobile: user.mobile },
                    customer: customers,
                    item_id: tickets.itemId,
                    item_name: tickets.itemName,
                    warranty: req.body.warranty,
                    campName: item?.campName,
                    campVenue: item?.campVenue,
                    distribution_date: item?.distributed_date,
                    distribution_place: customers.district,
                    problem: problems.problem_name,
                    complaint_Date: Helper.formatISODateTime(tickets.createdAt),
                    ticket_close_date: Helper.formatISODateTime(tickets.updatedAt),
                    ticketData: ticketData


                }
                //console.log(item)
                totalData.push(values)
            }
        }))

        if (totalData.length === 0) {
            Helper.response(
                "failed",
                "Record Not Found!",
                {},
                res,
                200
            );
            return;
        }

        Helper.response(
            "success",
            "Service Notes List",
            { totalData },
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
