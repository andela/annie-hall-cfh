/**
 * Module dependencies.
 */
var jwt = require('jsonwebtoken');
var mongoose = require('mongoose'),
  User = mongoose.model('User');
var avatars = require('./avatars').all();

var secret = process.env.JWT_SECRET;

/**
 * Auth callback
 */
exports.authCallback = function(req, res, next) {
  res.redirect('/chooseavatars');
};

/**
 * Show login form
 */
exports.signin = function(req, res) {
  if (!req.user) {
    res.redirect('/#!/signin?error=invalid');
  } else {
    res.redirect('/#!/app');
  }
};

/**
 * Show sign up form
 */
exports.signup = function(req, res) {
  if (!req.user) {
    res.redirect('/#!/signup');
  } else {
    res.redirect('/#!/app');
  }
};

/**
 * Logout
 */
exports.signout = function(req, res) {
  req.logout();
  return res.json({
    message: 'Logged Out'
  });
};

/**
 * Session
 */
exports.session = function(req, res) {
  res.redirect('/');
};

/** 
 * Check avatar - Confirm if the user who logged in via passport
 * already has an avatar. If they don't have one, redirect them
 * to our Choose an Avatar page.
 */ 
exports.checkAvatar = function(req, res) {
  if (req.user && req.user._id) {
    User.findOne({
      _id: req.user._id
    })
      .exec(function(err, user) {
        if (user.avatar !== undefined) {
          res.redirect('/#!/');
        } else {
          res.redirect('/#!/choose-avatar');
        }
      });
  } else {
    // If user doesn't even exist, redirect to /
    res.redirect('/');
  }

};

/**
 * Create user
 */
exports.create = function(req, res) {
  if (req.body.name && req.body.password && req.body.email) {
    User.findOne({
      email: req.body.email
    }).exec(function(err, existingUser) {
      if (!existingUser) {
        var user = new User(req.body);
        // Switch the user's avatar index to an actual avatar url
        user.avatar = avatars[user.avatar];
        user.provider = 'local';
        user.save(function(err, newUser) {
          if (err) {
            res.status(500).json({
              message: 'Internal Server error'
            });
          }
          req.logIn(user, function(err) {
            if (err) return next(err);
            var createdUser = {
              id: newUser._id,
              name: newUser.name,
              email: newUser.email
            };
            var token = jwt.sign({
              createdUser
            }, secret, { expiresIn: '1h' });
            return res.status(201).json({
              token,
              message: 'Successfully signed up',
              newUser
            });
          });
        });
      } else {
        return res.status(401).json({
          message: 'User already exist'
        });
      }
    });
  } else {
    return res.status(400).json({
      message: 'Field must not be empty'
    });
  }
};

/*
 * [signin a user]
 * @method jwtSignIn
 * @param  {[type]} req [the user infomation sent from the frontend]
 * @param  {[type]} res [the result of the registration]
 * @return {[type]} Object
 */
exports.userSignIn = (req, res) => {
  if (!req.body.email || !req.body.password) {
    return res.status(400).json({ message: 'Enter all required field' });
  }
  User.findOne({
    email: req.body.email
  }).exec((error, existingUser) => {
    if (error) {
      return res.status(500).json({
        message: 'Something went wrong'
      });
    }
    if (!existingUser) {
      return res.status(404).json({
        message: 'User not found'
      });
    }
    if (!existingUser.authenticate(req.body.password)) {
      return res.status(400).json({
        message: 'Invalid Login details'
      });
    }
    req.logIn(existingUser, () => {
      const newUser = {
        name: existingUser.name,
        email: existingUser.email
      };
      const token = jwt.sign({
        newUser
      }, secret, { expiresIn: '1h' });
      return res.status(200).json({ message: 'Login Successful', token });
    });
  });
};

/**
 * Assign avatar to user
 */
exports.avatars = function(req, res) {
  // Update the current user's profile to include the avatar choice they've made
  if (req.user && req.user._id && req.body.avatar !== undefined &&
    /\d/.test(req.body.avatar) && avatars[req.body.avatar]) {
    User.findOne({
      _id: req.user._id
    })
      .exec(function(err, user) {
        user.avatar = avatars[req.body.avatar];
        user.save();
      });
  }
  return res.redirect('/#!/app');
};

exports.addDonation = function(req, res) {
  if (req.body && req.user && req.user._id) {
    // Verify that the object contains crowdrise data
    if (req.body.amount && req.body.crowdrise_donation_id && req.body.donor_name) {
      User.findOne({
        _id: req.user._id
      })
        .exec(function(err, user) {
        // Confirm that this object hasn't already been entered
          var duplicate = false;
          for (var i = 0; i < user.donations.length; i++ ) {
            if (user.donations[i].crowdrise_donation_id === req.body.crowdrise_donation_id) {
              duplicate = true;
            }
          }
          if (!duplicate) {
            console.log('Validated donation');
            user.donations.push(req.body);
            user.premium = 1;
            user.save();
          }
        });
    }
  }
  res.send();
};

/**
 *  Show profile
 */
exports.show = function(req, res) {
  var user = req.profile;

  res.render('users/show', {
    title: user.name,
    user: user
  });
};

/**
 * Send User
 */
exports.me = function(req, res) {
  res.jsonp(req.user || null);
};

/**
 * Find user by id
 */
exports.user = function(req, res, next, id) {
  User
    .findOne({
      _id: id
    })
    .exec(function(err, user) {
      if (err) return next(err);
      if (!user) return next(new Error('Failed to load User ' + id));
      req.profile = user;
      next();
    });
};
