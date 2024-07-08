const Helper = require('../../helper/helper');
const aasra = require('../../model/aasra');
const ticket = require('../../model/ticket');
const users = require('../../model/users');

exports.Dashboard= async(req,res)=>{
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
       const data = [
            { id: 1, count:  user[0]?.aasra?.aasra_ticket.length??0, type: "Total Tickets", imgSrc: 'tickets.png' },
            { id: 2, count: 0, type: "Running Tickets", imgSrc: 'tickets.png' },
            { id: 3, count: 0, type: "Pending Tickets", imgSrc: 'tickets.png' },
            { id: 4, count: 0, type: "Register Grievance", imgSrc: 'griv.png' },
          ]
          const customer_name = user[0]?.name
          const ticketData = user[0]?.aasra?.aasra_ticket.map((f,index) => {
          const user = {
                sr_no:index+1,
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
        // const ticketData= [
        //     {sr_no:1,ticket_id:1,customer_name:'Test',product_name:'Wheel chair',description:'change in wheels',appointment_date:'7-7-24',status:'Pending'},
        //     {sr_no:2,ticket_id:2,customer_name:'Test',product_name:'Wheel chair',description:'change in wheels',appointment_date:'8-7-24',status:'Pending'}
        // ]
      Helper.response(
            "Success",
            "Data found successfull",
            { 
                cardData: data,
                tableData:ticketData
            },
            res,
            200
        );
    } catch (error) {
        console.log(error)
    }
}