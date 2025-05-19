import express from 'express';
import {
  getBookings,
  getUserBookings,
  getBooking,
  createBooking,
  updateBookingStatus
} from '../controllers/booking.controller';
import { protect, authorize } from '../middleware/auth.middleware';

const router = express.Router();

router.get('/', protect, authorize('admin'), getBookings);
router.get('/user', protect, getUserBookings);
router.get('/:id', protect, getBooking);
router.post('/', protect, createBooking);
router.put('/:id/status', protect, updateBookingStatus);

export default router;