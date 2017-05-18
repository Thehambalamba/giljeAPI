var bodyParser = require('body-parser');
var User = require('../models/user');
var Product = require('../models/product');
var Category = require('../models/category');
var mongoose = require('mongoose');
var Category = mongoose.model('Category');
var jwt = require('jsonwebtoken');
var config = require('../../config');
var superSecret = config.secret;

module.exports = function(app, express) {

    var apiRouter = express.Router();
    apiRouter.route('/authenticate')
    apiRouter.post('/authenticate', function(req, res) {

        // find the user
        User.findOne({
            userName: req.body.userName
        }).select('name username password').exec(function(err, user) {

            if (err) throw err;

            // no user with that username was found
            if (!user) {
                res.json({
                    success: false,
                    message: 'Authentication failed. User not found.'
                });
            } else if (user) {

                // check if password matches
                var validPassword = user.comparePassword(req.body.password);
                if (!validPassword) {
                    res.json({
                        success: false,
                        message: 'Authentication failed. Wrong password.'
                    });
                } else {

                    // if user is found and password is right
                    // create a token
                    var token = jwt.sign({
                        name: user.name,
                        userName: user.userName
                    }, superSecret, {
                        expiresIn: '24h' // expires in 24 hours
                    });

                    // return the information including token as JSON
                    res.json({
                        success: true,
                        message: 'Enjoy your token!',
                        token: token
                    });
                }

            }

        });
    });

    // route middleware to verify a token
    apiRouter.use(function(req, res, next) {
        // do logging
        console.log('Somebody just came to our app!');

        // check header or url parameters or post parameters for token
        var token = req.body.token || req.query.token || req.headers['x-access-token'];

        // decode token
        if (token) {

            // verifies secret and checks exp
            jwt.verify(token, superSecret, function(err, decoded) {

                if (err) {
                    res.status(403).send({
                        success: false,
                        message: 'Failed to authenticate token.'
                    });
                } else {
                    // if everything is good, save to request for use in other routes
                    req.decoded = decoded;

                    next(); // make sure we go to the next routes and don't stop here
                }
            });

        } else {

            // if there is no token
            // return an HTTP response of 403 (access forbidden) and an error message
            res.status(403).send({
                success: false,
                message: 'No token provided.'
            });

        }
    });


    // /home ruta
    apiRouter.get('/', function(req, res) {
        res.json({
            message: 'dobro došli'
        });
    });
    // kategorija
    apiRouter.route('/category')

    .get(function(req, res) {
            Category.find({}).exec(function(err, categories) {
                if (err) {
                    res.json("Kategorija nije pronadjena!");
                } else {
                    res.json(categories);
                }
            });
        })
        .post(function(req, res) {
            Category.find({}).exec(function(err, categories) {
                if (err) {
                    //res.json("Kategorija nije pronadjena!");
                } else {
                    var found = false;
                    for (var i in categories) {
                        if (categories[i].name == req.body.name) {
                            found = true;
                        }
                    }
                    if (!found) {
                        console.log(req.body.name, req.body.parent);
                        var category = new Category({
                            name: req.body.name,
                            parent: req.body.parent ? req.body.parent : null
                        });
                        category.save(function(err, result) {
                            if (err) {
                                res.json("Kategorija nije sačuvana!");
                            } else {
                                res.json(result);
                            }
                        });
                    }
                }

            });
        })
    apiRouter.route('/category/:category_id')
        .get(function(req, res) {
            Category.findById(req.params.category_id, function(err, category) {
                if (err) {
                    res.send(err);
                }
                res.json(category);
            });
        })
        .delete(function(req, res) {
            Category.remove({
                _id: req.params.category_id
            }, function(err, category) {
                if (err) {
                    res.send(err);
                }
                res.json({
                    message: 'Kategorija uspešno obrisana!'
                });
            });
        })

    .put(function(req, res) {
        console.log('Kategorija se ažurira!');
        var category = {
            name: req.body.name,
            parent: req.body.parent
        };
        Category.update({
            _id: req.body.id
        }, category, {
            upsert: true
        }, function(err) {
            if (err) {
                res.json("Kategorija nije ažurirana!");
            } else {
                res.json(err);
            }
        });
    });

    // /proizvodi ruta
    apiRouter.route('/products')

    .post(function(req, res) {

        var product = new Product();
        product.name = req.body.name;
        product.category = req.body.category;
        product.size = req.body.size;
        product.gender = req.body.gender;
        product.description = req.body.description;
        product.used = req.body.used;
        product.price = req.body.price;
        product.brand = req.body.brand;
        product.user = req.body.user;

        product.save(function(err) {
            if (err) {
                // duplicate entry
                if (err.code == 11000)
                    return res.json({
                        success: false,
                        message: ''
                    });
                else
                    return res.send(err);
            }
            // return a message
            res.json({
                message: 'Product created!'
            });
        });
    })

    .get(function(req, res) {
        Product.find(function(err, product) {
            if (err) res.send(err);

            // return the products
            res.json(product);
        });
    });

    apiRouter.route('/products/:product_id')

    .get(function(req, res) {
        Product.findById(req.params.product_id, function(err, product) {
            if (err) res.send(err);

            res.json(product);
        });
    })

    .put(function(req, res) {
        Product.findById(req.params.product_id, function(err, product) {

            if (err) res.send(err);
            if (req.body.name) product.name = req.body.name;
            if (req.body.category) product.category = req.body.category;
            if (req.body.size) product.size = req.body.size;
            if (req.body.gender) product.gender = req.body.gender;
            if (req.body.description) product.description = req.body.description;
            if (req.body.used) product.used = req.body.used;
            if (req.body.price) product.price = req.body.price;
            if (req.body.brand) product.brand = req.body.brand;
            if (req.body.user) product.user = req.body.user;

            product.save(function(err) {
                if (err) res.send(err);

                res.json({
                    message: 'Proizvod ažuriran!'
                });
            });

        });
    })

    .delete(function(req, res) {
        Product.remove({
            _id: req.params.product_id
        }, function(err, product) {
            if (err) res.send(err);

            res.json({
                message: 'Proizvod izbrisan!'
            });
        });
    });

    apiRouter.route('/users')

    .post(function(req, res) {
        var user = new User();
        user.firstName = req.body.firstName;
        user.lastName = req.body.lastName;
        user.userName = req.body.userName;
        user.password = req.body.password;
        user.email = req.body.email;
        user.phoneNumber = req.body.phoneNumber;
        user.products = req.body.products;

        user.save(function(err) {
            if (err) {
                if (err.code == 11000) {
                    return res.json({
                        success: false,
                        messaage: 'Korisnik sa tim imenom već postoji, pokušajte ponovo.'
                    });
                } else {
                    return res.send(err);
                }
            }
            res.json({
                message: 'Kreiran korisnik!'
            });
        });
    })

    .get(function(req, res) {
        User.find(function(err, users) {
            if (err) {
                res.send(err);
            }
            res.json(users);
        });
    });

    apiRouter.route('/users/:user_id')

    .get(function(req, res) {
        User.findById(req.params.user_id, function(err, user) {
            if (err) {
                res.send(err);
            }
            res.json(user);
        });
    })

    .put(function(req, res) {
        User.findById(req.params.user_id, function(err, user) {
            if (err) {
                res.send(err);
            }
            if (req.body.firstName) {
                user.firstName = req.body.firstName;
            }
            if (req.body.lastName) {
                user.lastName = req.body.lastName;
            }
            if (req.body.userName) {
                user.userName = req.body.userName;
            }
            if (req.body.password) {
                user.password = req.body.password;
            }
            if (req.body.email) {
                user.email = req.body.email;
            }
            if (req.body.phoneNumber) {
                user.phoneNumber = req.body.phoneNumber;
            }
            if (req.body.products) {
                user.products = req.body.products;
            }

            user.save(function(err) {
                if (err) {
                    res.send(err);
                }
                res.json({
                    message: 'Korisnik ažuriran!'
                });
            });
        });
    })

    .delete(function(req, res) {
        User.remove({
            _id: req.params.user_id
        }, function(err, user) {
            if (err) {
                res.send(err);
            }
            res.json({
                message: 'Korisnik uspešno obrisan!'
            });
        });
    });

    apiRouter.get('/me', function(req, res) {
        res.send(req.decoded);
    });

    return apiRouter;

};
