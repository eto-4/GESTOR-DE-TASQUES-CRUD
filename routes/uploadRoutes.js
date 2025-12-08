// uploadRoutes.js
const express = require('express');
const router = express.Router();

const UploadController = require('../controllers/uploadController');

// Middlewares de multer
const uploadSingle = require('../middleware/upload').uploadSingle('file');
const uploadMultiple = require('../middleware/upload').uploadMultiple('files', 10);

// LOCAL
router.post('/local', uploadSingle, (req, res) => {
    UploadController.uploadSingle(req, res, { local: true });
});

router.post('/local/multiple', uploadMultiple, (req, res) => {
    UploadController.uploadMultiple(req, res, { local: true });
});

// CLOUDINARY
router.post('/cloud', uploadSingle, (req, res) => {
    UploadController.uploadSingle(req, res, { cloud: true });
});

router.post('/cloud/multiple', uploadMultiple, (req, res) => {
    UploadController.uploadMultiple(req, res, { cloud: true });
});

// BOTH
router.post('/both', uploadSingle, (req, res) => {
    UploadController.uploadSingle(req, res, { local: true, cloud: true });
});

router.post('/both/multiple', uploadMultiple, (req, res) => {
    UploadController.uploadMultiple(req, res, { local: true, cloud: true });
});

module.exports = router;
