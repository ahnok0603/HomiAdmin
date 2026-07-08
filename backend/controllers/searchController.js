const { db } = require('../config/firebase');

// Get AI Search history
exports.getSearchHistory = async (req, res) => {
  try {
    const snapshot = await db.collection('searchHistory').get();
    const history = [];
    snapshot.forEach(doc => {
      history.push({ id: doc.id, ...doc.data() });
    });

    // Sort by search time descending
    history.sort((a, b) => new Date(b.searchTime || 0) - new Date(a.searchTime || 0));

    return res.status(200).json({
      success: true,
      history
    });
  } catch (error) {
    console.error('Error fetching search history:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve AI search history',
      error: error.message
    });
  }
};

// Delete search history item
exports.deleteSearchHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const docRef = db.collection('searchHistory').doc(id);
    const doc = await docRef.get();
    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Search history item not found'
      });
    }

    await docRef.delete();

    return res.status(200).json({
      success: true,
      message: 'AI Search history item deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting search history:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete AI search history item',
      error: error.message
    });
  }
};
