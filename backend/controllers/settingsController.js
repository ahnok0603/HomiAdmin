const { db } = require('../config/firebase');
const { uploadImage } = require('../utils/uploadHelper');

// Get website settings
exports.getSettings = async (req, res) => {
  try {
    const doc = await db.collection('settings').doc('website_settings').get();
    if (!doc.exists) {
      // Return default template settings if not created yet
      const defaults = {
        companyName: 'Homi Furniture',
        logo: '/logo.png',
        contactInfo: '123 Luxury Avenue, Design District',
        email: 'contact@homi.com',
        phone: '+1 (555) 019-2834',
        socialLinks: {
          facebook: 'https://facebook.com/homi',
          instagram: 'https://instagram.com/homi',
          twitter: 'https://twitter.com/homi'
        },
        about: 'Homi is an AI-powered premium furniture shopping experience.',
        privacyPolicy: 'Your privacy is important to us.',
        terms: 'Standard terms of service apply.'
      };
      await db.collection('settings').doc('website_settings').set(defaults);
      return res.status(200).json({ success: true, settings: defaults });
    }
    return res.status(200).json({
      success: true,
      settings: doc.data()
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve settings',
      error: error.message
    });
  }
};

// Update website settings
exports.updateSettings = async (req, res) => {
  try {
    const docRef = db.collection('settings').doc('website_settings');
    const doc = await docRef.get();
    const currentData = doc.exists ? doc.data() : {};

    const {
      companyName, contactInfo, email, phone,
      facebook, instagram, twitter, about, privacyPolicy, terms
    } = req.body;

    let logoUrl = currentData.logo || '/logo.png';
    if (req.files && req.files.logo) {
      const link = await uploadImage(req.files.logo, 'settings');
      if (link) logoUrl = link;
    }

    const updatedData = {
      companyName: companyName || currentData.companyName || 'Homi Furniture',
      logo: logoUrl,
      contactInfo: contactInfo !== undefined ? contactInfo : currentData.contactInfo || '',
      email: email !== undefined ? email : currentData.email || '',
      phone: phone !== undefined ? phone : currentData.phone || '',
      socialLinks: {
        facebook: facebook !== undefined ? facebook : (currentData.socialLinks?.facebook || ''),
        instagram: instagram !== undefined ? instagram : (currentData.socialLinks?.instagram || ''),
        twitter: twitter !== undefined ? twitter : (currentData.socialLinks?.twitter || '')
      },
      about: about !== undefined ? about : currentData.about || '',
      privacyPolicy: privacyPolicy !== undefined ? privacyPolicy : currentData.privacyPolicy || '',
      terms: terms !== undefined ? terms : currentData.terms || ''
    };

    await docRef.set(updatedData, { merge: true });

    return res.status(200).json({
      success: true,
      message: 'Settings updated successfully',
      settings: updatedData
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to save settings',
      error: error.message
    });
  }
};
