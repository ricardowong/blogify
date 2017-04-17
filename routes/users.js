var express = require('express'),
    router = express.Router(),
    FileSystem = require('fs'),
    path = require('path'),
    crypto = require('crypto'),
    Neon = require('neon'),
    algorithm = 'aes-256-ctr',
    password = 'batresiscool';

Class('Users')({
    utils: {
        encrypt: function encrypt(text) {
            var cipher = crypto.createCipher(algorithm, password)
            var crypted = cipher.update(text, 'utf8', 'hex')
            crypted += cipher.final('hex');
            return crypted;
        },
        decrypt: function decrypt(text) {
            var decipher = crypto.createDecipher(algorithm, password)
            var dec = decipher.update(text, 'hex', 'utf8')
            dec += decipher.final('utf8');
            return dec;
        }
    },
    routes: {
        post: {
            login: function login(request, response, next) {
                let storage_users_path = path.join(__dirname, '../storage/users', request.body.email);
                FileSystem.readFile(storage_users_path, "utf8", (err, file) => {
                    if (err) {
                        response.render('user/signup');
                    }
                    if (!file) {
                        file = {};
                    } else {
                        file = JSON.parse(file);
                    }

                    var decrypted_password = Users.utils.decrypt(file.password);
                    if (decrypted_password == request.body.password) {
                        request.session.email = request.body.email;
                        request.session.save(function(err) {
                            if (err) throw err;
                            console.log(request.session, request.store);
                            response.render('index', {
                            	title: "Blogify"
                            });
                        })
                    } else {
                        response.render('user/login', {
                            error: "El usuario o la contraseña estan mal dude"
                        });
                    }

                });
            },
            signup: function signup(request, response, next) {
                let email = request.body.email;
                let storage_users_path = path.join(__dirname, '../storage/users', email);
                let data = {};

                var encrypted_password = Users.utils.encrypt(request.body.password);

                data.password = encrypted_password;
                data.posts = {};
                request.session.email = request.body.email;
                console.log(request.session, data, storage_users_path);
                data = JSON.stringify(data);
                FileSystem.writeFile(storage_users_path, data, (err) => {
                    if (err) throw err;
                    response.render('index');
                });

            }
        },
        get: {
            signup: function signup(request, response, next) {
                response.render('user/signup');
            },
            login: function login(request, response, next) {
                response.render('user/login');
            },
            logout: function logout(request, response, next) {
                console.log(request.store);
                request.session.destroy(function(err) {
                    response.render('user/login');
                });
            }
        }

    }
});

router.get('/signup', Users.routes.get.signup);

router.post('/signup', Users.routes.post.signup);

router.get('/login', Users.routes.get.login);

router.post('/login', Users.routes.post.login);

router.get('/logout', Users.routes.get.logout);

module.exports = router;