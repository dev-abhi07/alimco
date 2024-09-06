const { errorMonitor } = require("events");
const sequelize = require("../../connection/conn");
const orderDetails = require("../../model/orderDetails");
const spareParts = require("../../model/spareParts");
const users = require("../../model/users");
const orderModel = require("../../model/order");
const Helper = require("../../helper/helper");
const order = require("../../model/order");
const stock = require("../../model/stock");
const aasra = require("../../model/aasra");

const payment = require("../../model/payment");
const formidable = require("formidable");
const fs = require('fs');
const path = require('path');
const { where, or, Op, and, Sequelize } = require("sequelize");
const repairPayments = require("../../model/repairPayment");
const e = require("express");
const states = require("../../model/state");


exports.productApi = async (req, res) => {

    try {
        const parts = await spareParts.findAll()
        const partsData = [];

        parts.map((record) => {
            const values = {
                value: record.id,
                label: record.part_number + '-' + record.part_name,
                itemPrice: record.unit_price,
                id: record.id
            }
            partsData.push(values)
        })
        Helper.response("success", "record found successfully", { partsData }, res, 200)
    } catch (error) {
        Helper.response("success", "Something went wrong!", { error }, res, 200)
    }
}
exports.createOrder = async (req, res) => {
    try {
        const token = req.headers['authorization'];
        const string = token.split(" ");
        const user = await users.findOne({ where: { token: string[1] } });
        const { products, gst, discount, shipping, orderStatus, supplier_name, subtotal, orderTaxAmount, grandTotal, notes } = req.body

        const total_order = {}

        total_order['aasra_id'] = user.ref_id
        total_order['total_bill'] = subtotal
        total_order['total_tax'] = orderTaxAmount
        total_order['grand_total'] = grandTotal
        total_order['gst'] = gst
        total_order['discount'] = discount
        total_order['shipping_charges'] = shipping
        total_order['order_status'] = orderStatus.label
        total_order['supplier_name'] = supplier_name.label

        total_order['order_date'] = new Date().toISOString().slice(0, 10),
            total_order['notes'] = notes

        const creatOrder = await orderModel.create(total_order).catch((err) => {
            console.log(err)
            Helper.response("error", "Something went wrong", err, res, 200)
        })
        if (creatOrder) {
            const purchase_order = await payment.create({
                order_id: creatOrder.id,
            })

            const order = await Promise.all(products.map(async (f) => {
                const products = {}
                products['order_id'] = creatOrder.id
                products['item_id'] = f.value
                products['item_name'] = f.label
                products['quantity'] = f.qty
                products['price'] = f.itemPrice

                const data = await orderDetails.create(products).then(async () => {

                }).catch((err) => {
                    console.log(err)
                })
                return data
            }))
            Helper.response("success", "Order created successfully", total_order, res, 200)
        }

    } catch (error) {
        console.log(error)
        Helper.response("error", "Something went wrong", error, res, 200)
    }
}

