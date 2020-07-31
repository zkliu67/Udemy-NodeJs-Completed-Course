const crypto = require('crypto'); // generate unique values
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');
// get all validation result from check function
const { validationResult } = require('express-validator/check');

const User = require('../models/user');

const transporter = nodemailer.createTransport(sendgridTransport({
  auth: {
    api_key: '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'
  }
}));

exports.getLogin = (req, res, next) => {
  // const isLoggedIn = req.get('Cookie').trim().split('=')[1];
  // console.log(req.session.isLoggedIn);
  let message = req.flash('error');

  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }

  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    isLoggedIn: req.session.isLoggedIn,
    errorMessage: message // pull the value from the key
  })
};

exports.postLogin = (req, res, next) => {
  //res.setHeader('Set-Cookie', 'loggedIn=true; Max-Age=5'); // header: Set-Cookie, content: oggedIn=true
  // set a cookie to the browser of a single user.
  // and sends back to the server with every request it makes.
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // 422 indicates validation error
    // instead of redirect
    return res.status(422)
      .render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        isLoggedIn: req.session.isLoggedIn,
        errorMessage: errors.array()[0].msg
      });
  }

  const {email, password} = req.body;

  User.findOne({email: email})
    .then(user => {
      if (!user) {
        req.flash('error', 'Invalid email!');// key, value
        return res.redirect('/login');
      }

      return bcrypt
        .compare(password, user.password)
        .then(doMatch => {
          if (doMatch) {
            req.session.isLoggedIn = true;
            req.session.user = user;
            
            return req.session.save(err => {
              console.log(err);
              res.redirect('/');
            });
          }
          req.flash('error', 'Invalid password!');
          res.redirect('/login')
        } )
        .catch(err => {
          return res.redirect('/login');
        })
    })
    .catch(err => {
      const error = new Error('Failed creating new product');
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getSignup = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'Signup',
    isLoggedIn: req.session.isLoggedIn,
    errorMessage: message,
    oldInput: {email: '', password: '', password2: ''},
    validationError: []
  })
};

exports.postSignup = (req, res, next) => {
  const {email, password, password2} = req.body;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    // 422 indicates validation error
    // instead of redirect
    return res.status(422)
      .render('auth/signup', {
        path: '/signup',
        pageTitle: 'Signup',
        isLoggedIn: req.session.isLoggedIn,
        errorMessage: errors.array()[0].msg,
        oldInput: {email: email, password: password, password2: password2},
        validationError: errors.array()
      });
  }
  
  // check for duplicate email address in router middleware
  bcrypt
    .hash(password, 12) // take the string to be hashed, 
    .then(hashedPassword => {
      const user = new User({
        email: email,
        password: hashedPassword,
        cart: {items: []}
      })
      return user.save();
    })
    .then(() => {
      res.redirect('/login');
      // return transporter.sendMail({
      //   to: 'leona.zkliu@gmail.com',
      //   from: 'duml2007@icloud.com',
      //   subject: 'Signup Succeed',
      //   html: '<h1>You successfully signed up</h1>'
      // })
      // .catch(err => {
      //   console.log(err);
      // })
    })
    .catch(err => {
      const error = new Error('Failed creating new product');
      error.httpStatusCode = 500;
      return next(error);
    })
};

exports.postLogout = (req, res, next) => {
  req.session.destroy(err => {
    console.log(err);
    const error = new Error('Failed creating new product');
    error.httpStatusCode = 500;
    return next(error);
  })
};

exports.getReset = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render('auth/reset-password', {
    path: '/reset',
    pageTitle: 'Reset Password',
    errorMessage: message
  })
};

exports.postReset = (req, res, next) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
      return res.redirect('/reset');
    }

    // stores in the database
    // stores with the user.
    const token = buffer.toString('hex');
    User.findOne({email: req.body.email})
      .then(user => {
        if (!user) {
          req.flash('error', 'No account with email found.')
          res.redirect('/reset');
        }

        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000;
        return user.save();
      })
      .then(result => {
        res.redirect(`/reset/${token}`);
        // transporter.sendMail({
        //     to: req.body.email,
        //     from: 'shop@node-complete.com',
        //     subject: 'Password Reset',
        //     html: `
        //       <p>You request a password reset</p>
        //       <p>Click this <a href="http://localhost:3000/reset/${token}"> Link </a>to reset the password.</p>
        //     `
        //   })
        //   .catch(err => {
        //     console.log(err);
        //   })
      })
      .catch(err => {
        const error = new Error('Failed creating new product');
        error.httpStatusCode = 500;
        return next(error);
      })
  });
};

exports.getNewPassword = (req, res, next) => {
  const token = req.params.token;
  User.findOne({resetToken: token, resetTokenExpiration: {$gt: Date.now()}})
    .then(user => {
      
      let message = req.flash('error');
      if (message.length > 0) {
        message = message[0];
      } else {
        message = null;
      }
      res.render('auth/new-password', {
        path: '/new-password',
        pageTitle: 'New Password',
        errorMessage: message,
        userId: user._id.toString(),
        token: token
      })

    })
    .catch(err => {
      const error = new Error('Failed creating new product');
      error.httpStatusCode = 500;
      return next(error);
    })
}

exports.postNewPassword = (req, res, next) => {
  const newPassword = req.body.password;
  const userId = req.body.userId;
  const token = req.body.token;

  let resetUser;

  User.findOne({
    resetToken: token, 
    resetTokenExpiration: {$gt: Date.now()},
    _id: userId
  })
    .then(user => {
      resetUser = user;
      return bcrypt.hash(newPassword, 12);
    })
    .then(hashedPassword => {
      resetUser.password = hashedPassword;
      resetUser.resetToken = undefined;
      resetUser.resetTokenExpiration = undefined;
      return resetUser.save();
    })
    .then(result => {
      res.redirect('/login');
    })
    .catch(err => {
      const error = new Error('Failed creating new product');
      error.httpStatusCode = 500;
      return next(error);
    })

}