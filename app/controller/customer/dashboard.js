const sequelize = require("../../connection/conn");
const Helper = require("../../helper/helper");
const aasra = require("../../model/aasra");
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
        const slots = await Helper.createTimeSlots('09:00','18:00','13:00','14:00','40')
        Helper.response(
            "success",
            "",
            {
                itemData:userItem,
                aasraData:aasraData,
                slots:slots
            },
            res,
            200
        );
        
    } catch (error) {
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