exports.orderList = async (req, res) => {
    try {
        
        const token = req.headers['authorization'];
        const string = token.split(" ");
        const user = await users.findOne({ where: { token: string[1] } });
        // const startDate = await Helper.formatDate(new Date(req.body.startDate));
        // const endDate = await Helper.formatDate(new Date(req.body.endDate));

        const startDatesplit = await Helper.formatDate(new Date(req.body.startDate));
        const splitDate = await Helper.formatDate(new Date(req.body.endDate));
        const startDate = startDatesplit.split(" ")[0] + " " + "00:00:00";
        const endDate = splitDate.split(" ")[0] + " " + "23:59:59";

        let orderWithImageUrls;
        if (req.body.startDate === null && req.body.endDate === null) {
            if (req.body.stock === true) {
                if (user.user_type == 'S') {
                    orderWithImageUrls = await orderModel.findAll({
                       
                        order: [
                            ['id', 'DESC']
                        ],
                        where: {
                            payment_status: 'Paid'
                        }
                    })

                    

                } else {
                    orderWithImageUrls = await orderModel.findAll({ order: [['id', 'DESC']], where: { aasra_id: user.ref_id, payment_status: 'Paid' } })
                }
                const order = orderWithImageUrls.map(o => {
                    if (o.image) {
                        o.image = o.image.replace('public/', '');
                    }
                    return o;
                });
            } else {

                if (user.user_type == 'S') {
                    orderWithImageUrls = await orderModel.findAll({ 
                        order: [['id', 'DESC']]
                 })
                } else {
                    orderWithImageUrls = await orderModel.findAll({ order: [['id', 'DESC']], where: { aasra_id: user.ref_id } })
                }
                const order = orderWithImageUrls.map(o => {
                    if (o.image) {
                        o.image = o.image.replace('public/', '');
                    }
                    return o;
                });
            }
        } else if (req.body.startDate !== null && req.body.endDate !== null) {
            if (req.body.stock === true) {
                if (user.user_type == 'S') {
                    orderWithImageUrls = await orderModel.findAll({
                        order: [['id', 'DESC']],
                        where: {
                            payment_status: 'Paid',
                            createdAt: {
                                [Op.between]: [startDate, endDate]
                            },
                            aasra_id: req.body.aasra_id
                        }
                    })
                } else {
                    orderWithImageUrls = await orderModel.findAll(
                        {
                            order: [
                                ['id', 'DESC']
                            ],
                            where:
                            {
                                aasra_id: user.ref_id, payment_status: 'Paid'
                            }
                        }
                    )


                }
                const order = orderWithImageUrls.map(o => {
                    if (o.image) {
                        o.image = o.image.replace('public/', '');
                    }
                    return o;
                });
            }
            else {

                if (user.user_type == 'S') {
                    orderWithImageUrls = await orderModel.findAll({ order: [['id', 'DESC']] })
                } else {
                    orderWithImageUrls = await orderModel.findAll({ order: [['id', 'DESC']], where: { aasra_id: user.ref_id } })

                }
                const order = orderWithImageUrls.map(o => {
                    if (o.image) {
                        o.image = o.image.replace('public/', '');
                    }
                    return o;
                });
            }

        }


        if (orderWithImageUrls.length === 0) {
            Helper.response(
                "failed",
                "Record Not Found!",
                {},
                res,
                200
            );
            return;
        }
        const orders = await Promise.all(orderWithImageUrls.map(async (o) => {

            const aasraData = await aasra.findOne({ where: { id: o.aasra_id } });

            let cgst = 0;
            let sgst = 0;
            const stateDetails = await states.findOne({ where: { id: aasraData?.state } })

            if (stateDetails.name !== 'UTTAR PRADESH') {
                cgst = o.gst / 2;
                sgst = o.gst / 2;
            }
            return {
                id: o.id,
                aasra_id: o.aasra_id,
                total_bill: o.total_bill,
                total_tax: o.total_tax,
                grand_total: o.grand_total,
                gst: o.gst,
                supplier_name: o.supplier_name,
                order_status: o.order_status,
                shipping_charges: o.shipping_charges,
                order_date: o.order_date,
                payment_status: o.payment_status,
                payment_method: o.payment_method,
                transaction_id: o.transaction_id,
                paid_amount: o.paid_amount,
                due_amount: o.due_amount,
                payment_date: o.payment_date == null ? null :Helper.formatISODateTime(o.payment_date),
                dps_value: o.dps_value,
                dps_date: o.dps_date,
                dps_no: o.dps_no,
                notes: o.notes,
                stock_transfer: o.stock_transfer,
                discount: o.discount,
                image: o.image ? o.image.replace('public/', '') : null,
                sgst: sgst,
                cgst: cgst,
                orderData: [],
                payment: {},
                aasra: {},
            };
        }));

        const orderDetailsPromises = orderWithImageUrls.map(order =>
            orderDetails.findAll({
                where: {
                    order_id: order.id
                }
            })
        );

        const aasraPromises = orderWithImageUrls.map(order =>
            aasra.findOne({
                where: {
                    id: order.aasra_id
                }
            })
        );

        const paymentPromises = orderWithImageUrls.map(order =>
            payment.findOne({
                where: {
                    order_id: order.id
                }
            })
        );
        const allPayments = await Promise.all(paymentPromises);

        const allOrderDetails = await Promise.all(orderDetailsPromises);

        const allAasraDetails = await Promise.all(aasraPromises);


        const flattenedOrderDetails = allOrderDetails
            .flat()
            .map(detail => ({
                id: detail.id,
                item_id: detail.item_id,
                item_name: detail.item_name,
                quantity: detail.quantity,
                price: detail.price,
                order_id: detail.order_id,
                image: detail.image,


            }));


        const ordersWithDetails = orders.map((order, index) => {
            return {
                ...order,
                orderData: flattenedOrderDetails.filter(detail => detail.order_id === order.id),
                payment: allPayments[index] ? {
                    id: allPayments[index].id,
                    order_id: allPayments[index].order_id,
                    purchase_order: allPayments[index].purchase_order,
                    invoice: allPayments[index].invoice,
                    PO_number: allPayments[index].PO_number,
                    invoice_number: allPayments[index].invoice_number,
                    createdAt: Helper.formatISODateTime(allPayments[index].createdAt),
                } : {},
                aasra: allAasraDetails[index] || {},

            };
        });


        Helper.response("success", "Order list", {order: ordersWithDetails}, res, 200)
    } catch (error) {

        Helper.response("error", "Something went wrong", error, res, 200)
    }
}

