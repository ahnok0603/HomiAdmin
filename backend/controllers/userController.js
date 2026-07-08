const { db, auth } = require('../config/firebase');

const mapUserToAdmin = (doc) => {
  const u = doc.data();
  return {
    id: doc.id,
    name: u.fullName || u.name || 'Unknown User',
    email: u.email || '',
    phone: u.phone || '',
    photo: u.avatarUrl || u.photo || 'https://via.placeholder.com/150',
    role: u.role || 'customer',
    status: u.isBlocked ? 'locked' : 'active',
    createdDate: u.createdAt || u.createdDate || null,
    totalSpent: u.stats?.totalSpent || u.totalSpent || 0,
    totalOrders: u.stats?.totalOrders || u.totalOrders || 0
  };
};

// Get all users with search
exports.getUsers = async (req, res) => {
  try {
    const { search } = req.query;
    const snapshot = await db.collection('users').get();
    let users = [];

    snapshot.forEach(doc => {
      users.push(mapUserToAdmin(doc));
    });

    if (search) {
      const q = search.toLowerCase();
      users = users.filter(u => 
        (u.name && u.name.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q)) ||
        (u.phone && u.phone.includes(q))
      );
    }

    // Default sort by created date descending
    users.sort((a, b) => new Date(b.createdDate || 0) - new Date(a.createdDate || 0));

    return res.status(200).json({
      success: true,
      users
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve users',
      error: error.message
    });
  }
};

// Get single user details
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await db.collection('users').doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Also get user order history
    const ordersSnap = await db.collection('orders')
      .where('customerEmail', '==', doc.data().email)
      .get();
    
    const orders = [];
    ordersSnap.forEach(oDoc => {
      orders.push({ id: oDoc.id, ...oDoc.data() });
    });

    return res.status(200).json({
      success: true,
      user: mapUserToAdmin(doc),
      orders
    });
  } catch (error) {
    console.error('Error fetching user details:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve user details',
      error: error.message
    });
  }
};

// Lock/Unlock user account
exports.toggleUserLock = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'locked' or 'active'

    if (!status || !['active', 'locked'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be 'active' or 'locked'"
      });
    }

    const docRef = db.collection('users').doc(id);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    await docRef.update({ isBlocked: status === 'locked', status });

    // Note: If using real Firebase Auth, you can disable/enable user accounts like this:
    try {
      await auth.updateUser(id, { disabled: status === 'locked' });
    } catch (authErr) {
      console.log('Firebase Auth user update skipped/failed:', authErr.message);
    }

    return res.status(200).json({
      success: true,
      message: `User account successfully ${status === 'locked' ? 'locked' : 'unlocked'}`
    });
  } catch (error) {
    console.error('Error updating user status:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update user account status',
      error: error.message
    });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const docRef = db.collection('users').doc(id);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    await docRef.delete();

    // Try deleting from Firebase Auth as well
    try {
      await auth.deleteUser(id);
    } catch (authErr) {
      console.log('Firebase Auth delete skipped:', authErr.message);
    }

    return res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      error: error.message
    });
  }
};
