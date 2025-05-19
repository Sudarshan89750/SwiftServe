import express from 'express';
import {
  getProviders,
  getProvider,
  createProvider,
  updateProvider,
  deleteProvider,
  getNearbyProviders
} from '../controllers/provider.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

router.get('/', getProviders);
router.get('/nearby', getNearbyProviders);
router.get('/:id', getProvider);
router.post('/', protect, createProvider);
router.put('/:id', protect, updateProvider);
router.delete('/:id', protect, deleteProvider);

export default router;