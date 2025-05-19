import express from 'express';
import {
  getServices,
  getService,
  createService,
  updateService,
  deleteService,
  getServiceProviders
} from '../controllers/service.controller';
import { protect, authorize } from '../middleware/auth.middleware';

const router = express.Router();

router.get('/', getServices);
router.get('/:id', getService);
router.post('/', protect, authorize('admin'), createService);
router.put('/:id', protect, authorize('admin'), updateService);
router.delete('/:id', protect, authorize('admin'), deleteService);
router.get('/:id/providers', getServiceProviders);

export default router;