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

async function testRead() {
  try {
    const snap = await db.collection('products').limit(1).get();
    console.log(`Success! Found ${snap.size} products.`);
    snap.forEach(doc => console.log(doc.id, doc.data()));
  } catch (err) {
    console.error("Error reading:", err);
  }
}

testRead();
