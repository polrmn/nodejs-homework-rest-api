const nodemailer = require('nodemailer')
require('dotenv').config()

const { GMAIL_APP_PASSWORD } = process.env;

const nodemailerConfig = {
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: "oroquaq@gmail.com",
    pass: GMAIL_APP_PASSWORD,
  },
};

const transport = nodemailer.createTransport(nodemailerConfig);

const sendEmail = async (data) => {
    const email = {...data, from: 'oroquaq@gmail.com'}
    await transport.sendMail(email)
    return true
}

module.exports = sendEmail;