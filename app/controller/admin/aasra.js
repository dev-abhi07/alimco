const formidable = require("formidable");
const sequelize = require("../../connection/conn");
const Helper = require("../../helper/helper");
const aasra = require("../../model/aasra");
const users = require("../../model/users");
const generate_pass = require("generate-password");
const fs = require('fs');
const path = require('path');
const document = require("../../model/documents");
const { default: test } = require("node:test");
const city = require("../../model/city");
const states = require("../../model/state");
const { where, Op, or, fn, col } = require("sequelize");
const spareParts = require("../../model/spareParts");
const labour_charges = require('../../model/labour_charges');
const aasraType = require("../../model/aasratype");
const orderDetails = require("../../model/orderDetails");
const order = require("../../model/order");
const stock = require("../../model/stock");


const XLSX = require('xlsx');
const ticket = require("../../model/ticket");
const transaction = require("../../model/transaction");
const payment = require("../../model/payment");
const partSerialNo = require("../../model/partSerialNo");
exports.registerAasraCentre = async (req, res) => {
    try {
        const form = new formidable.IncomingForm();
        // const unique_code = `AC_${await Helper.generateNumber(10000, 99999)}`;
        const rootUploadDir = 'documents/';
        form.parse(req, async function (err, fields, files) {
            if (!files.photoImg || !files.panImg || !files.adhaarImg || !files.areaImgs || !files.marketImg || !files.salesImg || !files.regImg || !files.signatureImg) {
                return Helper.response("failed", "Upload all images", null, res, 200);
            }
            if (err) {
                Helper.response("failed", "Error parsing the form", err, res, 200);
                return;
            }

            const transformedFields = {};
            const transformedFieldsFile = {};

            for (let key in fields) {
                transformedFields[key] = fields[key][0];
            }


            const emailValidate = await users.count({
                where: {
                    email: transformedFields.email
                }
            });

            const mobileValidate = await users.count({
                where: {
                    mobile: transformedFields.mobile_no
                }
            });

            if (mobileValidate > 0 || emailValidate > 0) {

                return Helper.response("failed", emailValidate > 0 ? 'Email already exists' : 'Mobile already exists', {}, res, 200);
            }


            try {



                const createAasra = await aasra.create({
                    ...transformedFields
                });

                if (createAasra) {
                    const password = generate_pass.generate({
                        length: 8,
                        numbers: true,
                        uppercase: true,
                        lowercase: true,
                    });

                    try {
                        const createUser = await users.create({
                            name: createAasra.name,
                            ref_id: createAasra.id,
                            user_type: 'AC',
                            email: createAasra.email,
                            password: Helper.encryptPassword(password),
                            pass_code: password,
                            mobile: createAasra.mobile_no,
                            status: 1,
                        });

                        const imageFields = {
                            photoImg: 'user_images',
                            panImg: 'pan_images',
                            adhaarImg: 'adhaar_images',
                            areaImgs: 'area_images',
                            marketImg: 'market_images',
                            salesImg: 'sales_images',
                            signatureImg: 'sign_images',
                            regImg: 'reg_images'
                        };
                        //move file according to foldesr
                        const moveFile = async (file, folder, field) => {
                            const folderPath = path.join(rootUploadDir, folder);
                            if (!fs.existsSync(folderPath)) {
                                fs.mkdirSync(folderPath, { recursive: true });
                            }

                            const fileName = `${unique_code}_${file.originalFilename}`;
                            const filePath = path.join(folderPath, fileName);

                            try {
                                await fs.promises.rename(file.filepath, filePath);
                                transformedFieldsFile[field] = path.join(folder, fileName);
                                console.log(`File moved to ${filePath}`);
                            } catch (err) {
                                console.error(`Error moving the file (${file.originalFilename}):`, err);
                            }
                        };

                        for (const [field, folder] of Object.entries(imageFields)) {
                            if (files[field] && files[field][0]) {
                                await moveFile(files[field][0], folder, field);
                            } else {
                                console.error(`No file found for field '${field}'.`);
                            }
                        }

                        const documentData = await document.create({
                            ...transformedFieldsFile,
                            aasra_id: createAasra.id
                        }).then(() => {
                            Helper.response("success", "User registered successfully", createUser, res, 200);
                        })

                    } catch (error) {
                        console.log(error)
                        Helper.response("failed", "Unable to register user", error, res, 200);
                    }
                }
            } catch (err) {
                console.log(err)
                Helper.response("failed", "Unable to register", err, res, 200);
            }
        });
    } catch (error) {
        console.log(error);
        Helper.response("failed", "Server error", error, res, 500);
    }
};

