const express = require('express');
// get the check function from the package.
const { check, body } = require('express-validator/check');

const authController = require('../controllers/auth');
const router = express.Router();
const User = require('../models/user');

router.get('/login', authController.getLogin);

router.post(
  '/login', 
  [
    body('email')
      .isEmail()
      .withMessage('Please enter a valid email address.')
      .normalizeEmail(),
    body('password', 'Please enter a valid password.')
      .isLength({min: 3})
      .isAlphanumeric()
      .trim()
  ],
  authController.postLogin);

router.get('/signup', authController.getSignup);

router.post(
  '/signup', 
  [
    check('email')
      .isEmail().withMessage('Please enter a valid email')
      .normalizeEmail()
      .custom((value, {req}) => {
        return User.findOne({email: value})
          .then(user => {
            console.log(user);
            if (user) {
              return Promise.reject('Email address already exists, please sign in');
            }
          });
      }),
    body('password',
      'Please enter a valid password')
      .isLength({min: 3}).isAlphanumeric().trim(),
    body('password2').trim()
      .custom((value, {req}) => {
        if (value !== req.body.password) {
          throw new Error('Passwords have to match.')
        }
        return true;
      })
  ]
  , authController.postSignup);

router.post('/logout', authController.postLogout);

router.get('/reset', authController.getReset);

router.post('/reset', authController.postReset);

router.get('/reset/:token', authController.getNewPassword);

router.post('/new-password', authController.postNewPassword);

module.exports = router;