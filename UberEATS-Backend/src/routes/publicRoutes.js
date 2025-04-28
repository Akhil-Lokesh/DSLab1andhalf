import { Router } from 'express';
import {
  listRestaurants,
  getRestaurantDetails,
  getRestaurantMenu,
} from '../controllers/publicController.js';

const router = Router();

// Add both singular and plural routes for better compatibility
router.get('/restaurants', listRestaurants);

// Singular form routes
router.get('/restaurant/:id', getRestaurantDetails);
router.get('/restaurant/:id/menu', getRestaurantMenu);

// Plural form routes
router.get('/restaurants/:id', getRestaurantDetails);
router.get('/restaurants/:id/menu', getRestaurantMenu);

export default router; 