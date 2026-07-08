const { db } = require('../config/firebase');
const { uploadImage } = require('../utils/uploadHelper');

// Get all rooms
exports.getRooms = async (req, res) => {
  try {
    const snapshot = await db.collection('rooms').get();
    const rooms = [];
    snapshot.forEach(doc => {
      rooms.push({ id: doc.id, ...doc.data() });
    });
    return res.status(200).json({
      success: true,
      rooms
    });
  } catch (error) {
    console.error('Error fetching rooms:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve rooms',
      error: error.message
    });
  }
};

// Create room inspiration
exports.createRoom = async (req, res) => {
  try {
    const { name, description, products, totalPrice } = req.body;
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Room name is required'
      });
    }

    let coverImage = 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1200&q=80';
    if (req.files && req.files.coverImage) {
      const link = await uploadImage(req.files.coverImage, 'rooms');
      if (link) coverImage = link;
    }

    // Parse products (expected as array of product IDs)
    let productsArray = [];
    if (products) {
      try {
        productsArray = Array.isArray(products) ? products : JSON.parse(products);
      } catch (e) {
        // Fallback if sent as comma-separated string
        productsArray = typeof products === 'string' ? products.split(',').map(p => p.trim()) : [];
      }
    }

    const roomData = {
      name,
      description: description || '',
      coverImage,
      products: productsArray,
      totalPrice: totalPrice ? parseFloat(totalPrice) : 0
    };

    const docRef = await db.collection('rooms').add(roomData);

    return res.status(201).json({
      success: true,
      message: 'Room inspiration created successfully',
      room: { id: docRef.id, ...roomData }
    });
  } catch (error) {
    console.error('Error creating room:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create room inspiration',
      error: error.message
    });
  }
};

// Update room inspiration
exports.updateRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await db.collection('rooms').doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    const currentData = doc.data();
    const { name, description, products, totalPrice } = req.body;

    let coverImage = currentData.coverImage;
    if (req.files && req.files.coverImage) {
      const link = await uploadImage(req.files.coverImage, 'rooms');
      if (link) coverImage = link;
    }

    let productsArray = currentData.products;
    if (products) {
      try {
        productsArray = Array.isArray(products) ? products : JSON.parse(products);
      } catch (e) {
        productsArray = typeof products === 'string' ? products.split(',').map(p => p.trim()) : currentData.products;
      }
    }

    const updatedData = {
      name: name || currentData.name,
      description: description !== undefined ? description : currentData.description,
      coverImage,
      products: productsArray,
      totalPrice: totalPrice !== undefined ? parseFloat(totalPrice) : currentData.totalPrice
    };

    await db.collection('rooms').doc(id).update(updatedData);

    return res.status(200).json({
      success: true,
      message: 'Room inspiration updated successfully',
      room: { id, ...updatedData }
    });
  } catch (error) {
    console.error('Error updating room:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update room inspiration',
      error: error.message
    });
  }
};

// Delete room inspiration
exports.deleteRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const docRef = db.collection('rooms').doc(id);
    const doc = await docRef.get();
    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    await docRef.delete();

    return res.status(200).json({
      success: true,
      message: 'Room inspiration deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting room:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete room inspiration',
      error: error.message
    });
  }
};
