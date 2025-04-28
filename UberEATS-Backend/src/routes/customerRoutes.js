import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import {
  getCustomerProfile,
  updateCustomerProfile,
  getCustomerOrders,
  placeOrder,
  cancelOrder,
  getFavorites,
  addFavorite,
  removeFavorite,
  checkFavorite,
} from '../controllers/customerController.js';
import { isAuthenticated, authorizeRoles } from '../middleware/authMiddleware.js';

const router = Router();

router.use(isAuthenticated, authorizeRoles('customer'));

router.get('/profile', getCustomerProfile);

router.put(
  '/profile',
  [body('name').optional().notEmpty(), body('email').optional().isEmail()],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });
    updateCustomerProfile(req, res, next);
  }
);

router.get('/orders', getCustomerOrders);

router.post(
  '/orders',
  [body('restaurantId').notEmpty(), body('items').isArray({ min: 1 })],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });
    placeOrder(req, res, next);
  }
);

router.put('/orders/:orderId/cancel', cancelOrder);

router.get('/favorites', getFavorites);
router.post('/favorites/:restaurantId', addFavorite);
router.delete('/favorites/:restaurantId', removeFavorite);
router.get('/favorites/:restaurantId/check', checkFavorite);

export default router; 