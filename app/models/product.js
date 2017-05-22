var mongoose = require('mongoose');
var Schema = mongoose.Schema;


// Product shema
var ProductSchema = new Schema({
    name: { type: String, require: true },
    category: { type: Schema.Types.ObjectId, ref: 'Category', default: null },
    size: { type: Number, required: true },
    gender: { type: Boolean, },
    description: { type: String, required: true },
    used: { type: Boolean,  },
    price: { type: Number, required: true },
    brand: { type: String, required: true },
	user: [{ type: Schema.Types.ObjectId, ref: 'User'}]    
});
// export MODELA
var Product = mongoose.model('Product', ProductSchema);

module.exports = Product;