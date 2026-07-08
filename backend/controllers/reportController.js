const { db } = require('../config/firebase');

// Generate report data helper
const generateReportStats = async (type) => {
  const ordersSnap = await db.collection('orders').get();
  const orders = [];
  ordersSnap.forEach(doc => {
    const o = doc.data();
    if (o.status === 'Delivered') {
      orders.push(o);
    }
  });

  const now = new Date();
  let totalRevenue = 0;
  let ordersCount = 0;
  let itemsCount = 0;
  
  const chartLabels = [];
  const chartValues = [];
  const chartOrdersCount = [];

  if (type === 'daily') {
    // Last 7 days, daily breakdown
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dateStr = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      chartLabels.push(dateStr);
      
      // Filter orders on this day
      const dayOrders = orders.filter(o => {
        const oDate = new Date(o.orderDate);
        return oDate.toDateString() === d.toDateString();
      });

      const rev = dayOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
      chartValues.push(rev);
      chartOrdersCount.push(dayOrders.length);
      
      totalRevenue += rev;
      ordersCount += dayOrders.length;
      itemsCount += dayOrders.reduce((sum, o) => sum + (o.items?.reduce((iSum, item) => iSum + item.quantity, 0) || 0), 0);
    }
  } else if (type === 'weekly') {
    // Last 4 weeks, weekly breakdown
    for (let i = 3; i >= 0; i--) {
      const label = `Week -${i}`;
      chartLabels.push(label);
      
      const start = new Date();
      start.setDate(now.getDate() - (i + 1) * 7);
      const end = new Date();
      end.setDate(now.getDate() - i * 7);

      const weekOrders = orders.filter(o => {
        const oDate = new Date(o.orderDate);
        return oDate >= start && oDate < end;
      });

      const rev = weekOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
      chartValues.push(rev);
      chartOrdersCount.push(weekOrders.length);

      totalRevenue += rev;
      ordersCount += weekOrders.length;
      itemsCount += weekOrders.reduce((sum, o) => sum + (o.items?.reduce((iSum, item) => iSum + item.quantity, 0) || 0), 0);
    }
  } else if (type === 'monthly') {
    // Last 6 months, monthly breakdown
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(now.getMonth() - i);
      const mLabel = months[d.getMonth()] + ' ' + d.getFullYear().toString().substring(2);
      chartLabels.push(mLabel);

      const monthOrders = orders.filter(o => {
        const oDate = new Date(o.orderDate);
        return oDate.getMonth() === d.getMonth() && oDate.getFullYear() === d.getFullYear();
      });

      const rev = monthOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
      chartValues.push(rev);
      chartOrdersCount.push(monthOrders.length);

      totalRevenue += rev;
      ordersCount += monthOrders.length;
      itemsCount += monthOrders.reduce((sum, o) => sum + (o.items?.reduce((iSum, item) => iSum + item.quantity, 0) || 0), 0);
    }
  } else {
    // yearly - last 3 years
    for (let i = 2; i >= 0; i--) {
      const yr = now.getFullYear() - i;
      chartLabels.push(yr.toString());

      const yearOrders = orders.filter(o => {
        const oDate = new Date(o.orderDate);
        return oDate.getFullYear() === yr;
      });

      const rev = yearOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
      chartValues.push(rev);
      chartOrdersCount.push(yearOrders.length);

      totalRevenue += rev;
      ordersCount += yearOrders.length;
      itemsCount += yearOrders.reduce((sum, o) => sum + (o.items?.reduce((iSum, item) => iSum + item.quantity, 0) || 0), 0);
    }
  }

  // Calculate average order value
  const avgOrderValue = ordersCount > 0 ? (totalRevenue / ordersCount) : 0;

  return {
    totalRevenue,
    ordersCount,
    itemsCount,
    avgOrderValue,
    chartLabels,
    chartValues,
    chartOrdersCount
  };
};

// API endpoint to fetch report statistics
exports.getReport = async (req, res) => {
  try {
    const { type = 'monthly' } = req.query; // daily, weekly, monthly, yearly
    const data = await generateReportStats(type);
    return res.status(200).json({
      success: true,
      report: data
    });
  } catch (error) {
    console.error('Error generating report:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate report statistics',
      error: error.message
    });
  }
};

