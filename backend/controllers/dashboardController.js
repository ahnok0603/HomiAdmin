const { db } = require('../config/firebase');

exports.getStats = async (req, res) => {
  try {
    // Fetch all collections in parallel
    const [usersSnap, productsSnap, categoriesSnap, ordersSnap] = await Promise.all([
      db.collection('users').get(),
      db.collection('products').get(),
      db.collection('roomCategories').get(), // Use roomCategories!
      db.collection('orders').get()
    ]);

    const totalUsers = usersSnap.size || 0;
    const totalProducts = productsSnap.size || 0;
    const totalCategories = categoriesSnap.size || 0;
    const totalOrders = ordersSnap.size || 0;

    let pendingOrders = 0;
    let completedOrders = 0;
    let revenue = 0;
    const orders = [];

    // Monthly revenue chart data (initialize with 6 recent months)
    const monthlyRev = {};
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Default last 6 months for chart display
    const currentMonthIdx = new Date().getMonth();
    const chartLabels = [];
    for (let i = 5; i >= 0; i--) {
      const idx = (currentMonthIdx - i + 12) % 12;
      chartLabels.push(months[idx]);
      monthlyRev[months[idx]] = 0;
    }

    if (ordersSnap && !ordersSnap.empty) {
      ordersSnap.forEach(doc => {
        const order = doc.data();
        order.id = doc.id;
        orders.push(order);

        if (order.status === 'Pending') {
          pendingOrders++;
        } else if (order.status === 'Delivered') {
          completedOrders++;
          revenue += order.totalPrice || 0;

          // Chart calculations
          if (order.orderDate) {
            const date = new Date(order.orderDate);
            const mName = months[date.getMonth()];
            if (monthlyRev[mName] !== undefined) {
              monthlyRev[mName] += order.totalPrice || 0;
            }
          }
        }
      });
    }

    // Sort orders by date descending for latest orders
    const latestOrders = orders
      .sort((a, b) => new Date(b.orderDate || 0) - new Date(a.orderDate || 0))
      .slice(0, 5);

    // Monthly Revenue Chart Array
    const chartData = chartLabels.map(label => monthlyRev[label]);

    // Low stock products (quantity <= 5)
    const products = [];
    productsSnap.forEach(doc => {
      const p = doc.data();
      p.id = doc.id;
      // Map to frontend expectation for Dashboard
      products.push({
        id: p.id,
        name: p.name || 'Unnamed',
        image: p.imageUrls?.[0] || p.image_urls?.[0] || p.images?.[0] || '',
        price: p.price || p.product_price || 0,
        quantity: p.stockQuantity || p.stock_quantity || p.quantity || 0,
        status: p.stockStatus === 'in_stock' || p.stock_status === 'in_stock' || p.status === 'active' ? 'active' : 'inactive',
      });
    });

    const lowStockProducts = products
      .filter(p => p.quantity <= 5 && p.status === 'active')
      .slice(0, 5);

    // Best Selling Products (mocked / calculated based on orders)
    const productSales = {};
    orders.forEach(o => {
      if (o.status === 'Delivered' && o.items) {
        o.items.forEach(item => {
          productSales[item.id] = (productSales[item.id] || 0) + (item.quantity || 1);
        });
      }
    });

    const bestSellingProducts = products
      .map(p => ({
        ...p,
        salesCount: productSales[p.id] || 0
      }))
      .sort((a, b) => b.salesCount - a.salesCount)
      .slice(0, 5);

    return res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalProducts,
        totalCategories,
        totalOrders,
        pendingOrders,
        completedOrders,
        revenue,
        chartLabels,
        chartData,
        latestOrders,
        bestSellingProducts,
        lowStockProducts
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve dashboard statistics',
      error: error.message
    });
  }
};
