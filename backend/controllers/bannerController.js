const { db } = require('../config/firebase');
const { uploadImage } = require('../utils/uploadHelper');

const mapBannerToAdmin = (doc) => {
  const b = doc.data();
  return {
    id: doc.id,
    title: b.title || 'Untitled Banner',
    link: b.linkUrl || b.link || '',
    status: b.isActive ? 'active' : 'inactive',
    image: b.imageUrl || b.image || ''
  };
};

// Get all banners
exports.getBanners = async (req, res) => {
  try {
    const snapshot = await db.collection('banners').get();
    const banners = [];
    snapshot.forEach(doc => {
      banners.push(mapBannerToAdmin(doc));
    });
    return res.status(200).json({
      success: true,
      banners
    });
  } catch (error) {
    console.error('Error fetching banners:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve banners',
      error: error.message
    });
  }
};

// Create banner
exports.createBanner = async (req, res) => {
  try {
    const { title, link = '', status = 'active' } = req.body;
    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Banner title is required'
      });
    }

    let imageUrl = 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80';
    if (req.files && req.files.image) {
      const linkUrl = await uploadImage(req.files.image, 'banners');
      if (linkUrl) imageUrl = linkUrl;
    }

    const firestoreData = {
      title,
      linkUrl: link,
      isActive: status === 'active',
      imageUrl: imageUrl,
      textColor: '#1A1A1A',
      bgColor: '#F5F5F0'
    };

    const docRef = await db.collection('banners').add(firestoreData);
    const newDoc = await docRef.get();

    return res.status(201).json({
      success: true,
      message: 'Banner created successfully',
      banner: mapBannerToAdmin(newDoc)
    });
  } catch (error) {
    console.error('Error creating banner:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create banner',
      error: error.message
    });
  }
};

// Update banner
exports.updateBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const docRef = db.collection('banners').doc(id);
    const doc = await docRef.get();
    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Banner not found'
      });
    }

    const currentData = doc.data();
    const { title, link, status } = req.body;

    let imageUrl = currentData.imageUrl || currentData.image;
    if (req.files && req.files.image) {
      const linkUrl = await uploadImage(req.files.image, 'banners');
      if (linkUrl) imageUrl = linkUrl;
    }

    const updatedData = {
      title: title || currentData.title,
      linkUrl: link !== undefined ? link : currentData.linkUrl,
      isActive: status !== undefined ? status === 'active' : currentData.isActive,
      imageUrl: imageUrl
    };

    await docRef.update(updatedData);
    const updatedDoc = await docRef.get();

    return res.status(200).json({
      success: true,
      message: 'Banner updated successfully',
      banner: mapBannerToAdmin(updatedDoc)
    });
  } catch (error) {
    console.error('Error updating banner:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update banner',
      error: error.message
    });
  }
};

// Delete banner
exports.deleteBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const docRef = db.collection('banners').doc(id);
    const doc = await docRef.get();
    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Banner not found'
      });
    }

    await docRef.delete();

    return res.status(200).json({
      success: true,
      message: 'Banner deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting banner:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete banner',
      error: error.message
    });
  }
};
