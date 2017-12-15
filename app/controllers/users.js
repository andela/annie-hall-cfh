/**
 * Module dependencies.
 */
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import nodemailer from 'nodemailer';

const User = mongoose.model('User');

const avatars = require('./avatars').all();

const secret = process.env.JWT_SECRET;

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

exports.inviteUser = function (req, res) {
  const userEmail = req.body.email;
  const link = req.body.link;
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    secure: false,
    port: 25,
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD
    },
    tls: {
      rejectUnauthorized: false
    }
  });
  const mailBody = {
    from: '"Cards for Humanity" <cardsForHumanity@cfh.com>',
    to: userEmail,
    subject: 'Game Invite!',
    text: `You've been invited to join a gaming session on Cards for Humanity. Join by clicking this link ${link}`,
    html: `<b><h3>You've been invited to join a gaming session on Cards for Humanity. Join by clicking this link </h3><a>${link}</a></b>`
  };

  transporter.sendMail(mailBody, (error) => {
    if (error) {
      res.status(400).json({
        message: 'An error occured while trying to send your mail',
        error
      });
    } else {
      res.status(200).json({
        message: 'Message sent successfully'
      });
    }
  });
};

exports.searchUser = function (req, res) {
  const query = req.params.userParam;
  User.find({
    $or: [
      { email: { $regex: `.*${query}.*` } }, { name: { $regex: `.*${query}.*` } }
    ]
  }, 'email name').exec((err, user) => {
    if (err) {
      return res.status(500).json({ Message: 'Internal server error' });
    }
    return res.status(200).json({ Message: 'Success', User: user });
  });
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
        const user = new User(req.body);
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
            const currUser = {
              id: newUser._id,
              name: newUser.name,
              email: newUser.email
            };
            const token = jwt.sign({
              currUser
            }, secret, { expiresIn: '1h' });
            return res.status(201).json({
              token,
              message: 'Successfully signed up',
              currUser
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
      const currUser = {
        id: existingUser._id,
        name: existingUser.name,
        email: existingUser.email
      };
      const token = jwt.sign({
        currUser
      }, secret, { expiresIn: '24h' });
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
      if (!user) return next(new Error(`Failed to load User ${id}`));
      req.profile = user;
      next();
    });
};

/**
 * get donation
 * @export
 * @param {any} req
 * @param {any} res
 * @returns {void} description
 */
export function getDonation(req, res) {
  if (req.decoded) {
    const userId = req.decoded.createdUser.id;
    User.findById({
      _id: userId
    })
      .exec((err, userDonations) => {
        if (err) {
          return res.status(500).send({
            message: 'Donation not succesfully retrieved'
          });
        }
        return res.status(200).json(userDonations);
      });
  } else {
    return res.status(401).send({ message: 'Unauthenticated user' });
  }
}
