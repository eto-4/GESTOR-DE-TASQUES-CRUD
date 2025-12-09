// routes/uploadRoutes.js
const express = require('express');
const router = express.Router();
const UploadController = require('../controllers/uploadController');
const { parseSingle, parseMultiple } = require('../middleware/uploadParser');

// LOCAL
router.post('/local',
  parseSingle('file'),
  (req, res, next) => UploadController.uploadSingle(req, res, next, { local: true })
);

router.post('/local/multiple',
  parseMultiple('files', 10),
  (req, res, next) => UploadController.uploadMultiple(req, res, next, { local: true })
);

// CLOUD
router.post('/cloud',
  parseSingle('file'),
  (req, res, next) => UploadController.uploadSingle(req, res, next, { cloud: true })
);

router.post('/cloud/multiple',
  parseMultiple('files', 10),
  (req, res, next) => UploadController.uploadMultiple(req, res, next, { cloud: true })
);

// BOTH
router.post('/both',
  parseSingle('file'),
  (req, res, next) => UploadController.uploadSingle(req, res, next, { local: true, cloud: true })
);

router.post('/both/multiple',
  parseMultiple('files', 10),
  (req, res, next) => UploadController.uploadMultiple(req, res, next, { local: true, cloud: true })
);

module.exports = router;