import mongoose from 'mongoose';

const dishSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    image: { type: String },
    category: { type: String, enum: ['Appetizer', 'Salad', 'Main Course', 'Dessert', 'Beverage', 'Other'] },
    ingredients: { type: [String] },
    is_available: { type: Boolean, default: true },
  },
  { timestamps: true, toJSON: { transform: toJSONTransform } }
);

const restaurantSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    ownerName: { type: String },
    email: { type: String, required: true },
    phone: { type: String },
    location: { type: String, required: true },
    cuisine: { type: String },
    description: { type: String },
    hours: { type: String },
    images: { type: [String], default: [] },
    dishes: [dishSchema],
  },
  { timestamps: true, toJSON: { transform: toJSONTransform } }
);

// Helper to add id alias
function toJSONTransform(doc, ret) {
  ret.id = ret._id;
  delete ret._id;
  return ret;
}

const Restaurant = mongoose.model('Restaurant', restaurantSchema);
export default Restaurant; 