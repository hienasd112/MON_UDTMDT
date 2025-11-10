import express from 'express';
const router = express.Router();
import { submitMessage, getAllMessages } from '../controllers/contactController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

router.post('/', submitMessage);

// --- (THÊM ROUTE MỚI) ---
// GET /api/contact (Private/Admin)
router.get('/', protect, admin, getAllMessages);

export default router;