exports.orderTransfer = async (req, res) => {
    try {

        let startDate;
        let endDate;
        if (req.body.startDate !== null && req.body.endDate !== null) {
            // startDate = await Helper.formatDate(new Date(req.body.startDate));
            // endDate = await Helper.formatDate(new Date(req.body.endDate));
            const startDatesplit = await Helper.formatDate(new Date(req.body.startDate));
            const splitDate = await Helper.formatDate(new Date(req.body.endDate));
            startDate = startDatesplit.split(" ")[0] + " " + "00:00:00";
            endDate = splitDate.split(" ")[0] + " " + "23:59:59";
        }

        const aasra_id = req.body.aasra_id;
        const token = req.headers['authorization'];
        const string = token.split(" ");
        const user = await users.findOne({ where: { token: string[1] } });

        let orderWithImageUrls;

        if (aasra_id === undefined) {
            if (user.user_type == 'S') {
                orderWithImageUrls = await orderModel.findAll({
                    where: {
                        createdAt: {
                            [Op.between]: [startDate, endDate]
                        },
                        payment_status: 'Paid'
                    }
                })
            } else {
                orderWithImageUrls = await orderModel.findAll({
                    where: {
                        createdAt: {
                            [Op.between]: [startDate, endDate]
                        },
                        payment_status: 'Paid'
                    }
                })
            }
        }
        if (req.body.startDate === null && req.body.endDate === null) {

            if (user.user_type == 'S') {
                orderWithImageUrls = await orderModel.findAll({
                    where: {
                        aasra_id: aasra_id,
                        payment_status: 'Paid'
                    }
                })
            } else {
                orderWithImageUrls = await orderModel.findAll({
                    where: {
                        aasra_id: aasra_id,
                        payment_status: 'Paid'
                    }
                })
            }
        }
        if (startDate !== null && aasra_id !== undefined) {
            if (user.user_type == 'S') {
                orderWithImageUrls = await orderModel.findAll({
                    where: {
                        aasra_id: aasra_id,
                        createdAt: {
                            [Op.between]: [startDate, endDate]
                        },
                        payment_status: 'Paid'
                    }
                })
            } else {
                orderWithImageUrls = await orderModel.findAll({
                    where: {
                        aasra_id: aasra_id,
                        createdAt: {
                            [Op.between]: [startDate, endDate]
                        },
                        payment_status: 'Paid'
                    }
                })
            }
        }

        const order = orderWithImageUrls.map(o => {
            if (o.image) {
                o.image = o.image.replace('public/', '');
            }
            return o;
        });

        const orders = orderWithImageUrls.map(o => {
            return {
                id: o.id,
                aasra_id: o.aasra_id,
                total_bill: o.total_bill,
                total_tax: o.total_tax,
                grand_total: o.grand_total,
                gst: o.gst,
                supplier_name: o.supplier_name,
                order_status: o.order_status,
                shipping_charges: o.shipping_charges,
                order_date: o.order_date,
                payment_status: o.payment_status,
                payment_method: o.payment_method,
                transaction_id: o.transaction_id,
                paid_amount: o.paid_amount,
                due_amount: o.due_amount,
                payment_date: Helper.formatISODateTime(o.payment_date),
                dps_value: o.dps_value,
                dps_date: o.dps_date,
                dps_no: o.dps_no,
                notes: o.notes,
                image: o.image ? o.image.replace('public/', '') : null,
                orderData: [],
                payment: {},
                aasra: {},
            };
        });

        const orderDetailsPromises = orderWithImageUrls.map(order =>
            orderDetails.findAll({
                where: {
                    order_id: order.id
                }
            })
        );

        const aasraPromises = orderWithImageUrls.map(order =>
            aasra.findOne({
                where: {
                    id: order.aasra_id
                }
            })
        );



        const paymentPromises = orderWithImageUrls.map(order =>
            payment.findOne({
                where: {
                    order_id: order.id
                }
            })
        );
        const allPayments = await Promise.all(paymentPromises);

        const allOrderDetails = await Promise.all(orderDetailsPromises);

        const allAasraDetails = await Promise.all(aasraPromises);


        const flattenedOrderDetails = allOrderDetails
            .flat()
            .map(detail => ({
                id: detail.id,
                item_id: detail.item_id,
                item_name: detail.item_name,
                quantity: detail.quantity,
                price: detail.price,
                order_id: detail.order_id,
                image: detail.image,


            }));


        const ordersWithDetails = orders.map((order, index) => {
            return {
                ...order,
                orderData: flattenedOrderDetails.filter(detail => detail.order_id === order.id),
                payment: allPayments[index] ? {
                    id: allPayments[index].id,
                    order_id: allPayments[index].order_id,
                    purchase_order: allPayments[index].purchase_order,
                    invoice: allPayments[index].invoice,
                    PO_number: allPayments[index].PO_number,
                    invoice_number: allPayments[index].invoice_number,
                    createdAt: Helper.formatISODateTime(allPayments[index].createdAt),
                } : {},
                aasra: allAasraDetails[index] || {},

            };
        });


        Helper.response("success", "Order list", {
            order: ordersWithDetails,

        }, res, 200)
    } catch (error) {
        console.log(error)
        Helper.response("error", "Something went wrong", error, res, 200)
    }
}

