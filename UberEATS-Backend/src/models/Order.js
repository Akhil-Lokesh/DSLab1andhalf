import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema(
  {
    dishId: { type: mongoose.Schema.Types.ObjectId, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    items: [orderItemSchema],
    totalPrice: { type: Number, required: true },
    status: {
      type: String,
      enum: [
        'New',
        'Order Received',
        'Confirmed',
        'Preparing',
        'Ready for Pickup',
        'On the Way',
        'Delivered',
        'Picked Up',
        'Cancelled',
      ],
      default: 'New',
    },
    paymentMethod: {
      type: String,
      enum: ['card', 'cod'],
      default: 'card'
    },
    deliveryAddress: { type: String },
    notes: { type: String },
  },
  { timestamps: true }
);

const Order = mongoose.model('Order', orderSchema);
export default Order; 