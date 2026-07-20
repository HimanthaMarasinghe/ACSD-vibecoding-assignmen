import express from 'express';
import { getProfile, updateProfile } from '../controllers/profileController.js';

const router = express.Router();

router.get('/:email', getProfile);
router.put('/:email', updateProfile);

export default router;
