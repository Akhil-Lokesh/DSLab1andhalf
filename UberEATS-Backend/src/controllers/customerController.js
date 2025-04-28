import User from '../models/User.js';
import Restaurant from '../models/Restaurant.js';
import Order from '../models/Order.js';
import { sendKafkaMessage } from '../utils/kafka.js';
import mongoose from 'mongoose';

export const getCustomerProfile = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.session.userId)) {
      return res.status(401).json({ message: 'Session invalid' });
    }
    const user = await User.findById(req.session.userId).select('-password');
    if (!user) return res.status(401).json({ message: 'Session invalid' });
    res.json(user);
  } catch (err) {
    next(err);
  }
};

export const updateCustomerProfile = async (req, res, next) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const updates = req.body;
    if (updates.password) delete updates.password; // Disallow password change here
    
    console.log('Updating profile for user:', req.session.userId);
    console.log('Update data received:', updates);
    
    // Convert empty strings to null to avoid storing empty strings
    const cleanedUpdates = Object.fromEntries(
      Object.entries(updates).map(([key, value]) => {
        // Convert empty strings to null but keep other falsey values (except 0)
        if (value === '' || (value && typeof value === 'string' && value.trim() === '')) {
          return [key, null];
        }
        return [key, value];
      })
    );
    
    console.log('Cleaned update data:', cleanedUpdates);
    
    const updated = await User.findByIdAndUpdate(
      req.session.userId, 
      cleanedUpdates, 
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!updated) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    console.log('Profile updated successfully:', updated._id);
    console.log('Updated fields:', {
      name: updated.name,
      phone: updated.phone,
      address: updated.address,
      city: updated.city,
      state: updated.state,
      country: updated.country
    });
    
    // Update session data if needed
    if (updates.name) {
      req.session.user = {
        ...req.session.user,
        name: updates.name
      };
    }
    
    // Make sure session is saved after updating
    req.session.save((err) => {
      if (err) {
        console.error('Session save error:', err);
      }
      res.json(updated);
    });
  } catch (err) {
    console.error('Profile update error:', err);
    next(err);
  }
};

export const getCustomerOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ customer: req.session.userId })
      .populate('restaurant', 'name location')
      .sort({ createdAt: -1 });
    
    // Transform data for frontend
    const formattedOrders = orders.map(order => {
      const orderObj = order.toObject();
      return {
        id: orderObj._id,
        created_at: orderObj.createdAt,
        status: orderObj.status,
        total_price: orderObj.totalPrice,
        restaurant_id: orderObj.restaurant._id,
        restaurant_name: orderObj.restaurant.name,
        restaurant_address: orderObj.restaurant.location,
        payment_method: orderObj.paymentMethod,
        items: orderObj.items,
        delivery_address: orderObj.deliveryAddress,
        notes: orderObj.notes
      };
    });
    
    res.json(formattedOrders);
  } catch (err) {
    next(err);
  }
};

