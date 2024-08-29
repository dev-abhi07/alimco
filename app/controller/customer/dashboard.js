const sequelize = require("../../connection/conn");
const Helper = require("../../helper/helper");
const aasra = require("../../model/aasra");
const aasraType = require("../../model/aasratype");
const problem = require("../../model/problem");
const stock = require("../../model/stock");
const users = require("../../model/users");

exports.dashboard = async (req ,res) => {
    try {
        const userItem = [];
        res.data.res.map(async(record) => {
            const dataItem = {
                itemName:record.itemName,
                itemId:record.itemId,
                expiryDate:await Helper.addYear(record.dstDate)
            }            
            
            userItem.push(dataItem)
        })
        // console.log(userItem)
        const aasraa = await aasra.findAll({
            where:{
                state:req.body.state_id,
                district:req.body.city_id
            }
        })


        const problemDetails = await problem.findAll();
        problemDetail = [];
        await Promise.all(
            problemDetails.map( async (record) => {
                
                const values = {
                    id:record?.id,
                    problem_name:record?.problem_name,
                     }
                
                problemDetail.push(values)
            })
        )

        aasraData = [];
        await Promise.all(
            aasraa.map( async (record) => {
                const user = await users.findOne({
                    where:{
                        ref_id : record?.id,
                        user_type:'AC'
                    }
                })  
                const values = {
                    centerName:record?.name_of_org,
                    address:record?.address,
                    pinCode:record?.pincode ? record?.pincode : '',
                    id:user.ref_id,
                    centerImage:record?.center_image ? process.env.BASE_URL : 'https://media.istockphoto.com/id/1147544807/vector/thumbnail-image-vector-graphic.jpg?s=612x612&w=0&k=20&c=rnCKVbdxqkjlcs3xH87-9gocETqpspHFXu5dIGB4wuM='
                }
                
                aasraData.push(values)
            })
        )

        aasraCenter = [] ;
        const aasraaCentresDate = await aasraType.findAll({
                    where:{
                        state_id:req.body.state_id,
                        city_id:req.body.city_id
                    }
            })

            await Promise.all(
                 aasraaCentresDate.map( async (record) => {
                    const user = await users.findOne({
                        where:{
                            ref_id : record?.id,
                            user_type:'AC'
                        }
                    })  
                    const values = {
                        type:record?.type,
                        address:record?.address,
                        center_name:record?.centre_name ,
                        id:user?.ref_id,
                        contact_details: record?.contact_details,
                        contact_person : record?.contact_person,                        
                    }
                    
                    aasraCenter.push(values)
                })
            )

        productData = [] ;
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
                        stockIn:stock.stock_in,
                        price: stock.price,
                        gstAmount: gstAmount,
                        totalPriceIncludingGST: totalPriceIncludingGST,
                        centerImage: record?.center_image ? process.env.BASE_URL : 'https://media.istockphoto.com/id/1147544807/vector/thumbnail-image-vector-graphic.jpg?s=612x612&w=0&k=20&c=rnCKVbdxqkjlcs3xH87-9gocETqpspHFXu5dIGB4wuM='
                    };
        
                    productData.push(values);
                });
            })
        );
        const slots = await Helper.createTimeSlots('09:00','18:00','13:00','14:00','40')
        Helper.response(
            "success",
            "",
            {
                itemData:userItem,
                aasraData:aasraData,
                slots:slots,
                productData:productData,
                problemDetail:problemDetail,
                aasraCenter:aasraCenter
            },
            res,
            200
        );
        
    } catch (error) {
        console.log(error)
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