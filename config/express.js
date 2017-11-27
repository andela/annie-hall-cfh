/**
 * Module dependencies.
 */
var express = require('express'),
    bodyParser = require('body-parser'),
    session = require('express-session'),
    compression = require('compression'),
    favicon = require('serve-favicon'),
    logger = require('morgan'),
    methodOverride = require('method-override'),
    cookieParser = require('cookie-parser'),
    mongoStore = require('connect-mongo')(session),
    flash = require('connect-flash'),
    helpers = require('view-helpers'),
    config = require('./config'),
    apiRoutes = require('./routes');

module.exports = function(app, passport, mongoose) {
    app.set('showStackError', true);

    //Should be placed before express.static
    app.use(compression({
        filter: function(req, res) {
            return (/json|text|javascript|css/).test(res.getHeader('Content-Type'));
        },
        level: 9
    }));

    //Setting the fav icon and static folder
    app.use(favicon(config.root + '/public/img/icons/favicon.ico'));
    app.use(express.static(config.root + '/public'));

    //Don't use logger for test env
    if (process.env.NODE_ENV !== 'test') {
        app.use(logger('dev'));
    }

    //Set views path, template engine and default layout
    app.set('views', config.root + '/app/views');
    app.set('view engine', 'jade');

    //Enable jsonp
    app.enable('jsonp callback');

    //cookieParser should be above session
    app.use(cookieParser());

    //bodyParser should be above methodOverride
    // app.use(express.bodyParser());
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(methodOverride());

    //express/mongo session storage
    app.use(session({
        secret: 'MEAN',
        resave: false,
        saveUninitialized: true,
        store: new mongoStore({
            url: config.db,
            collection: 'sessions',
            mongoose_connection: mongoose.connection
        })
    }));

    //connect flash for flash messages
    app.use(flash());

    //dynamic helpers
    app.use(helpers(config.app.name));

    //use passport session
    app.use(passport.initialize());
    app.use(passport.session());

    app.use('/', apiRoutes);

    //Assume "not found" in the error msgs is a 404. this is somewhat silly, but valid, you can do whatever you like, set properties, use instanceof etc.
    app.use(function(err, req, res, next) {
        //Treat as 404
        if (~err.message.indexOf('not found')) return next();

        //Log it
        console.error(err.stack);

        //Error page
        res.status(500).render('500', {
            error: err.stack
        });
    });

    //Assume 404 since no middleware responded
    app.use(function(req, res, next) {
        res.status(404).render('404', {
            url: req.originalUrl,
            error: 'Not found'
        });
    });
};
