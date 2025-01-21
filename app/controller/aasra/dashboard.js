const Helper = require("../../helper/helper");
const aasra = require("../../model/aasra");
const ticket = require("../../model/ticket");
const users = require("../../model/users");
const db = require("../../connection/conn");

exports.Dashboard = async (req, res) => {
  try {
    //console.log("hell")
    const token = req.headers["authorization"];
    const string = token.split(" ");
    const user = await users.findOne({ where: { token: string[1] } });
    console.log(user, "okkjhh");
    if (user.user_type == "S") {
      var data = [
        {
          id: 1,
          count: await ticket.count(),
          type: "Total Tickets",
          imgSrc: "tickets.png",
        },
        {
          id: 2,
          count: await ticket.count({ where: { status: 1 } }),
          type: "Running Tickets",
          imgSrc: "tickets.png",
        },
        {
          id: 3,
          count: await ticket.count({ where: { status: 2 } }),
          type: "Pending Tickets",
          imgSrc: "tickets.png",
        },
        { id: 4, count: 0, type: "Register Grievance", imgSrc: "griv.png" },
      ];
      var tickets = await ticket.findAll();
      const ticketData = [];
      await Promise.all(
        tickets.map(async (record, count = 1) => {
          const getUser = await users.findByPk(record.userId);
          const getAasra = await aasra.findByPk(record.aasraId);
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
            status:
              record.status == 0
                ? "Pending"
                : record.status == 1
                ? "Open"
                : "Closed",
            sr_no: count + 1,
          };
          ticketData.push(dataValue);
        })
      );
      Helper.response(
        "success",
        "Welcome to Dashboard",
        {
          cardData: data,
          tableData: ticketData,
          sideBar: res.filteredMenu,
        },
        res,
        200
      );
    }
    if (user.user_type == "AC") {
      var data = [
        {
          id: 1,
          count: await ticket.count({
            where: { status: 0, aasraId: user.ref_id },
          }),
          type: "Total Tickets",
          imgSrc: "tickets.png",
        },
        {
          id: 2,
          count: await ticket.count({
            where: { status: 1, aasraId: user.ref_id },
          }),
          type: "Running Tickets",
          imgSrc: "tickets.png",
        },
        {
          id: 3,
          count: await ticket.count({
            where: { status: 2, aasraId: user.ref_id },
          }),
          type: "Pending Tickets",
          imgSrc: "tickets.png",
        },
        { id: 4, count: 0, type: "Register Grievance", imgSrc: "griv.png" },
      ];
      var tickets = await ticket.findAll({
        where: {
          aasraId: user.ref_id,
        },
      });

      const ticketData = [];
      await Promise.all(
        tickets.map(async (record, count = 1) => {
          const getUser = await users.findByPk(record.userId);
          const getAasra = await aasra.findByPk(record.aasraId);
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
            status:
              record.status == 0
                ? "Pending"
                : record.status == 1
                ? "Open"
                : "Closed",
            sr_no: count + 1,
          };
          ticketData.push(dataValue);
        })
      );

      let date = new Date();
      let year = date.getFullYear();
      let month = date.getMonth() + 1;

      let sql = ` Select od.grand_total,tst.payment_method from orders as od join transactions 
       as tst on od.id = tst.order_id where od.status = 'success' and tst.payment_status = 'Paid' `;

      if (req.body.year) {
        sql += ` and YEAR(od.createdAt)  = ${req.body.year}`;
      } else {
        sql += ` and YEAR(od.createdAt)  = ${year}  and  MONTH(od.createdAt)  = ${month} `;
      }

      let transaction_dt = await db.query(sql);

      console.log(transaction_dt.rows);

      var chartConfig = [
        {
          "chart": {
            "type": "column"
          },
          "title": {
            "text": "Purchase Monthly Transactions (Cash + Online) Breakdown  2025"
          },
          "subtitle": {
            "text": ""
          },
          "xAxis": {
            "categories": [
              "Jan",
              "Feb",
              "Mar",
              "Apr",
              "May",
              "Jun",
              "Jul",
              "Aug",
              "Sep",
              "Oct",
              "Nov",
              "Dec"
            ],
            "title": {
              "text": "Months"
            }
          },
          "yAxis": {
            "min": 0,
            "title": {
              "text": "Total Amount (₹)"
            }
          },
          "tooltip": {
            "valueSuffix": " ₹"
          },
          "plotOptions": {
            "column": {
              "pointPadding": 0.2,
              "borderWidth": 0
            }
          },
          "series": [
            {
              "name": "Cash ",
              "color": "#1e90ff",
              "data": [
                {
                  "name": "Jan",
                  "y": 53,
                  "tooltip": {
                    "valueSuffix": " ₹"
                  }
                },
                {
                  "name": "Feb",
                  "y": 0,
                  "tooltip": {
                    "valueSuffix": " ₹"
                  }
                },
                {
                  "name": "Mar",
                  "y": 0,
                  "tooltip": {
                    "valueSuffix": " ₹"
                  }
                },
                {
                  "name": "Apr",
                  "y": 0,
                  "tooltip": {
                    "valueSuffix": " ₹"
                  }
                },
                {
                  "name": "May",
                  "y": 0,
                  "tooltip": {
                    "valueSuffix": " ₹"
                  }
                },
                {
                  "name": "Jun",
                  "y": 0,
                  "tooltip": {
                    "valueSuffix": " ₹"
                  }
                },
                {
                  "name": "Jul",
                  "y": 0,
                  "tooltip": {
                    "valueSuffix": " ₹"
                  }
                },
                {
                  "name": "Aug",
                  "y": 0,
                  "tooltip": {
                    "valueSuffix": " ₹"
                  }
                },
                {
                  "name": "Sep",
                  "y": 0,
                  "tooltip": {
                    "valueSuffix": " ₹"
                  }
                },
                {
                  "name": "Oct",
                  "y": 0,
                  "tooltip": {
                    "valueSuffix": " ₹"
                  }
                },
                {
                  "name": "Nov",
                  "y": 0,
                  "tooltip": {
                    "valueSuffix": " ₹"
                  }
                },
                {
                  "name": "Dec",
                  "y": 0,
                  "tooltip": {
                    "valueSuffix": " ₹"
                  }
                }
              ]
            },
            {
              "name": "Online ",
              "color": "#32cd32",
              "data": [
                {
                  "name": "Jan",
                  "y": 79,
                  "tooltip": {
                    "valueSuffix": " ₹"
                  }
                },
                {
                  "name": "Feb",
                  "y": 0,
                  "tooltip": {
                    "valueSuffix": " ₹"
                  }
                },
                {
                  "name": "Mar",
                  "y": 0,
                  "tooltip": {
                    "valueSuffix": " ₹"
                  }
                },
                {
                  "name": "Apr",
                  "y": 0,
                  "tooltip": {
                    "valueSuffix": " ₹"
                  }
                },
                {
                  "name": "May",
                  "y": 0,
                  "tooltip": {
                    "valueSuffix": " ₹"
                  }
                },
                {
                  "name": "Jun",
                  "y": 0,
                  "tooltip": {
                    "valueSuffix": " ₹"
                  }
                },
                {
                  "name": "Jul",
                  "y": 0,
                  "tooltip": {
                    "valueSuffix": " ₹"
                  }
                },
                {
                  "name": "Aug",
                  "y": 0,
                  "tooltip": {
                    "valueSuffix": " ₹"
                  }
                },
                {
                  "name": "Sep",
                  "y": 0,
                  "tooltip": {
                    "valueSuffix": " ₹"
                  }
                },
                {
                  "name": "Oct",
                  "y": 0,
                  "tooltip": {
                    "valueSuffix": " ₹"
                  }
                },
                {
                  "name": "Nov",
                  "y": 0,
                  "tooltip": {
                    "valueSuffix": " ₹"
                  }
                },
                {
                  "name": "Dec",
                  "y": 0,
                  "tooltip": {
                    "valueSuffix": " ₹"
                  }
                }
              ]
            },
            {
              "name": "Total ",
              "color": "#ff6347",
              "data": [
                {
                  "name": "Jan",
                  "y": 132,
                  "tooltip": {
                    "valueSuffix": " ₹"
                  }
                },
                {
                  "name": "Feb",
                  "y": 0,
                  "tooltip": {
                    "valueSuffix": " ₹"
                  }
                },
                {
                  "name": "Mar",
                  "y": 0,
                  "tooltip": {
                    "valueSuffix": " ₹"
                  }
                },
                {
                  "name": "Apr",
                  "y": 0,
                  "tooltip": {
                    "valueSuffix": " ₹"
                  }
                },
                {
                  "name": "May",
                  "y": 0,
                  "tooltip": {
                    "valueSuffix": " ₹"
                  }
                },
                {
                  "name": "Jun",
                  "y": 0,
                  "tooltip": {
                    "valueSuffix": " ₹"
                  }
                },
                {
                  "name": "Jul",
                  "y": 0,
                  "tooltip": {
                    "valueSuffix": " ₹"
                  }
                },
                {
                  "name": "Aug",
                  "y": 0,
                  "tooltip": {
                    "valueSuffix": " ₹"
                  }
                },
                {
                  "name": "Sep",
                  "y": 0,
                  "tooltip": {
                    "valueSuffix": " ₹"
                  }
                },
                {
                  "name": "Oct",
                  "y": 0,
                  "tooltip": {
                    "valueSuffix": " ₹"
                  }
                },
                {
                  "name": "Nov",
                  "y": 0,
                  "tooltip": {
                    "valueSuffix": " ₹"
                  }
                },
                {
                  "name": "Dec",
                  "y": 0,
                  "tooltip": {
                    "valueSuffix": " ₹"
                  }
                }
              ]
            }
          ],
          "credits": {
            "enabled": false
          }
        }
      ];

      Helper.response(
        "success",
        "Welcome to Dashboard",
        {
          chartConfig,
          cardData: data,
          tableData: ticketData,
          sideBar: res.filteredMenu,
        },
        res,
        200
      );
    }
  } catch (error) {
    console.log(error);
  }
};

