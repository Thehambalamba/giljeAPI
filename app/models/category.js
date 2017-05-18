var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var CategorySchema = new Schema({
    name: {type: String,required:true},
    parent:  { type: Schema.Types.ObjectId, default: null }
});

var Category = mongoose.model('Category', CategorySchema);

Category.getIdByName = function (name, callback){
    Category.findOne({name:name}).exec(function(err, result){
        //console.log(result._id);
        callback(result._id);
    });
}


module.exports = Category;