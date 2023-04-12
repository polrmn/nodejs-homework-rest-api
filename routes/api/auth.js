const express = require('express')
const HttpError = require("../../helpers/HttpError");
const validateBody = require("../../utils/validateBody");
const schemas = require('../../schemas/auth');
const { register, login, getCurrent, logout } = require("../../controllers/auth");
const authenticate = require('../../middlewares/authenticate')

const router = express.Router()

router.post('/register', validateBody(schemas.registerSchema), register);

router.post('/login', validateBody(schemas.loginSchema), login);

router.get('/current', authenticate, getCurrent);

router.post('/logout', authenticate, logout)



module.exports = router
