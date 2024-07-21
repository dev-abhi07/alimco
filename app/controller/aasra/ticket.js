const Helper = require('../../helper/helper');
const users = require('../../model/users');
const ticket = require('../../model/ticket');
const aasra = require('../../model/aasra');
exports.ticketListDetails = async (req, res) => {
    try {
        const token = req.headers["authorization"];
        const string = token.split(" ");
        const user = await users.findAll({
            include: [{
                model: aasra,
                as: 'aasra',

                include: [{
                    model: ticket,
                    as: 'aasra_ticket'
                }]
            }],
            where: {
                token: string[1]
            }
        });
        if (user) {
            const customer_name = user[0]?.name
            const data = user[0]?.aasra?.aasra_ticket.map((f) => {

                const user = {
                    ticket_id: f.id,
                    customer_name: customer_name,
                    status: f.status,
                    description: f.description,
                    product_name: f.product_name,
                    appointment_date: Helper.formatDateTime(f.createdAt),
                    percentage: (f.status == 'Done') ? 100 : (f.status == 'Pending') ? 10 : (f.status == 'Open') ? 50 : 0
                }
                return user
            })
            Helper.response("Success", "Record found Successfully", data, res, 200)
        }
    } catch (error) {
        console.log(error)
        Helper.response("Failed", "No Record found ", {}, res, 200)
    }
}   


exports.ticketList = async (req, res) => {
    try {
        const token = req.headers["authorization"];
        const string = token.split(" ");
        var tickets = await ticket.findAll({
            where: {
                aasraId: user.ref_id
            }
        })
        console.log(tickets)
        const ticketData = [];
        await Promise.all(
            tickets.map(async (record, count = 1) => {
                const getUser = await users.findByPk(record.userId)
                const getAasra = await aasra.findByPk(record.aasraId)
                const dataValue = {
                    aasraId: record.aasraId,
                    customer_name: getUser.name,
                    product_name: record.itemName,
                    itemId: record.itemId,
                    description: record.description,
                    appointment_date: record.appointment_date,
                    appointment_time: record.appointment_time,
                    ticket_id: record.ticket_id,
                    aasraName: getAasra.name_of_org,
                    status: record.status == 0 ? 'Pending' : record.status == 1 ? 'Open' : 'Closed',
                    sr_no: count + 1
                }
                ticketData.push(dataValue)
            })
        )
        Helper.response(
            "success",
            "Welcome to Dashboard",
            {
                cardData: data,
                tableData: ticketData,
                sideBar: res.filteredMenu
            },
            res,
            200
        );
    } catch (error) {
        Helper.response(
            "success",
            "Something went wrong!",
            {error},
            res,
            200
        );
    }
}

exports.createRepair = async(req ,res) => {
    try {
        const data = req.body;
        // console.log(data)
        // return false
        const create = await Promise.all(
            data.map(async (record) => {
                await repair.create(record)   
            }) 
        )
        if(create){
            Helper.response(
                "success",
                "Repair Created Successfully!",
                {},
                res,
                200
            );
        }
    } catch (error) {
        Helper.response(
            "success",
            "Something went wrong!",
            {error},
            res,
            200
        );
    }
}