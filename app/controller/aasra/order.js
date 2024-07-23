const { errorMonitor } = require("events");
const sequelize = require("../../connection/conn");
const orderDetails = require("../../model/orderDetails");
const spareParts = require("../../model/spareParts");
const users = require("../../model/users");
const orderModel = require("../../model/order");
const Helper = require("../../helper/helper");
const order = require("../../model/order");
const stock = require("../../model/stock");
const payment = require("../../model/payment");

exports.productApi = async (req, res) => {

    try {
        const parts = await spareParts.findAll()
        const partsData = [];
        //console.log(parts)
        parts.map((record) => {
            const values = {
                value: record.id,
                label: record.part_number + '-' + record.part_name,
                itemPrice: record.unit_price,
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
            const order = await Promise.all(products.map(async (f) => {
                const products = {}
                products['order_id'] = creatOrder.id
                products['item_id'] = f.value
                products['item_name'] = f.label
                products['quantity'] = f.qty
                products['price'] = f.itemPrice

                const data = await orderDetails.create(products).then(async() => {
                    Helper.response("success", "Order created successfully", total_order, res, 200)
                    const purchase_order= await payment.create({
                        order_id:creatOrder.id,
                    })
                }).catch((err) => {
                    console.log(err)
                })
                return data
            }))
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
        if (user.user_type == 'S') {
            var order = await orderModel.findAll()
        } else {
            var order = await orderModel.findAll({ where: { aasra_id: user.ref_id } })
        }

        Helper.response("success", "Order list", order, res, 200)
    } catch (error) {
        Helper.response("error", "Something went wrong", error, res, 200)
    }
}

exports.updateOrder = async (req, res) => {
    try {

        const token = req.headers['authorization'];
        const string = token.split(" ");
        const user = await users.findOne({ where: { token: string[1] } });

        const order = await orderModel.update(
            { due_amount: req.body.grand_total - req.body.paid_amount },
            { where: { aasra_id: user.ref_id, order_id: req.body.order_id } }
        );

        // if(order){
        //     const orderDetail= await orderModel.findOne({where:{aasra_id:user.ref_id,order_id:req.body.order_id}})

        // }
        Helper.response("success", "Order updated", order, res, 200)
    } catch (error) {
        console.log(error)
        Helper.response("error", "Something went wrong", error, res, 200)
    }
}

exports.orderDetails = async (req, res) => {
    try {
        const { order_id } = req.body
        const itemPerOrder = await orderDetails.findAll({ where: { order_id: order_id } })
        Helper.response("success", "Order details", itemPerOrder, res, 200)
    } catch (error) {
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
                    aasra_id: payment_status.aasra_id
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

        const stockList = await stock.findAll({ where: { aasra_id: user.ref_id } })
        Helper.response("success", "Stock List", stockList, res, 200)
    } catch (error) {
        console.log(error)
        Helper.response("failed", "Something went wrong", error, res, 200)
    }
}

exports.generatePurchaseOrder= async(req,res)=>{
    try {
        const {order_id}= req.body
        const purchase_order= await payment.create({
            order_id:order_id,
            purchase_order:true,
            
        })
        Helper.response("success", "Purchase Order Generated", purchase_order, res, 200)
    } catch (error) {
        Helper.response("failed", "Something went wrong", error, res, 200)
    }
}

exports.purchaseOrderStatus= async(req,res)=>{
    try {
        const {order_id} = req.body
        const purchase_order= await payment.findOne({where:{order_id:order_id}})
        if(purchase_order.purchase_order==false){
            Helper.response("failed", "Purchase Order Not Generated", purchase_order, res, 200)
        }
        else{
            Helper.response("success", "Purchase Order Generated", purchase_order, res, 200)
        }
    } catch (error) {
        Helper.response("failed", "Something went wrong", error, res, 200)
    }
}

exports.transactionList = async(req,res)=>{
    try {
        const token = req.headers['authorization'];
        const string = token.split(" ");
        const user = await users.findOne({ where: { token: string[1] } });
        const transactionList = await orderModel.findAll({where:{aasra_id:user.ref_id,payment_status:'paid'}})
        Helper.response("success", "Transaction List", transactionList, res, 200)
    } catch (error) {
        console.log(error)
        Helper.response("error", "Something went wrong", error, res, 200)
    }
}