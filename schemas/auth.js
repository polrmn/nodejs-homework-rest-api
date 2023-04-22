const Joi = require("joi");

const emailRegexp = /^\S+@\S+\.\S+$/;

const registerSchema = Joi.object({
  email: Joi.string().pattern(emailRegexp).required(),
  password: Joi.string().required(),
});

const loginSchema = Joi.object({
  email: Joi.string().pattern(emailRegexp).required(),
  password: Joi.string().required(),
});

const verifySchema = Joi.object({
  email: Joi.string().pattern(emailRegexp).required(),
});

module.exports = {
  registerSchema,
  loginSchema,
  verifySchema,
};