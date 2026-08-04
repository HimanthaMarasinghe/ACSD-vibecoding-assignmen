import express from 'express';
import { getProducts, getProductById, createProduct } from '../controllers/productController.js';
import { requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getProducts);
router.get('/:id', getProductById);
router.post('/', requireAdmin, createProduct);

export default router;
