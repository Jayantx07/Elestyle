const React = require('react');

const Welcome = ({ name }) => {
  return React.createElement(
    'div',
    { style: { fontFamily: 'sans-serif', color: '#333' } },
    React.createElement('h1', null, `Welcome to ElleStyle, ${name}!`),
    React.createElement('p', null, 'We are thrilled to have you here.'),
    React.createElement('p', null, 'Explore our latest collections and find your perfect style.'),
    React.createElement(
      'a',
      {
        href: process.env.APP_URL || 'https://ellestyle.in',
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
      'Start Shopping'
    )
  );
};

module.exports = Welcome;
