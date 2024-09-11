const Helper = require('../../helper/helper');
const aasra = require('../../model/aasra');
const repair = require('../../model/repair');
const ticket = require('../../model/ticket');
const users = require('../../model/users');
const { Op } = require('sequelize')
const aasras = require('../../model/aasra');
const repairPayment = require('../../model/repairPayment');
const items = require('../../model/items');
const problem = require('../../model/problem');
const manufacturer = require('../../model/manufacturer');
const spareParts = require('../../model/spareParts');
const customer = require('../../model/customer');
exports.Dashboard = async (req, res) => {
  try {
    //console.log("hell")
    const token = req.headers['authorization'];
    const string = token.split(" ");
    const user = await users.findOne({ where: { token: string[1] } });
    if (user.user_type == 'S') {

      var data = [
        { id: 1, count: await ticket.count(), type: "Total Tickets", imgSrc: 'tickets.png' },
        { id: 2, count: await ticket.count({ where: { status: 0 } }), type: "Pending Tickets", imgSrc: 'tickets.png' },
        { id: 3, count: await ticket.count({ where: { status: 1 } }), type: "Running Tickets", imgSrc: 'tickets.png' },
        { id: 3, count: await ticket.count({ where: { status: 2 } }), type: "Close Tickets", imgSrc: 'tickets.png' },
      ]
      var tickets = await ticket.findAll({
        order:[
          ['id','DESC']
        ]
      })
      console.log(tickets)
      const ticketData = [];
      var subtotal = 0
      await Promise.all(
        tickets.map(async (record, count = 1) => {

          console.log(record)
          // const getUser = await users.findByPk(record.user_id)
          const getAasra = await aasra.findByPk(record.aasra_id)

          //console.log(record)
          const repairData = await repair.findAll({
            where: {
              ticket_id: record.ticket_id
            }
          })
          const getUser = await users.findOne({
            where: {
              ref_id: record.user_id,
              user_type: 'C'
            }
          })

          const getCustomer = await customer.findOne({
            where: {
              id: getUser.ref_id,             
            }
          })


          

          const itemDetails = await items.findOne({
            where: {
              user_id: record.user_id
            }
          })
          const warranty = await Helper.compareDate(itemDetails?.expire_date);

          const getproblem = await problem.findOne({
            where: {
              id: record.problem
            }
          })

          const repairPayments = await repairPayment.count({
            where: {
              ticket_id: record.ticket_id
            }
          })



          var subtotal = 0
          var serviceCharge = 0
          var gst = 0
          var discount = 0
          repairData.map((t) => {
            subtotal += t.productPrice * t.qty;
            serviceCharge += t.repairServiceCharge + t.repairPrice;
            gst = subtotal * 18 / 100;
            discount = t.record == 1 ? 100 : 0;
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
            address:getCustomer?.district+', '+getCustomer?.state,
            aadhaar:getCustomer.aadhaar,
            ticket_id: record.ticket_id,
            aasraName: getAasra.name_of_org,
            status: record.status == 0 ? 'Pending' : record.status == 1 ? 'Open' : 'Closed',
            sr_no: count + 1,
            ticketDetail: (record.status == 2 || record.status == 1) ? repairData : null,
            subtotal: subtotal,
            serviceCharge: serviceCharge,
            gst: process.env.SERVICE_GST,
            totalAmount: subtotal + serviceCharge,
            discount: 0,
            createdAt: record.createdAt,
            payment_status: repairPayments == 0 ? false : true,
            warranty: warranty,
            dstDate: itemDetails?.distributed_date ?? null,
            expire_date: itemDetails?.expire_date ?? null,
            problem: getproblem?.problem_name ?? null,
            mobile: getUser.mobile ?? null,
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
    if (user.user_type == 'A') {

      var data = [
        { id: 1, count: await ticket.count(), type: "Total Tickets", imgSrc: 'tickets.png' },
        { id: 2, count: await ticket.count({ where: { status: 0 } }), type: "Pending Tickets", imgSrc: 'tickets.png' },
        { id: 3, count: await ticket.count({ where: { status: 1 } }), type: "Running Tickets", imgSrc: 'tickets.png' },
        { id: 3, count: await ticket.count({ where: { status: 2 } }), type: "Close Tickets", imgSrc: 'tickets.png' },
      ]
      var tickets = await ticket.findAll({
        order:[
          ['id','DESC']
        ]
      })
      console.log(tickets)
      const ticketData = [];
      var subtotal = 0
      await Promise.all(
        tickets.map(async (record, count = 1) => {

          console.log(record)
          // const getUser = await users.findByPk(record.user_id)
          const getAasra = await aasra.findByPk(record.aasra_id)

          //console.log(record)
          const repairData = await repair.findAll({
            where: {
              ticket_id: record.ticket_id
            }
          })
          const getUser = await users.findOne({
            where: {
              ref_id: record.user_id,
              user_type: 'C'
            }
          })

          const getCustomer = await customer.findOne({
            where: {
              id: getUser.ref_id,             
            }
          })


          

          const itemDetails = await items.findOne({
            where: {
              user_id: record.user_id
            }
          })
          const warranty = await Helper.compareDate(itemDetails?.expire_date);

          const getproblem = await problem.findOne({
            where: {
              id: record.problem
            }
          })

          const repairPayments = await repairPayment.count({
            where: {
              ticket_id: record.ticket_id
            }
          })



          var subtotal = 0
          var serviceCharge = 0
          var gst = 0
          var discount = 0
          repairData.map((t) => {
            subtotal += t.productPrice * t.qty;
            serviceCharge += t.repairServiceCharge + t.repairPrice;
            gst = subtotal * 18 / 100;
            discount = t.record == 1 ? 100 : 0;
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
            address:getCustomer?.district+', '+getCustomer?.state,
            aadhaar:getCustomer.aadhaar,
            ticket_id: record.ticket_id,
            aasraName: getAasra.name_of_org,
            status: record.status == 0 ? 'Pending' : record.status == 1 ? 'Open' : 'Closed',
            sr_no: count + 1,
            ticketDetail: (record.status == 2 || record.status == 1) ? repairData : null,
            subtotal: subtotal,
            serviceCharge: serviceCharge,
            gst: process.env.SERVICE_GST,
            totalAmount: subtotal + serviceCharge,
            discount: 0,
            createdAt: record.createdAt,
            payment_status: repairPayments == 0 ? false : true,
            warranty: warranty,
            dstDate: itemDetails?.distributed_date ?? null,
            expire_date: itemDetails?.expire_date ?? null,
            problem: getproblem?.problem_name ?? null,
            mobile: getUser.mobile ?? null,
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
    if (user.user_type == 'AC' || user.user_type == 'PMDK' || user.user_type == 'HQ'|| user.user_type == 'RMC'|| user.user_type == 'AAPC') {

      var data = [
        { id: 1, count: await ticket.count({ where: { aasra_id: user.ref_id } }), type: "Total Tickets", imgSrc: 'tickets.png' },
        { id: 2, count: await ticket.count({ where: { status: 0, aasra_id: user.ref_id } }), type: "Running Tickets", imgSrc: 'tickets.png' },
        { id: 3, count: await ticket.count({ where: { status: 1, aasra_id: user.ref_id } }), type: "Pending Tickets", imgSrc: 'tickets.png' },
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
          // const getUser = await users.findByPk(record.user_id)
          const getAasra = await aasra.findByPk(record.aasra_id)
          const getUser = await users.findOne({
            where: {
              ref_id: record.user_id,
              user_type: 'C'
            }
          })


          const repairData = await repair.findAll({
            where: {
              ticket_id: record.ticket_id
            }
          })

          const repairDataValues = await Promise.all(repairData.map(async (records) => {
            const oldManufacture = await manufacturer.findOne({
              where: {
                id: records.old_manufacturer_id
              }
            });

            const newManufacture = await manufacturer.findOne({
              where: {
                id: records.new_manufacturer_id
              }
            });
            return {
              ...records.dataValues,
              old_manufacture_name: oldManufacture?.manufacturer_code ?? null,
              new_manufacture_name: newManufacture?.manufacturer_code ?? null,
              old_manufacture_id: oldManufacture?.id ?? null,
              new_manufacture_id: newManufacture?.id ?? null,

            }
          }))
          const repairPayments = await repairPayment.count({
            where: {
              ticket_id: record.ticket_id
            }
          })

          const itemDetails = await items.findOne({
            where: {
              user_id: record.user_id
            }
          })
          const getproblem = await problem.findOne({
            where: {
              id: record.problem
            }
          })

          const getCustomer = await customer.findOne({
            where: {
              id: getUser.ref_id,             
            }
          })

          const warranty = await Helper.compareDate(itemDetails?.expire_date);

          var subtotal = 0
          var serviceCharge = 0
          var gst = 0
          var discount = 0
          repairData.map((t) => {
            subtotal += t.productPrice * t.qty;
            serviceCharge += t.repairServiceCharge + t.price;
            gst = subtotal * 18 / 100;
            discount = t.record == 1 ? 100 : 0;
          })


          const dataValue = {
            aasraId: record.aasra_id,
            customer_name: getUser.name,
            mobile: getUser.mobile,
            product_name: record.itemName,
            itemId: record.itemId,
            description: record.description,
            address:getCustomer?.district+', '+getCustomer?.state,
            aadhaar:getCustomer.aadhaar,
            appointment_date: record.appointment_date,
            appointment_time: record.appointment_time,
            ticket_id: record.ticket_id,
            aasraName: getAasra.name_of_org,
            status: record.status == 0 ? 'Pending' : record.status == 1 ? 'Open' : 'Closed',
            sr_no: count + 1,
            ticketDetail: (record.status == 2 || record.status == 1) ? repairDataValues : null,
            subtotal: subtotal,
            serviceCharge: serviceCharge,
            gst: process.env.SERVICE_GST,
            totalAmount: subtotal + serviceCharge,
            discount: discount,
            createdDate: record.createdAt,
            payment_status: repairPayments == 0 ? false : true,
            warranty: warranty,
            dstDate: itemDetails?.distributed_date ?? null,
            expire_date: itemDetails?.expire_date ?? null,
            problem: getproblem?.problem_name ?? null,
            mobile: getUser.mobile ?? null,
            createdAt:record.createdAt
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


    const start = await Helper.getMonth(req.body.startDate);
    const end = await Helper.getMonth(req.body.endDate);
    const startDatesplit = await Helper.formatDate(new Date(req.body.startDate));
    const splitDate = await Helper.formatDate(new Date(req.body.endDate));
    const startDate = startDatesplit.split(" ")[0] + " " + "00:00:00";
    const endDate = splitDate.split(" ")[0] + " " + "23:59:59";
     
    if (user.user_type == 'S' || user.user_type == 'A') {
      const aasra_id = req.body.aasra_id;


      if (aasra_id != null) {

        var tickets = await ticket.findAll({
          where: {
            aasra_id: aasra_id,
            createdAt: {
              [Op.between]: [startDate, endDate]
            },
          },
          order: [
            ['id', 'DESC']
          ]
        })
       
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
          tickets.map(async (record, count = 1) => {

            const getAasra = await aasra.findByPk(record.aasra_id)
            const repairData = await repair.findAll({
              where: {
                ticket_id: record.ticket_id
              }
            })

            const repairDataValues = await Promise.all(repairData.map(async (records) => {
              const oldManufacture = await manufacturer.findOne({
                where: {
                  id: records.old_manufacturer_id
                }
              });
  
              const newManufacture = await manufacturer.findOne({
                where: {
                  id: records.new_manufacturer_id
                }
              });
              return {
                ...records.dataValues,
                old_manufacture_name: oldManufacture?.manufacturer_code ?? null,
                new_manufacture_name: newManufacture?.manufacturer_code ?? null,
                old_manufacture_id: oldManufacture?.id ?? null,
                new_manufacture_id: newManufacture?.id ?? null,
  
              }
            }))

            const getUser = await users.findOne({
              where: {
                ref_id: record.user_id,
                user_type: 'C'
              }
            })

            const getproblem = await problem.findOne({
              where: {
                id: record.problem
              }
            })

            const repairPayments = await repairPayment.count({
              where: {
                ticket_id: record.ticket_id
              }
            })

            const itemDetails = await items.findOne({
              where: {
                user_id: record.user_id
              }
            })

            const getCustomer = await customer.findOne({
              where: {
                id: getUser.ref_id,             
              }
            })
            const warranty = await Helper.compareDate(itemDetails?.expire_date);



            var subtotal = 0
            var serviceCharge = 0
            var gst = 0
            var discount = 0
            repairData.map((t) => {
              subtotal += t.productPrice * t.qty;
              serviceCharge += t.repairServiceCharge + t.repairPrice;
              gst = subtotal * 18 / 100;
              discount = t.record == 1 ? 100 : 0;
            })

            const dataValue = {
              aasraId: record.aasraId,
              customer_name: getUser.name,
              product_name: record.itemName,
              itemId: record.itemId,
              description: record.description,
              appointment_date: record.appointment_date,
              appointment_time: record.appointment_time,
              address:getCustomer?.district+', '+getCustomer?.state,
              aadhaar:getCustomer.aadhaar,
              ticket_id: record.ticket_id,
              aasraName: getAasra.name_of_org,
              status: record.status == 0 ? 'Pending' : record.status == 1 ? 'Open' : 'Closed',
              sr_no: count + 1,
              ticketDetail: (record.status == 2 || record.status == 1) ? repairDataValues : null,
              payment_status: repairPayments == 0 ? false : true,
              subtotal: subtotal,
              serviceCharge: serviceCharge,
              gst: process.env.SERVICE_GST,
              totalAmount: subtotal + serviceCharge,
              discount: 0,
              warranty: warranty,
              dstDate: itemDetails?.distributed_date ?? null,
              expire_date: itemDetails?.expire_date ?? null,
              problem: getproblem?.problem_name ?? null,
              mobile: getUser.mobile ?? null,
              createdAt:record.createdAt

            }
            ticketData.push(dataValue)
          })
        )

      } else {


        var tickets = await ticket.findAll({
          order: [
            ['id', 'DESC']
          ]
        })
       
        await Promise.all(
          tickets.map(async (record, count = 1) => {

            const getAasra = await aasra.findByPk(record.aasra_id)
            const repairData = await repair.findAll({
              where: {
                ticket_id: record.ticket_id
              }
            })
            const getUser = await users.findOne({
              where: {
                ref_id: record.user_id,
                user_type: 'C'
              }
            })
            const repairPayments = await repairPayment.count({
              where: {
                ticket_id: record.ticket_id
              }
            })
            const itemDetails = await items.findOne({
              where: {
                user_id: record.user_id
              }
            })
            
            const getCustomer = await customer.findOne({
              where: {
                id: getUser.ref_id,             
              }
            })

            const getproblem = await problem.findOne({
              where: {
                id: record.problem
              }
            })
            const warranty = await Helper.compareDate(itemDetails?.expire_date);

            var subtotal = 0
            var serviceCharge = 0
            var gst = 0
            var discount = 0
            repairData.map((t) => {
              subtotal += t.productPrice * t.qty;
              serviceCharge += t.repairServiceCharge + t.repairPrice;
              gst = subtotal * 18 / 100;
              discount = t.record == 1 ? 100 : 0;
            })

            const repairDataValues = await Promise.all(repairData.map(async (records) => {
              const oldManufacture = await manufacturer.findOne({
                where: {
                  id: records.old_manufacturer_id
                }
              });
  
              const newManufacture = await manufacturer.findOne({
                where: {
                  id: records.new_manufacturer_id
                }
              });
              return {
                ...records.dataValues,
                old_manufacture_name: oldManufacture?.manufacturer_code ?? null,
                new_manufacture_name: newManufacture?.manufacturer_code ?? null,
                old_manufacture_id: oldManufacture?.id ?? null,
                new_manufacture_id: newManufacture?.id ?? null,
  
              }
            }))

            const dataValue = {
              aasraId: record.aasraId,
              customer_name: getUser.name,
              product_name: record.itemName,
              itemId: record.itemId,
              description: record.description,
              appointment_date: record.appointment_date,
              appointment_time: record.appointment_time,
              aadhaar:getCustomer.aadhaar,
              ticket_id: record.ticket_id,
              address:getCustomer?.district+', '+getCustomer?.state,
              aasraName: getAasra.name_of_org,
              status: record.status == 0 ? 'Pending' : record.status == 1 ? 'Open' : 'Closed',
              sr_no: count + 1,
              ticketDetail: (record.status == 2 || record.status == 1) ? repairDataValues : null,
              payment_status: repairPayments == 0 ? false : true,
              subtotal: subtotal,
              serviceCharge: serviceCharge,
              gst: process.env.SERVICE_GST,
              totalAmount: subtotal + serviceCharge,
              discount: 0,
              warranty: warranty,
              dstDate: itemDetails?.distributed_date ?? null,
              expire_date: itemDetails?.expire_date ?? null,
              problem: getproblem?.problem_name ?? null,
              mobile: getUser.mobile ?? null,
              createdAt:record.createdAt

            }
            ticketData.push(dataValue)
          })
        )
      }

    } else {

      if (JSON.stringify(req.body) === '{}') {


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
            // const getUser = await users.findByPk(record.user_id)
            const getAasra = await aasra.findByPk(record.aasra_id)
            const repairData = await repair.findAll({
              where: {
                ticket_id: record.ticket_id
              }
            })
            const getUser = await users.findOne({
              where: {
                ref_id: record.user_id,
                user_type: 'C'
              }
            })


            const repairPayments = await repairPayment.count({
              where: {
                ticket_id: record.ticket_id
              }
            })
            const itemDetails = await items.findOne({
              where: {
                user_id: record.user_id
              }
            })
            const getproblem = await problem.findOne({
              where: {
                id: record.problem
              }
            })

            const getCustomer = await customer.findOne({
              where: {
                id: getUser.ref_id,             
              }
            })

            const repairDataValues = await Promise.all(repairData.map(async (records) => {
              const oldManufacture = await manufacturer.findOne({
                where: {
                  id: records.old_manufacturer_id
                }
              });
  
              const newManufacture = await manufacturer.findOne({
                where: {
                  id: records.new_manufacturer_id
                }
              });
              return {
                ...records.dataValues,
                old_manufacture_name: oldManufacture?.manufacturer_code ?? null,
                new_manufacture_name: newManufacture?.manufacturer_code ?? null,               
  
              }
            }))

            

            var subtotal = 0
            var serviceCharge = 0
            var gst = 0
            var discount = 0
            repairData.map((t) => {
              subtotal += t.productPrice * t.qty;
              serviceCharge += t.repairServiceCharge + t.repairPrice;
              gst = subtotal * 18 / 100;
              discount = t.record == 1 ? 100 : 0;
            })

            const warranty = await Helper.compareDate(itemDetails?.expire_date);

            const dataValue = {
              aasraId: record.aasraId,
              customer_name: getUser.name,
              product_name: record.itemName,
              itemId: record.itemId,
              description: record.description,
              appointment_date: record.appointment_date,
              appointment_time: record.appointment_time,
              address:getCustomer?.district+', '+getCustomer?.state,
              ticket_id: record.ticket_id,
              aadhaar:getCustomer.aadhaar,
              aasraName: getAasra.name_of_org,
              status: record.status == 0 ? 'Pending' : record.status == 1 ? 'Open' : 'Closed',
              sr_no: count + 1,
              ticketDetail: (record.status == 2 || record.status == 1) ? repairDataValues : null,
              payment_status: repairPayments == 0 ? false : true,
              gst: process.env.SERVICE_GST,
              warranty: warranty,
              dstDate: itemDetails?.distributed_date ?? null,
              expire_date: itemDetails?.expire_date ?? null,
              problem: getproblem?.problem_name ?? null,
              subtotal: subtotal,
              serviceCharge: serviceCharge,
              totalAmount: subtotal + serviceCharge,
              discount: 0,
              mobile: getUser.mobile ?? null,
              createdAt:record.createdAt

            }
            ticketData.push(dataValue)
          })
        )
      } else {

        var tickets = await ticket.findAll({
          where: {
            aasra_id: user.ref_id,
            createdAt: {
              [Op.between]: [startDate, endDate]
            },
          },
          order: [
            ['id', 'DESC']
          ]
        })
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
          tickets.map(async (record, count = 1) => {

            const getAasra = await aasra.findByPk(record.aasra_id)
            const repairData = await repair.findAll({
              where: {
                ticket_id: record.ticket_id
              }
            })
            const getUser = await users.findOne({
              where: {
                ref_id: record.user_id,
                user_type: 'C'
              }
            })
            const repairPayments = await repairPayment.count({
              where: {
                ticket_id: record.ticket_id
              }
            })
            const itemDetails = await items.findOne({
              where: {
                user_id: record.user_id
              }
            })
            const getproblem = await problem.findOne({
              where: {
                id: record.problem
              }
            })

            const getCustomer = await customer.findOne({
              where: {
                id: getUser.ref_id,             
              }
            })
            var subtotal = 0
            var serviceCharge = 0

            const warranty = await Helper.compareDate(itemDetails?.expire_date);

            const dataValue = {
              aasraId: record.aasraId,
              customer_name: getUser.name,
              product_name: record.itemName,
              itemId: record.itemId,
              description: record.description,
              appointment_date: record.appointment_date,
              appointment_time: record.appointment_time,
              aadhaar:getCustomer.aadhaar,
              ticket_id: record.ticket_id,
              address:getCustomer?.district+', '+getCustomer?.state,
              aasraName: getAasra.name_of_org,
              status: record.status == 0 ? 'Pending' : record.status == 1 ? 'Open' : 'Closed',
              sr_no: count + 1,
              ticketDetail: (record.status == 2 || record.status == 1) ? repairData : null,
              payment_status: repairPayments == 0 ? false : true,
              gst: process.env.SERVICE_GST,
              warranty: warranty,
              dstDate: itemDetails?.distributed_date ?? null,
              expire_date: itemDetails?.expire_date ?? null,
              problem: getproblem?.problem_name ?? null,
              totalAmount: subtotal + serviceCharge ,
              mobile: getUser.mobile ?? null,
              createdAt:record.createdAt
            }
            ticketData.push(dataValue)
          })
        )

      }

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
      // const startDate = await Helper.formatDate(new Date(req.body.startDate));
      // const endDate = await Helper.formatDate(new Date(req.body.endDate));
      const start = await Helper.getMonth(req.body.startDate);
      const end = await Helper.getMonth(req.body.endDate);
      const startDatesplit = await Helper.formatDate(new Date(req.body.startDate));
      const splitDate = await Helper.formatDate(new Date(req.body.endDate));
      const startDate = startDatesplit.split(" ")[0] + " " + "00:00:00";
      const endDate = splitDate.split(" ")[0] + " " + "23:59:59";

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
      // const startDate = await Helper.formatDate(new Date(req.body.startDate));
      // const endDate = await Helper.formatDate(new Date(req.body.endDate));
      const start = await Helper.getMonth(req.body.startDate);
      const end = await Helper.getMonth(req.body.endDate);
      const startDatesplit = await Helper.formatDate(new Date(req.body.startDate));
      const splitDate = await Helper.formatDate(new Date(req.body.endDate));
      const startDate = startDatesplit.split(" ")[0] + " " + "00:00:00";
      const endDate = splitDate.split(" ")[0] + " " + "23:59:59";

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

    Helper.response(
      "failed",
      "Something went wrong!",
      { error },
      res,
      200
    );
  }
}


exports.servicehistorylist = async (req, res) => {
  try {


    const token = req.headers["authorization"];
    const string = token.split(" ");
    const user = await users.findOne({ where: { token: string[1] } });
    const ticketData = [];
    const userData = await users.findOne({ where: { udid: req.body.udid } });
    if (userData === null ) {
      Helper.response(
        "failed",
        "Data Not Found!",
        {},
        res,
        200
      );
      return;
    }
    if (user.user_type == 'S' || user.user_type == 'A') {
      const userDetails = await users.findOne({ where: { udid: req.body.udid } });
     
      if (userDetails.length === 0 ) {
        Helper.response(
          "failed",
          "Record Not Found!",
          {},
          res,
          200
        );
        return;
      }
      
      console.log('1');

      var tickets = await ticket.findAll({
        where: {
          user_id: userDetails.ref_id,
        },
        order: [
          ['id', 'DESC']
        ]
      })
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
        tickets.map(async (record, count = 1) => {

          const getUser = await users.findOne({
            where: {
              ref_id: record.user_id,
              user_type: 'C'
            }
          })
          const getAasra = await aasra.findByPk(record.aasra_id)
          const repairData = await repair.findAll({
            where: {
              ticket_id: record.ticket_id
            }
          })

          const repairPayments = await repairPayment.count({
            where: {
              ticket_id: record.ticket_id
            }
          })

          var subtotal = 0
          var serviceCharge = 0
          var gst = 0
          var discount = 0
          repairData.map((t) => {
            subtotal += t.productPrice * t.qty
            serviceCharge += t.repairPrice
            gst = subtotal * 18 / 100
            discount = t.record == 1 ? 100 : 0
          })

          const dataValue = {
            aasraId: record.aasraId,
            customer_name: getUser.name,
            aasra_name: getAasra.name_of_org,
            ticket_no: record.ticket_id,
            product_name: record.itemName,
            appointment_date: record.appointment_date,
            appointment_time: record.appointment_time,
            status: record.status == 0 ? 'Pending' : record.status == 1 ? 'Open' : 'Closed',
            udid:req.body.udid,
            sr_no: count + 1,
          }
          ticketData.push(dataValue)
        })
      )

    } else {

      const userDetails = await users.findOne({ where: { udid: req.body.udid } });
      if (userDetails.length === 0) {
        Helper.response(
          "failed",
          "Record Not Found!",
          {},
          res,
          200
        );
        return;
      }


      var tickets = await ticket.findAll({
        where: {
          user_id: userDetails.ref_id,
        },
        order: [
          ['id', 'DESC']
        ]
      })
      await Promise.all(
        tickets.map(async (record, count = 1) => {

          const getAasra = await aasra.findByPk(record.aasra_id)
          const repairData = await repair.findAll({
            where: {
              ticket_id: record.ticket_id
            }
          })
          const getUser = await users.findOne({
            where: {
              ref_id: record.user_id,
              user_type: 'C'
            }
          })
          const repairPayments = await repairPayment.count({
            where: {
              ticket_id: record.ticket_id
            }
          })

          const dataValue = {
            aasraId: record.aasraId,
            customer_name: getUser.name,
            aasra_name: getAasra.name_of_org,
            ticket_no: record.ticket_id,
            product_name: record.itemName,
            appointment_date: record.appointment_date,
            appointment_time: record.appointment_time,
            status: record.status == 0 ? 'Pending' : record.status == 1 ? 'Open' : 'Closed',
            sr_no: count + 1,
            udid:req.body.udid,
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

    Helper.response(
      "failed",
      "Something went wrong!",
      { error },
      res,
      200
    );
  }
}