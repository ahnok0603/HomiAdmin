const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');

initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: privateKey,
  })
});

const db = getFirestore();

async function checkSchema() {
  const collections = ['users', 'banners', 'orders', 'categories', 'roomCategories'];
  for (const col of collections) {
    try {
      const snap = await db.collection(col).limit(1).get();
      if (snap.empty) {
        console.log(`Collection '${col}' is empty or does not exist.`);
      } else {
        console.log(`\n--- Schema for '${col}' ---`);
        snap.forEach(doc => console.log(doc.id, doc.data()));
      }
    } catch (e) {
      console.log(`Error reading '${col}':`, e.message);
    }
  }
}

checkSchema();