exports.updateOrderPayment = async (req, res) => {
    try {
        const { order_id } = req.body

        const token = req.headers['authorization'];
        const string = token.split(" ");
        const date = new Date();
        const year = `${date.getFullYear()}`
        const user = await users.findOne({ where: { token: string[1] } });

        const invoice_number = (date.getFullYear() + '-' + `${parseInt((year)?.split('0')[1]) + 1}`) + '/' + await Helper.generateNumber(10000000, 99999999)
        const order = await orderModel.update(
            {
                ...req.body,
                due_amount: req.body.grand_total - req.body.paid_amount
            },
            {
                where: {
                    aasra_id: user.ref_id,
                    id: req.body.order_id
                }
            }
        );

        const orderUpdated = await orderModel.findOne({
            where: {
                aasra_id: user.ref_id,
                id: req.body.order_id
            }
        })



        if (orderUpdated.due_amount == 0) {
            await orderModel.update({ payment_status: 'Paid' }, {
                where: {
                    aasra_id: user.ref_id,
                    id: req.body.order_id
                }
            })
            await payment.update({ invoice: 1, invoice_number: invoice_number }, { where: { order_id: order_id } })
        }
        Helper.response("success", "Order updated", order, res, 200)
    } catch (error) {
        console.log(error)
        Helper.response("error", "Something went wrong", error, res, 200)
    }
}


