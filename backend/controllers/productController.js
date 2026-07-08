const { db } = require('../config/firebase');
const { uploadImage } = require('../utils/uploadHelper');

// Adapter to convert Firestore product to Admin Frontend format
const mapProductToAdmin = (doc) => {
  const p = doc.data();
  
  // Format dimensions object to string if it exists
  let dimsString = '';
  if (p.dimensions && typeof p.dimensions === 'object') {
    dimsString = `${p.dimensions.widthInch || 0}W x ${p.dimensions.depthInch || 0}D x ${p.dimensions.heightInch || 0}H inch`;
  } else if (typeof p.dimensions === 'string') {
    dimsString = p.dimensions;
  }

  // Extract color name from colorVariants if available
  let colorString = '';
  if (p.colorVariants && p.colorVariants.length > 0) {
    colorString = p.colorVariants.map(cv => cv.name).join(', ');
  } else if (p.colors && typeof p.colors === 'string') {
    colorString = p.colors;
  }

  return {
    id: doc.id,
    name: p.name || 'Unnamed Product',
    description: p.description || '',
    category: p.subCategoryId || p.sub_category_id || p.category || 'Uncategorized',
    price: p.price || p.product_price || 0,
    discount: p.discountPercent || p.discount_percent || p.discount || 0,
    quantity: p.stockQuantity || p.stock_quantity || p.quantity || 0,
    material: p.materials ? (Array.isArray(p.materials) ? p.materials.join(', ') : p.materials) : '',
    color: colorString,
    dimensions: dimsString,
    rating: p.rating || 5,
    status: (p.stockStatus === 'in_stock' || p.stock_status === 'in_stock' || p.status === 'active') ? 'active' : 'inactive',
    featured: p.isBestSeller || p.is_best_seller || p.featured || false,
    images: p.imageUrls || p.image_urls || p.images || []
  };
};

// Get all products
exports.getProducts = async (req, res) => {
  try {
    const { search, category, status, featured, sort, order, page = 1, limit = 10 } = req.query;

    const snapshot = await db.collection('products').get();
    let products = [];
    
    snapshot.forEach(doc => {
      products.push(mapProductToAdmin(doc));
    });

    // 1. Search filter
    if (search) {
      const q = search.toLowerCase();
      products = products.filter(p => 
        (p.name && p.name.toLowerCase().includes(q)) || 
        (p.description && p.description.toLowerCase().includes(q)) ||
        (p.material && p.material.toLowerCase().includes(q)) ||
        (p.color && p.color.toLowerCase().includes(q))
      );
    }

    // 2. Category filter
    if (category) {
      products = products.filter(p => p.category === category);
    }

    // 3. Status filter
    if (status) {
      products = products.filter(p => p.status === status);
    }

    // 4. Featured filter
    if (featured !== undefined) {
      const isFeatured = featured === 'true';
      products = products.filter(p => p.featured === isFeatured);
    }

    // 5. Sorting
    if (sort) {
      const direction = order === 'desc' ? -1 : 1;
      products.sort((a, b) => {
        let valA = a[sort];
        let valB = b[sort];
        
        if (typeof valA === 'string' && typeof valB === 'string') {
          return valA.localeCompare(valB) * direction;
        }
        return ((valA || 0) - (valB || 0)) * direction;
      });
    } else {
      products.sort((a, b) => b.id.localeCompare(a.id));
    }

    // 6. Pagination
    const total = products.length;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const startIndex = (pageNum - 1) * limitNum;
    const paginatedProducts = products.slice(startIndex, startIndex + limitNum);

    return res.status(200).json({
      success: true,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      products: paginatedProducts
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve products',
      error: error.message
    });
  }
};

// Get single product
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await db.collection('products').doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    return res.status(200).json({
      success: true,
      product: mapProductToAdmin(doc)
    });
  } catch (error) {
    console.error('Error fetching product details:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve product details', error: error.message });
  }
};

// Create new product (Map from Admin back to Firestore schema)
exports.createProduct = async (req, res) => {
  try {
    const {
      name, description, category, price, discount,
      quantity, material, color, dimensions, rating,
      status, featured
    } = req.body;

    if (!name || !category || !price) {
      return res.status(400).json({ success: false, message: 'Name, category, and price are required' });
    }

    const imageLinks = [];
    if (req.files && req.files.images) {
      const files = Array.isArray(req.files.images) ? req.files.images : [req.files.images];
      for (const file of files) {
        const link = await uploadImage(file, 'products');
        if (link) imageLinks.push(link);
      }
    }

    const firestoreData = {
      name,
      description: description || '',
      subCategoryId: category,
      price: parseFloat(price),
      discountPercent: parseFloat(discount || 0),
      stockQuantity: parseInt(quantity || 0),
      materials: material || '',
      colors: color || '',
      dimensions: dimensions || '',
      rating: parseFloat(rating || 5),
      stockStatus: status === 'active' ? 'in_stock' : 'out_of_stock',
      isBestSeller: featured === 'true' || featured === true,
      imageUrls: imageLinks,
      createdAt: new Date().toISOString()
    };

    const docRef = await db.collection('products').add(firestoreData);
    const newDoc = await docRef.get();

    return res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product: mapProductToAdmin(newDoc)
    });
  } catch (error) {
    console.error('Error creating product:', error);
    return res.status(500).json({ success: false, message: 'Failed to create product', error: error.message });
  }
};

// Update product
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const docRef = db.collection('products').doc(id);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const currentData = doc.data();
    const {
      name, description, category, price, discount,
      quantity, material, color, dimensions, rating,
      status, featured, existingImages
    } = req.body;

    const imageLinks = [];
    if (existingImages) {
      if (Array.isArray(existingImages)) imageLinks.push(...existingImages);
      else imageLinks.push(existingImages);
    } else if (currentData.imageUrls) {
      imageLinks.push(...currentData.imageUrls);
    }

    if (req.files && req.files.images) {
      const files = Array.isArray(req.files.images) ? req.files.images : [req.files.images];
      for (const file of files) {
        const link = await uploadImage(file, 'products');
        if (link) imageLinks.push(link);
      }
    }

    const updatedData = {
      name: name || currentData.name,
      description: description !== undefined ? description : currentData.description,
      subCategoryId: category || currentData.subCategoryId || currentData.category,
      price: price !== undefined ? parseFloat(price) : currentData.price,
      discountPercent: discount !== undefined ? parseFloat(discount) : currentData.discountPercent,
      stockQuantity: quantity !== undefined ? parseInt(quantity) : currentData.stockQuantity,
      materials: material !== undefined ? material : currentData.materials,
      colors: color !== undefined ? color : currentData.colors,
      dimensions: dimensions !== undefined ? dimensions : currentData.dimensions,
      rating: rating !== undefined ? parseFloat(rating) : currentData.rating,
      stockStatus: status ? (status === 'active' ? 'in_stock' : 'out_of_stock') : currentData.stockStatus,
      isBestSeller: featured !== undefined ? (featured === 'true' || featured === true) : currentData.isBestSeller,
      imageUrls: imageLinks,
      updatedAt: new Date().toISOString()
    };

    await docRef.update(updatedData);
    const updatedDoc = await docRef.get();

    return res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      product: mapProductToAdmin(updatedDoc)
    });
  } catch (error) {
    console.error('Error updating product:', error);
    return res.status(500).json({ success: false, message: 'Failed to update product', error: error.message });
  }
};

// Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const docRef = db.collection('products').doc(id);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    await docRef.delete();
    return res.status(200).json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete product', error: error.message });
  }
};
