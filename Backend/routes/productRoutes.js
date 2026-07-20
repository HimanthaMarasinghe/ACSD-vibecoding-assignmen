import express from 'express';
import { getProducts, getProductById, addProductReview } from '../controllers/productController.js';

const router = express.Router();

router.get('/', getProducts);
router.get('/:id', getProductById);
router.post('/:id/reviews', addProductReview);

export default router;