exports.orderDetails = async (req, res) => {
    try {
        const token = req.headers['authorization'];
        const string = token.split(" ");
        const user = await users.findOne({ where: { token: string[1] } });
        const { order_id } = req.body;

        let orderWithImageUrls;

        if (user.user_type === 'S') {
            orderWithImageUrls = await orderModel.findOne({
                where: { id: order_id },
            });
        } else {
            orderWithImageUrls = await orderModel.findOne({
                where: { id: order_id },
            });
        }


        if (!orderWithImageUrls) {
            return Helper.response("error", "Order not found", {}, res, 200);
        }


        if (orderWithImageUrls.image) {
            orderWithImageUrls.image = orderWithImageUrls.image.replace('public/', '');
        }

        const aasraData = await aasra.findOne({ where: { id: orderWithImageUrls.aasra_id } });

        const stateDetails = await states.findOne({ where: { id: aasraData.state } })
        let cgst = 0;
        var sgst = 0;

        if (stateDetails.name !== 'UTTAR PRADESH') {
            cgst = orderWithImageUrls.gst / 2;
            sgst = orderWithImageUrls.gst / 2;

        }

        const order = {
            id: orderWithImageUrls.id,
            aasra_id: orderWithImageUrls.aasra_id,
            total_bill: orderWithImageUrls.total_bill,
            total_tax: orderWithImageUrls.total_tax,
            grand_total: orderWithImageUrls.grand_total,
            gst: orderWithImageUrls.gst,
            supplier_name: orderWithImageUrls.supplier_name,
            order_status: orderWithImageUrls.order_status,
            shipping_charges: orderWithImageUrls.shipping_charges,
            order_date: orderWithImageUrls.order_date,
            payment_status: orderWithImageUrls.payment_status,
            payment_method: orderWithImageUrls.payment_method,
            transaction_id: orderWithImageUrls.transaction_id,
            paid_amount: orderWithImageUrls.paid_amount,
            due_amount: orderWithImageUrls.due_amount,
            payment_date: Helper.formatISODateTime(orderWithImageUrls.payment_date),
            dps_value: orderWithImageUrls.dps_value,
            dps_date: orderWithImageUrls.dps_date,
            dps_no: orderWithImageUrls.dps_no,
            image: orderWithImageUrls.image || null,
            notes: orderWithImageUrls.notes,
            stock_transfer: orderWithImageUrls.stock_transfer,
            discount: orderWithImageUrls.discount,
            cgst: cgst,
            sgst: sgst,
            orderData: [],
            payment: {},
            aasra: {},
        };

        const orderDetailsPromises = orderDetails.findAll({
            where: {
                order_id: order.id
            }
        });

        const aasraPromise = aasra.findOne({
            where: {
                id: order.aasra_id
            }
        });

        const paymentPromise = payment.findOne({
            where: {
                order_id: order.id
            }
        });

        const [allOrderDetails, aasraDetails, paymentDetails] = await Promise.all([
            orderDetailsPromises,
            aasraPromise,
            paymentPromise
        ]);

        const flattenedOrderDetails = allOrderDetails.map(detail => ({
            id: detail.item_id,
            item_id: detail.item_id,
            item_name: detail.item_name,
            quantity: detail.quantity,
            price: detail.price,
            order_id: detail.order_id,
            image: detail.image
        }));

        const orderWithDetails = {
            ...order,
            orderData: flattenedOrderDetails,
            payment: paymentDetails ? {
                id: paymentDetails.id,
                order_id: paymentDetails.order_id,
                purchase_order: paymentDetails.purchase_order,
                invoice: paymentDetails.invoice,
                PO_number: paymentDetails.PO_number,
                invoice_number: paymentDetails.invoice_number,
                createdAt: Helper.formatDateTime(paymentDetails.createdAt)
            } : {},
            aasra: aasraDetails || {}
        };

        Helper.response("success", "Order details", { order: orderWithDetails }, res, 200);
    } catch (error) {
        console.error(error);
        Helper.response("error", "Something went wrong", error, res, 200);
    }
}
exports.addStock = async (req, res) => {


    try {
        const { order_id, payment } = req.body;
        const payment_status = (await order.findOne({ where: { id: order_id } }))
        await order.update({
            stock_transfer: true
        }, {
            where: {
                id: order_id,
            }
        })
        if (payment_status.payment_status == 'Paid') {

            const itemsAddToStock = await orderDetails.findAll({ where: { order_id: order_id } })

            const data = await Promise.all(itemsAddToStock.map(async (f) => {

                await stock.create({
                    ...f.dataValues,
                    aasra_id: payment_status.aasra_id,
                    stock_in: f.quantity,
                }).catch((err) => {
                    console.log(err)
                })
            }))



            if (data) {
                Helper.response("success", "Stock added successfully", {}, res, 200)
            } else {

                Helper.response("failed", "Stock not added", {}, res, 200)
            }
        }
        else {
            Helper.response("failed", "Payment not done", {}, res, 200)
        }

    } catch (error) {

        Helper.response("failed", "Something went wrong", error, res, 200)
    }
}

