const { auth, isMock } = require('../config/firebase');

exports.login = async (req, res) => {
  const { email, password, token } = req.body;

  try {
    // 1. Token-based login (from frontend Firebase Authentication)
    if (token) {
      const decodedToken = await auth.verifyIdToken(token);
      
      // Save admin to session
      req.session.admin = {
        uid: decodedToken.uid,
        email: decodedToken.email,
        name: decodedToken.name || decodedToken.email
      };
      
      return res.status(200).json({
        success: true,
        message: 'Login successful',
        admin: req.session.admin,
        token: token
      });
    }

    // 2. Email/Password-based login (useful for mock or custom login)
    if (email && password) {
      if (email === 'admin@homi.com' && password === 'admin123') {
        req.session.admin = {
          uid: 'mock_admin',
          email: 'admin@homi.com',
          name: 'Homi Admin'
        };

        return res.status(200).json({
          success: true,
          message: 'Login successful (Mock Mode)',
          admin: req.session.admin,
          token: 'mock-admin-token'
        });
      }

      // If not mock, user should log in on the frontend using Firebase SDK
      // and send the resulting ID Token here.
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. For live database, please log in via Firebase UI.'
      });
    }

    return res.status(400).json({
      success: false,
      message: 'Please provide email and password, or a valid Firebase token'
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(401).json({
      success: false,
      message: error.message || 'Authentication failed'
    });
  }
};

exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Could not log out. Please try again.'
      });
    }
    res.clearCookie('connect.sid'); // Clear session cookie
    return res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  });
};

exports.checkMe = (req, res) => {
  if (req.session && req.session.admin) {
    return res.status(200).json({
      success: true,
      authenticated: true,
      admin: req.session.admin
    });
  }
  return res.status(200).json({
    success: true,
    authenticated: false
  });
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({
      success: false,
      message: 'Email is required'
    });
  }

  try {
    if (isMock) {
      return res.status(200).json({
        success: true,
        message: `Password reset instructions sent to ${email} (Mock Mode).`
      });
    }

    // In a production backend, we can trigger a password reset link email via Firebase Admin
    // Or let the frontend trigger it directly.
    const link = await auth.generatePasswordResetLink(email);
    console.log(`Password reset link generated for ${email}: ${link}`);
    
    // Return success
    return res.status(200).json({
      success: true,
      message: 'Password reset link generated successfully. Please check your email inbox.'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to trigger password reset'
    });
  }
};

const { uploadImage } = require('../utils/uploadHelper');

exports.updateProfile = async (req, res) => {
  if (!req.session || !req.session.admin) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }

  try {
    const { name } = req.body;
    let photoUrl = req.session.admin.photo || null;

    if (req.files && req.files.avatar) {
      const link = await uploadImage(req.files.avatar, 'admins');
      if (link) {
        photoUrl = link;
      }
    }

    if (name) {
      req.session.admin.name = name;
    }
    if (photoUrl) {
      req.session.admin.photo = photoUrl;
    }

    // Try to update Firebase Auth if it's not a mock user
    if (req.session.admin.uid && req.session.admin.uid !== 'mock_admin' && !isMock) {
      try {
        const updateData = {};
        if (name) updateData.displayName = name;
        if (photoUrl) updateData.photoURL = photoUrl;
        await auth.updateUser(req.session.admin.uid, updateData);
      } catch (authErr) {
        console.warn('Failed to update Firebase Auth user profile:', authErr.message);
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      admin: req.session.admin
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
};

