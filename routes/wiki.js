var express = require('express');
var router = express.Router();
var models = require('../models');
var Page = models.Page;
var User = models.User;
module.exports = router;


// GET /wiki
router.get('/', function (req, res, next) {
    Page.findAll({})
        .then(function (pages) {
            res.render('index', {
                pages: pages
            });
        })
        .catch(next);
});


// POST /wiki
router.post('/', function (req, res, next) {

    User.findOrCreate({
        where: {
            email: req.body.authorEmail,
            name: req.body.authorName
        }
    })
        .spread(function (user, wasCreatedBool) {
            return Page.create({
                title: req.body.title,
                content: req.body.content,
                status: req.body.status,
                tags: req.body.tags
            }).then(function (createdPage) { // Nested .then so we can remember `user`
                return createdPage.setAuthor(user);
            });
        })
        .then(function (createdPage) {
            res.redirect(createdPage.route);
        })
        .catch(next);
});

// GET /wiki/add
router.get('/add', function (req, res) {
    res.render('addpage');
});

router.get('/search/:tag', function (req, res, next) {

    Page.findByTag(req.params.tag)
        .then(function (pages) {
            res.render('index', {
                pages: pages
            });
        })
        .catch(next);
});

// /wiki/Javascript
router.get('/:urlTitle', function (req, res, next) {

    var urlTitleOfAPage = req.params.urlTitle;

    Page.findOne({
        where: {
            urlTitle: urlTitleOfAPage
        }
        /* includes runs a join and gives us .author
         * so this is an alternative to doing page.getAuthor
         * separately */
        // includes: [
        //     { model: User, as: 'author' }
        // ]
    })
        .then(function (page) {

            if (!page) {
                var error = new Error('That page was not found!');
                error.status = 404;
                throw error;
            }

            return page.getAuthor()
                .then(function (author) { // Nested .then so we can remember `page`

                    page.author = author;

                    res.render('wikipage', {
                        page: page
                    });

                });

        })
        .catch(next);

});

router.get('/:urlTitle/similar', function (req, res, next) {

    Page.findOne({
        where: {
            urlTitle: req.params.urlTitle
        }
    })
        .then(function (page) {

            if (!page) {
                var error = new Error('That page was not found!');
                error.status = 404;
                throw error;
            }

            return page.findSimilar();

        })
        .then(function (similarPages) {
            res.render('index', {
                pages: similarPages
            });
        })
        .catch(next);

});

// Editing functionality

router.get('/:urlTitle/edit', function (req, res, next) {
    Page.findOne({
        where: {
            urlTitle: req.params.urlTitle
        }
    })
        .then(function (page) {

            if (!page) {
                var error = new Error('That page was not found!');
                error.status = 404;
                throw error;
            }

            res.render('editpage', {
                page: page
            });

        })
        .catch(next);
});

router.post('/:urlTitle/edit', function (req, res, next) {

    Page.findOne({
        where: {
            urlTitle: req.params.urlTitle
        }
    })
        .then(function (page) {

            for (var key in req.body) {
                page[key] = req.body[key];
            }

            return page.save();

        })
        .then(function (updatedPage) {
            res.redirect(updatedPage.route);
        })
        .catch(next);
});

router.get('/:urlTitle/delete', function (req, res, next) {

    Page.destroy({
        where: {
            urlTitle: req.params.urlTitle
        }
    })
        .then(function () {
            res.redirect('/wiki');
        })
        .catch(next);

});
