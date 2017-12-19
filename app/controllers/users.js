/**
 * Module dependencies.
 */
var jwt = require('jsonwebtoken');
var mongoose = require('mongoose'),
  User = mongoose.model('User');
var avatars = require('./avatars').all();
var nodemailer = require('nodemailer');


import avatar from './avatars';

const User = mongoose.model('User');
const avatars = avatar.all();
const secret = process.env.JWT_SECRET;

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
  },
  inviteUser: (req, res) => {
    const userEmail = req.body.email;
    const { link } = req.body;
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
      html: `<div style = "width: 70%; height: 6margin: 0 auto; padding: 3%;" >
                    <div style = "background-color: black; color: #FFF; padding: 1%; text-align: center;" >
                      <h4 class = "modal-title"> Card For Humanity - Annie-Hall </h4> 
                    </div> 
                    <center>
                      <p> You've been invited to join a gaming session on Cards for Humanity. </p> 
                      <p>
                        Click this link to join game:
                        <a href = ${link}> <button style = "background: #F6A623; color: #FFF; padding: 2%; border:0; border-radius: 5px;"> Join Game </button></a >
                        </p> 
                    </center> 
                    <div style = "font-size: 14px; margin-top: 6px; color: #fff; text-align: center; background-color: black; padding: 0.5%;" >
                      <p> 
                        Cardsfor Humanity - Annie-Hall & copy;2017 <br /> <a style = "color: #F6A623;"
                        href = "http://www.andela.com"> Andela </a>
                      </p>
                    <div>
                  </div>`
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
            var currUser = {
              id: newUser._id,
              name: newUser.name,
              email: newUser.email
            };
            var token = jwt.sign({
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
        res.status(200).json({
          message: 'Message sent successfully'
        });
      }
    });
  },
  searchUser: (req, res) => {
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
  },
  checkAvatar: (req, res) => {
    if (req.user && req.user._id) {
      User.findOne({
        _id: req.user._id
      })
        .exec((err, user) => {
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
  },
  create: (req, res) => {
    if (req.body.name && req.body.password && req.body.email) {
      User.findOne({
        email: req.body.email
      }).exec((err, existingUser) => {
        if (!existingUser) {
          const user = new User(req.body);
          // Switch the user's avatar index to an actual avatar url
          user.avatar = avatars[user.avatar];
          user.provider = 'local';
          user.save((err, newUser) => {
            if (err) {
              res.status(500).json({
                message: 'Internal Server error'
              });
            }
            req.logIn(user, (err) => {
              if (err) return next(err);
              const createdUser = {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email
              };
              const token = jwt.sign({
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
          id: existingUser._id,
          name: existingUser.name,
          email: existingUser.email
        };
        const token = jwt.sign({
          newUser
        }, secret, { expiresIn: '1h' });
        return res.status(200).json({ message: 'Login Successful', token });
      });
  }
  return res.redirect('/#!/app');
};

/**
 *  Show profile
 */
exports.show = function(req, res) {
  var user = req.profile;


  addDonation: (req, res) => {
    if (req.body && req.user && req.user._id) {
      // Verify that the object contains crowdrise data
      if (req.body.amount && req.body.crowdrise_donation_id && req.body.donor_name) {
        User.findOne({
          _id: req.user._id
        })
          .exec((err, user) => {
            // Confirm that this object hasn't already been entered
            let duplicate = false;
            for (let i = 0; i < user.donations.length; i++) {
              if (user.donations[i].crowdrise_donation_id === req.body.crowdrise_donation_id) {
                duplicate = true;
              }
            }
            if (!duplicate) {
              // TODO Remove this console.log
              console.log('Validated donation');
              user.donations.push(req.body);
              user.premium = 1;
              user.save();
            }
          });
      }
    }
    res.send();
  },
  show: (req, res) => {
    const user = req.profile;

    res.render('users/show', {
      title: user.name,
      user
    });
  },
  me: (req, res) => {
    res.json(req.user || null);
  },
  user: (req, res, next, id) => {
    User.findOne({
      _id: id
    })
      .exec((err, foundUser) => {
        if (err) return next(err);
        if (!foundUser) return next(new Error(`Failed to load User ${id}`));
        req.profile = foundUser;
        next();
      });
  }
};

/**
 * @returns {void} description
 * get donation
 * @export
 * @param {any} req
 * @param {any} res
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

