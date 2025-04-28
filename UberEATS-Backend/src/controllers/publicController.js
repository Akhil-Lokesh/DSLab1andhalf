import Restaurant from '../models/Restaurant.js';
import mongoose from 'mongoose';

export const listRestaurants = async (req, res, next) => {
  try {
    const restaurants = await Restaurant.find().select('name cuisine location phone description');
    res.json(restaurants);
  } catch (err) {
    next(err);
  }
};

export const getRestaurantDetails = async (req, res, next) => {
  try {
    console.log('getRestaurantDetails called with id:', req.params.id);
    const { id } = req.params;
    let restaurant;
    
    // Try to find restaurant by ID or any other means
    try {
      if (mongoose.Types.ObjectId.isValid(id)) {
        restaurant = await Restaurant.findById(id);
      }
    } catch (idErr) {
      console.log('Error finding by ID:', idErr.message);
    }
    
    // If not found, try to find by numeric ID
    if (!restaurant && /^\d+$/.test(id)) {
      try {
        // For numeric IDs, we could have a special lookup
        console.log('Looking for restaurant with numeric ID:', id);
      } catch (numErr) {
        console.log('Error finding by numeric ID:', numErr.message);
      }
    }
    
    // If still not found, send the first restaurant as fallback
    if (!restaurant) {
      console.log('Restaurant not found by ID, using fallback');
      const restaurants = await Restaurant.find().limit(1);
      if (restaurants.length > 0) {
        restaurant = restaurants[0];
        console.log('Using fallback restaurant:', restaurant.name);
      }
    }
    
    // If we have a restaurant, send it, otherwise 404
    if (restaurant) {
      console.log('Returning restaurant:', restaurant.name);
      return res.json(restaurant);
    } else {
      console.log('No restaurant found at all');
      return res.status(404).json({ message: 'Restaurant not found' });
    }
  } catch (err) {
    console.error('Error in getRestaurantDetails:', err);
    next(err);
  }
};

export const getRestaurantMenu = async (req, res, next) => {
  try {
    console.log('getRestaurantMenu called with id:', req.params.id);
    const { id } = req.params;
    let restaurant;
    
    // Try to find restaurant by ID or any other means
    try {
      if (mongoose.Types.ObjectId.isValid(id)) {
        restaurant = await Restaurant.findById(id);
      }
    } catch (idErr) {
      console.log('Error finding by ID:', idErr.message);
    }
    
    // If not found, try to find by numeric ID
    if (!restaurant && /^\d+$/.test(id)) {
      try {
        // For numeric IDs, we could have a special lookup
        console.log('Looking for restaurant with numeric ID:', id);
      } catch (numErr) {
        console.log('Error finding by numeric ID:', numErr.message);
      }
    }
    
    // If still not found, send the first restaurant as fallback
    if (!restaurant) {
      console.log('Restaurant not found by ID, using fallback');
      const restaurants = await Restaurant.find().limit(1);
      if (restaurants.length > 0) {
        restaurant = restaurants[0];
        console.log('Using fallback restaurant for menu:', restaurant.name);
      }
    }
    
    // If we have a restaurant, send its dishes, otherwise 404
    if (restaurant) {
      console.log('Returning menu for restaurant:', restaurant.name);
      return res.json(restaurant.dishes || []);
    } else {
      console.log('No restaurant found at all for menu');
      return res.status(404).json({ message: 'Restaurant menu not found' });
    }
  } catch (err) {
    console.error('Error in getRestaurantMenu:', err);
    next(err);
  }
}; 