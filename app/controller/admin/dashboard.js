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
const sale = require('../../model/sale')
const saleDetail = require('../../model/saleDetails')
const aasra = require('../../model/aasra')
const manufacturer = require('../../model/manufacturer')



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
        const aasraData = req.body.aasra_id !== undefined && req.body.aasra_id !== null
            ? req.body.aasra_id
            : await Helper.getAasraId(req);

        const warranty = req.body.warranty;
        const start = await Helper.getMonth(req.body.startDate);
        const end = await Helper.getMonth(req.body.endDate);

        const startDatesplit = await Helper.formatDate(new Date(req.body.startDate));
        const splitDate = await Helper.formatDate(new Date(req.body.endDate));
        const startDate = startDatesplit.split(" ")[0] + " " + "00:00:00";
        const endDate = splitDate.split(" ")[0] + " " + "23:59:59";
        if (req.body.type == 3) {
            const aasras = req.body.aasra_id;
            if (aasras !== null) {
                var tickets = await sale.findAll({
                    where: {
                        aasra_id: aasras
                    },
                    createdAt: {
                        [Op.between]: [startDate, endDate]
                    },
                    order: [
                        ['id', 'DESC']
                    ]
                })
            } else {
                var tickets = await sale.findAll({
                    createdAt: {
                        [Op.between]: [startDate, endDate]
                    },
                    order: [
                        ['id', 'DESC']
                    ]
                })
            }

            const ticketResponses = [];
            await Promise.all(
                tickets.map(async (record, count = 1) => {
                    // const getUser = await users.findByPk(record.user_id)
                    const getAasra = await aasra.findByPk(record.aasra_id)
                    const repairData = await saleDetail.findAll({
                        where: {
                            sale_id: record.id,
                        },
                        order: [
                            ['id', 'DESC']
                        ]
                    })

                    const repairDataValues = await Promise.all(repairData.map(async (records) => {


                        const newManufacture = await manufacturer.findOne({
                            where: {
                                id: records.new_manufacturer_id
                            }
                        });
                        return {
                            ...records.dataValues,
                            new_manufacture_name: newManufacture?.manufacturer_code ?? null,

                        }
                    }))
                    const dates = `${start} - ${end}`;
                    const dataValue = {

                        id: record.id,
                        aasra_id: record.aasra_id,
                        name: record.name,
                        mobile_no: record.mobile_no,
                        email: record.email,
                        address: record.address,
                        totalSpareCost: record.totalSpareCost,
                        gstAmount: record.gstAmount,
                        gstPercent: record.gstPercent,
                        grandTotal: record.grandTotal,
                        aasraName: getAasra.name_of_org,
                        ticketDetail: repairDataValues,



                        total_amount: record.totalSpareCost,
                        taxable_amount: record.totalSpareCost,
                        rate_gst: 18,
                        gst: record.gstAmount,
                        invoice_value: record.grandTotal,
                        aasra_name: getAasra.name_of_org,
                        month: dates,
                        type: 'RTU',
                        type_value: 3,
                    }
                    ticketResponses.push(dataValue)
                })
            )

            if (ticketResponses.length === 0) {
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
                ticketResponses,
                res,
                200
            );
        } else {
            let ticketDetails;
            if (aasraData == null) {
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
                        aasra_id: aasraData,
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

            const ticketResponses = [];

            // Iterate over all tickets and group repairs by ticket_id
            for (const ticket of ticketDetails) {
                const ticketId = ticket.ticket_id;

                // Fetch associated repairs
                let repairs;
                if (warranty == null) {
                    repairs = await repair.findAll({
                        where: {
                            ticket_id: ticketId,
                            createdAt: {
                                [Op.between]: [startDate, endDate]
                            },
                        },
                    });
                } else {
                    repairs = await repair.findAll({
                        where: {
                            ticket_id: ticketId,
                            warranty: warranty,
                            createdAt: {
                                [Op.between]: [startDate, endDate]
                            },
                        },
                    });
                }

                if (repairs.length > 0) {
                    let aasra_name = 'N/A';
                    let getAasra = null;
                    if (ticket.aasra_id) {
                        getAasra = await aasras.findByPk(ticket.aasra_id);
                        aasra_name = getAasra ? getAasra.name_of_org : 'N/A';
                    }

                    const dates = `${start} - ${end}`;
                    const itemDetails = await items.findOne({
                        where: {
                            user_id: ticket.user_id
                        }
                    });

                    const repairDataDiscount = await repair.findOne({
                        where: {
                            ticket_id: ticket.ticket_id
                        },
                        order: [['id', 'DESC']]
                    });

                    let subtotal = 0;
                    let serviceCharge = 0;
                    let gst = 0;
                    let discountAmt = 0;
                    let subtotalPurchase = 0;
                    let serviceChargePurchase = 0;

                    // Iterate over repairs to aggregate the amounts
                    repairs.forEach(record => {
                        console.log(record)
                        if (record.repairCheckValue === "Repair/Replace" ) {
                            subtotal += record.productPrice * record.qty;
                            serviceCharge += record.repairServiceCharge;
                            gst += subtotal * 18 / 100;
                        } 
                        if (record.repairCheckValue === "Purchase") {
                            subtotalPurchase += record.productPrice * record.qty;
                            serviceChargePurchase += record.repairServiceCharge;
                        }
                    });
                   console.log(subtotalPurchase,'subtotalPurchase')
                    const warranty = Helper.compareDate(itemDetails?.expire_date);
                    if (warranty === 1) {
                        discountAmt = subtotal + serviceCharge;
                    } else {
                        discountAmt = 0;
                    }

                    let amtgst = 0;
                    if (getAasra && getAasra.gst != null) {
                        amtgst = ((subtotal + serviceCharge + subtotalPurchase - discountAmt) * 18) / 100;
                    }
                   let gstAmtCal 
                   let invoiceVal 
                  
                    if(warranty === true){
                        gstAmtCal = 0 + ((subtotalPurchase) * 18) / 100
                        invoiceVal = 0 + subtotalPurchase + ((subtotalPurchase) * 18) / 100
                    }else{
                        gstAmtCal = amtgst
                        invoiceVal = (subtotal + serviceCharge + subtotalPurchase + amtgst) - discountAmt - (repairDataDiscount?.dataValues?.discountRec || 0)
                    }

                    // Prepare the response for each type
                    if (req.body.type == 2) {
                        const labourDetails = {
                            ticket_id: ticket.ticket_id,
                            total_amount: serviceCharge  ,
                            taxable_amount: serviceCharge ,
                            aasra_name: aasra_name,
                            month: dates,
                            type: 'Labour',
                            type_value: 2,
                            rate_gst: 18,
                            gst: gstAmtCal ,
                            invoice_value: invoiceVal ,
                        };
                        ticketResponses.push(labourDetails);
                    } else if (req.body.type == 1) {
                        const sellDetails = {
                            ticket_id: ticket.ticket_id,
                            total_amount: subtotal + subtotalPurchase ,
                            taxable_amount: subtotal + subtotalPurchase,
                            rate_gst: 18,
                            gst: gstAmtCal ,
                            invoice_value: invoiceVal,
                            aasra_name: aasra_name,
                            month: dates,
                            type_value: 1,
                            type: 'Sales'
                        };
                        ticketResponses.push(sellDetails);
                    }
                }
            }

            if (ticketResponses.length === 0) {
                Helper.response(
                    "failed",
                    "Record Not Found!",
                    {},
                    res,
                    200
                );
                return;
            }

            // Send response with all ticket and repair details
            Helper.response(
                "success",
                "Record Found Successfully",
                ticketResponses,
                res,
                200
            );
            
        }


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
                status: 2,
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
