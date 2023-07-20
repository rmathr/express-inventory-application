const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ProductSchema = new Schema({
  product_name: { type: String, required: true, maxLength: 100 },
  description: { type: String, required: true, maxLength: 400 },
  category: [{ type: Schema.Types.ObjectId, ref: 'Category' }],
  price: { type: Number, required: true, min: 0.01 },
  stock_quantity: { type: Number, required: true, min: 0 },
});

ProductSchema.virtual('url').get(function () {
  // We don't use an arrow function as we'll need the this object
  return `/catalog/product/${this._id}`;
});

module.exports = mongoose.model('Product', ProductSchema);
