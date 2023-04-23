const fs = require('fs')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const gravatar = require('gravatar')
const path = require('path')
const jimp = require('jimp')
const {v4} = require('uuid')
const User = require('../models/user');
const ctrlWrapper = require("../utils/ctrlWrapper");
const HttpError = require('../helpers/HttpError');
const sendEmail = require('../helpers/sendEmail')

const { SECRET_KEY, BASE_URL } = process.env;

const avatarDir = path.join(__dirname, '../', 'public', 'avatars')

const register = async (req, res) => {
    const {email, password} = req.body
    const user = await User.findOne({email});
    if (user) {
        throw HttpError(409, "Email in use");
    }
    const hashPassword = await bcrypt.hash(password, 10);
    const avatarURL = gravatar.url(email);
    const verificationToken = v4();

    const newUser = await User.create({
      ...req.body,
      password: hashPassword,
      avatarURL,
      verificationToken,
    });

    const verifyEmail = {
      to: email,
      subject: "Verify email",
      html: `<a target='_blank' href='${BASE_URL}/api/auth/verify/${verificationToken}'>Click to verify your email</a>`,
    };

    await sendEmail(verifyEmail);

    res.status(201).json({
      email: newUser.email,
      subscription: newUser.subscription,
    });
}

const login = async (req, res) => {
    const {email, password} = req.body
    const user = await User.findOne({email})
    if (!user) {
        throw HttpError(401, "Email or password is wrong");
    }
    if(!user.verify) {
      throw HttpError(401, "Email not verify");
    }
    const passwordCompare = await bcrypt.compare(password, user.password)
    if (!passwordCompare) {
        throw HttpError(401, "Email or password is wrong");
    }

    const payload = {
        id: user._id
    }
    const token = jwt.sign(payload, SECRET_KEY, {expiresIn: "23h"})
    await User.findByIdAndUpdate(user._id, {token})
    res.json({token: token, user: {email: user.email, subscription: user.subscription }})
}

const verifyEmail = async (req, res) => {
  const {verificationToken} = req.params
  const user = await User.findOne({ verificationToken });
  if (!user) {
    throw HttpError(404, "User not found");
  }
  await User.findByIdAndUpdate(user._id, { verify: true, verificationToken: '' });

  res.json({
    message: 'Verify succes'
  })
}

const resendEmail = async (req, res) => {
  const {email} = req.body
  const user = await User.findOne({email})

  if (!user) {
    throw HttpError(404, "User not found");
  }
  if (user.verify) {
    throw HttpError(400, "Verification has already been passed");
  }

  const verifyEmail = {
    to: email,
    subject: "Verify email",
    html: `<a target='_blank' href='${BASE_URL}/api/auth/verify/${user.verificationToken}'>Click to verify your email</a>`,
  };

  await sendEmail(verifyEmail);

  res.json({
    message: 'Verification email sent'
  })
}

const getCurrent = async (req, res) => {
    const {email, subscription} = req.user;
    res.json({ email, subscription });
}

const logout = async (req, res) => {
    const {_id} = req.user;
    await User.findByIdAndUpdate(_id, {token: ''});
    res.status(204).json()
}

const updateAvatar = async (req, res) => {
  const { path: tmpUpload, filename } = req.file;
  const { _id } = req.user;
  const savename = `${_id}_${filename}`;
  const resultUpload = path.join(avatarDir, savename);
  const avatarURL = path.join("avatars", savename);

  const image = await jimp.read(tmpUpload);
  image.resize(250,250);
  await image.writeAsync(resultUpload);
  
  await User.findByIdAndUpdate(_id, { avatarURL });
  res.json({
    avatarURL,
  });
};


module.exports = {
  register: ctrlWrapper(register),
  login: ctrlWrapper(login),
  verifyEmail: ctrlWrapper(verifyEmail),
  resendEmail: ctrlWrapper(resendEmail),
  getCurrent: ctrlWrapper(getCurrent),
  logout: ctrlWrapper(logout),
  updateAvatar: ctrlWrapper(updateAvatar)
};