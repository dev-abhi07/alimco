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
const transaction = require("../../model/transaction");
const invoicecopy = require("../../model/invoicecopy");



exports.productApi = async (req, res) => {

    try {
        const parts = await spareParts.findAll({
            where:{
                type:null 
            }
        })
        const partsData = [];

        parts.map((record) => {
            const values = {
                value: record.id,
                label: record.part_number + '-' + record.part_name,
                itemPrice: record.base_price,
                itemUnitPrice: record.unit_price,
                id: record.id
            }
            partsData.push(values)
        })
        Helper.response("success", "record found successfully", { partsData }, res, 200)
    } catch (error) {
        Helper.response("success", "Something went wrong!", { error }, res, 200)
    }
}

exports.productRtuApi = async (req, res) => {

    try {
        const parts = await spareParts.findAll({
            where:{
                type:'rtu'
            }
        })
        const partsData = [];

        parts.map((record) => {
            const values = {
                value: record.id,
                label: record.part_number + '-' + record.part_name,
                itemPrice: record.base_price,
                itemUnitPrice: record.unit_price,
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
        const { products, gst, discount, shipping, orderStatus, supplier_name, subtotal, orderTaxAmount, grandTotal, notes, underWarranty ,type} = req.body

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
        total_order['type'] = type.value || null
        total_order['type_label'] = type.label || null
        total_order['underWarranty'] = underWarranty?.label || null
      
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
                products['unit_price'] = f.itemUnitPrice
                products['type'] = type.value || null
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

        const startDate = req.body.startDate ? `${await Helper.formatDate(new Date(req.body.startDate))} 00:00:00` : null;
        const endDate = req.body.endDate ? `${await Helper.formatDate(new Date(req.body.endDate))} 23:59:59` : null;

        let whereClause = {};
        if (user.user_type !== 'S' && user.user_type !== 'A') {
            whereClause.aasra_id = user.ref_id;
        }

        if (startDate && endDate) {
            whereClause.createdAt = { [Op.between]: [startDate, endDate] };
        }

        if (req.body.stock === true) {
            whereClause.payment_status = 'Paid';
        }

        // Fetch all orders in one go based on the conditions
        const orderWithImageUrls = await orderModel.findAll({
            where: whereClause,
            order: [['id', 'DESC']]
        });

        if (orderWithImageUrls.length === 0) {
            return Helper.response("failed", "Record Not Found!", {}, res, 200);
        }

        // Extract all necessary IDs for batching the additional queries
        const orderIds = orderWithImageUrls.map(order => order.id);
        const aasraIds = orderWithImageUrls.map(order => order.aasra_id);

        // Fetch all related data in batches
        const [transactions, aasras, payments, orderDetail, stateDetails,invoiceCopies, stockData] = await Promise.all([
            transaction.findAll({ where: { order_id: orderIds, status: 'success' } }),
            aasra.findAll({ where: { id: aasraIds } }),
            payment.findAll({ where: { order_id: orderIds } }),
            orderDetails.findAll({ where: { order_id: orderIds } }),
            states.findAll({ attributes: ['id', 'name'] }),
            invoicecopy.findAll({ where: { order_id: orderIds } }), // Fetch multiple invoice copies
            stock.findAll({ where: { order_id: orderIds } }) //
        ]);

        const sparePartIds = orderDetail.map(detail => detail.item_id);

        // Fetch all spare parts related to item_ids
        const sparePart = await spareParts.findAll({ where: { id: sparePartIds } });

        // Create a sparePartMap for quick lookup
        const sparePartMap = sparePart.reduce((acc, part) => {
            acc[part.id] = part;
            return acc;
        }, {});

        const stateMap = stateDetails.reduce((acc, state) => {
            acc[state.id] = state.name;
            return acc;
        }, {});

        // Map the related data to make lookup faster
        const transactionMap = transactions.reduce((acc, trans) => {
            acc[trans.order_id] = trans;
            return acc;
        }, {});

        const aasraMap = aasras.reduce((acc, a) => {
            acc[a.id] = a;
            return acc;
        }, {});

        const paymentMap = payments.reduce((acc, pay) => {
            acc[pay.order_id] = pay;
            return acc;
        }, {});

        const invoiceCopyMap = invoiceCopies.reduce((acc, copy) => {
            if (!acc[copy.order_id]) {
                acc[copy.order_id] = [];
            }
        
            acc[copy.order_id].push({
                id: copy.id,
                image: copy.image ? copy.image.replace('public/', '') : null
            });
            return acc;
        }, {});


        const stockMap = stockData.reduce((acc, stock) => {
            if (!acc[stock.order_id]) {
                acc[stock.order_id] = {
                    items: [],
                    total_gst_price_partial: 0 // Initialize total_gst_price_partial
                };
            }
        
            const sparePartPartial = sparePartMap[stock.item_id];

            const gstPricePartial = sparePartPartial ? (stock.quantity * stock.unit_price) : 0;

      
            
            acc[stock.order_id].items.push({
                id: stock.id, // Directly add the id
                item_id: stock.item_id,
                item_name: stock.item_name,
                quantity: stock.quantity,
                itemUnitPrice: stock.unit_price,
                price: stock.price,
                order_id: stock.order_id,
                sparePartPartial: sparePartPartial
            });
            acc[stock.order_id].total_gst_price_partial += gstPricePartial;
            return acc;
        }, {});


        const orderDetailsMap = orderDetail.reduce((acc, detail) => {
            if (!acc[detail.order_id]) {
                acc[detail.order_id] = {
                    items: [],
                    total_gst_price: 0
                };
            }

            const sparePart = sparePartMap[detail.item_id];
            const gstPrice = sparePart ? (detail.quantity * detail.unit_price) : 0;

    

            acc[detail.order_id].items.push({
                id: detail.id, // Directly add the id
                item_id: detail.item_id,
                item_name: detail.item_name,
                quantity: detail.quantity,
                price: detail.price,
                itemUnitPrice: detail.unit_price,
                order_id: detail.order_id,
                image: detail.image,
                gstpercent:sparePart,
                sparePart: sparePart ? { gst_price: gstPrice } : null // Include sparePart if needed
            });

            // Add gst_price to the total for the order
            acc[detail.order_id].total_gst_price += gstPrice;

            return acc;
        }, {});

    
        const ordersWithDetails = orderWithImageUrls.map(order => {
            const aasraData = aasraMap[order.aasra_id];
            const aasraState = stateMap[aasraData?.state];
            const isOutOfState = aasraState && aasraState !== 'UTTAR PRADESH';
            const cgst = isOutOfState ? order.gst / 2 : 0;
            const sgst = isOutOfState ? order.gst / 2 : 0;

            const totalGstPrice = orderDetailsMap[order.id]?.total_gst_price - order.total_bill  || 0;

            const totalGstPricePartial = stockMap[order.id]?.total_gst_price_partial - order.creditnotetotal  || 0;

         

            return {
                id: order.id,
                aasra_id: order.aasra_id,
                total_bill: order.total_bill,
                total_tax: order.total_tax,
                grand_total: order.grand_total,
                gst: order.gst,
                supplier_name: order.supplier_name,
                order_status: order.order_status,
                shipping_charges: order.shipping_charges,
                order_date: order.order_date,
                payment_status: order.payment_status,
                payment_method: order.payment_method,
                underWarranty: order.underWarranty,
                transaction_id: order.transaction_id,
                paid_amount: order.paid_amount,
                due_amount: order.due_amount,
                payment_date: Helper.formatISODateTime(order.payment_date),
                dps_value: order.dps_value,
                dps_date: Helper.istDateFormate(order.dps_date),
                dps_no: order.dps_no,
                notes: order.notes,
                stock_transfer: order.stock_transfer,
                discount: order.discount,
                image: order.image ? order.image.replace('public/', '') : null,
                sgst: sgst,
                cgst: cgst,
                gst_price: totalGstPrice,
                order_id_online: transactionMap[order.id]?.order || null,
                online_razorpay_payment_id: transactionMap[order.id]?.razorpay_payment_id || null,
                online_razorpay_signature: transactionMap[order.id]?.razorpay_signature || null,
                online_status: transactionMap[order.id]?.status || null,
                orderData: orderDetailsMap[order.id]?.items || [],

                invoice_no: order.invoice_no,
                invoice_date: Helper.istDateFormate(order.invoice_date) ,
                invoicecopies: invoiceCopyMap[order.id] || [], 
                stockData: stockMap[order.id] || [], 
                creditnotetotal: order.creditnotetotal,
                totalGstPricePartial:totalGstPricePartial,
                startDate: Helper.formatISODateTime(order.startDate),
                endDate: Helper.formatISODateTime(order.endDate),
                type: order.type,
                type_label: order.type_label,
                payment: paymentMap[order.id] ? {
                    id: paymentMap[order.id].id,
                    order_id: paymentMap[order.id].order_id,
                    purchase_order: paymentMap[order.id].purchase_order,
                    invoice: paymentMap[order.id].invoice,
                    PO_number: paymentMap[order.id].PO_number,
                    invoice_number: paymentMap[order.id].invoice_number,
                    createdAt: Helper.formatISODateTime(paymentMap[order.id].createdAt),
                } : {},
                aasra: aasraMap[order.aasra_id] || {},
            };
        });

        // Sending the response
        Helper.response("success", "Order list", { order: ordersWithDetails }, res, 200);
    } catch (error) {
        console.error(error);
        Helper.response("failed", "Something went wrong", error, res, 200);
    }
};






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
            if (user.user_type == 'S' || user.user_type == 'A') {
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

            if (user.user_type == 'S' || user.user_type == 'A') {
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
            if (user.user_type == 'S' || user.user_type == 'A') {
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
                    createdAt: Helper.formatDateTime(allPayments[index].createdAt),
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

        if (user.user_type === 'S' || user.user_type == 'A') {
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
            underWarranty: orderWithImageUrls.underWarranty,
            payment_method: orderWithImageUrls.payment_method,
            transaction_id: orderWithImageUrls.transaction_id,
            paid_amount: orderWithImageUrls.paid_amount,
            due_amount: orderWithImageUrls.due_amount,
            payment_date: orderWithImageUrls.payment_date,
            dps_value: orderWithImageUrls.dps_value,
            dps_date: orderWithImageUrls.dps_date,
            dps_no: orderWithImageUrls.dps_no,
            image: orderWithImageUrls.image || null,
            notes: orderWithImageUrls.notes,
            stock_transfer: orderWithImageUrls.stock_transfer,
            discount: orderWithImageUrls.discount,
            creditnotetotal: orderWithImageUrls.creditnotetotal,
            type: orderWithImageUrls.type,
            type_label: orderWithImageUrls.type_label,
            cgst: cgst,
            sgst: sgst,
            gstNo: aasraData.gst,
            total_gst_price: 0,
            orderData: [],
            partialData:[],
            payment: {},
            aasra: {},
        };

        const orderDetailsPromises = orderDetails.findAll({
            where: {
                order_id: order.id
            }
        });

       const stockdatadetails =  stock.findAll({
                    where:{
                        order_id :order.id
                    }
        })

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

        const [allOrderDetails, aasraDetails, paymentDetails,stockdatapartial] = await Promise.all([
            orderDetailsPromises,
            aasraPromise,
            paymentPromise,
            stockdatadetails
        ]);

        const flattenedOrderDetails = await Promise.all(allOrderDetails.map(async (detail) => {
            
            const sparePart = await spareParts.findOne({
                where: {
                    id: detail.item_id
                }   
            });

           
            const itemGst = sparePart.gst;
            const gstPrice = detail.quantity * detail.unit_price; 

            order.total_gst_price += gstPrice;
            return {
                id: detail.item_id,
                item_id: detail.item_id,
                item_name: detail.item_name,
                quantity: detail.quantity,
                price: detail.price,
                itemUnitPrice: detail.unit_price,
                order_id: detail.order_id,
                image: detail.image,
                hsn_code: sparePart.hsn_code,
                description: sparePart.description,
                part_number: sparePart.part_number,
                gst: itemGst,
                gst_price: gstPrice
            };
          }));
        const partialOrderDetails = await Promise.all(stockdatapartial.map(async (detail) => {
            
                    const sparePart = await spareParts.findOne({
                        where: {
                            id: detail.item_id
                        }
                    });

           
            const itemGst = sparePart.gst;
            

            return {
                id: detail.item_id,
                item_id: detail.item_id,
                item_name: detail.item_name,
                quantity: detail.quantity,
                price: detail.price,
                itemUnitPrice: detail.unit_price,
                order_id: detail.order_id,
                image: detail.image,
                hsn_code: sparePart.hsn_code,
                description: sparePart.description,
                part_number: sparePart.part_number,
                gst: itemGst
                
            };
        }));
        const adjustedTotalBill = order.total_gst_price - order.total_bill  ;
        const orderWithDetails = {
            ...order,
            orderData: flattenedOrderDetails,
            partialData :partialOrderDetails,
            payment: paymentDetails ? {
                id: paymentDetails.id,
                order_id: paymentDetails.order_id,
                purchase_order: paymentDetails.purchase_order,
                invoice: paymentDetails.invoice,
                PO_number: paymentDetails.PO_number,
                invoice_number: paymentDetails.invoice_number,
                createdAt: Helper.formatDateTime(paymentDetails.createdAt)
            } : {},
            aasra: aasraDetails || {},
            gst_amount: adjustedTotalBill
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
        else if (payment_status.underWarranty == 'UnderWarranty') {
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

        const aasras = req.body.aasra_id !== undefined && req.body.aasra_id !== null
            ? req.body.aasra_id
            : await Helper.getAasraId(req);

        const startDatesplit = await Helper.formatDate(new Date(req.body.startDate));
        const splitDate = await Helper.formatDate(new Date(req.body.endDate));
        const startDate = startDatesplit.split(" ")[0] + " " + "00:00:00";
        const endDate = splitDate.split(" ")[0] + " " + "23:59:59";

        if (user.user_type == 'S' || user.user_type == 'A') {

            if (aasras == null) {
                var stockDataList = await stock.findAll({
                    where: req.body.spare_id == null
                        ? {
                            createdAt: { [Op.between]: [startDate, endDate] },
                        } : {
                            [Op.or]: [
                                { item_id: req.body.spare_id }
                            ],
                            createdAt: { [Op.between]: [startDate, endDate] }
                        },
                    attributes: [
                        'item_id',
                        'aasra_id',
                        [Sequelize.fn('COUNT', Sequelize.col('item_id')), 'count'],
                        [Sequelize.fn('SUM', Sequelize.col('stock_in')), 'stock_in'],
                        [Sequelize.fn('SUM', Sequelize.col('stock_out')), 'stock_out'],
                    ],
                    group: ['item_id', 'aasra_id'],
                    raw: true
                });
            } else {
                var stockDataList = await stock.findAll({

                    where: req.body.spare_id == null
                        ? {
                            aasra_id: aasras,
                            createdAt: { [Op.between]: [startDate, endDate] },
                        } : {
                            aasra_id: aasras,
                            item_id: req.body.spare_id,
                            createdAt: { [Op.between]: [startDate, endDate] }
                        },
                    attributes: [
                        'item_id',
                        'aasra_id',
                        [Sequelize.fn('COUNT', Sequelize.col('item_id')), 'count'],
                        [Sequelize.fn('SUM', Sequelize.col('stock_in')), 'stock_in'],
                        [Sequelize.fn('SUM', Sequelize.col('stock_out')), 'stock_out'],
                    ],
                    group: ['item_id', 'aasra_id'],
                    raw: true
                });
            }



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
                const aasraNameDetails = await Helper.getAasraDetails(t.aasra_id)
                const values = {
                    item_id: t.item_id,
                    stock_in: t.stock_in,
                    stock_out: t.stock_out,
                    aasraName: aasraNameDetails.name_of_org || '',
                    aasra_id: aasraNameDetails.id || '',
                    part_number: item?.part_number || '',
                    item_part: item?.part_number || '',
                    item_name: item?.part_name || '',
                    price: item?.unit_price || '',
                    quantity: t.stock_in,
                    available_stock: (t.stock_in || 0) - (t.stock_out || 0)
                }

                return values
            }))
        }
        else {
            console.log(aasras)

            var stockDataList = await stock.findAll(
                {

                    where: req.body.spare_id == null
                        ? {
                            aasra_id: aasras,
                            createdAt: { [Op.between]: [startDate, endDate] },
                        } : {
                            aasra_id: aasras,
                            item_id: req.body.spare_id,
                            createdAt: { [Op.between]: [startDate, endDate] }
                        },
                    attributes: [
                        'item_id',
                        'aasra_id',
                        [Sequelize.fn('COUNT', Sequelize.col('item_id')), 'count'],
                        [Sequelize.fn('SUM', Sequelize.col('stock_in')), 'stock_in'],
                        [Sequelize.fn('SUM', Sequelize.col('stock_out')), 'stock_out'],
                    ],
                    group: ['item_id', 'aasra_id'],
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
                const aasraNameDetails = await Helper.getAasraDetails(t.aasra_id)

                const values = {
                    item_id: t.item_id,
                    stock_in: t.stock_in,
                    stock_out: t.stock_out,
                    aasraName: aasraNameDetails.name_of_org || '',
                    aasra_id: aasraNameDetails.id || '',
                    part_number: item?.part_number || '',
                    item_part: item?.part_number || '',
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
        const aasras = req.body.aasra_id !== undefined && req.body.aasra_id !== null
            ? req.body.aasra_id
            : await Helper.getAasraId(req);

        const token = req.headers['authorization'];
        const string = token.split(" ");
        const user = await users.findOne({ where: { token: string[1] } });



        const startDatesplit = await Helper.formatDate(new Date(req.body.startDate));
        const splitDate = await Helper.formatDate(new Date(req.body.endDate));
        const startDate = startDatesplit.split(" ")[0] + " " + "00:00:00";
        const endDate = splitDate.split(" ")[0] + " " + "23:59:59";

        if (user.user_type == 'S' || user.user_type == 'A') {
            if (aasras == null) {
                var transactionList = await repairPayments.findAll({
                    where: {
                        createdAt: {
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
                        aasra_id: aasras, createdAt: {
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


            const data = await Promise.all(transactionList.map(async (record) => {
                const aasraDetails = await Helper.getAasraDetails(record.aasra_id)
                return {
                    id: record.id,
                    aasra_id: record.aasra_id,
                    aasraName: aasraDetails.name_of_org,
                    uniqueCode: aasraDetails.unique_code,
                    createdAt: record.createdAt,
                    discount: record.discount,
                    payment_mode: record.payment_mode,
                    serviceCharge: record.serviceCharge,
                    ticket_id: record?.ticket_id,
                    total_amount: record.total_amount,
                    updatedAt: record?.updatedAt,
                    receipt_no: record?.receipt_no,
                };


            }));

            Helper.response("success", "Transaction List", data, res, 200)
        } else {

            var transactionList = await repairPayments.findAll({
                where: {
                    aasra_id: aasras, createdAt: {
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


            const data = await Promise.all(transactionList.map(async (record) => {
                const aasraDetails = await Helper.getAasraDetails(record.aasra_id)
                return {
                    id: record.id,
                    aasra_id: record.aasra_id,
                    aasraName: aasraDetails.name_of_org,
                    uniqueCode: aasraDetails.unique_code,
                    createdAt: record.createdAt,
                    discount: record.discount,
                    payment_mode: record.payment_mode,
                    serviceCharge: record.serviceCharge,
                    ticket_id: record?.ticket_id,
                    total_amount: record.total_amount,
                    updatedAt: record?.updatedAt,
                    receipt_no: record?.receipt_no,
                };


            }));
            Helper.response("success", "Transaction List", data, res, 200)
        }




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
                notes = [],
                startDate = [],
                endDate = [],
                type_value =[],
                type_label =[],
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
                    subtotal: fields[`products[${i}][subtotal]`],
                    unit_price: fields[`products[${i}][itemUnitPrice]`]
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
                            notes: notes[0],
                            startDate:startDate[0],
                            endDate: endDate[0],
                            type: type_value[0] || null,
                            type_label: type_label[0] || null,
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
                                    unit_price: f.unit_price[index],
                                    image: newPath,
                                    type: type_value[0] || null 
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
                    notes: notes[0],
                    startDate:startDate[0],
                    endDate: endDate[0],
                    type: type_value[0] || null,
                    type_label: type_label[0] || null,
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
                            unit_price: f.unit_price[index],
                            image: null,
                            type: type_value[0] || null
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

exports.stockReports = async (req, res) => {



    try {

        const item_id = req.body.item_id
        const aasra_id = req.body.aasra_id
        const token = req.headers['authorization'];
        const string = token.split(" ");
        const user = await users.findOne({ where: { token: string[1] } });
        if (user.user_type == 'S' || user.user_type == 'A') {


            const stocks = await stock.findAll({ where: { item_id: item_id, aasra_id: aasra_id } })

            const allData = stocks.map((t) => {
                const values = {
                    item_id: t.item_id,
                    item_name: t.item_name,
                    quantity: t.quantity,
                    price: t.price,
                    stock_in: t.stock_in,
                    stock_out: t.stock_out,
                    createdAt: Helper.formatISODateTime(t.createdAt)
                }
                return values
            })

            Helper.response("success", "Stock List Found!", allData, res, 200)
        } else {
            const stocks = await stock.findAll({ where: { item_id: item_id, aasra_id: aasra_id } })

            const allData = stocks.map((t) => {
                const values = {
                    item_id: t.item_id,
                    item_name: t.item_name,
                    quantity: t.quantity,
                    price: t.price,
                    stock_in: t.stock_in,
                    stock_out: t.stock_out,
                    createdAt: Helper.formatISODateTime(t.createdAt)
                }
                return values
            })


            Helper.response("success", "Stock List Found!", allData, res, 200)
        }



    } catch (error) {
        Helper.response("error", "Something went wrong", error, res, 200)
    }
}




exports.bultiStockTransfer = async (req, res) => {
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
                dpsValue = [],
                dpsDate = [],
                dpsNo = [],
                notes = [],
                invoice_no = [],
                invoice_date = [],
                type_value =[]
            } = fields;

            const products = [];

            for (let i = 0; fields[`products[${i}][value]`]; i++) {
                products.push({
                    id: fields[`products[${i}][value]`],
                    label: fields[`products[${i}][label]`],
                    itemPrice: fields[`products[${i}][itemPrice]`],
                    qty: fields[`products[${i}][qty]`],
                    gst: fields[`products[${i}][gst]`],
                    subtotal: fields[`products[${i}][subtotal]`],
                    unit_price: fields[`products[${i}][itemUnitPrice]`],
                });
            }

            const orderDetails = await orderModel.findOne({ where: { id: order_id[0] } });
            const aasra_id = orderDetails.aasra_id;
            let totalCreditNote = 0;
            for (const product of products) {
                const productPrices = product.subtotal; // Assuming this is an array
                productPrices.forEach(price => {
                    totalCreditNote += parseFloat(price || 0); // Sum up all item prices
                });
            }

            if (Object.keys(files.invoice_copy).length > 0) {
                const imagePaths = [];

                await Promise.all(Object.values(files.invoice_copy).map(async (imageFile) => {
                    console.log("File path is undefined for:", imageFile);
                   
                    const ext = path.extname(imageFile.originalFilename);  
                    const oldPath = imageFile.filepath;  
                    const newPath = path.join('public/', imageFile.originalFilename);  
                    const normalizedPath = newPath.replace(/\\/g, '/');
                    try {
                        await fs.promises.rename(oldPath, normalizedPath);  // Save the file with the normalized path
                        imagePaths.push(normalizedPath);
            

                        await invoicecopy.create({
                            order_id: order_id[0],
                            image: normalizedPath  
                        });
                    } catch (err) {
                        console.log(err);
                        return Helper.response("failed", "Failed to upload invoice copy", err, res, 200);
                    }
                }));

                const total_order = {
                    invoice_no: invoice_no[0],
                    invoice_date: invoice_date[0],
                    creditnotetotal: totalCreditNote,
                    stock_transfer: 1
                };

                await orderModel.update(total_order, { where: { id: order_id[0] } });

                const order = await Promise.all(products.map(async (f) => {
                    const productDataArray = f.id.map((id, index) => {
                        return {
                            order_id: order_id[0],
                            item_id: id || '--',
                            item_name: f.label[index],
                            quantity: f.qty[index],
                            price: f.itemPrice[index],
                            unit_price: f.unit_price[index],
                            stock_in: f.qty[index],
                            aasra_id: aasra_id,
                            type: type_value[0]
                        };
                    });
                    return Promise.all(productDataArray.map(productData => stock.create(productData)));
                }));

                return Helper.response("success", "Order and Invoice Updated, Stock Transferred successfully", total_order, res, 200);
            } else {
                const total_order = {
                    invoice_no: invoice_no[0],
                    invoice_date: invoice_date[0],
                    creditnotetotal: totalCreditNote,
                    stock_transfer: 1
                };

                await orderModel.update(total_order, { where: { id: order_id[0] } });

                const order = await Promise.all(products.map(async (f) => {
                    const productDataArray = f.id.map((id, index) => {
                        return {
                            order_id: order_id[0],
                            item_id: id || '--',
                            item_name: f.label[index],
                            quantity: f.qty[index],
                            price: f.itemPrice[index],
                            unit_price: f.unit_price[index],
                            stock_in: f.qty[index],
                            aasra_id: aasra_id,
                            type: type_value[0]
                        };
                    });
                    return Promise.all(productDataArray.map(productData => stock.create(productData)));
                }));

                return Helper.response("success", "Order Updated and Stock Transferred successfully", total_order, res, 200);
            }
        } catch (error) {
            console.log(error);
            Helper.response("failed", "Something went wrong", error, res, 200);
        }
    });
};


exports.nrmlStockTransfer = async (req, res) => {
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
                dpsValue = [],
                dpsDate = [],
                dpsNo = [],
                notes = [],
                invoice_no = [],
                invoice_date = []
            } = fields;

           
        
            const orderDetail = await orderModel.findOne({ where: { id: order_id[0] } });
            const aasra_id = orderDetail.aasra_id;

            if (Object.keys(files.invoice_copy).length > 0) {
                const imagePaths = [];

                await Promise.all(Object.values(files.invoice_copy).map(async (imageFile) => {
                    console.log("File path is undefined for:", imageFile);
                   
                    const ext = path.extname(imageFile.originalFilename);  
                    const oldPath = imageFile.filepath;  
                    const newPath = path.join('public/', imageFile.originalFilename);  
                    const normalizedPath = newPath.replace(/\\/g, '/');
                    try {
                        await fs.promises.rename(oldPath, normalizedPath);  // Save the file with the normalized path
                        imagePaths.push(normalizedPath);
            

                        await invoicecopy.create({
                            order_id: order_id[0],
                            image: normalizedPath  
                        });
                    } catch (err) {
                        console.log(err);
                        return Helper.response("failed", "Failed to upload invoice copy", err, res, 200);
                    }
                }));

                const total_order = {
                    invoice_no: invoice_no[0],
                    invoice_date: invoice_date[0],
                    stock_transfer: 1
                };

                await orderModel.update(total_order, { where: { id: order_id[0] } });

              
                const itemsAddToStock = await orderDetails.findAll({ where: { order_id: order_id[0] } })

                const data = await Promise.all(itemsAddToStock.map(async (f) => {
    
                    await stock.create({
                        ...f.dataValues,
                        aasra_id: aasra_id,
                        stock_in: f.quantity,
                    }).catch((err) => {
                        console.log(err)
                    })
                }))
                return Helper.response("success", "Order and Invoice Updated, Stock Transferred successfully", total_order, res, 200);
            } else {
                const total_order = {
                    invoice_no: invoice_no[0],
                    invoice_date: invoice_date[0],
                    stock_transfer: 1
                };

                await orderModel.update(total_order, { where: { id: order_id[0] } });

             
                const itemsAddToStock = await orderDetails.findAll({ where: { order_id: order_id[0] } })

                const data = await Promise.all(itemsAddToStock.map(async (f) => {
    
                    await stock.create({
                        ...f.dataValues,
                        aasra_id: aasra_id,
                        stock_in: f.quantity,
                    }).catch((err) => {
                        console.log(err)
                    })
                }))

                return Helper.response("success", "Order Updated and Stock Transferred successfully", total_order, res, 200);
            }
        } catch (error) {
            console.log(error);
            Helper.response("failed", "Something went wrong", error, res, 200);
        }
    });
};


// exports.bultiStockTransfer = async (req, res) => {
//     const form = new formidable.IncomingForm();

//     form.parse(req, async (err, fields, files) => {
//         if (err) {
//             console.log(err);
//             return Helper.response("failed", "Failed to parse form data", err, res, 200);
//         }

//         const token = req.headers['authorization'];
//         const string = token.split(" ");
//         const user = await users.findOne({ where: { token: string[1] } });

//         try {
//             // Extract form fields
//             const {
//                 gst = [],
//                 discount = [],
//                 shipping = [],
//                 orderStatus = [],
//                 supplier_name = [],
//                 subtotal = [],
//                 orderTaxAmount = [],
//                 grandTotal = [],
//                 order_id = [],
//                 dpsValue = [],
//                 dpsDate = [],
//                 dpsNo = [],
//                 notes = [],
//                 invoice_no = [],
//                 invoice_date = []
//             } = fields;

//             const products = [];
           
//             for (let i = 0; fields[`products[${i}][value]`]; i++) {
//                 products.push({
//                     id: fields[`products[${i}][value]`],
//                     label: fields[`products[${i}][label]`],
//                     itemPrice: fields[`products[${i}][itemPrice]`],
//                     qty: fields[`products[${i}][qty]`],
//                     gst: fields[`products[${i}][gst]`],
//                     subtotal: fields[`products[${i}][subtotal]`]
//                 });
//             }

//             const orderDetails = await orderModel.findOne({ where: { id: order_id[0] } });
//             const aasra_id = orderDetails.aasra_id;
//             if (files.invoice_copy && Object.keys(files.invoice_copy).length > 0) {
//                 const imagePaths = [];

                
//                 await Promise.all(Object.values(files.invoice_copy).map(async (imageFile) => {
//                     const ext = imageFile.mimetype;
//                     const oldPath = imageFile.filepath;
//                     const newPath = 'public/' + imageFile.originalFilename;

//                     try {
//                         await fs.promises.rename(oldPath, newPath);
//                         imagePaths.push(newPath);

                        
//                         await invoicecopy.create({
//                             order_id: order_id[0],
//                             image: newPath
//                         });
//                     } catch (err) {
//                         console.log(err);
//                         return Helper.response("failed", "Failed to upload invoice copy", err, res, 200);
//                     }
//                 }));

              
//                 const total_order = {
//                     invoice_no: invoice_no[0],
//                     invoice_date: invoice_date[0]
//                 };
//                 await orderModel.update(total_order, { where: { id: order_id[0] } });

                
//                 const order = await Promise.all(products.map(async (f) => {
//                     const productDataArray = f.id.map((id, index) => {
//                         return {
//                             order_id: order_id[0],
//                             item_id: id || '--',
//                             item_name: f.label[index],
//                             quantity: f.qty[index],
//                             price: f.itemPrice[index],
//                             stock_in: f.qty[index],
//                             aasra_id:aasra_id
//                         };
//                     });
//                     return Promise.all(productDataArray.map(productData => stock.create(productData)));
//                 }));

//                 return Helper.response("success", "Order and Invoice Updated, Stock Transferred successfully", total_order, res, 200);
//             } else {
                
//                 const total_order = {
//                     invoice_no: invoice_no[0],
//                     invoice_date: invoice_date[0]
//                 };
//                 await orderModel.update(total_order, { where: { id: order_id[0] } });

               
//                 const order = await Promise.all(products.map(async (f) => {
//                     const productDataArray = f.id.map((id, index) => {
//                         return {
//                             order_id: order_id[0],
//                             item_id: id || '--',
//                             item_name: f.label[index],
//                             quantity: f.qty[index],
//                             price: f.itemPrice[index],
//                             stock_in: f.qty[index],
//                             aasra_id:aasra_id
//                         };
//                     });
//                     return Promise.all(productDataArray.map(productData => stock.create(productData)));
//                 }));

//                 return Helper.response("success", "Order Updated and Stock Transferred successfully", total_order, res, 200);
//             }
//         } catch (error) {
//             console.log(error);
//             Helper.response("failed", "Something went wrong", error, res, 200);
//         }
//     });
// };
