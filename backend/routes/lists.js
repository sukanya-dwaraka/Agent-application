/**
 * routes/lists.js
 * Fixed: multer fileFilter trusts extension over MIME (browsers lie about CSV type)
 */

const express     = require('express');
const router      = express.Router();
const multer      = require('multer');
const path        = require('path');
const fs          = require('fs');
const listCtrl    = require('../controllers/listController');
const { protect } = require('../middleware/auth');

// ─── Multer storage ───────────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

// Trust file EXTENSION — browsers send wrong MIME for CSV frequently
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (['.csv', '.xlsx', '.xls'].includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type "${ext}". Only .csv, .xlsx, and .xls are allowed.`), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

// ─── Error wrapper for multer ─────────────────────────────────────────────────
const uploadMiddleware = (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
};

// ─── Routes (all protected) ───────────────────────────────────────────────────
router.use(protect);

router.post('/upload', uploadMiddleware, listCtrl.uploadAndDistribute);
router.get('/',        listCtrl.getAllBatches);
router.get('/:id',     listCtrl.getBatch);
router.delete('/:id',  listCtrl.deleteBatch);

module.exports = router;