// Export report as Excel/CSV
exports.exportExcel = async (req, res) => {
  try {
    const { type = 'monthly' } = req.query;
    const data = await generateReportStats(type);

    let csvContent = `Report Type,${type.toUpperCase()}\n`;
    csvContent += `Generated Date,${new Date().toLocaleString()}\n\n`;
    csvContent += `Summary Metrics\n`;
    csvContent += `Total Revenue,Orders Count,Items Sold,Avg Order Value\n`;
    csvContent += `$${data.totalRevenue.toFixed(2)},${data.ordersCount},${data.itemsCount},$${data.avgOrderValue.toFixed(2)}\n\n`;
    
    csvContent += `Detailed Chart Breakdown\n`;
    csvContent += `Timeframe,Revenue ($),Orders count\n`;
    
    for (let i = 0; i < data.chartLabels.length; i++) {
      csvContent += `${data.chartLabels[i]},$${data.chartValues[i].toFixed(2)},${data.chartOrdersCount[i]}\n`;
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=homi_report_${type}_${Date.now()}.csv`);
    return res.status(200).send(csvContent);
  } catch (error) {
    console.error('Error exporting report CSV:', error);
    return res.status(500).send('Error exporting CSV');
  }
};

// Export report as PDF (print-friendly HTML)
exports.exportPDF = async (req, res) => {
  try {
    const { type = 'monthly' } = req.query;
    const data = await generateReportStats(type);

    const breakdownRows = data.chartLabels.map((label, idx) => `
      <tr>
        <td>${label}</td>
        <td align="right">$${data.chartValues[idx].toFixed(2)}</td>
        <td align="center">${data.chartOrdersCount[idx]}</td>
      </tr>
    `).join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Homi Sales Report - ${type.toUpperCase()}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            color: #333;
            margin: 40px;
            font-size: 14px;
          }
          .header {
            border-bottom: 2px solid #8B5E3C;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .title {
            font-size: 28px;
            color: #8B5E3C;
            margin: 0;
            text-transform: uppercase;
          }
          .subtitle {
            color: #777;
            margin-top: 5px;
          }
          .metrics {
            display: flex;
            justify-content: space-between;
            margin-bottom: 40px;
          }
          .metric-card {
            background: #F5F1EB;
            border: 1px solid #ddd;
            border-radius: 6px;
            padding: 15px;
            width: 22%;
            text-align: center;
          }
          .metric-title {
            font-size: 12px;
            color: #777;
            text-transform: uppercase;
            margin-bottom: 5px;
          }
          .metric-value {
            font-size: 20px;
            font-weight: bold;
            color: #8B5E3C;
          }
          .table-title {
            font-size: 16px;
            font-weight: bold;
            color: #333;
            margin-bottom: 15px;
            text-transform: uppercase;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          th {
            background: #F5F1EB;
            border: 1px solid #ddd;
            padding: 10px;
            font-weight: bold;
            text-align: left;
          }
          td {
            border: 1px solid #eee;
            padding: 10px;
          }
          .footer {
            margin-top: 80px;
            border-top: 1px solid #eee;
            padding-top: 20px;
            text-align: center;
            font-size: 12px;
            color: #777;
          }
          .print-btn {
            background: #8B5E3C;
            color: #fff;
            border: none;
            padding: 10px 20px;
            font-size: 14px;
            border-radius: 4px;
            cursor: pointer;
            float: right;
          }
          @media print {
            .print-btn {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <button class="print-btn" onclick="window.print()">Print PDF</button>
        <div class="header">
          <div class="title">Homi Admin Sales Report</div>
          <div class="subtitle">Report Type: ${type.toUpperCase()} | Generated on: ${new Date().toLocaleString()}</div>
        </div>

        <div class="metrics">
          <div class="metric-card">
            <div class="metric-title">Total Revenue</div>
            <div class="metric-value">$${data.totalRevenue.toFixed(2)}</div>
          </div>
          <div class="metric-card">
            <div class="metric-title">Orders Processed</div>
            <div class="metric-value">${data.ordersCount}</div>
          </div>
          <div class="metric-card">
            <div class="metric-title">Items Sold</div>
            <div class="metric-value">${data.itemsCount}</div>
          </div>
          <div class="metric-card">
            <div class="metric-title">Avg Order Value</div>
            <div class="metric-value">$${data.avgOrderValue.toFixed(2)}</div>
          </div>
        </div>

        <div class="table-title">Performance breakdown</div>
        <table>
          <thead>
            <tr>
              <th>Time Period / Interval</th>
              <th align="right">Revenue</th>
              <th align="center">Orders Completed</th>
            </tr>
          </thead>
          <tbody>
            ${breakdownRows}
          </tbody>
        </table>

        <div class="footer">
          Confidential Homi Administrative Report. Keep secured.
        </div>
      </body>
      </html>
    `;

    return res.status(200).send(htmlContent);
  } catch (error) {
    console.error('Error generating PDF report:', error);
    return res.status(500).send('Error generating report PDF');
  }
};
