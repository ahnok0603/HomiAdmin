const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

let db;
let auth;
let storage;
let isMock = false;

const firebaseProjectId = process.env.FIREBASE_PROJECT_ID;
const firebaseClientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const firebasePrivateKey = process.env.FIREBASE_PRIVATE_KEY;

if (firebaseProjectId && firebaseClientEmail && firebasePrivateKey) {
  try {
    const { initializeApp, cert } = require('firebase-admin/app');
    const { getFirestore } = require('firebase-admin/firestore');
    const { getAuth } = require('firebase-admin/auth');
    const { getStorage } = require('firebase-admin/storage');
    
    // Replace escaped newlines in private key
    const privateKey = firebasePrivateKey.replace(/\\n/g, '\n');
    
    const app = initializeApp({
      credential: cert({
        projectId: firebaseProjectId,
        clientEmail: firebaseClientEmail,
        privateKey: privateKey,
      }),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET || `${firebaseProjectId}.appspot.com`
    });

    db = getFirestore(app);
    auth = getAuth(app);
    storage = getStorage(app);
    console.log('Firebase Admin SDK initialized successfully with real credentials.');
  } catch (error) {
    console.error('Error initializing real Firebase Admin SDK, falling back to mock database:', error);
    setupMockDb();
  }
} else {
  console.log('Firebase credentials not set in environment. Falling back to local mock JSON database.');
  setupMockDb();
}