exports.aasraList = async (req, res) => {
    try {
        const data = await aasra.findAll({
            include: [{
                model: document,
                as: 'document'
            }, {
                model: states,
                as: 'stateData',
                attributes: ['name', 'id'],

            }, {
                model: city,
                as: 'city',
                attributes: ['city', 'id'],
            }
            ]
        });
        if (data) {
            Helper.response("success", "Aasra list", { data }, res, 200);
        }
        else {
            Helper.response("failed", "Unable to fetch list", [], res, 200);
        }


    } catch (error) {
        console.log(error)
        Helper.response("failed", "Server error", error, res, 200);
    }
}

exports.updateAasraCenter = async (req, res) => {
    try {
        const form = new formidable.IncomingForm();
        // const unique_code = `AC_${await Helper.generateNumber(10000, 99999)}`;
        const rootUploadDir = 'documents/';
        form.parse(req, async function (err, fields, files) {

            if (Object.keys(files).length !== 0) {

                if (err) {
                    Helper.response("failed", "Error parsing the form", err, res, 200);
                    return;
                }

                const transformedFields = {};
                const transformedFieldsFile = {};

                for (let key in fields) {
                    transformedFields[key] = fields[key][0];
                }

                try {

                    const createAasra = await aasra.update(transformedFields, { where: { id: transformedFields.id } });


                    if (createAasra) {

                        try {
                            const imageFields = {
                                photoImg: 'user_images',
                                panImg: 'pan_images',
                                adhaarImg: 'adhaar_images',
                                areaImgs: 'area_images',
                                marketImg: 'market_images',
                                salesImg: 'sales_images',
                                signatureImg: 'sign_images',
                                regImg: 'reg_images'
                            };
                            //move file according to foldesr
                            const moveFile = async (file, folder, field) => {
                                const folderPath = path.join(rootUploadDir, folder);
                                if (!fs.existsSync(folderPath)) {
                                    fs.mkdirSync(folderPath, { recursive: true });
                                }

                                const fileName = `${unique_code}_${file.originalFilename}`;
                                const filePath = path.join(folderPath, fileName);

                                try {
                                    await fs.promises.rename(file.filepath, filePath);
                                    transformedFieldsFile[field] = path.join(folder, fileName);
                                    console.log(`File moved to ${filePath}`);
                                } catch (err) {
                                    console.error(`Error moving the file (${file.originalFilename}):`, err);
                                }
                            };

                            for (const [field, folder] of Object.entries(imageFields)) {
                                if (files[field] && files[field][0]) {
                                    await moveFile(files[field][0], folder, field);
                                } else {
                                    console.error(`No file found for field '${field}'.`);
                                }
                            }

                            const updateFields = { ...transformedFieldsFile };

                            const documentData = await document.update(
                                updateFields,
                                { where: { aasra_id: transformedFields.id } }
                            );
                            Helper.response("success", "User updated successfully", {}, res, 200);

                        } catch (error) {
                            console.log(error)
                            Helper.response("failed", "Unable to register user", error, res, 200);
                        }
                    }

                } catch (err) {
                    console.log(err)
                    Helper.response("failed", "Unable to update", err, res, 200);
                }
            } else {

                const transformedFields = {};


                for (let key in fields) {
                    transformedFields[key] = fields[key][0];
                }
                const createAasra = await aasra.update(transformedFields, { where: { id: transformedFields.id } });
                Helper.response("success", "User updated successfully", {}, res, 200);
            }
        });
    } catch (error) {
        Helper.response("failed", "Unable to update", err, res, 200);
    }
}