exports.stockList = async (req, res) => {
    try {
        const token = req.headers['authorization'];
        const string = token.split(" ");
        const user = await users.findOne({ where: { token: string[1] } });

        if (user.user_type == 'S') {

            var stockDataList = await stock.findAll(
                {
                    where: {
                        aasra_id: req.body.aasra_id
                    },
                    attributes: [
                        'item_id',
                        [Sequelize.fn('COUNT', Sequelize.col('item_id')), 'count'],
                        [Sequelize.fn('SUM', Sequelize.col('stock_in')), 'stock_in'],
                        [Sequelize.fn('SUM', Sequelize.col('stock_out')), 'stock_out'],
                    ],
                    group: ['item_id'],
                    raw: true
                },
            )


            if (stockDataList.length === 0) {
                Helper.response(
                    "failed",
                    "Stock Not Available!",
                    {},
                    res,
                    200
                );
                return;
            }

            var TotalRecord = await Promise.all(stockDataList.map(async (t) => {

                const item = await spareParts.findByPk(t.item_id)


                const values = {
                    item_id: t.item_id,
                    stock_in: t.stock_in,
                    stock_out: t.stock_out,
                    item_id: item?.part_number || '',
                    item_name: item?.part_name || '',
                    price: item?.unit_price || '',
                    quantity: t.stock_in,
                    available_stock: (t.stock_in || 0) - (t.stock_out || 0)
                }

                return values
            }))
        }
        else {
            var stockDataList = await stock.findAll(
                {
                    where: {
                        aasra_id: user.ref_id
                    },
                    attributes: [
                        'item_id',
                        [Sequelize.fn('COUNT', Sequelize.col('item_id')), 'count'],
                        [Sequelize.fn('SUM', Sequelize.col('stock_in')), 'stock_in'],
                        [Sequelize.fn('SUM', Sequelize.col('stock_out')), 'stock_out'],
                    ],
                    group: ['item_id'],
                    raw: true
                },
            )


            if (stockDataList.length === 0) {
                Helper.response(
                    "failed",
                    "Stock Not Available!",
                    {},
                    res,
                    200
                );
                return;
            }

            var TotalRecord = await Promise.all(stockDataList.map(async (t) => {

                const item = await spareParts.findByPk(t.item_id)


                const values = {
                    item_id: t.item_id,
                    stock_in: t.stock_in,
                    stock_out: t.stock_out,
                    item_id: item?.part_number || '',
                    item_name: item?.part_name || '',
                    price: item?.unit_price || '',
                    quantity: t.stock_in,
                    available_stock: (t.stock_in || 0) - (t.stock_out || 0)
                }

                return values
            }))

        }
        console.log(TotalRecord);
        Helper.response("success", "Stock List", TotalRecord, res, 200)
    } catch (error) {
        console.log(error)
        Helper.response("error", "Something went wrong", error, res, 200)
    }
}
exports.generatePurchaseOrder = async (req, res) => {
    try {
        const { order_id } = req.body
        const date = new Date()

        const year = `${date.getFullYear()}`
        const PO_number = (date.getFullYear() + '-' + `${parseInt((year)?.split('0')[1]) + 1}`) + '/' + await Helper.generateNumber(10000000, 99999999)

        const purchase_order = await payment.update({
            order_id: order_id,
            purchase_order: true,
            PO_number: PO_number
        }, {
            where: {
                order_id: order_id
            }
        })
        Helper.response("success", "Purchase Order Generated", purchase_order, res, 200)
    } catch (error) {
        console.log(error)
        Helper.response("failed", "Something went wrong", error, res, 200)
    }
}

