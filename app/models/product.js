var mongoose = require('mongoose');
var Schema = mongoose.Schema;


// Product shema
var ProductSchema = new Schema({
    name: { type: String, require: true },
    size: { type: Number, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    brand: { type: String, required: true },
});
// export MODELA
var Product = mongoose.model('Product', ProductSchema);

module.exports = Product;