exports.categoryWiseProduct = async (req, res) => {
    try {
       
        const getProduct = await spareParts.findAll({
            where: {
                category: req.body.category_id
            }
        })
        const productData = [];
        getProduct.map((record) => {
            const data = {
                value: record.id,
                label: record.part_number + '-' + record.part_name,
                productPrice: parseFloat(record.unit_price),
                id: record.id
            }

            productData.push(data)
        })
        //console.log(productData)
        Helper.response("success", "Product Found Successfully!", { productData }, res, 200);
    } catch (error) {
        console.log(error)
        Helper.response("success", "Product Found Successfully!", { productData }, res, 200);
    }
}


exports.categoryRtoWiseProduct = async (req, res) => {
    try {
        const token = req.headers['authorization'];
        const string = token.split(" ");
        const user = await users.findOne({ where: { token: string[1] } });
        const aasras = await aasra.findOne({ where: { id: user.ref_id } })
        const gstno = aasras?.gst
        const getProduct = await spareParts.findAll({
            where: {
                category: req.body.category_id,
                type:"rtu"
            }
        })
        const productData = [];
        getProduct.map((record) => {
            const data = {
                value: record.id,
                label: record.part_number + '-' + record.part_name,
                productPrice: parseFloat(record.unit_price),
                basePrice:record.base_price,
                id: record.id
            }

            productData.push(data)
        })
        //console.log(productData)
        Helper.response("success", "Product Found Successfully!", { productData ,gstno}, res, 200);
    } catch (error) {
        console.log(error)
        Helper.response("success", "Product Found Successfully!", { productData }, res, 200);
    }
}



exports.productRepairList = async (req, res) => {
    try {
        const token = req.headers['authorization'];
        const string = token.split(" ");
        const user = await users.findOne({ where: { token: string[1] } });
        const aasras = await aasra.findOne({ where: { id: user.ref_id } })
        const { repair_id } = req.body

        let data = [];
        const product = await labour_charges.findAll()
        if (req.body.warranty == true) {
            if (aasras == null) {

                data = product.map((f) => {
                    const productData = {
                        value: f.id,
                        label: f.natureOfWork,
                        repairServiceCharge: 0,
                        repairTime: f.repairTime,
                        finalLabourCharges: f.finalLabourCharges,
                        repairPrice: 45,
                        repairGst: 0.18
                    }
                    return productData
                })
            }
            else if (aasras != null && aasras.aasra_type == 'RMC' || aasras.aasra_type == 'PMDK' || aasras.aasra_type == 'HQ' || aasras.aasra_type == 'AAPC') {
                data = product.map((f) => {
                    const productData = {
                        value: f.id,
                        label: f.natureOfWork,
                        repairServiceCharge: 0,
                        repairTime: f.repairTime,
                        repairPrice: 0,
                        repairGst: 0
                    }
                    return productData
                })
            } else {
                data = product.map((f) => {
                    const productData = {
                        value: f.id,
                        label: f.natureOfWork,
                        repairServiceCharge: 0,
                        repairTime: f.repairTime,
                        finalLabourCharges: f.finalLabourCharges,
                        repairPrice: 45,
                        repairGst: 0.18
                    }
                    return productData
                })
            }
        } else {
            if (aasras == null) {

                data = product.map((f) => {
                    const productData = {
                        value: f.id,
                        label: f.natureOfWork,
                        repairServiceCharge: f.finalLabourCharges,
                        repairTime: f.repairTime,
                        finalLabourCharges: f.finalLabourCharges,
                        repairPrice: 45,
                        repairGst: 0.18
                    }
                    return productData
                })
            }
            else if (aasras != null && aasras.aasra_type == 'RMC' || aasras.aasra_type == 'PMDK' || aasras.aasra_type == 'HQ' || aasras.aasra_type == 'AAPC') {
                data = product.map((f) => {
                    const productData = {
                        value: f.id,
                        label: f.natureOfWork,
                        repairServiceCharge: 0,
                        repairTime: f.repairTime,
                        repairPrice: 0,
                        repairGst: 0
                    }
                    return productData
                })
            } else {
                data = product.map((f) => {
                    const productData = {
                        value: f.id,
                        label: f.natureOfWork,
                        repairServiceCharge: f.finalLabourCharges,
                        repairTime: f.repairTime,
                        finalLabourCharges: f.finalLabourCharges,
                        repairPrice: 45,
                        repairGst: 0.18
                    }
                    return productData
                })
            }
        }


        Helper.response("success", "Product Found Successfully!", data, res, 200);

    } catch (error) {
        console.log(error, 'eror')
        Helper.response("failed", "Server error", error, res, 200);
    }
}

