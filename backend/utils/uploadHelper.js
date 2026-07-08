const { storage, isMock } = require('../config/firebase');
const path = require('path');
const fs = require('fs');

/**
 * Uploads a file to Firebase Storage or local uploads folder based on environment.
 * @param {Object} file - The file object from express-fileupload (req.files.file)
 * @param {string} folderName - Subfolder (e.g. 'products', 'categories', 'banners', 'rooms')
 * @returns {Promise<string>} - Public URL of the uploaded image
 */
const uploadImage = async (file, folderName = 'images') => {
  if (!file) return null;
  
  const uniqueName = `${Date.now()}_${Math.floor(Math.random() * 10000)}${path.extname(file.name)}`;
  
  if (isMock) {
    // Save to local public/uploads directory
    const destDir = path.join(__dirname, '..', 'public', 'uploads', folderName);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    const destPath = path.join(destDir, uniqueName);
    await file.mv(destPath);
    const backendUrl = process.env.API_URL || 'http://localhost:5000';
    return `${backendUrl}/uploads/${folderName}/${uniqueName}`;
  } else {
    // Upload to Firebase Storage
    try {
      const bucket = storage.bucket();
      const destination = `${folderName}/${uniqueName}`;
      const blob = bucket.file(destination);
      
      const fileBuffer = fs.readFileSync(file.tempFilePath);
      
      await blob.save(fileBuffer, {
        metadata: { contentType: file.mimetype },
        public: true,
        resumable: false
      });

      // Firebase public URL format
      return `https://storage.googleapis.com/${bucket.name}/${destination}`;
    } catch (error) {
      console.error('Firebase Storage upload error, trying local fallback:', error);
      // Fallback to local save if Firebase storage fails
      const destDir = path.join(__dirname, '..', 'public', 'uploads', folderName);
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }
      const destPath = path.join(destDir, uniqueName);
      await file.mv(destPath);
      
      const backendUrl = process.env.API_URL || 'http://localhost:5000';
      return `${backendUrl}/uploads/${folderName}/${uniqueName}`;
    }
  }
};

module.exports = {
  uploadImage
};
