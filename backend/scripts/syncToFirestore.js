const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { getAuth } = require('firebase-admin/auth');
const fs = require('fs');
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
  }),
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || `${firebaseProjectId}.appspot.com`
});

const db = getFirestore();
const DATA_DIR = path.join(__dirname, '..', 'data');

async function syncCollection(collectionName) {
  const filePath = path.join(DATA_DIR, `${collectionName}.json`);
  if (!fs.existsSync(filePath)) {
    console.log(`File ${collectionName}.json not found. Skipping.`);
    return;
  }

  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const batchSize = 100; // Batch limit for Firestore is 500, we'll use 100
  let batches = [];
  let currentBatch = db.batch();
  let count = 0;

  for (const item of data) {
    const docId = item.id || db.collection(collectionName).doc().id;
    const docRef = db.collection(collectionName).doc(docId);
    
    currentBatch.set(docRef, item);
    count++;

    if (count % batchSize === 0) {
      batches.push(currentBatch);
      currentBatch = db.batch();
    }
  }

  if (count % batchSize !== 0) {
    batches.push(currentBatch);
  }

  try {
    for (let i = 0; i < batches.length; i++) {
      await batches[i].commit();
    }
    console.log(`✅ Successfully synced ${count} items to collection '${collectionName}'`);
  } catch (error) {
    console.error(`❌ Error syncing collection '${collectionName}':`, error);
  }
}

async function syncAuthUsers() {
  const filePath = path.join(DATA_DIR, `users.json`);
  if (!fs.existsSync(filePath)) return;

  const users = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  console.log(`Syncing ${users.length} users to Firebase Auth...`);
  
  for (const user of users) {
    try {
      await getAuth().getUserByEmail(user.email);
      console.log(`User ${user.email} already exists in Auth. Skipping.`);
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        try {
          await getAuth().createUser({
            uid: user.id,
            email: user.email,
            password: 'password123', // Default password for synced users
            displayName: user.name,
            photoURL: user.avatar || '',
          });
          console.log(`Created Auth user: ${user.email} (Password: password123)`);
        } catch (createError) {
          console.error(`Error creating Auth user ${user.email}:`, createError.message);
        }
      } else {
        console.error(`Error checking user ${user.email}:`, error.message);
      }
    }
  }

  // Ensure our mock admin user exists in real Auth for testing
  try {
    await getAuth().getUserByEmail('admin@homi.com');
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      await getAuth().createUser({
        uid: 'mock_admin',
        email: 'admin@homi.com',
        password: 'admin123',
        displayName: 'Homi Admin',
      });
      console.log(`Created Default Admin: admin@homi.com / admin123`);
    }
  }
}

async function runSync() {
  console.log("Starting data synchronization to Firestore...");
  const collections = [
    'users', 'products', 'categories', 'orders', 'reviews',
    'banners', 'rooms', 'notifications', 'settings', 'searchHistory'
  ];

  for (const col of collections) {
    await syncCollection(col);
  }

  await syncAuthUsers();

  console.log("🎉 All synchronization completed!");
  process.exit(0);
}

runSync();