exports.test = async (req, res) => {
  try {
    const token = req.headers["authorization"];
    const string = token.split(" ");
    const user = await users.findAll({
      include: [
        {
          model: aasra,
          as: "aasra",

          include: [
            {
              model: ticket,
              as: "aasra_ticket",
            },
          ],
        },
      ],
      where: {
        token: string[1],
      },
    });
    const data = [
      {
        id: 1,
        count: user[0]?.aasra?.aasra_ticket.length ?? 0,
        type: "Total Tickets",
        imgSrc: "tickets.png",
      },
      { id: 2, count: 0, type: "Running Tickets", imgSrc: "tickets.png" },
      { id: 3, count: 0, type: "Pending Tickets", imgSrc: "tickets.png" },
      { id: 4, count: 0, type: "Register Grievance", imgSrc: "griv.png" },
    ];
    const customer_name = user[0]?.name;
    const ticketData = user[0]?.aasra?.aasra_ticket.map((f, index) => {
      const user = {
        sr_no: index + 1,
        ticket_id: f.id,
        customer_name: customer_name,
        status: f.status,
        description: f.description,
        product_name: f.product_name,
        appointment_date: Helper.formatDateTime(f.createdAt),
        percentage:
          f.status == "Done"
            ? 100
            : f.status == "Pending"
            ? 10
            : f.status == "Open"
            ? 50
            : 0,
      };
      return user;
    });
    // const ticketData= [
    //     {sr_no:1,ticket_id:1,customer_name:'Test',product_name:'Wheel chair',description:'change in wheels',appointment_date:'7-7-24',status:'Pending'},
    //     {sr_no:2,ticket_id:2,customer_name:'Test',product_name:'Wheel chair',description:'change in wheels',appointment_date:'8-7-24',status:'Pending'}
    // ]
    Helper.response(
      "Success",
      "Data found successfull",
      {
        cardData: data,
        tableData: ticketData,
      },
      res,
      200
    );
  } catch (error) {
    console.log(error);
  }
};

