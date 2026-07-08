const { db } = require('../config/firebase');

// Get all orders
exports.getOrders = async (req, res) => {
  try {
    const { status, search } = req.query;
    const snapshot = await db.collection('orders').get();
    let orders = [];

    snapshot.forEach(doc => {
      orders.push({ id: doc.id, ...doc.data() });
    });

    // 1. Status Filter
    if (status) {
      orders = orders.filter(o => o.status === status);
    }

    // 2. Search Filter (by customerName, customerEmail, phone, or order ID)
    if (search) {
      const q = search.toLowerCase();
      orders = orders.filter(o => 
        o.id.toLowerCase().includes(q) ||
        (o.customerName && o.customerName.toLowerCase().includes(q)) ||
        (o.customerEmail && o.customerEmail.toLowerCase().includes(q)) ||
        (o.phone && o.phone.includes(q))
      );
    }

    // Sort by order date descending
    orders.sort((a, b) => new Date(b.orderDate || 0) - new Date(a.orderDate || 0));

    return res.status(200).json({
      success: true,
      orders
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve orders',
      error: error.message
    });
  }
};

// Get single order details
exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await db.collection('orders').doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    return res.status(200).json({
      success: true,
      order: { id: doc.id, ...doc.data() }
    });
  } catch (error) {
    console.error('Error fetching order details:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve order details',
      error: error.message
    });
  }
};

// Change order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // Pending, Confirmed, Shipping, Delivered, Cancelled

    const validStatuses = ['Pending', 'Confirmed', 'Shipping', 'Delivered', 'Cancelled'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    const docRef = db.collection('orders').doc(id);
    const doc = await docRef.get();
    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    await docRef.update({ status });

    return res.status(200).json({
      success: true,
      message: `Order status updated to ${status} successfully`
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update order status',
      error: error.message
    });
  }
};

