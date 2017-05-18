var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');


// USER shema
var UserSchema = new Schema({
    firstName: { type: String, required:true },
    lastName: { type: String, required:true },
    userName: { type: String, required: true, index: { unique: true } },
    password: { type: String, required: true, select: false },
    email: { type: String, required: true, index: { unique: true } },
    phoneNumber: { type: Number, required: true },
    products: [{ type: Schema.Types.ObjectId, ref: 'Product'}]

});

// hashovanje sifre pre cuvanja
UserSchema.pre('save', function(next) {
    var user = this;

    // proveriti da li je korisnik novi ili se updatuje
    if (!user.isModified('password')) return next();

    // hash
    bcrypt.hash(user.password, null, null, function(err, hash) {
        if (err) return next(err);

        // koristi hashovanu sifru
        user.password = hash;
        next();
    });
});

// uporedjivanje passworda
UserSchema.methods.comparePassword = function(password) {
    var user = this;

    return bcrypt.compareSync(password, user.password);
};
// export MODELA
var User = mongoose.model('User', UserSchema);

module.exports = User;
