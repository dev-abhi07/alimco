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
const { where } = require("sequelize");
const payment = require("../../model/payment");
const formidable = require("formidable");
const fs = require('fs');
const path = require('path');


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
        const { products, gst, discount, shipping, orderStatus, supplier_name, subtotal, orderTaxAmount, grandTotal } = req.body

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
        total_order['order_date'] = new Date().toISOString().slice(0, 10)

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
        let orderWithImageUrls;
        if (user.user_type == 'S') {
            orderWithImageUrls = await orderModel.findAll()
        } else {
            orderWithImageUrls = await orderModel.findAll({ where: { aasra_id: user.ref_id } })
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
                payment_date: o.payment_date,
                dps_value: o.dps_value,
                dps_date: o.dps_date,
                dps_no: o.dps_no,
                image: o.image ? o.image.replace('public/', '') : null,
                orderData: [] ,
                 payment: {},
                 aasra:{},
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
                image: detail.image
                
            }));

        
        const ordersWithDetails = orders.map((order , index)=> {
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
                     createdAt: Helper.formatDateTime(allPayments[index].createdAt) ,
                } : {},
                aasra : allAasraDetails[index] || {}
            };
        });


        Helper.response("success", "Order list",{
            order:ordersWithDetails,
         
        } , res, 200)
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
        const { order_id } = req.body
        const itemPerOrder = await order.findOne({
            where: { id: order_id },
        });
        const aasras = await aasra.findByPk(itemPerOrder.aasra_id)
        const orderDetail = await orderDetails.findAll({
            where: {
                order_id: itemPerOrder.id
            }
        })
        const value = {
            assraData: aasras,
            orderData: orderDetail,
            payment: await payment.findOne({ where: { order_id: itemPerOrder.id } }),
            total: itemPerOrder.grand_total,
            gst: itemPerOrder.gst,
            shipping: itemPerOrder.shipping_charges,
            discount: 0
        }
        Helper.response("success", "Order details", value, res, 200)
    } catch (error) {
        console.log(error)
        Helper.response("error", "Something went wrong", error, res, 200)
    }
}

exports.addStock = async (req, res) => {


    try {
        const { order_id, payment } = req.body;
        const payment_status = (await order.findOne({ where: { id: order_id } }))
        if (payment_status.payment_status == 'paid') {


            const itemsAddToStock = await orderDetails.findAll({ where: { order_id: order_id } })

            const data = await Promise.all(itemsAddToStock.map(async (f) => {
                await stock.create({
                    ...f.dataValues,
                    aasra_id: payment_status.aasra_id,
                    stock_in: f.quantity
                }).catch((err) => {
                    console.log(err)
                })
            }))
            if (data) {
                Helper.response("success", "Stock added success fully", {}, res, 200)
            } else {
                Helper.response("error", "Something went wrong", {}, res, 200)
            }
        }
        else {
            Helper.response("error", "Payment not done", {}, res, 200)
        }

    } catch (error) {
        Helper.response("error", "Something went wrong", error, res, 200)
    }
}

exports.stockList = async (req, res) => {
    try {
        const token = req.headers['authorization'];
        const string = token.split(" ");
        const user = await users.findOne({ where: { token: string[1] } });

        if (user.user_type == 'S') {

            var stockList = await stock.findAll(
                {
                    include: aasra,
                    where: {
                        aasra_id: req.body.aasra_id
                    }
                },
            )
        }
        else {
            var stockList = await stock.findAll({
            }, { where: { aasra_id: user.ref_id } })
        }
        console.log(stockList)
        Helper.response("success", "Stock List", stockList, res, 200)
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
        const transactionList = await orderModel.findAll({ where: { aasra_id: user.ref_id, payment_status: 'paid' } })
        Helper.response("success", "Transaction List", transactionList, res, 200)
    } catch (error) {
        console.log(error)
        Helper.response("error", "Something went wrong", error, res, 200)
    }
}
// exports.updateOrderDetails = async (req, res) => {
//     try {
//         const token = req.headers['authorization'];
//         const string = token.split(" ");
//         const user = await users.findOne({ where: { token: string[1] } });


//         const { products, gst, discount, shipping, orderStatus, supplier_name, subtotal, orderTaxAmount, grandTotal, order_id , aasra_id,dpsValue,dpsDate,dpsNo} = req.body

//         const total_order = {}

//         total_order['aasra_id'] = aasra_id
//         total_order['total_bill'] = subtotal
//         total_order['total_tax'] = orderTaxAmount
//         total_order['grand_total'] = grandTotal
//         total_order['gst'] = gst
//         total_order['discount'] = discount
//         total_order['shipping_charges'] = shipping
//         total_order['order_status'] = orderStatus.label
//         total_order['supplier_name'] = supplier_name.label
//         total_order['order_date'] = new Date().toISOString().slice(0, 10)

//         total_order['dps_value'] = dpsValue
//         total_order['dps_date'] = dpsDate
//         total_order['dps_no'] = dpsNo



//         //const deleteOrder = await orderModel.destroy({ where: { id: order_id } })

//         const createOrder = await orderModel.update(total_order,{where:{id:order_id}}).catch((err) => {
//             console.log(err)
//             Helper.response("error", "Something went wrong", err, res, 200)
//         })
//         if (createOrder) {

//             const deleteOrder = await orderDetails.destroy({ where: { order_id: order_id } })
//             const order = await Promise.all(products.map(async (f) => {

//                 const products = {}
//                 products['order_id'] = order_id
//                 products['item_id'] = f.id
//                 products['item_name'] = f.label
//                 products['quantity'] = f.qty
//                 products['price'] = f.itemPrice

//                 const data = await orderDetails.create(products).catch((err) => {
//                     console.log(err)
//                 })
//                 return data
//             }))

//             Helper.response("success", "Order Updated successfully", total_order, res, 200)
//         }

//     } catch (error) {
//         console.log(error)
//         Helper.response("error", "Something went wrong", error, res, 200)
//     }
// }



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
                dpsNo = []
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



            // Handle image upload


            if (files.image != undefined) {
                const imageFile = files.image[0];

                const ext = files.image[0].mimetype;
                var oldPath = files.image[0].filepath
                // const newPath = 'public/' + files.image[0].originalFilename + '.' + ext.split('/')[1]
                const newPath = 'public/' + files.image[0].originalFilename

                // Move the file to the public directory
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
                            image: newPath || null
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
                    dps_no: dpsNo[0]
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