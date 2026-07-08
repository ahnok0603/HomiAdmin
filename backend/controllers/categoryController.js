const { db } = require('../config/firebase');
const { uploadImage } = require('../utils/uploadHelper');

const mapCategoryToAdmin = (doc) => {
  const c = doc.data();
  return {
    id: doc.id,
    name: c.name || 'Unnamed',
    description: c.slug || c.description || '',
    status: c.status || 'active',
    image: c.imageUrl || c.image_url || c.image || ''
  };
};

// Get all categories
exports.getCategories = async (req, res) => {
  try {
    const snapshot = await db.collection('roomCategories').get();
    const categories = [];
    snapshot.forEach(doc => {
      categories.push(mapCategoryToAdmin(doc));
    });
    return res.status(200).json({
      success: true,
      categories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve categories',
      error: error.message
    });
  }
};

// Get single category
exports.getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await db.collection('roomCategories').doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    return res.status(200).json({
      success: true,
      category: mapCategoryToAdmin(doc)
    });
  } catch (error) {
    console.error('Error fetching category:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve category details',
      error: error.message
    });
  }
};

// Create category
exports.createCategory = async (req, res) => {
  try {
    const { name, description, status = 'active' } = req.body;
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required'
      });
    }

    let imageUrl = 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80'; // fallback
    if (req.files && req.files.image) {
      const link = await uploadImage(req.files.image, 'categories');
      if (link) imageUrl = link;
    }

    const firestoreData = {
      name,
      slug: description ? description.toLowerCase().replace(/[^a-z0-9]+/g, '-') : name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      imageUrl: imageUrl,
      order: 1
    };

    const docRef = await db.collection('roomCategories').add(firestoreData);
    const newDoc = await docRef.get();

    return res.status(201).json({
      success: true,
      message: 'Category created successfully',
      category: mapCategoryToAdmin(newDoc)
    });
  } catch (error) {
    console.error('Error creating category:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create category',
      error: error.message
    });
  }
};

// Update category
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const docRef = db.collection('roomCategories').doc(id);
    const doc = await docRef.get();
    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    const currentData = doc.data();
    const { name, description, status } = req.body;

    let imageUrl = currentData.imageUrl || currentData.image_url || currentData.image;
    if (req.files && req.files.image) {
      const link = await uploadImage(req.files.image, 'categories');
      if (link) imageUrl = link;
    }

    const updatedData = {
      name: name || currentData.name,
      slug: description ? description.toLowerCase().replace(/[^a-z0-9]+/g, '-') : currentData.slug,
      imageUrl: imageUrl
    };

    await docRef.update(updatedData);
    const updatedDoc = await docRef.get();

    return res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      category: mapCategoryToAdmin(updatedDoc)
    });
  } catch (error) {
    console.error('Error updating category:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update category',
      error: error.message
    });
  }
};

// Delete category
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const docRef = db.collection('roomCategories').doc(id);
    const doc = await docRef.get();
    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    await docRef.delete();

    return res.status(200).json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete category',
      error: error.message
    });
  }
};
