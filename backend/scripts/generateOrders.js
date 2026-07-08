const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const firebaseProjectId = process.env.FIREBASE_PROJECT_ID;
const firebaseClientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const firebasePrivateKey = process.env.FIREBASE_PRIVATE_KEY;

if (!firebaseProjectId || !firebaseClientEmail || !firebasePrivateKey) {
  console.error("Missing Firebase configuration in backend/.env!");
  process.exit(1);
}

const privateKey = firebasePrivateKey.replace(/\\n/g, '\n');

initializeApp({
  credential: cert({
    projectId: firebaseProjectId,
    clientEmail: firebaseClientEmail,
    privateKey: privateKey,
  })
});

const db = getFirestore();

const randomDate = (start, end) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString();
};

const statuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
const paymentMethods = ['Credit Card', 'PayPal', 'Cash on Delivery'];

const firstNames = ['Nguyen', 'Tran', 'Le', 'Pham', 'Hoang', 'Huynh', 'Phan', 'Vu', 'Vo', 'Dang', 'Bui', 'Do', 'Ho', 'Ngo', 'Duong', 'Ly'];
const middleNames = ['Thi', 'Van', 'Ngoc', 'Thanh', 'Minh', 'Hoang', 'Gia', 'Bao', 'Xuan', 'Thu', 'Tuan', 'Anh', 'Huu', 'Quang', 'Hai'];
const lastNames = ['An', 'Binh', 'Chau', 'Dung', 'Ha', 'Hai', 'Khang', 'Linh', 'Mai', 'Nam', 'Nhi', 'Oanh', 'Phong', 'Quyen', 'Son', 'Tam', 'Uyen', 'Vinh', 'Yen'];

const cities = ['Ho Chi Minh', 'Ha Noi', 'Da Nang', 'Hai Phong', 'Can Tho', 'Dong Nai', 'Binh Duong'];
const streets = ['Le Loi', 'Nguyen Hue', 'Tran Hung Dao', 'Ly Tu Trong', 'Vo Van Tan', 'Cach Mang Thang 8', 'Dien Bien Phu', 'Hai Ba Trung', 'Nguyen Thi Minh Khai', 'Le Duan'];

const mockProducts = [
  { id: 'prod_nordic_sofa', name: 'Nordic Velvet Sofa', price: 899, image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80' },
  { id: 'prod_lounge_chair', name: 'Classic Leather Lounge Chair', price: 1299, image: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=800&q=80' },
  { id: 'prod_dining_table', name: 'Minimalist Oak Dining Table', price: 649, image: 'https://images.unsplash.com/photo-1617806118233-18e1db207f62?auto=format&fit=crop&w=800&q=80' },
  { id: 'prod_office_desk', name: 'Apex Standing Desk', price: 499, image: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=800&q=80' }
];

async function generateOrders() {
  console.log('Cleaning up old orders...');
  const oldOrders = await db.collection('orders').get();
  let deleteBatch = db.batch();
  oldOrders.forEach(doc => {
    deleteBatch.delete(doc.ref);
  });
  await deleteBatch.commit();
  console.log('Old orders deleted.');

  console.log('Fetching existing products...');
  let products = [...mockProducts];
  try {
    const prodSnapshot = await db.collection('products').limit(10).get();
    if (!prodSnapshot.empty) {
      products = prodSnapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name,
        price: doc.data().price,
        image: doc.data().images?.[0] || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80'
      }));
    }
  } catch (e) {
    console.log('Could not fetch products, using mocks');
  }

  console.log('Generating 50 unaccented VN orders...');
  let currentBatch = db.batch();
  
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));

  for (let i = 0; i < 50; i++) {
    const docRef = db.collection('orders').doc(`vn_ord_unaccent_${Date.now()}_${i}`);
    
    const fName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const mName = middleNames[Math.floor(Math.random() * middleNames.length)];
    const lName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const fullName = `${fName} ${mName} ${lName}`;
    const emailPrefix = `${fName}${mName}${lName}`.toLowerCase().replace(/\\s/g, '');
    
    const numItems = Math.floor(Math.random() * 3) + 1;
    let items = [];
    let totalPrice = 0;
    
    for (let j = 0; j < numItems; j++) {
      const p = products[Math.floor(Math.random() * products.length)];
      const qty = Math.floor(Math.random() * 2) + 1;
      items.push({
        id: p.id,
        name: p.name,
        price: p.price,
        quantity: qty,
        image: p.image
      });
      totalPrice += (p.price * qty);
    }
    
    const shippingFee = Math.floor(Math.random() * 50) + 20;
    totalPrice += shippingFee;

    const orderDate = randomDate(thirtyDaysAgo, now);
    
    let status = statuses[Math.floor(Math.random() * statuses.length)];
    if (new Date(orderDate) < new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000)) {
        status = 'Delivered';
    }

    const orderData = {
      customerName: fullName,
      customerEmail: `${emailPrefix}${Math.floor(Math.random() * 99)}@gmail.com`,
      phone: `09${Math.floor(Math.random() * 90000000) + 10000000}`,
      shippingAddress: `${Math.floor(Math.random() * 300) + 1} ${streets[Math.floor(Math.random() * streets.length)]}, ${cities[Math.floor(Math.random() * cities.length)]}`,
      paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
      items: items,
      totalPrice: parseFloat(totalPrice.toFixed(2)),
      shippingFee: shippingFee,
      voucher: Math.random() > 0.8 ? { code: 'DISCOUNT20', discount: 20 } : null,
      orderDate: orderDate,
      status: status
    };

    currentBatch.set(docRef, orderData);
  }

  await currentBatch.commit();
  console.log('50 unaccented VN orders successfully generated and pushed to Firestore!');
  process.exit(0);
}

generateOrders().catch(console.error);
