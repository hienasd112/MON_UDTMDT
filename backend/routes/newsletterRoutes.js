import express from 'express';
const router = express.Router();
import { subscribe, getAllSubscribers } from '../controllers/newsletterController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

router.post('/subscribe', subscribe);   

// --- (THÊM ROUTE MỚI) ---
// GET /api/newsletter (Private/Admin)
router.get('/', protect, admin, getAllSubscribers);
export default router;