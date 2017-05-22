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
    apiRouter.options('*', function(req, res) {
        res.send();
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
                success: true,
                message: 'Kreiran korisnik!'
            });
        });
    })
    apiRouter.route('/authenticate')

    .post(function(req, res) {

        // nadji korisnika
        User.findOne({
            userName: req.body.userName
        }).select('firstName lastName userName password email phone products').exec(function(err, user) {

            if (err) throw err;

            // ne postoji korisnik sa tim usernamom
            if (!user) {
                res.json({
                    success: false,
                    message: 'Autentikacija nije uspela. Korisnik ne postoji.'
                });
            } else if (user) {

                // proveri sifru
                var validPassword = user.comparePassword(req.body.password);
                if (!validPassword) {
                    res.json({
                        success: false,
                        message: 'Autentikacija nije uspela. Pogresna sifra.'
                    });
                } else {

                    // kreiraj token ukoliko je sve uredu
                    var token = jwt.sign({
                        name: user.name,
                        userName: user.userName
                    }, superSecret, {
                        expiresIn: '24h' // kada istice
                    });

                    // vrati informacije sa porukom
                    res.json({
                        success: true,
                        message: 'Token dodeljen.',
                        token: token,
                        user: user
                    });
                }

            }

        });
    });

    // midleware za aplikaciju i verifikaciju tokena
    apiRouter.use(function(req, res, next) {
        // log
        console.log('Neko je dosao na nasu aplikaciju');

        // proveri dali zahtev ima token u headeru
        var token = req.body.token || req.query.token || req.get('Authorization');

        // dekodiraj token
        if (token) {

            // proveri secret
            jwt.verify(token, superSecret, function(err, decoded) {

                if (err) {
                    res.status(403).send({
                        success: false,
                        message: 'Neuspesna authentikacija.'
                    });
                } else {

                    req.decoded = decoded;

                    next();
                }
            });

        } else {

            // ukoliko nema tokena posalji HTTP response 403 
            res.status(403).send({
                success: false,
                message: 'Niste dostavili token'
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
                // ukolkiko vec postoji
                if (err.code == 11000)
                    return res.json({
                        success: false,
                        message: 'Došlo je do greške pokusajte ponovo.'
                    });
                else
                    return res.send(err);
            }
            // poruka
            res.json({
                success: true,
                message: 'Proizvod je kreiran.'
                
            });
        });
    })

    .get(function(req, res) {
        Product.find(function(err, product) {
            if (err) res.send(err);

            // vrati kreirani proizvod
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

    .get(function(req, res) {
        User.find(function(err, users) {
            if (err) {
                res.send(err);
            }
            res.json(users);
        });
    })

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
