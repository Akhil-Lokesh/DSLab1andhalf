import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import {
  getRestaurantProfile,
  updateRestaurantProfile,
  getRestaurantDishes,
  addDish,
  updateDish,
  getRestaurantOrders,
  getOrderDetails,
  updateOrderStatus,
  updateRestaurantImage,
} from '../controllers/restaurantController.js';
import { isAuthenticated, authorizeRoles } from '../middleware/authMiddleware.js';
import multer from 'multer';
import path from 'path';

const router = Router();

router.use(isAuthenticated, authorizeRoles('restaurant'));

// Configure Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(path.resolve(), 'uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

router.get('/profile', getRestaurantProfile);
router.put('/profile', updateRestaurantProfile);
router.post('/profile/image', upload.single('image'), updateRestaurantImage);

router.get('/dishes', getRestaurantDishes);
router.post(
  '/dishes',
  [body('name').notEmpty(), body('price').isNumeric()],
  upload.single('image'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });
    addDish(req, res, next);
  }
);
router.put('/dishes/:dishId', upload.single('image'), updateDish);

// Orders
router.get('/orders', getRestaurantOrders);
router.get('/orders/:orderId', getOrderDetails);
router.put('/orders/:orderId/status', updateOrderStatus);

export default router; 