exports.purchaseOrderStatus = async (req, res) => {
    try {
        const { order_id } = req.body
        const purchase_order = await payment.findOne({ where: { order_id: order_id } })
        if (purchase_order.purchase_order == false) {
            Helper.response("failed", "Purchase Order Not Generated", purchase_order, res, 200)
        }
        else {
            Helper.response("success", "Purchase Order Generated", purchase_order, res, 200)
        }
    } catch (error) {
        Helper.response("failed", "Something went wrong", error, res, 200)
    }
}
exports.transactionList = async (req, res) => {
    try {
        const token = req.headers['authorization'];
        const string = token.split(" ");
        const user = await users.findOne({ where: { token: string[1] } });

        const startDate = await Helper.formatDate(new Date(req.body.startDate));
        const endDate = await Helper.formatDate(new Date(req.body.endDate));

        if (user.user_type == 'S') {
            var transactionList = await repairPayments.findAll({
                where: {
                    aasra_id: req.body.aasra_id, createdAt: {
                        [Op.between]: [startDate, endDate]
                    },
                }
            })
            if (transactionList.length === 0) {
                Helper.response(
                    "failed",
                    "Record Not Found!",
                    {},
                    res,
                    200
                );
                return;
            }


        } else {
            var transactionList = await repairPayments.findAll({
                where: {
                    aasra_id: user.ref_id, createdAt: {
                        [Op.between]: [startDate, endDate]
                    },
                }
            })

            if (transactionList.length === 0) {
                Helper.response(
                    "failed",
                    "Record Not Found!",
                    {},
                    res,
                    200
                );
                return;
            }
        }
        // console.log(transactionList)
        Helper.response("success", "Transaction List", transactionList, res, 200)
    } catch (error) {
        console.log(error)
        Helper.response("error", "Something went wrong", error, res, 200)
    }
}



