const React = require('react');

const ResetPassword = ({ name, resetLink }) => {
  return React.createElement(
    'div',
    { style: { fontFamily: 'sans-serif', color: '#333' } },
    React.createElement('h1', null, `Password Reset Request, ${name}`),
    React.createElement('p', null, 'You requested to reset your password. Click the button below to set a new password. This link is valid for 15 minutes.'),
    React.createElement(
      'a',
      {
        href: resetLink,
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
      'Reset Password'
    ),
    React.createElement('p', { style: { marginTop: '24px', fontSize: '12px', color: '#777' } }, 'If you did not request this, please ignore this email.')
  );
};

module.exports = ResetPassword;
