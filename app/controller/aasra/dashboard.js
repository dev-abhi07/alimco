const Helper = require('../../helper/helper');
const aasra = require('../../model/aasra');
const ticket = require('../../model/ticket');
const users = require('../../model/users');

exports.Dashboard = (req, res) => {
  try {
    const data = [
      { id: 1, count: 50, type: "Total Tickets", imgSrc: 'tickets.png' },
      { id: 2, count: 15, type: "Running Tickets", imgSrc: 'tickets.png' },
      { id: 3, count: 15, type: "Pending Tickets", imgSrc: 'tickets.png' },
      { id: 4, count: 20, type: "Register Grievance", imgSrc: 'griv.png' },
    ]
    const ticketData = [
      { sr_no: 1, ticket_id: 1, customer_name: 'Test', product_name: 'Wheel chair', description: 'change in wheels', appointment_date: '7-7-24', status: 'Pending' },
      { sr_no: 2, ticket_id: 2, customer_name: 'Test', product_name: 'Wheel chair', description: 'change in wheels', appointment_date: '8-7-24', status: 'Pending' }
    ]

    const sidebar = [
      {
        Items: [
          {
            title: 'Dashboards',
            icon: 'home',
            type: "link",
            path: "dashboard"
          },
          {
            title: 'Tickets',
            icon: 'task',
            type: "link",
            path: "tickets"
          },       
          {
            title: 'Inventory Reports',
            icon: 'home',
            type: "link",
            path: "inventory-reports"
          },
          {
            title: 'Revenue Reports',
            icon: 'home',
            type: "link",
            path: "revenue-reports"
          },          
        ]
      }
    ]


    Helper.response(
      "success",
      "Welcome to Dashboard",
      {
        cardData: data,
        tableData: ticketData,
        sideBar: sidebar
      },
      res,
      200
    );
  } catch (error) {

  }

}