// Generate printable invoice HTML
exports.getInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await db.collection('orders').doc(id).get();
    if (!doc.exists) {
      return res.status(404).send('<h1>Order not found</h1>');
    }

    const order = doc.data();
    order.id = doc.id;

    // Fetch company settings for invoice header
    const settingsDoc = await db.collection('settings').doc('website_settings').get();
    const settings = settingsDoc.exists ? settingsDoc.data() : {
      companyName: 'Homi Furniture',
      contactInfo: '123 Luxury Avenue, Design District',
      email: 'contact@homi.com',
      phone: '+1 (555) 019-2834'
    };

    const itemsRows = order.items.map((item, idx) => `
      <tr>
        <td>${idx + 1}</td>
        <td>
          <strong>${item.name}</strong>
        </td>
        <td align="right">$${item.price.toFixed(2)}</td>
        <td align="center">${item.quantity}</td>
        <td align="right">$${(item.price * item.quantity).toFixed(2)}</td>
      </tr>
    `).join('');

    const discountAmount = order.voucher ? (order.totalPrice * (order.voucher.discount / 100)) : 0;
    const subtotal = order.totalPrice + discountAmount;

    const invoiceHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Invoice #${order.id}</title>
        <style>
          body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            color: #333;
            margin: 0;
            padding: 40px;
            font-size: 14px;
            line-height: 1.5;
          }
          .invoice-box {
            max-width: 800px;
            margin: auto;
          }
          .header-table, .details-table, .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
          }
          .header-table td {
            vertical-align: top;
          }
          .company-logo {
            font-size: 28px;
            font-weight: bold;
            color: #8B5E3C;
            text-transform: uppercase;
            letter-spacing: 2px;
          }
          .invoice-title {
            font-size: 24px;
            text-align: right;
            color: #555;
            text-transform: uppercase;
          }
          .info-block {
            margin-top: 10px;
          }
          .info-block h3 {
            margin: 0 0 5px 0;
            font-size: 14px;
            color: #8B5E3C;
            text-transform: uppercase;
            border-bottom: 1px solid #eee;
            padding-bottom: 5px;
          }
          .items-table th {
            background: #F5F1EB;
            border: 1px solid #ddd;
            padding: 10px;
            font-weight: bold;
            text-align: left;
            text-transform: uppercase;
            font-size: 12px;
            color: #555;
          }
          .items-table td {
            border: 1px solid #eee;
            padding: 10px;
          }
          .totals-table {
            width: 300px;
            float: right;
            margin-top: 20px;
            border-collapse: collapse;
          }
          .totals-table td {
            padding: 6px 10px;
          }
          .totals-table tr.grand-total {
            font-weight: bold;
            font-size: 16px;
            background: #F5F1EB;
            color: #8B5E3C;
            border-top: 2px solid #8B5E3C;
          }
          .footer {
            margin-top: 100px;
            text-align: center;
            font-size: 12px;
            color: #777;
            border-top: 1px solid #eee;
            padding-top: 20px;
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
            margin-bottom: 20px;
          }
          @media print {
            .print-btn {
              display: none;
            }
            body {
              padding: 0;
            }
          }
        </style>
      </head>
      <body>
        <div class="invoice-box">
          <button class="print-btn" onclick="window.print()">Print Invoice</button>
          
          <table class="header-table">
            <tr>
              <td>
                <div class="company-logo">${settings.companyName}</div>
                <div class="info-block">
                  ${settings.contactInfo}<br>
                  Phone: ${settings.phone}<br>
                  Email: ${settings.email}
                </div>
              </td>
              <td align="right">
                <div class="invoice-title">Invoice</div>
                <div class="info-block">
                  <strong>Invoice No:</strong> INV-${order.id.toUpperCase()}<br>
                  <strong>Date:</strong> ${new Date(order.orderDate).toLocaleDateString()}<br>
                  <strong>Status:</strong> ${order.status}<br>
                  <strong>Payment Method:</strong> ${order.paymentMethod}
                </div>
              </td>
            </tr>
          </table>

          <table class="details-table">
            <tr>
              <td width="50%" valign="top">
                <div class="info-block" style="margin-right: 20px;">
                  <h3>Bill To</h3>
                  <strong>Name:</strong> ${order.customerName}<br>
                  <strong>Email:</strong> ${order.customerEmail}<br>
                  <strong>Phone:</strong> ${order.phone || 'N/A'}
                </div>
              </td>
              <td width="50%" valign="top">
                <div class="info-block">
                  <h3>Shipping Address</h3>
                  ${order.shippingAddress.replace(/\n/g, '<br>')}
                </div>
              </td>
            </tr>
          </table>

          <table class="items-table">
            <thead>
              <tr>
                <th width="5%">#</th>
                <th>Item Description</th>
                <th align="right" width="15%">Unit Price</th>
                <th align="center" width="10%">Qty</th>
                <th align="right" width="15%">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsRows}
            </tbody>
          </table>

          <table class="totals-table">
            <tr>
              <td>Subtotal:</td>
              <td align="right">$${subtotal.toFixed(2)}</td>
            </tr>
            ${order.voucher ? `
            <tr>
              <td>Discount (${order.voucher.code}):</td>
              <td align="right">-$${discountAmount.toFixed(2)}</td>
            </tr>
            ` : ''}
            <tr>
              <td>Shipping Fee:</td>
              <td align="right">$${(order.shippingFee || 0).toFixed(2)}</td>
            </tr>
            <tr class="grand-total">
              <td>Grand Total:</td>
              <td align="right">$${(order.totalPrice + (order.shippingFee || 0)).toFixed(2)}</td>
            </tr>
          </table>

          <div style="clear: both;"></div>

          <div class="footer">
            Thank you for shopping with ${settings.companyName}!<br>
            If you have any questions about this invoice, please contact us.
          </div>
        </div>
      </body>
      </html>
    `;

    return res.status(200).send(invoiceHTML);
  } catch (error) {
    console.error('Error generating invoice:', error);
    return res.status(500).send('<h1>Internal Server Error while generating invoice</h1>');
  }
};
