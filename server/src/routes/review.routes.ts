import express from 'express';
import {
  getReviews,
  getProviderReviews,
  getServiceReviews,
  createReview,
  updateReview,
  deleteReview
} from '../controllers/review.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

router.get('/', getReviews);
router.get('/provider/:providerId', getProviderReviews);
router.get('/service/:serviceId', getServiceReviews);
router.post('/', protect, createReview);
router.put('/:id', protect, updateReview);
router.delete('/:id', protect, deleteReview);

export default router;