exports.AarsaDropDown = async (req, res) => {
    try {
        const aasras = await aasra.findAll()
        const dataset = []

        aasras.map((record) => {
            const values = {
                value: record.id,
                label: record.name_of_org
            }
            dataset.push(values)
        })
        Helper.response("success", "", dataset, res, 200);

    } catch (error) {
        Helper.response("failed", "Server error", error, res, 200);
    }
}

exports.aasraType = async (req, res) => {
    try {

        const aasratypeName = [
            { value: 'AAPC', label: 'AAPC' },
            { value: 'RMC', label: 'RMC' },
            { value: 'PMDK', label: 'PMDK' },
            { value: 'HQ', label: 'HQ' },
            { value: 'aasra', label: 'Aasra' }
        ];


        const data = [];
        aasratypeName.map((record) => {
            const value = {
                value: record.value,
                label: record.label
            };
            data.push(value);
        });

        Helper.response(
            "success",
            "Record Fetched Successfully",
            { data },
            res,
            200
        );
    } catch (error) {
        Helper.response(
            "failed",
            "Something went wrong!",
            { error },
            res,
            500
        );
    }
};
exports.aasraTypecreate = async (req, res) => {
    console.log(req.body)

    try {

        const checkName = aasraType.f
        const data = {
            type: req.body.type,
            centre_name: req.body.centre_name,
            state_id: req.body.state_id,
            city_id: req.body.city_id,
            address: req.body.address,
            contact_details: req.body.contact_details,
            contact_person: req.body.contact_person,
            email_id: req.body.email_id
        }

        const create = aasraType.create(data);
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
            { error },
            res,
            200
        );
    }

}