exports.updateOrderDetails = async (req, res) => {

    const form = new formidable.IncomingForm();

    form.parse(req, async (err, fields, files) => {

        if (err) {
            console.log(err);
            return Helper.response("failed", "Failed to parse form data", err, res, 200);
        }

        const token = req.headers['authorization'];
        const string = token.split(" ");
        const user = await users.findOne({ where: { token: string[1] } });

        try {
            // Extract form fields
            const {

                gst = [],
                discount = [],
                shipping = [],
                orderStatus = [],
                supplier_name = [],
                subtotal = [],
                orderTaxAmount = [],
                grandTotal = [],
                order_id = [],
                aasra_id = [],
                dpsValue = [],
                dpsDate = [],
                dpsNo = [],
                notes = []
            } = fields;

            const products = [];
            // Extract and group product fields
            for (let i = 0; fields[`products[${i}][value]`]; i++) {
                products.push({
                    id: fields[`products[${i}][value]`],
                    label: fields[`products[${i}][label]`],
                    itemPrice: fields[`products[${i}][itemPrice]`],
                    qty: fields[`products[${i}][qty]`],
                    gst: fields[`products[${i}][gst]`],
                    subtotal: fields[`products[${i}][subtotal]`]
                });
            }


            if (files.image != undefined) {
                const imageFile = files.image[0];

                const ext = files.image[0].mimetype;
                var oldPath = files.image[0].filepath
                const newPath = 'public/' + files.image[0].originalFilename


                fs.rename(oldPath, newPath, async (err) => {

                    if (err) {
                        console.log(err);
                        return Helper.response("failed", "Failed to move image file", err, res, 200);
                    } else {

                        const total_order = {
                            aasra_id: aasra_id[0],
                            total_bill: subtotal[0],
                            total_tax: orderTaxAmount[0],
                            grand_total: grandTotal[0],
                            gst: gst[0],
                            discount: discount[0],
                            shipping_charges: shipping[0],
                            order_status: orderStatus[0],
                            supplier_name: supplier_name[0],
                            order_date: new Date().toISOString().slice(0, 10),
                            dps_value: dpsValue[0],
                            dps_date: dpsDate[0],
                            dps_no: dpsNo[0],
                            image: newPath || null,
                            notes: notes[0]
                        };

                        await orderModel.update(total_order, { where: { id: order_id[0] } });

                        const delet = await orderDetails.destroy({ where: { order_id: order_id[0] } });



                        const order = await Promise.all(products.map(async (f) => {

                            const productDataArray = f.id.map((id, index) => {

                                return {
                                    order_id: order_id[0],
                                    item_id: id || '--',
                                    item_name: f.label[index],
                                    quantity: f.qty[index],
                                    price: f.itemPrice[index],
                                    image: newPath
                                };
                            });
                            return Promise.all(productDataArray.map(productData => orderDetails.create(productData)));
                        }));
                        return Helper.response("success", "Order Updated successfully", total_order, res, 200);

                    }
                });
            } else {

                const total_order = {
                    aasra_id: aasra_id[0],
                    total_bill: subtotal[0],
                    total_tax: orderTaxAmount[0],
                    grand_total: grandTotal[0],
                    gst: gst[0],
                    discount: discount[0],
                    shipping_charges: shipping[0],
                    order_status: orderStatus[0],
                    supplier_name: supplier_name[0],
                    order_date: new Date().toISOString().slice(0, 10),
                    dps_value: dpsValue[0],
                    dps_date: dpsDate[0],
                    dps_no: dpsNo[0],
                    notes: notes[0]
                };

                // Update the order
                await orderModel.update(total_order, { where: { id: order_id[0] } });

                const delet = await orderDetails.destroy({ where: { order_id: order_id[0] } });



                const order = await Promise.all(products.map(async (f) => {

                    const productDataArray = f.id.map((id, index) => {

                        return {
                            order_id: order_id[0],
                            item_id: id || '--',
                            item_name: f.label[index],
                            quantity: f.qty[index],
                            price: f.itemPrice[index],
                            image: null
                        };
                    });
                    return Promise.all(productDataArray.map(productData => orderDetails.create(productData)));



                }));
                return Helper.response("success", "Order Updated successfully", total_order, res, 200);


            }


        } catch (error) {
            console.log(error);
            Helper.response("failed", "Something went wrong", error, res, 200);
        }
    });
};

exports.paymentStatus = async (req, res) => {
    try {
        const { order_id } = req.body
        const token = req.headers['authorization'];
        const string = token.split(" ");
        const user = await users.findOne({ where: { token: string[1] } });
        const transactionList = await orderModel.findAll({ where: { aasra_id: user.ref_id, order_id: order_id } })
        if (transactionList.payment_status == 'Paid') {
            Helper.response("success", "Payment is done", transactionList, res, 200)
        } else {
            Helper.response("error", "Payment is pending", transactionList, res, 200)
        }
        Helper.response("success", "Transaction List", transactionList, res, 200)
    } catch (error) {
        Helper.response("error", "Something went wrong", error, res, 200)
    }
}