const React = require('react');

const VerifyEmail = ({ name, verificationLink }) => {
  return React.createElement(
    'div',
    { style: { fontFamily: 'sans-serif', color: '#333' } },
    React.createElement('h1', null, `Verify Your Email, ${name}`),
    React.createElement('p', null, 'Please click the button below to verify your email address and activate your ElleStyle account.'),
    React.createElement(
      'a',
      {
        href: verificationLink,
        style: {
          display: 'inline-block',
          padding: '12px 24px',
          backgroundColor: '#000',
          color: '#fff',
          textDecoration: 'none',
          borderRadius: '4px',
          marginTop: '16px',
        },
      },
      'Verify Email'
    ),
    React.createElement('p', { style: { marginTop: '24px', fontSize: '12px', color: '#777' } }, 'If you did not request this, please ignore this email.')
  );
};

module.exports = VerifyEmail;