exports.ticketList = async (req, res) => {
  try {
    const token = req.headers["authorization"];
    const string = token.split(" ");
    const user = await users.findOne({ where: { token: string[1] } });
    var tickets = await ticket.findAll({
      where: {
        aasraId: user.ref_id,
      },
    });
    const ticketData = [];
    await Promise.all(
      tickets.map(async (record, count = 1) => {
        const getUser = await users.findByPk(record.userId);
        const getAasra = await aasra.findByPk(record.aasraId);
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
          status:
            record.status == 0
              ? "Pending"
              : record.status == 1
              ? "Open"
              : "Closed",
          sr_no: count + 1,
        };
        ticketData.push(dataValue);
      })
    );
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
      "success",
      "Record Found Successfully!",
      { error },
      res,
      200
    );
  }
};

// exports.newDashboardDataGraphs = async (req, res) => {
//   try {
//     const { chart_type, indicator } = req.body;
//     var aa = {
//       rotation: -45, // Rotate labels for better visibility
//       style: {
//         fontSize: "10px", // Adjust font size to fit more labels
//       },
//       staggerLines: 1, // Stagger labels to avoid overlap
//     };

//     var startDate = req.body.start_date
//       ? req.body.start_date + " " + "00:00:00.001"
//       : "";
//     const lastDateOfMonth = endOfMonth(new Date(req.body.end_date));
//     const formattedLastDateOfMonth = format(lastDateOfMonth, "yyyy-MM-dd");
//     var endDate = formattedLastDateOfMonth + " 11:59:59.001";