function setupMockDb() {
  isMock = true;
  const DATA_DIR = path.join(__dirname, '..', 'data');
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  // Create initial empty files if they don't exist
  const collections = [
    'users', 'products', 'categories', 'orders', 'reviews',
    'banners', 'rooms', 'notifications', 'settings', 'searchHistory'
  ];

  collections.forEach(col => {
    const filePath = path.join(DATA_DIR, `${col}.json`);
    if (!fs.existsSync(filePath)) {
      // Seed initial data for a professional look
      let initialData = [];
      if (col === 'settings') {
        initialData = [{
          id: 'website_settings',
          companyName: 'Homi Furniture',
          logo: '/logo.png',
          contactInfo: '123 Luxury Avenue, Design District',
          email: 'contact@homi.com',
          phone: '+1 (555) 019-2834',
          socialLinks: {
            facebook: 'https://facebook.com/homi',
            instagram: 'https://instagram.com/homi',
            twitter: 'https://twitter.com/homi'
          },
          about: 'Homi is an AI-powered premium furniture shopping experience designed to match stunning aesthetics with smart spatial intelligence.',
          privacyPolicy: 'Your privacy is important to us. We secure your details and never sell them to third parties.',
          terms: 'Standard terms of service apply. Deliveries take 3-7 business days depending on room selection.'
        }];
      } else if (col === 'categories') {
        initialData = [
          { id: 'cat_living', name: 'Living Room', description: 'Sofas, armchairs, coffee tables, and TV units.', image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80', status: 'active' },
          { id: 'cat_bedroom', name: 'Bedroom', description: 'Beds, wardrobes, bedside tables, and dressers.', image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80', status: 'active' },
          { id: 'cat_dining', name: 'Dining Room', description: 'Dining tables, chairs, and sideboards.', image: 'https://images.unsplash.com/photo-1617806118233-18e1db207f62?auto=format&fit=crop&w=800&q=80', status: 'active' },
          { id: 'cat_office', name: 'Office', description: 'Desks, ergonomic chairs, and bookshelves.', image: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=800&q=80', status: 'active' }
        ];
      } else if (col === 'banners') {
        initialData = [
          { id: 'ban_1', title: 'Summer Nordic Collection', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80', link: '/categories/living', status: 'active' },
          { id: 'ban_2', title: 'Smart Spaces: 20% Off Desks', image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80', link: '/categories/office', status: 'active' }
        ];
      } else if (col === 'products') {
        initialData = [
          {
            id: 'prod_nordic_sofa',
            name: 'Nordic Velvet Sofa',
            description: 'A premium 3-seater sofa with high-density foam and solid oak legs. Upholstered in spill-resistant velvet.',
            category: 'Living Room',
            price: 899,
            discount: 10,
            quantity: 15,
            images: [
              'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80',
              'https://images.unsplash.com/photo-1484101403633-562f891dc89a?auto=format&fit=crop&w=800&q=80'
            ],
            material: 'Velvet, Oak wood',
            color: 'Forest Green',
            dimensions: '220cm x 90cm x 85cm',
            rating: 4.8,
            status: 'active',
            featured: true
          },
          {
            id: 'prod_lounge_chair',
            name: 'Classic Leather Lounge Chair',
            description: 'Ergonomic lounge chair with matching ottoman. Made with top-grain leather and molded walnut plywood.',
            category: 'Living Room',
            price: 1299,
            discount: 0,
            quantity: 5,
            images: [
              'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=800&q=80'
            ],
            material: 'Leather, Walnut wood',
            color: 'Caramel Brown',
            dimensions: '85cm x 85cm x 80cm',
            rating: 4.9,
            status: 'active',
            featured: true
          },
          {
            id: 'prod_dining_table',
            name: 'Minimalist Oak Dining Table',
            description: 'Spacious dining table that fits up to 6 people. Clean lines and solid white oak construction.',
            category: 'Dining Room',
            price: 649,
            discount: 5,
            quantity: 3,
            images: [
              'https://images.unsplash.com/photo-1617806118233-18e1db207f62?auto=format&fit=crop&w=800&q=80'
            ],
            material: 'Oak wood',
            color: 'Natural Oak',
            dimensions: '180cm x 90cm x 75cm',
            rating: 4.5,
            status: 'active',
            featured: false
          },
          {
            id: 'prod_office_desk',
            name: 'Apex Standing Desk',
            description: 'Electric height adjustable desk with memory preset keys. Perfect for health-conscious smart offices.',
            category: 'Office',
            price: 499,
            discount: 0,
            quantity: 2,
            images: [
              'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=800&q=80'
            ],
            material: 'Steel, Bamboo',
            color: 'White/Bamboo',
            dimensions: '140cm x 70cm x 65-125cm',
            rating: 4.7,
            status: 'active',
            featured: false
          }
        ];
      } else if (col === 'users') {
        initialData = [
          {
            id: 'user_1',
            name: 'Alex Johnson',
            email: 'alex@example.com',
            phone: '+1 (555) 012-3456',
            address: '742 Evergreen Terrace, Springfield',
            avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
            membershipTier: 'Gold',
            createdDate: '2026-01-15T08:30:00Z',
            status: 'active'
          },
          {
            id: 'user_2',
            name: 'Sophia Smith',
            email: 'sophia@example.com',
            phone: '+1 (555) 098-7654',
            address: '10 Downing Street, London',
            avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
            membershipTier: 'Platinum',
            createdDate: '2026-02-10T14:45:00Z',
            status: 'active'
          },
          {
            id: 'user_3',
            name: 'Michael Brown',
            email: 'michael@example.com',
            phone: '+1 (555) 045-6789',
            address: '456 Oak Lane, Seattle',
            avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
            membershipTier: 'Silver',
            createdDate: '2026-03-01T10:15:00Z',
            status: 'locked'
          }
        ];
      } else if (col === 'orders') {
        initialData = [
          {
            id: 'order_1001',
            customerName: 'Alex Johnson',
            customerEmail: 'alex@example.com',
            phone: '+1 (555) 012-3456',
            shippingAddress: '742 Evergreen Terrace, Springfield',
            paymentMethod: 'Credit Card',
            items: [
              { id: 'prod_nordic_sofa', name: 'Nordic Velvet Sofa', price: 809.1, quantity: 1, image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80' }
            ],
            totalPrice: 809.1,
            shippingFee: 50,
            voucher: { code: 'WELCOME10', discount: 10 },
            orderDate: '2026-07-01T10:20:00Z',
            status: 'Delivered'
          },
          {
            id: 'order_1002',
            customerName: 'Sophia Smith',
            customerEmail: 'sophia@example.com',
            phone: '+1 (555) 098-7654',
            shippingAddress: '10 Downing Street, London',
            paymentMethod: 'PayPal',
            items: [
              { id: 'prod_lounge_chair', name: 'Classic Leather Lounge Chair', price: 1299, quantity: 1, image: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=800&q=80' },
              { id: 'prod_office_desk', name: 'Apex Standing Desk', price: 499, quantity: 1, image: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=800&q=80' }
            ],
            totalPrice: 1798,
            shippingFee: 75,
            voucher: null,
            orderDate: '2026-07-07T08:15:00Z',
            status: 'Pending'
          }
        ];
      } else if (col === 'reviews') {
        initialData = [
          {
            id: 'rev_1',
            productName: 'Nordic Velvet Sofa',
            productId: 'prod_nordic_sofa',
            userName: 'Alex Johnson',
            rating: 5,
            comment: 'Absolutely stunning! The velvet feels incredible and it is very comfortable. Super fast shipping too.',
            createdDate: '2026-07-02T11:00:00Z'
          },
          {
            id: 'rev_2',
            productName: 'Minimalist Oak Dining Table',
            productId: 'prod_dining_table',
            userName: 'Sophia Smith',
            rating: 4,
            comment: 'Very solid and beautiful oak table. Setup was easy. Highly recommend.',
            createdDate: '2026-06-28T09:30:00Z'
          }
        ];
      } else if (col === 'rooms') {
        initialData = [
          {
            id: 'room_nordic_living',
            name: 'Nordic Sanctuary Living Room',
            coverImage: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1200&q=80',
            description: 'A cozy, clean Scandinavian living room setup highlighting natural oak tones and lush forest green accents.',
            products: ['prod_nordic_sofa', 'prod_lounge_chair'],
            totalPrice: 2198
          }
        ];
      } else if (col === 'searchHistory') {
        initialData = [
          {
            id: 'sh_1',
            uploadedImage: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=200&q=80',
            recommendedProducts: [
              { id: 'prod_nordic_sofa', name: 'Nordic Velvet Sofa' },
              { id: 'prod_lounge_chair', name: 'Classic Leather Lounge Chair' }
            ],
            userName: 'Alex Johnson',
            searchTime: '2026-07-08T10:45:00Z'
          }
        ];
      } else if (col === 'notifications') {
        initialData = [
          {
            id: 'notif_1',
            title: 'Nordic Series Arrival',
            body: 'Explore our latest Scandinavian room collections now. Free home consultation.',
            sentDate: '2026-07-05T09:00:00Z',
            target: 'All Users'
          }
        ];
      }

      fs.writeFileSync(filePath, JSON.stringify(initialData, null, 2));
    }
  });

  // Mock database CRUD client
  class MockCollection {
    constructor(name) {
      this.name = name;
      this.filePath = path.join(DATA_DIR, `${name}.json`);
      this.filters = [];
      this.sorts = [];
      this.limitVal = null;
    }

    _read() {
      try {
        return JSON.parse(fs.readFileSync(this.filePath, 'utf8'));
      } catch (e) {
        return [];
      }
    }

    _write(data) {
      fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2));
    }

    where(field, operator, value) {
      const q = new MockCollection(this.name);
      q.filters = [...this.filters, { field, operator, value }];
      q.sorts = [...this.sorts];
      q.limitVal = this.limitVal;
      return q;
    }

    orderBy(field, direction = 'asc') {
      const q = new MockCollection(this.name);
      q.filters = [...this.filters];
      q.sorts = [...this.sorts, { field, direction }];
      q.limitVal = this.limitVal;
      return q;
    }

    limit(n) {
      const q = new MockCollection(this.name);
      q.filters = [...this.filters];
      q.sorts = [...this.sorts];
      q.limitVal = n;
      return q;
    }

    async get() {
      let items = this._read();
      // Apply filters
      this.filters.forEach(f => {
        items = items.filter(item => {
          let itemVal = item[f.field];
          // Handle nested object lookups (e.g., socialLinks.facebook)
          if (f.field.includes('.')) {
            const parts = f.field.split('.');
            itemVal = item;
            for (const part of parts) {
              itemVal = itemVal ? itemVal[part] : undefined;
            }
          }

          if (f.operator === '==') return itemVal == f.value;
          if (f.operator === '!=') return itemVal != f.value;
          if (f.operator === '>') return itemVal > f.value;
          if (f.operator === '<') return itemVal < f.value;
          if (f.operator === '>=') return itemVal >= f.value;
          if (f.operator === '<=') return itemVal <= f.value;
          if (f.operator === 'array-contains') return Array.isArray(itemVal) && itemVal.includes(f.value);
          return true;
        });
      });

      // Apply sorts
      this.sorts.forEach(s => {
        items.sort((a, b) => {
          let valA = a[s.field];
          let valB = b[s.field];
          if (typeof valA === 'string') {
            return s.direction === 'desc' ? valB.localeCompare(valA) : valA.localeCompare(valB);
          }
          return s.direction === 'desc' ? valB - valA : valA - valB;
        });
      });

      // Apply limit
      if (this.limitVal !== null) {
        items = items.slice(0, this.limitVal);
      }

      const docs = items.map(item => ({
        id: item.id,
        exists: true,
        data: () => item
      }));

      return {
        docs,
        size: docs.length,
        empty: docs.length === 0,
        forEach: (callback) => docs.forEach(callback)
      };
    }

    doc(id) {
      const parent = this;
      return {
        id,
        async get() {
          const items = parent._read();
          const item = items.find(x => x.id === id);
          return {
            id,
            exists: !!item,
            data: () => item
          };
        },
        async set(data, options = {}) {
          const items = parent._read();
          const idx = items.findIndex(x => x.id === id);
          let newData = { ...data, id };
          
          if (idx !== -1) {
            if (options.merge) {
              newData = { ...items[idx], ...data, id };
            }
            items[idx] = newData;
          } else {
            items.push(newData);
          }
          parent._write(items);
          return { id };
        },
        async update(data) {
          const items = parent._read();
          const idx = items.findIndex(x => x.id === id);
          if (idx !== -1) {
            items[idx] = { ...items[idx], ...data };
            parent._write(items);
            return { id };
          }
          throw new Error(`Document with id ${id} not found in ${parent.name}`);
        },
        async delete() {
          const items = parent._read();
          const filtered = items.filter(x => x.id !== id);
          parent._write(filtered);
          return { success: true };
        }
      };
    }

    async add(data) {
      const items = this._read();
      const id = `${this.name.substring(0, 3)}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      const newDoc = { ...data, id };
      items.push(newDoc);
      this._write(items);
      return { id };
    }
  }

  // Mock Database Client instance
  db = {
    collection: (name) => new MockCollection(name)
  };

  // Mock Storage Client instance
  storage = {
    bucket: () => ({
      upload: async (filePath, options) => {
        // Just mock upload, copy file to standard local public assets or return simulated public link
        const filename = path.basename(filePath);
        const publicUrl = `/uploads/${filename}`;
        console.log(`Mock file uploaded: ${filePath} -> ${publicUrl}`);
        return [{ mediaLink: publicUrl }];
      }
    })
  };

  // Mock Authentication Client instance
  auth = {
    verifyIdToken: async (token) => {
      if (token === 'mock-admin-token') {
        return { uid: 'mock_admin', email: 'admin@homi.com', name: 'Super Admin' };
      }
      throw new Error('Invalid authentication token');
    },
    createUser: async (details) => {
      const usersCol = new MockCollection('users');
      const docRef = await usersCol.add({
        name: details.displayName || 'Unnamed User',
        email: details.email,
        phone: details.phoneNumber || '',
        avatar: details.photoURL || '',
        membershipTier: 'Silver',
        createdDate: new Date().toISOString(),
        status: 'active'
      });
      return { uid: docRef.id, email: details.email };
    },
    deleteUser: async (uid) => {
      const usersCol = new MockCollection('users');
      await usersCol.doc(uid).delete();
      return { success: true };
    }
  };
}

module.exports = {
  db,
  auth,
  storage,
  isMock
};