export const placeOrder = async (req, res, next) => {
  try {
    const { restaurantId, items, deliveryAddress, notes, paymentMethod } = req.body;

    // Handle null or undefined restaurantId
    if (!restaurantId) {
      return res.status(400).json({ message: 'Restaurant ID is required' });
    }

    // Convert restaurantId to ObjectId if it's not already
    let restaurantObjectId;
    try {
      // Add debug logging
      console.log('Restaurant ID received:', restaurantId, 'Type:', typeof restaurantId);

      // First check if it's already a valid ObjectId
      if (mongoose.Types.ObjectId.isValid(restaurantId)) {
        restaurantObjectId = new mongoose.Types.ObjectId(restaurantId);
      } 
      // If not a valid ObjectId, try fallback options
      else {
        // Try to find available restaurants
        const restaurants = await Restaurant.find({});
        // Log available restaurants for debugging
        console.log('Available restaurants:', restaurants.map(r => ({id: r._id, name: r.name})));
        
        // Use first restaurant as fallback
        const mockRestaurant = restaurants[0];
        if (mockRestaurant) {
          console.log('Using fallback restaurant:', mockRestaurant.name);
          restaurantObjectId = mockRestaurant._id;
        } else {
          return res.status(400).json({ message: 'No restaurants found in database' });
        }
      }
    } catch (error) {
      console.error('Error converting restaurant ID:', error);
      return res.status(400).json({ message: 'Invalid restaurant ID format' });
    }

    const restaurant = await Restaurant.findById(restaurantObjectId);
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });

    // Calculate total price
    let totalPrice = 0;
    const orderItems = [];
    items.forEach((item) => {
      const dish = restaurant.dishes.id(item.dishId);
      if (!dish) throw new Error('Dish not found');
      const quantity = item.quantity || 1;
      totalPrice += dish.price * quantity;
      orderItems.push({ dishId: dish._id, name: dish.name, price: dish.price, quantity });
    });

    const order = await Order.create({
      customer: req.session.userId,
      restaurant: restaurantObjectId,
      items: orderItems,
      totalPrice,
      deliveryAddress,
      notes,
      paymentMethod: paymentMethod || 'card', // Default to card if not provided
      status: 'New',
    });

    // Publish Kafka event with proper error handling
    try {
      await sendKafkaMessage('order_created', String(order._id), order);
    } catch (kafkaError) {
      console.warn('Order created but notification failed:', kafkaError.message);
      // Continue processing - don't let Kafka issue prevent order completion
    }

    // Transform response for frontend
    const orderObj = order.toObject();
    const formattedOrder = {
      id: orderObj._id,
      created_at: orderObj.createdAt,
      status: orderObj.status,
      total_price: orderObj.totalPrice,
      restaurant_id: restaurant._id,
      restaurant_name: restaurant.name,
      items: orderObj.items,
      delivery_address: orderObj.deliveryAddress,
      payment_method: orderObj.paymentMethod,
      notes: orderObj.notes
    };

    res.status(201).json(formattedOrder);
  } catch (err) {
    next(err);
  }
};

export const cancelOrder = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { reason } = req.body;

    const order = await Order.findOne({ _id: orderId, customer: req.session.userId });
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (['Delivered', 'Picked Up'].includes(order.status)) {
      return res.status(400).json({ message: 'Cannot cancel completed order' });
    }

    order.status = 'Cancelled';
    await order.save();

    // Use the new Kafka helper with error handling
    try {
      await sendKafkaMessage('order_cancelled', String(order._id), { 
        orderId: order._id, 
        status: 'Cancelled',
        reason 
      });
    } catch (kafkaError) {
      console.warn('Order cancelled but notification failed:', kafkaError.message);
    }

    // Transform response for frontend
    const orderObj = order.toObject();
    const formattedOrder = {
      id: orderObj._id,
      created_at: orderObj.createdAt,
      status: orderObj.status,
      total_price: orderObj.totalPrice,
      items: orderObj.items,
      delivery_address: orderObj.deliveryAddress,
      notes: orderObj.notes
    };

    res.json(formattedOrder);
  } catch (err) {
    next(err);
  }
};

export const getFavorites = async (req, res, next) => {
  try {
    const user = await User.findById(req.session.userId).populate('favorites', 'name cuisine location');
    return res.json(user.favorites);
  } catch (err) {
    next(err);
  }
};

export const addFavorite = async (req, res, next) => {
  try {
    const { restaurantId } = req.params;
    await User.findByIdAndUpdate(req.session.userId, { $addToSet: { favorites: restaurantId } });
    return res.json({ message: 'Added to favorites' });
  } catch (err) {
    next(err);
  }
};

export const removeFavorite = async (req, res, next) => {
  try {
    const { restaurantId } = req.params;
    await User.findByIdAndUpdate(req.session.userId, { $pull: { favorites: restaurantId } });
    return res.json({ message: 'Removed from favorites' });
  } catch (err) {
    next(err);
  }
};

export const checkFavorite = async (req, res, next) => {
  try {
    const { restaurantId } = req.params;
    const user = await User.findById(req.session.userId);
    const isFav = user.favorites.some((id) => String(id) === restaurantId);
    res.json({ isFavorite: isFav });
  } catch (err) {
    next(err);
  }
}; 