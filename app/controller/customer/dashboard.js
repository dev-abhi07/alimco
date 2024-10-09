const sequelize = require("../../connection/conn");
const Helper = require("../../helper/helper");
const aasra = require("../../model/aasra");
const aasraType = require("../../model/aasratype");
const problem = require("../../model/problem");
const stock = require("../../model/stock");
const users = require("../../model/users");
const { where, Op, or, fn, col } = require('sequelize')

exports.dashboard = async (req, res) => {
    try {
         
        const userItem = [];
        res.data.res.map(async (record) => {
            const dataItem = {
                itemName: record.itemName,
                itemId: record.itemId,
                expiryDate: await Helper.addYear(record.dstDate)
            }

            userItem.push(dataItem)
        })
        // console.log(userItem)

        // const aasraa = await aasra.findAll({
        //     where:{
        //         state:req.body.state_id,
        //         aasra_type:req.body.aasra_type
        //     }
        // })

        const aasraa = await aasra.findAll({
            attributes: {
                include: [
                    [
                        sequelize.literal(
                            `ROUND(6371.0 * ACOS( SIN(${req.body.latitude}*PI()/180) * SIN(lat*PI()/180) + COS(${req.body.latitude}*PI()/180) * COS(lat*PI()/180) * COS((log*PI()/180) - (${req.body.longitude}*PI()/180))), 1)`
                        ),
                        'distance'
                    ]
                ]
            },
            where: {
                state: req.body.state_id,
                // aasra_type: req.body.aasra_type
            }
        });


     

        


        const problemDetails = await problem.findAll();
        const problemDetail = [];
        await Promise.all(
            problemDetails.map(async (record) => {

                const values = {
                    id: record?.id,
                    problem_name: record?.problem_name,
                }

                problemDetail.push(values)
            })
        )

        const aasraData = [];

   
        await Promise.all(
            aasraa.map(async (record) => {
                const user = await users.findOne({
                    where: {
                        ref_id: record?.id,
                        user_type: 'AC'
                    }
                })
               
                
                const values = {
                    centerName: record?.name_of_org,
                    address: record?.address,
                    pinCode: record?.pincode ? record?.pincode : '',
                    lat: record?.lat,
                    long: record?.log,
                    id: user.ref_id,
                    distance:record.dataValues.distance,
                    centerImage: record?.center_image ? process.env.BASE_URL : 'https://media.istockphoto.com/id/1147544807/vector/thumbnail-image-vector-graphic.jpg?s=612x612&w=0&k=20&c=rnCKVbdxqkjlcs3xH87-9gocETqpspHFXu5dIGB4wuM='
                }

                aasraData.push(values)
            })
        )

      


       

        const productData = [];
        await Promise.all(
            aasraa.map(async (record) => {
                const stocks = await stock.findAll({
                    where: {
                        aasra_id: record?.id
                    }
                });

                if (!stocks) {
                    Helper.response(
                        "failed",
                        "product not found!",
                        {

                        },
                        res,
                        200
                    );
                    return;
                }

                stocks.forEach((stock) => {
                    const gstPercentage = 18;
                    const gstAmount = (stock.price * gstPercentage) / 100;
                    const totalPriceIncludingGST = stock.price + gstAmount;

                    const values = {
                        productId: stock.id,
                        productName: stock.item_name,
                        stockIn: stock.stock_in,
                        price: stock.price,
                        gstAmount: gstAmount,
                        totalPriceIncludingGST: totalPriceIncludingGST,
                        centerImage: record?.center_image ? process.env.BASE_URL : 'https://media.istockphoto.com/id/1147544807/vector/thumbnail-image-vector-graphic.jpg?s=612x612&w=0&k=20&c=rnCKVbdxqkjlcs3xH87-9gocETqpspHFXu5dIGB4wuM='
                    };

                    productData.push(values);
                });
            })
        );
        const slots = await Helper.createTimeSlots('09:00', '18:00', '13:00', '14:00', '40')
        Helper.response(
            "success",
            "",
            {
                itemData: userItem,
                aasraData: aasraData,
                slots: slots,
                productData: productData,
                problemDetail: problemDetail
            },
            res,
            200
        );

    } catch (error) {
        console.log(error);
        
        Helper.response(
            "failed",
            "Something went wrong!",
            {
                error
            },
            res,
            200
        );
    }
}



exports.aasraGroupList = async (req, res) => {
    try {
        // Fetch all aasra records with aggregation
        const aasraaCentresData = await aasra.findAll({
            where: {
                state: req.body.state_id,
                aasra_type: req.body.aasra_type
            }
        });
        if (aasraaCentresData.length === 0) {
            Helper.response(
                "failed",
                "Record Not Found!",
                {},
                res,
                200
            );
            return;
        }
        // Prepare to collect results
        const aasraCenter = [];

        // Process the data
        await Promise.all(
            aasraaCentresData.map(async (record) => {
                const values = {
                    id: record.id,
                    name_of_org: record.name_of_org,
                    address: record.address,
                    state: record.state,
                    aasra_type: record.aasra_type
                };

                aasraCenter.push(values);
            })
        );


        Helper.response(
            "success",
            "Data Retrieved Successfully",
            aasraCenter,
            res,
            200
        );

    } catch (error) {
       
        Helper.response(
            "failed",
            "Something went wrong!",
            {},
            res,
            500
        );
    }
};

exports.centrelist = async (req, res) => {
    try {

        const aasratypeName = [
            { value: 'AAPC', label: 'AAPC' },
            { value: 'RMC', label: 'RMC' },
            { value: 'PMDK', label: 'PMDK' },
            { value: 'HQ', label: 'HQ' },
            { value: 'aasra', label: 'aasra' }
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