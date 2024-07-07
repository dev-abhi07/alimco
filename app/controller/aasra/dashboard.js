const Helper = require('../../helper/helper')

exports.Dashboard= (req,res)=>{
    try {
       const data = [
            { id: 1, count: 50, type: "Total Tickets", imgSrc: 'tickets.png' },
            { id: 2, count: 15, type: "Running Tickets", imgSrc: 'tickets.png' },
            { id: 3, count: 15, type: "Pending Tickets", imgSrc: 'tickets.png' },
            { id: 4, count: 20, type: "Register Grievance", imgSrc: 'griv.png' },
          ]
        const ticketData= [
            {sr_no:1,ticket_id:1,customer_name:'Test',product_name:'Wheel chair',description:'change in wheels',appointment_date:'7-7-24',status:'Pending'},
            {sr_no:2,ticket_id:2,customer_name:'Test',product_name:'Wheel chair',description:'change in wheels',appointment_date:'8-7-24',status:'Pending'}
        ]

          Helper.response(
            "Success",
            "Login Successful",
            { 
                cardData: data,
                tableData:ticketData
            },
            res,
            200
        );
    } catch (error) {
        
    }
}