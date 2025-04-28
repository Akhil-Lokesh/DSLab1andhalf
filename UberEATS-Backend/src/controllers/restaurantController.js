import fs from 'fs';
import path from 'path';
import Restaurant from '../models/Restaurant.js';
import Order from '../models/Order.js';
import { sendKafkaMessage } from '../utils/kafka.js';

export const getRestaurantProfile = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findOne({ user: req.session.userId });
    if (!restaurant) return res.status(404).json({ message: 'Restaurant profile not found' });
    res.json(restaurant);
  } catch (err) {
    next(err);
  }
};

export const updateRestaurantProfile = async (req, res, next) => {
  try {
    const updates = req.body;
    const restaurant = await Restaurant.findOneAndUpdate({ user: req.session.userId }, updates, { new: true });
    if (!restaurant) return res.status(404).json({ message: 'Restaurant profile not found' });
    res.json(restaurant);
  } catch (err) {
    next(err);
  }
};

// Dishes CRUD
export const getRestaurantDishes = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findOne({ user: req.session.userId });
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });
    res.json(restaurant.dishes);
  } catch (err) {
    next(err);
  }
};

export const addDish = async (req, res, next) => {
  try {
    const { name, description, price, category, ingredients, is_available } = req.body;
    let image = req.body.image;
    if (req.file) {
      const uploadDir = path.join(path.resolve(), 'uploads');
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
      image = `/uploads/${req.file.filename}`;
    }
    const restaurant = await Restaurant.findOne({ user: req.session.userId });
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });

    const dish = { name, description, price, image, category, ingredients, is_available };
    restaurant.dishes.push(dish);
    await restaurant.save();
    res.status(201).json(restaurant.dishes[restaurant.dishes.length - 1]);
  } catch (err) {
    next(err);
  }
};

export const updateDish = async (req, res, next) => {
  try {
    const { dishId } = req.params;
    let updates = { ...req.body };
    if (req.file) {
      const uploadDir = path.join(path.resolve(), 'uploads');
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
      updates.image = `/uploads/${req.file.filename}`;
    }

    const restaurant = await Restaurant.findOne({ user: req.session.userId });
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });

    const dish = restaurant.dishes.id(dishId);
    if (!dish) return res.status(404).json({ message: 'Dish not found' });

    Object.assign(dish, updates);
    await restaurant.save();

    res.json(dish);
  } catch (err) {
    next(err);
  }
};

// Orders
export const getRestaurantOrders = async (req, res, next) => {
  try {
    const { status } = req.query;
    const restaurant = await Restaurant.findOne({ user: req.session.userId });
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });

    const filter = { restaurant: restaurant._id };
    if (status) filter.status = status;

    const orders = await Order.find(filter)
      .populate('customer', 'name')
      .sort({ createdAt: -1 });
    
    // Transform data for frontend
    const formattedOrders = orders.map(order => {
      const orderObj = order.toObject();
      return {
        id: orderObj._id,
        created_at: orderObj.createdAt,
        status: orderObj.status,
        total_price: orderObj.totalPrice,
        customer_id: orderObj.customer._id,
        customer_name: orderObj.customer.name,
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

export const getOrderDetails = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const restaurant = await Restaurant.findOne({ user: req.session.userId });
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });

    const order = await Order.findOne({ _id: orderId, restaurant: restaurant._id })
      .populate('customer', 'name');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    
    // Transform for frontend
    const orderObj = order.toObject();
    const formattedOrder = {
      id: orderObj._id,
      created_at: orderObj.createdAt,
      status: orderObj.status,
      total_price: orderObj.totalPrice,
      customer_id: orderObj.customer._id,
      customer_name: orderObj.customer.name,
      items: orderObj.items,
      delivery_address: orderObj.deliveryAddress,
      notes: orderObj.notes,
      restaurant_id: restaurant._id,
      restaurant_name: restaurant.name
    };
    
    res.json(formattedOrder);
  } catch (err) {
    next(err);
  }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const restaurant = await Restaurant.findOne({ user: req.session.userId });
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });

    const order = await Order.findOne({ _id: orderId, restaurant: restaurant._id });
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.status = status;
    await order.save();

    // Update Kafka message sending with error handling
    try {
      await sendKafkaMessage('order_status_updated', String(order._id), { 
        orderId: order._id, 
        status,
        restaurantId: restaurant._id,
        restaurantName: restaurant.name
      });
    } catch (kafkaError) {
      console.warn('Order status updated but notification failed:', kafkaError.message);
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
      notes: orderObj.notes,
      restaurant_id: restaurant._id,
      restaurant_name: restaurant.name
    };

    res.json(formattedOrder);
  } catch (err) {
    next(err);
  }
};

// Upload/update restaurant profile image
export const updateRestaurantImage = async (req, res, next) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ message: 'No image file provided' });

    const restaurant = await Restaurant.findOne({ user: req.session.userId });
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });

    const uploadDir = path.join(path.resolve(), 'uploads');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
    const imagePath = `/uploads/${file.filename}`;

    // For simplicity, store single logo as image field and keep gallery in images array
    restaurant.image = imagePath;
    if (!restaurant.images) restaurant.images = [];
    restaurant.images.push(imagePath);

    await restaurant.save();

    return res.json({ image: imagePath });
  } catch (err) {
    next(err);
  }
}; 