exports.aasraTypelist = async (req, res) => {

    try {
        const aasralist = await aasraType.findAll();
        const data = [];

        for (const record of aasralist) {
            const stateName = await states.findByPk(record.state_id);
            const cityName = await city.findOne({
                where: {
                    id: record.city_id,
                    state_id: record.state_id
                }
            });

            const value = {
                id: record.id,
                type: record.type,
                centre_name: record.centre_name,
                state_id: record.state_id,
                city_id: record.city_id,
                state_label: stateName ? stateName.name : null,
                city_label: cityName ? cityName.city : null,
                address: record.address,
                contact_details: record.contact_details,
                contact_person: record.contact_person,
                email_id: record.email_id
            };
            data.push(value);
        }

        Helper.response(
            "success",
            "Record Fetched Successfully",
            { data },
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


exports.aasraTypeupdate = async (req, res) => {
    try {
        const update = await aasraType.update({
            type: req.body.type,
            centre_name: req.body.centre_name,
            state_id: req.body.state_id,
            city_id: req.body.city_id,
            address: req.body.address,
            contact_details: req.body.contact_details,
            contact_person: req.body.contact_person,
            email_id: req.body.email_id
        }, {
            where: {
                id: req.body.id,
            }
        })
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

exports.stocktransferupdate = async (req, res) => {
    try {

        const orderId = await order.findOne({
            where: {
                id: req.body.order_id
            }
        })
        if (!orderId) {
            return Helper.response(
                "failed",
                "Record Not Found!",
                {},
                res,
                200
            );
        }

        const orderDetailsId = await orderDetails.findAll({
            where: {
                order_id: orderId.id
            }
        })
        if (!orderDetailsId) {
            return Helper.response(
                "failed",
                "Record Not Found!",
                {},
                res,
                200
            );
        }

        if (orderDetailsId) {
            orderDetailsId.map(async (t) => {
                await stock.create({
                    item_id: t.item_id,
                    quantity: t.quantity,
                    price: t.price,
                    item_name: t.item_name,
                    quantity: t.quantity,
                    aasra_id: orderId.aasra_id,
                    stock_in: t.quantity
                });
            })
        }

        if (orderDetailsId) {
            await order.update({
                order_status: req.body.status
            }, {
                where: {
                    id: req.body.order_id
                }
            });
        }


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


exports.uniqueOrderId = async (req, res) => {
    try {

        const ticketid = req.body.ticket_id;
        const orderid = req.body.order_id;
        if (ticketid != null) {
            const ticketOrder = await ticket.findOne({
                where: {
                    ticket_id: ticketid
                }
            });
            if (ticketOrder) {
                const randomCode = Math.floor(100000 + Math.random() * 900000);

                const unique_id = `order_${ticketOrder.ticket_id}-${Helper.getFullYearForUnique(ticketOrder.createdAt)}-${randomCode}`;
                const randomAlphaNumeric = Math.random().toString(36).substring(2, 10).toUpperCase();
                const order_unique = `order_${randomAlphaNumeric}`;
                Helper.response(
                    "success",
                    "Record Fetched Successfully",
                    { unique_id, order_unique },
                    res,
                    200
                );
            } else {
                console.log('Ticket not found');
                Helper.response(
                    "failed",
                    "Ticket not found",
                    {},
                    res,
                    200
                );
            }
        }

        if (orderid != null) {
            const orderData = await order.findOne({
                where: {
                    id: orderid
                }
            });

            const amount = orderData.grand_total;
            const receipt_no = orderData.id;

            const payres = await Helper.createRazorpayOrder(amount, receipt_no)



            if (payres.success) {
                const razorpayResponse = payres.data;
                console.log(payres.data)

                const existingTransaction = await transaction.findOne({
                    where: {
                        order_id: razorpayResponse.receipt,
                        status: 'created'
                    }
                });

                if (existingTransaction) {
                    await transaction.destroy({
                        where: {
                            order_id: razorpayResponse.receipt,
                            status: 'created'
                        }
                    });
                }

                const transactions = await transaction.create({
                    order_id: razorpayResponse.receipt,
                    amount: razorpayResponse.amount,
                    order: razorpayResponse.id,
                    receipt: razorpayResponse.receipt,
                    status: razorpayResponse.status,
                    time: razorpayResponse.created_at,
                });

                console.log('Transaction saved:', transactions);
                const orderss = await order.findOne({
                    where: { id: orderData.id }
                });
                const aasradata = await Helper.getAasraDetails(orderss.aasra_id)

                const data = {
                    order_id: transactions.order,
                    amount: transactions.amount,
                    email: aasradata.email,
                    contact: aasradata.mobile_no,
                    receipt: transactions.receipt,
                }

                Helper.response(
                    "success",
                    "Order created and transaction saved successfully",
                    data,
                    res,
                    200
                );
            } else {
                Helper.response("failed", "Failed to create Razorpay order", payres.error, res, 200);
            }


        }


    } catch (error) {
        console.log(error)
        Helper.response(
            "failed",
            "something went wrong",
            {},
            res,
            200
        );
    }

}

exports.orderSucess = async (req, res) => {
    try {
    
    
        const formData = req.body;
       

        console.log("Received Data:", formData);


        const { razorpay_payment_id, razorpay_order_id, razorpay_signature, error_code, error_description, error } = formData;

        const date = new Date();
        const year = `${date.getFullYear()}`
        const invoice_number = (date.getFullYear() + '-' + `${parseInt((year)?.split('0')[1]) + 1}`) + '/' + await Helper.generateNumber(10000000, 99999999)

        if (error) {

            const metadata = JSON.parse(error.metadata);
            const razorpay_order = metadata.order_id;
            const razorpay_payment = metadata.payment_id;
            const error_getway = error.code;
            const error_description = error.description;
            await transaction.update({
                status: 'failed',
                razorpay_signature: null,
                razorpay_payment_id: razorpay_payment,
                description: error_description,
            }, {
                where: {
                    order: razorpay_order
                }
            });

            res.redirect(
                `http://alimco.demoquaeretech.in/order-failed?error_code=${error_getway}&error_description=${error_description}`
            );
        } else {

            const transactionData = await transaction.findOne({
                where: {
                    order: razorpay_order_id
                }
            });
            const time = await Helper.convertIso(transactionData.time)
            const orderDataDetails = await order.findOne({
                where: {
                    id: transactionData.order_id
                }
            })
            const transactionDataDetails = await transaction.findOne({
                where: {
                    order: razorpay_order_id
                }
            })

            if (orderDataDetails) {
                const paidAmount = transactionDataDetails.amount / 100;
                const dueAmount = orderDataDetails.grand_total - paidAmount;

                await order.update({
                    payment_status: 'Paid',
                    payment_method: 'online',
                    transaction_id: razorpay_payment_id,
                    paid_amount: paidAmount,
                    due_amount: dueAmount,
                    payment_date: time
                }, {
                    where: {
                        id: transactionData.order_id
                    }
                });
            }

            await payment.update({
                invoice: 1,
                invoice_number: invoice_number
            },
                {
                    where: { order_id: transactionData.order_id }
                })

            await transaction.update({
                status: 'success',
                razorpay_signature: razorpay_signature,
                razorpay_payment_id: razorpay_payment_id
            }, {
                where: {
                    order: razorpay_order_id
                }
            });


            res.redirect(
                `http://alimco.demoquaeretech.in/order-success?razorpay_payment_id=${razorpay_payment_id}&razorpay_order_id=${razorpay_order_id}&razorpay_signature=${razorpay_signature}`
            );
        }

    } catch (error) {
        console.log(error)
        Helper.response(
            "failed",
            "something went wrong",
            {},
            res,
            200
        );
    }

}

exports.orderSucess1 = async (req, res) => {
    try {
    
    
        const formData = req.body;
       

        console.log("Received Data:", formData);


        const { razorpay_payment_id, razorpay_order_id, razorpay_signature, error_code, error_description, error } = formData;

        const date = new Date();
        const year = `${date.getFullYear()}`
        const invoice_number = (date.getFullYear() + '-' + `${parseInt((year)?.split('0')[1]) + 1}`) + '/' + await Helper.generateNumber(10000000, 99999999)

        if (error) {

            const metadata = JSON.parse(error.metadata);
            const razorpay_order = metadata.order_id;
            const razorpay_payment = metadata.payment_id;
            const error_getway = error.code;
            const error_description = error.description;
            await transaction.update({
                status: 'failed',
                razorpay_signature: null,
                razorpay_payment_id: razorpay_payment,
                description: error_description,
            }, {
                where: {
                    order: razorpay_order
                }
            });

            res.redirect(
                `http://192.168.23.177:3000/order-failed?error_code=${error_getway}&error_description=${error_description}`
            );
        } else {

            const transactionData = await transaction.findOne({
                where: {
                    order: razorpay_order_id
                }
            });
            const time = await Helper.convertIso(transactionData.time)
            const orderDataDetails = await order.findOne({
                where: {
                    id: transactionData.order_id
                }
            })
            const transactionDataDetails = await transaction.findOne({
                where: {
                    order: razorpay_order_id
                }
            })

            if (orderDataDetails) {
                const paidAmount = transactionDataDetails.amount / 100;
                const dueAmount = orderDataDetails.grand_total - paidAmount;

                await order.update({
                    payment_status: 'Paid',
                    payment_method: 'online',
                    transaction_id: razorpay_payment_id,
                    paid_amount: paidAmount,
                    due_amount: dueAmount,
                    payment_date: time
                }, {
                    where: {
                        id: transactionData.order_id
                    }
                });
            }

            await payment.update({
                invoice: 1,
                invoice_number: invoice_number
            },
                {
                    where: { order_id: transactionData.order_id }
                })

            await transaction.update({
                status: 'success',
                razorpay_signature: razorpay_signature,
                razorpay_payment_id: razorpay_payment_id
            }, {
                where: {
                    order: razorpay_order_id
                }
            });


            res.redirect(
                `http://192.168.23.177:3000/order-success?razorpay_payment_id=${razorpay_payment_id}&razorpay_order_id=${razorpay_order_id}&razorpay_signature=${razorpay_signature}`
            );
        }

    } catch (error) {
        console.log(error)
        Helper.response(
            "failed",
            "something went wrong",
            {},
            res,
            200
        );
    }

}

exports.orderSucess2 = async (req, res) => {
    try {
    
    
        const formData = req.body;  
       

        console.log("Received Data1:", formData);


        const { razorpay_payment_id, razorpay_order_id, razorpay_signature, error_code, error_description, error } = formData;

        const date = new Date();
        const year = `${date.getFullYear()}`
        const invoice_number = (date.getFullYear() + '-' + `${parseInt((year)?.split('0')[1]) + 1}`) + '/' + await Helper.generateNumber(10000000, 99999999)

        if (error) {

            const metadata = error?.metadata && JSON?.parse(error?.metadata);
            const razorpay_order = metadata?.order_id;
            const razorpay_payment = metadata?.payment_id;
            const error_getway = error?.code;
            const error_description = error?.description;
            await transaction.update({
                status: 'failed',
                razorpay_signature: null,
                razorpay_payment_id: razorpay_payment||"",
                description: error_description||"",
            }, {
                where: {
                    order: razorpay_order||""
                }
            });

            res.redirect(
                `http://192.168.23.44:3000/order-failed?error_code=${error_getway||error}&error_description=${error_description||""}`
            );
        } else {

            const transactionData = await transaction.findOne({
                where: {
                    order: razorpay_order_id
                }
            });
            const time = await Helper.convertIso(transactionData.time)
            const orderDataDetails = await order.findOne({
                where: {
                    id: transactionData.order_id
                }
            })
            const transactionDataDetails = await transaction.findOne({
                where: {
                    order: razorpay_order_id
                }
            })

            if (orderDataDetails) {
                const paidAmount = transactionDataDetails.amount / 100;
                const dueAmount = orderDataDetails.grand_total - paidAmount;

                await order.update({
                    payment_status: 'Paid',
                    payment_method: 'online',
                    transaction_id: razorpay_payment_id,
                    paid_amount: paidAmount,
                    due_amount: dueAmount,
                    payment_date: time
                }, {
                    where: {
                        id: transactionData.order_id
                    }
                });
            }

            await payment.update({
                invoice: 1,
                invoice_number: invoice_number
            },
                {
                    where: { order_id: transactionData.order_id }
                })

            await transaction.update({
                status: 'success',
                razorpay_signature: razorpay_signature,
                razorpay_payment_id: razorpay_payment_id
            }, {
                where: {
                    order: razorpay_order_id
                }
            });


            res.redirect(
                `http://192.168.23.44:3000/order-success?razorpay_payment_id=${razorpay_payment_id}&razorpay_order_id=${razorpay_order_id}&razorpay_signature=${razorpay_signature}`
            );
        }

    } catch (error) {
        console.log(error)
        Helper.response(
            "failed",
            "something went wrong",
            {},
            res,
            200
        );
    }

}

exports.orderSucess3 = async (req, res) => {
    try {
    
    
        const formData = req.body;
       

        console.log("Received Data:", formData);


        const { razorpay_payment_id, razorpay_order_id, razorpay_signature, error_code, error_description, error } = formData;

        const date = new Date();
        const year = `${date.getFullYear()}`
        const invoice_number = (date.getFullYear() + '-' + `${parseInt((year)?.split('0')[1]) + 1}`) + '/' + await Helper.generateNumber(10000000, 99999999)

        if (error) {

            const metadata = JSON.parse(error.metadata);
            const razorpay_order = metadata.order_id;
            const razorpay_payment = metadata.payment_id;
            const error_getway = error.code;
            const error_description = error.description;
            await transaction.update({
                status: 'failed',
                razorpay_signature: null,
                razorpay_payment_id: razorpay_payment,
                description: error_description,
            }, {
                where: {
                    order: razorpay_order
                }
            });

            res.redirect(
                `http://192.168.23.12:3000/order-failed?error_code=${error_getway}&error_description=${error_description}`
            );
        } else {

            const transactionData = await transaction.findOne({
                where: {
                    order: razorpay_order_id
                }
            });
            const time = await Helper.convertIso(transactionData.time)
            const orderDataDetails = await order.findOne({
                where: {
                    id: transactionData.order_id
                }
            })
            const transactionDataDetails = await transaction.findOne({
                where: {
                    order: razorpay_order_id
                }
            })

            if (orderDataDetails) {
                const paidAmount = transactionDataDetails.amount / 100;
                const dueAmount = orderDataDetails.grand_total - paidAmount;

                await order.update({
                    payment_status: 'Paid',
                    payment_method: 'online',
                    transaction_id: razorpay_payment_id,
                    paid_amount: paidAmount,
                    due_amount: dueAmount,
                    payment_date: time
                }, {
                    where: {
                        id: transactionData.order_id
                    }
                });
            }

            await payment.update({
                invoice: 1,
                invoice_number: invoice_number
            },
                {
                    where: { order_id: transactionData.order_id }
                })

            await transaction.update({
                status: 'success',
                razorpay_signature: razorpay_signature,
                razorpay_payment_id: razorpay_payment_id
            }, {
                where: {
                    order: razorpay_order_id
                }
            });


            res.redirect(
                `http://192.168.23.12:3000/order-success?razorpay_payment_id=${razorpay_payment_id}&razorpay_order_id=${razorpay_order_id}&razorpay_signature=${razorpay_signature}`
            );
        }

    } catch (error) {
        console.log(error)
        Helper.response(
            "failed",
            "something went wrong",
            {},
            res,
            200
        );
    }

}




exports.importpartSerial = async (req, res) => {
    try {
   
       
        const filePath = req.file.path;

  
        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
        
        for (const row of sheetData) {
            const createpart = await partSerialNo.create({
                moterTriSerialNo: row.moterTriSerialNo,
                hubDriveMoter: row.hubDriveMoter,
                batteryOne: row.batteryOne,
                batterytwo: row.batterytwo,
                charger: row.charger,
                controller: row.controller,
            });
        }


        fs.unlinkSync(filePath);

        Helper.response(
            "success",
            "file data insert Successfully",
            {},
            res,
            200
        );
    } catch (error) {
        console.error('Error importing users:', error);
        Helper.response(
            "failed",
            "something went wrong",
            {},
            res,
            200
        );
    }
};

exports.listpartSerialno = async (req, res) => {

    try {

        const token = req.headers["authorization"];
        const string = token.split(" ");
        const user = await users.findOne({ where: { token: string[1] } });
        const ticketData = [];
    
    
        const start = await Helper.getMonth(req.body.startDate);
        const end = await Helper.getMonth(req.body.endDate);
        const startDatesplit = await Helper.formatDate(new Date(req.body.startDate));
        const splitDate = await Helper.formatDate(new Date(req.body.endDate));
        const startDate = startDatesplit.split(" ")[0] + " " + "00:00:00";
        const endDate = splitDate.split(" ")[0] + " " + "23:59:59";
    
        if (user.user_type == 'S' || user.user_type == 'A') {
            if(req.body.moterTriSerialNo != null){
                var tickets = await partSerialNo.findAll({
                    where: {
                      moterTriSerialNo: req.body.moterTriSerialNo,
                      createdAt: {
                        [Op.between]: [startDate, endDate]
                      },
                    },
                    order: [
                      ['id', 'DESC']
                    ]
                  })
            }else{
                var tickets = await partSerialNo.findAll()
            }
          
    
            if (tickets.length === 0) {
              Helper.response(
                "failed",
                "Record Not Found!",
                {},
                res,
                200
              );
              return;
            }
    
            await Promise.all(
              tickets.map(async (record) => {
    
                const dataValue = {
                    id:record.id,
                    moterTriSerialNo: record.moterTriSerialNo,
                    hubDriveMoter:record.hubDriveMoter,
                    batteryOne: record.batteryOne,
                    batterytwo:record.batterytwo,
                    charger: record.charger,
                    controller: record.controller,
                }
                ticketData.push(dataValue)
              })
            )
    
        
          }
    
        
        Helper.response(
          "success",
          "Record Found Successfully!",
          {
            partSerialNo: ticketData,
          },
          res,
          200
        );
      } catch (error) {
         console.log(error,'drsdf')
         
        Helper.response(
          "failed",
          "Something went wrong!",
          { error },
          res,
          200
        );
      }

}