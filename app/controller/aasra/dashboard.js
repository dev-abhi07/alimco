const Helper = require('../../helper/helper');
const aasra = require('../../model/aasra');
const repair = require('../../model/repair');
const ticket = require('../../model/ticket');
const users = require('../../model/users');
const { Op } = require('sequelize')
const aasras = require('../../model/aasra');

exports.Dashboard = async (req, res) => {
  try {
    //console.log("hell")
    const token = req.headers['authorization'];
    const string = token.split(" ");
    const user = await users.findOne({ where: { token: string[1] } });
    if (user.user_type == 'S') {

      var data = [
        { id: 1, count: await ticket.count(), type: "Total Tickets", imgSrc: 'tickets.png' },
        { id: 2, count: await ticket.count({ where: { status: 1 } }), type: "Running Tickets", imgSrc: 'tickets.png' },
        { id: 3, count: await ticket.count({ where: { status: 2 } }), type: "Pending Tickets", imgSrc: 'tickets.png' },
        { id: 4, count: 0, type: "Register Grievance", imgSrc: 'griv.png' },
      ]
      var tickets = await ticket.findAll()
      const ticketData = [];
      var subtotal = 0
      await Promise.all(
        tickets.map(async (record, count = 1) => {
          const getUser = await users.findByPk(record.user_id)
          const getAasra = await aasra.findByPk(record.aasra_id)

          const repairData = await repair.findAll({
            where: {
              ticket_id: record.ticket_id
            }
          })
          var subtotal = 0
          var serviceCharge = 0
          var gst = 0
          var discount = 0
          repairData.map((t) => {
            subtotal += t.price * t.qty
            serviceCharge += t.repairPrice
            gst = subtotal * 18 / 100
            discount = t.record == 1 ? 100 : 0
          })


          const dataValue = {
            aasraId: record.aasraId,
            customer_name: getUser.name,
            mobile: getUser.mobile,
            product_name: record.itemName,
            itemId: record.itemId,
            description: record.description,
            appointment_date: record.appointment_date,
            appointment_time: record.appointment_time,
            ticket_id: record.ticket_id,
            aasraName: getAasra.name_of_org,
            status: record.status == 0 ? 'Pending' : record.status == 1 ? 'Open' : 'Closed',
            sr_no: count + 1,
            ticketDetail: record.status == 2 ? repairData : null,
            subtotal: subtotal,
            serviceCharge: serviceCharge,
            gst: gst,
            totalAmount: subtotal + serviceCharge + gst,
            discount: 0,
            createdDate: record.createdAt

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
    }
    if (user.user_type == 'AC') {

      var data = [
        { id: 1, count: await ticket.count({ where: { aasra_id: user.ref_id } }), type: "Total Tickets", imgSrc: 'tickets.png' },
        { id: 2, count: await ticket.count({ where: { status: 1, aasra_id: user.ref_id } }), type: "Running Tickets", imgSrc: 'tickets.png' },
        { id: 3, count: await ticket.count({ where: { status: 0, aasra_id: user.ref_id } }), type: "Pending Tickets", imgSrc: 'tickets.png' },
        { id: 4, count: await ticket.count({ where: { status: 2, aasra_id: user.ref_id } }), type: "Closed Tickets", imgSrc: 'tickets.png' },
      ]
      var tickets = await ticket.findAll({
        where: {
          aasra_id: user.ref_id
        }
      })

      const ticketData = [];
      await Promise.all(
        tickets.map(async (record, count = 1) => {
          const getUser = await users.findByPk(record.user_id)
          const getAasra = await aasra.findByPk(record.aasra_id)


          const repairData = await repair.findAll({
            where: {
              ticket_id: record.ticket_id
            }
          })
          var subtotal = 0
          var serviceCharge = 0
          var gst = 0
          var discount = 0
          repairData.map((t) => {
            subtotal += t.price * t.qty
            serviceCharge += t.repairPrice
            gst = subtotal * 18 / 100
            discount = t.record == 1 ? 100 : 0
          })


          const dataValue = {
            aasraId: record.aasraId,
            customer_name: getUser.name,
            mobile: getUser.mobile,
            product_name: record.itemName,
            itemId: record.itemId,
            description: record.description,
            appointment_date: record.appointment_date,
            appointment_time: record.appointment_time,
            ticket_id: record.ticket_id,
            aasraName: getAasra.name_of_org,
            status: record.status == 0 ? 'Pending' : record.status == 1 ? 'Open' : 'Closed',
            sr_no: count + 1,
            ticketDetail: record.status == 2 ? repairData : null,
            subtotal: subtotal,
            serviceCharge: serviceCharge,
            gst: gst,
            totalAmount: subtotal + serviceCharge + gst,
            discount: 0,
            createdDate: record.createdAt
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
    }

  } catch (error) {
    console.log(error)
  }

}


exports.test = async (req, res) => {
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
      { id: 1, count: user[0]?.aasra?.aasra_ticket.length ?? 0, type: "Total Tickets", imgSrc: 'tickets.png' },
      { id: 2, count: 0, type: "Running Tickets", imgSrc: 'tickets.png' },
      { id: 3, count: 0, type: "Pending Tickets", imgSrc: 'tickets.png' },
      { id: 4, count: 0, type: "Register Grievance", imgSrc: 'griv.png' },
    ]
    const customer_name = user[0]?.name
    const ticketData = user[0]?.aasra?.aasra_ticket.map((f, index) => {
      const user = {
        sr_no: index + 1,
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
        tableData: ticketData
      },
      res,
      200
    );
  } catch (error) {
    console.log(error)
  }
}

exports.ticketList = async (req, res) => {
  try {
    const token = req.headers["authorization"];
    const string = token.split(" ");
    const user = await users.findOne({ where: { token: string[1] } });
    const ticketData = [];
    if (user.user_type == 'S') {
      var tickets = await ticket.findAll({
        order: [
          ['id', 'DESC']
        ]
      })
      await Promise.all(
        tickets.map(async (record, count = 1) => {
          const getUser = await users.findByPk(record.user_id)
          const getAasra = await aasra.findByPk(record.aasra_id)
          const repairData = await repair.findAll({
            where: {
              ticket_id: record.ticket_id
            }
          })


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
            sr_no: count + 1,
            ticketDetail: record.status == 2 ? repairData : null
          }
          ticketData.push(dataValue)
        })
      )
    } else {
      var tickets = await ticket.findAll({
        where: {
          aasra_id: user.ref_id
        },
        order: [
          ['id', 'DESC']
        ]
      })
      await Promise.all(
        tickets.map(async (record, count = 1) => {
          const getUser = await users.findByPk(record.user_id)
          const getAasra = await aasra.findByPk(record.aasra_id)
          const repairData = await repair.findAll({
            where: {
              ticket_id: record.ticket_id
            }
          })



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
            sr_no: count + 1,
            ticketDetail: record.status == 2 ? repairData : null
          }
          ticketData.push(dataValue)
        })
      )
    }
    Helper.response(
      "success",
      "Record Found Successfully!",
      {
        tableData: ticketData,
      },
      res,
      200
    );
  } catch (error) {
    // console.log(error)
    Helper.response(
      "failed",
      "Something went wrong!",
      { error },
      res,
      200
    );
  }
}

exports.getAasraRevenue = async (req, res) => {
 

  try {
    const aasra = await Helper.getAasraId(req)  
    if (req.body.type == 2) {
        const startDate = await Helper.formatDate(new Date(req.body.startDate));
        const endDate = await Helper.formatDate(new Date(req.body.endDate));
        const start = await Helper.getMonth(req.body.startDate);
        const end = await Helper.getMonth(req.body.endDate);
       

        const ticketDetails = await ticket.findAll({
            where: {
                aasra_id: aasra,
                status: 2
            }
        })

        if (ticketDetails.length === 0) {
            Helper.response(
                "failed",
                "Record Not Found!",
                {},
                res,
                200
            );
            return;
        }

        const ticketIds = ticketDetails.map(ticket => ticket.ticket_id);

        var repairs = await repair.findAll({
            where: {
                ticket_id: ticketIds,
                createdAt: {
                    [Op.between]: [startDate, endDate]
                },
            }
        });
        if (repairs.length === 0) {
            Helper.response(
                "failed",
                "Record Not Found!",
                {},
                res,
                200
            );
            return;
        }
        const getAasra = await aasras.findByPk(aasra)
        const dates = `${start} - ${end}`;
        const totalAmount = repairs.reduce((sum, record) => sum + record.amount, 0);
        const labourDetails = {
            total_amount: totalAmount,
            aasra_name: getAasra.name_of_org,
            month: dates,
            type: 2
        };

        Helper.response(
            "success",
            "Record Found Successfully",
            [labourDetails],
            res,
            200
        );
    }
    else if (req.body.type == 1) {
        const startDate = await Helper.formatDate(new Date(req.body.startDate));
        const endDate = await Helper.formatDate(new Date(req.body.endDate));
        const start = await Helper.getMonth(req.body.startDate);
        const end = await Helper.getMonth(req.body.endDate);
       

        const ticketDetails = await ticket.findAll({
            where: {
                aasra_id: aasra,
                status: 2
            }
        })

        if (ticketDetails.length === 0) {
            Helper.response(
                "failed",
                "Record Not Found!",
                {},
                res,
                200
            );
            return;
        }

        const ticketIds = ticketDetails.map(ticket => ticket.ticket_id);

        var repairs = await repair.findAll({
            where: {
                ticket_id: ticketIds,
                createdAt: {
                    [Op.between]: [startDate, endDate]
                },
            }
        });

        if (repairs.length === 0) {
            Helper.response(
                "failed",
                "Record Not Found!",
                {},
                res,
                200
            );
            return;
        }
        const getAasra = await aasras.findByPk(aasra)
        const dates = `${start} - ${end}`;
        const totalAmount = repairs.reduce((sum, record) => sum + (record.qty * record.price), 0);
        const sellDetails = {
            total_amount: totalAmount,
            aasra_name: getAasra.name_of_org,
            month: dates,
            type: 1
        };

        Helper.response(
            "success",
            "Record Found Successfully",
            [sellDetails],
            res,
            200
        );
    }


} catch (error) {
    console.log(error)
    Helper.response(
        "failed",
        "Something went wrong!",
        { error },
        res,
        200
    );
}
}