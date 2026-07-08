const { db } = require('../config/firebase');

// Get all reviews with search and filter
exports.getReviews = async (req, res) => {
  try {
    const { productId, search } = req.query;
    const snapshot = await db.collection('reviews').get();
    let reviews = [];

    snapshot.forEach(doc => {
      reviews.push({ id: doc.id, ...doc.data() });
    });

    // 1. Filter by Product ID
    if (productId) {
      reviews = reviews.filter(r => r.productId === productId);
    }

    // 2. Search in user name, comment or product name
    if (search) {
      const q = search.toLowerCase();
      reviews = reviews.filter(r => 
        (r.userName && r.userName.toLowerCase().includes(q)) ||
        (r.comment && r.comment.toLowerCase().includes(q)) ||
        (r.productName && r.productName.toLowerCase().includes(q))
      );
    }

    // Sort by date descending
    reviews.sort((a, b) => new Date(b.createdDate || 0) - new Date(a.createdDate || 0));

    return res.status(200).json({
      success: true,
      reviews
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve reviews',
      error: error.message
    });
  }
};

// Delete review
exports.deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const docRef = db.collection('reviews').doc(id);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    await docRef.delete();

    return res.status(200).json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting review:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete review',
      error: error.message
    });
  }
};