//     if (req.body.start_date == req.body.end_date) {
//       const lastDateOfMonth = endOfMonth(new Date(req.body.end_date));
//       const formattedLastDateOfMonth = format(lastDateOfMonth, "yyyy-MM-dd");
//       var endDate = formattedLastDateOfMonth + " 11:59:59.001";
//     }

//     var DateFilter =
//       startDate && endDate
//         ? `and "fs"."createdAt" between '${startDate}' and '${endDate}'`
//         : "";

//     var initialGraphData = [
//       {
//         chart: {
//           type: "column",
//         },
//         title: {
//           text: "Title of the graph",
//         },
//         subtitle: {
//           text: "sub title if needed",
//         },
//         xAxis: {
//           categories: ["USA", "China", "Brazil", "EU", "Argentina", "India"],
//           crosshair: true,
//           accessibility: {
//             description: "Countries",
//           },
//         },
//         yAxis: {
//           min: 0,
//           title: {
//             text: "1000 metric tons (MT)",
//           },
//         },
//         tooltip: {
//           valueSuffix: " (1000 MT)",
//         },
//         plotOptions: {
//           column: {
//             pointPadding: 0.2,
//             borderWidth: 0,
//           },
//         },
//         series: [
//           {
//             name: "Corn",
//             data: [387749, 280000, 129000, 64300, 54000, 34300],
//           },
//           {
//             name: "Wheat",
//             data: [45321, 140000, 10000, 140500, 19500, 113500],
//           },
//         ],
//         exporting: {
//           chartOptions: {
//             chart: {
//               height: 800,
//               width: 1200,
//             },
//           },
//         },
//         credits: {
//           enabled: false,
//         },
//       }
//     ];
//     // var transformedData = { districts: [] };
//     var transformedData = [];

//     if (indicator.label == "Delivery Data") {
//       var eladsitrictid;
//       if (req.body.district_id && req.body.district_id.value) {
//         eladsitrictid = ` and el.district_id=${req.body.district_id.value}`;
//       } else {
//         eladsitrictid = "";
//       }

//       const TOTALdata = await Helper.getDeliveryTotalDataGraph(
//         IdDistrict,

//         sheet,
//         DateFilter,
//         startDate,
//         endDate,
//         monthsBetween,
//         eladsitrictid,

//         indicatorid,
//         req.body.sheet
//       );

//       const data = await Helper.getDeliveryDataGraph(
//         IdDistrict,
//         top_district,
//         sheet,
//         DateFilter,
//         startDate,
//         endDate,
//         monthsBetween,
//         eladsitrictid,
//         indicatorid,
//         req.body.sheet
//       );

//       TOTALdata["District"] = `Total ${data.length} `;
//       initialGraphData[0].series.push(
//         {
//           type: `${chart_type.value == "table" ? "" : chart_type.value}`,
//           name: "ELA",
//           data: [],
//           dataLabels: {
//             enabled: true,
//             format: "{point.y}",
//           },
//           visible: true,
//         },
//         {
//           type: `${chart_type.value == "table" ? "" : chart_type.value}`,
//           name: "Total number of NEW Pregnant Women registered for ANC ",
//           data: [],
//           dataLabels: {
//             enabled: true,
//             format: "{point.y}",
//           },
//           visible: true,
//         },
//         {
//           type: `${chart_type.value == "table" ? "" : chart_type.value}`,
//           name: "Out of the total NEW ANC registered, number registered within 1st trimester (within 12 weeks)",
//           data: [],
//           dataLabels: {
//             enabled: true,
//             format: "{point.y:.0f}%",
//           },
//           visible: true,
//         },
//         {
//           type: `${chart_type.value == "table" ? "" : chart_type.value}`,
//           name: "% Of1st TrimesterANC Registration Against TotalANC Regsitration",
//           data: [],
//           dataLabels: {
//             enabled: true,
//             format: "{point.y:.0f}%",
//           },
//         },

//         {
//           type: `${chart_type.value == "table" ? "" : chart_type.value}`,
//           name: "Number of PW received 4 or more ANC check ups",
//           data: [],
//           dataLabels: {
//             enabled: true,
//             format: "{point.y}",
//           },
//         },

//         {
//           type: `${chart_type.value == "table" ? "" : chart_type.value}`,
//           name: "Total number of institutional deliveries (ID)",
//           data: [],
//           dataLabels: {
//             enabled: true,
//             format: "{point.y}",
//           },
//           visible: true,
//         },
//         {
//           type: `${chart_type.value == "table" ? "" : chart_type.value}`,
//           name: "Institutional Delivery against yearly ELA",
//           data: [],
//           dataLabels: {
//             enabled: true,
//             format: "{point.y:.0f}%",
//           },
//           visible: true,
//         },

