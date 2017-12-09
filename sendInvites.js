const nodemailer = require('nodemailer');

exports.sendMessage = function (details, recipient) {
  console.log('inside sendMessage');
  const transport = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD
    }
  });

  const message = {
    from: 'no_reply@cardsForHumanity.com',
    to: recipient,
    subject: 'Game Invite!',
    text: `click on this link to join game ${details}`,
    html: `<p> click on this link to join game <a>${details} </a> </p>`
  };

  transport.sendMail({
    message,
    function(error) {
      if (error) {
        return 'Error. Couldn\`t send message';
      }
      return `Message sent to ${recipient}`;
    }
  });
};
