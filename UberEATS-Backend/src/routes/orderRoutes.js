import { Router } from 'express';
import Order from '../models/Order.js';
import { isAuthenticated } from '../middleware/authMiddleware.js';

const router = Router();

// Fetch order by id (both customer and restaurant can access if they belong)
router.get('/orders/:orderId', isAuthenticated, async (req, res, next) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId)
      .populate('customer', 'name')
      .populate({ path: 'restaurant', select: 'name location user' });
    
    if (!order) return res.status(404).json({ message: 'Order not found' });

    // Check access
    if (
      String(order.customer._id) !== req.session.userId &&
      String(order.restaurant.user) !== req.session.userId
    ) {
      return res.status(403).json({ message: 'Permission denied' });
    }

    // Transform for frontend
    const orderObj = order.toObject();
    const formattedOrder = {
      id: orderObj._id,
      created_at: orderObj.createdAt,
      status: orderObj.status,
      total_price: orderObj.totalPrice,
      restaurant_id: orderObj.restaurant._id,
      restaurant_name: orderObj.restaurant.name,
      restaurant_address: orderObj.restaurant.location,
      items: orderObj.items,
      delivery_address: orderObj.deliveryAddress,
      payment_method: orderObj.paymentMethod,
      customer_name: orderObj.customer.name,
      notes: orderObj.notes
    };

    res.json(formattedOrder);
  } catch (err) {
    next(err);
  }
});

export default router; 