//         {
//           type: `${chart_type.value == "table" ? "" : chart_type.value}`,
//           name: "% of Institutional delivery against 4 ANC ",
//           data: [],
//           dataLabels: {
//             enabled: true,
//             format: "{point.y:.0f}%",
//           },
//         },

//       );

//       // console.log(data, "ggftyfytfy");
//       await Promise.all(
//         data.map(async (f) => {
//           initialGraphData[0].title.text = "Delivery Data";
//           initialGraphData[0].xAxis.categories.push(f.district_name);
//           if (initialGraphData[0] && initialGraphData[0].xAxis) {
//             // Check if xAxis.labels exists, if not, initialize it as an empty array
//             if (!Array.isArray(initialGraphData[0].xAxis.labels)) {
//               initialGraphData[0].xAxis.labels = {};
//             }
//             initialGraphData[0].xAxis.labels = aa;
//           }
//           initialGraphData[0].series[0].data.push(parseInt(f["ELA"]));
//           initialGraphData[0].series[1].data.push(parseInt(f["PW registered"]));
//           initialGraphData[0].series[2].data.push(parseInt(f["1st trimester (within 12 weeks)"]));
//           initialGraphData[0].series[3].data.push(parseFloat(f["% 1st trimester against PW"]));
//           initialGraphData[0].series[4].data.push(parseFloat(f["% Pw of total of ANC"]));
//           initialGraphData[0].series[5].data.push(parseFloat(f["Total number of institutional deliveries (ID)"])
//           );
//           initialGraphData[0].series[6].data.push(parseFloat(f["Institutional Delivery against yearly ELA"]) ?? 0.0
//           );
//           initialGraphData[0].series[7].data.push(parseFloat(f["% institutional against 4 anc"]) ?? 0.0);

//         })
//       );

//       if (req.body.chart_type.label == "Table") {
//         initialGraphData.forEach((table) => {
//           let tableTitle =
//             table.title.text +
//             " (" +
//             Helper.formatDate(req.body.start_date) +
//             " to " +
//             Helper.formatDate(req.body.end_date) +
//             ")";
//           let categories = table.xAxis.categories;

//           let tableData = table.series.map((series) => {
//             let rowData = {
//               category: series.name,
//             };

//             categories.forEach((category, index) => {
//               rowData[category] = series.data[index] || 0;
//             });

//             return rowData;
//           });

//           ////AAP KEY ////

//           // Create a list of district names
//           const districtNames = Object.keys(tableData[0]).filter(
//             (key) => key !== "category"
//           );

//           // Process each district
//           districtNames.forEach((district) => {
//             const districtData = {
//               name: district,
//               data: [],
//             };

//             // Process each category and calculate totals for the district
//             tableData.forEach((categoryData) => {
//               const category = categoryData.category;
//               const count = categoryData[district];

//               // Add the category and its count to the district's data
//               districtData.data.push({
//                 c_name: category,
//                 count: count, // Ensure count is a string
//               });
//             });

//             // Add the district data to transformed data
//             transformedData.push(districtData);
//           });

//           // Add Grand Total to the last index of the districts array
//           const grandTotalData = {
//             name: "Grand Total",
//             data: [],
//           };

//           // Map the Grand Total values to the same structure as the other districts
//           Object.keys(TOTALdata).forEach((category) => {
//             if (category == "District" || category == "ELA") {
//             } else {
//               grandTotalData.data.push({
//                 c_name: category,
//                 count: TOTALdata[category],
//               });
//             }
//           });

//           // Add the Grand Total to the districts array
//           transformedData.push(grandTotalData);

//           resultObject.push({
//             tableTitle: tableTitle,
//             tableFooter: TOTALdata,
//             data: tableData,
//           });
//         });
//       }

//       if (initialGraphData[0].series[0].data == "") {
//         Helper.response(
//           "Error",
//           "No data found between " +
//             req.body.start_date +
//             " to " +
//             req.body.end_date,
//           {},
//           res,
//           200
//         );
//       } else {
//         Helper.response(
//           "Success",
//           "Data found successfully",
//           { initialGraphData, resultObject, transformedData },
//           res,
//           200
//         );
//       }
//     }

//   } catch (error) {
//     console.log(error);
//     Helper.response("Error", "Unable to fetch data", error, res, 200);
//   }
// };
