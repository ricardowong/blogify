var express = require('express'),
    FileSystem = require('fs'),
    router = express.Router(),
    path = require('path'),
    Neon = require('neon'),
    Storage = require('../lib/storage');

Class('Index').includes(Storage)({
    utils: {
        protectedRouteMiddleware: function protectedRouteMiddleware(request, response, next) {
            var session, user;
            session = Index.db.select('sessions', request.sessionID);
            console.log(session, "13");
            if (session) {
	            user = Index.db.select('users', session.email);
	            console.log(user, session, "16");
	            if (user) {
	            	next();
	            } else {
	            	response.render('user/signup');
	            }
            } else {
            	response.render('user/login');
            }
        }
    },
    routes: {
        post: {
            storeEntry: function storeEntry(request, response, next) {
                var user, session, email;
	                user = Index.db.select("users", request.session.email);
	                console.log(user, "sajda");
                if (user) {
	                user.posts[Date.now()] = request.body.textContent;

	                Index.db.update("users", user.email, user);
	                response.send({
	                	message: "Stored Entry"
	                });
                } else {
                	response.render('login');
                }
            }
        },
        get: {
            index: function index(request, response, next) {
                response.render('index', {
                    title: 'Blogify'
                });
            },

            blogEntriesView: function blogEntriesView(request, response) {
                response.render('posts', {
                    title: "All posts"
                });
            },

            blogEntries: function blogEntries(request, response, next) {
                var user, posts;
                user = Index.db.select('users', request.session.email);
                posts = user.posts;
                response.send(posts);
            },

            loginRedirect: function loginRedirect(request, response) {
            	response.render('user/login');
            },

            logoutRedirect: function logoutRedirect(request, response) {
            	request.render('user/logout');
            }

        }
    }
});

router.get('/', Index.utils.protectedRouteMiddleware.bind(this), Index.routes.get.index);
router.get('/login', Index.routes.get.loginRedirect);
router.get('/logout', Index.routes.get.logoutRedirect);
router.post('/store-entry', Index.routes.post.storeEntry);

router.get('/blog-preview', Index.utils.protectedRouteMiddleware.bind(this), Index.routes.get.blogEntriesView);

router.get('/api/posts', Index.utils.protectedRouteMiddleware.bind(this), Index.routes.get.blogEntries);

module.exports = router;