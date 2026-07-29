const authService = require('../services/authService');

const setTokenCookie = (res, token) => {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

exports.signup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    await authService.signup(name, email, password);
    res.status(201).json({
      success: true,
      message: 'Registration successful. Please check your email to verify your account.',
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ success: false, message: 'Token is required' });
    await authService.verifyEmail(token);
    res.status(200).json({ success: true, message: 'Email verified successfully' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { user, accessToken, refreshToken } = await authService.login(email, password);
    setTokenCookie(res, refreshToken);
    res.status(200).json({
      success: true,
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    res.status(401).json({ success: false, message: error.message });
  }
};

exports.googleAuth = async (req, res, next) => {
  try {
    const { credential } = req.body;
    if (!credential) return res.status(400).json({ success: false, message: 'Google credential is required' });
    
    const { user, accessToken, refreshToken } = await authService.googleAuth(credential);
    setTokenCookie(res, refreshToken);
    res.status(200).json({
      success: true,
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    res.status(401).json({ success: false, message: error.message });
  }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    await authService.forgotPassword(email);
    res.status(200).json({
      success: true,
      message: 'If an account with that email exists, we have sent a password reset link.',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    await authService.resetPassword(token, password);
    res.status(200).json({
      success: true,
      message: 'Password has been reset successfully',
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.refreshToken = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ success: false, message: 'Not authorized, no refresh token' });
    }
    const { accessToken, user } = await authService.refreshAuthToken(refreshToken);
    res.status(200).json({
      success: true,
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
      }
    });
  } catch (error) {
    res.status(401).json({ success: false, message: error.message });
  }
};

exports.logout = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
      await authService.logout(refreshToken);
    }
    res.cookie('refreshToken', 'none', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true,
    });
    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error during logout' });
  }
};

exports.getMe = async (req, res, next) => {
  try {
    // req.user is populated by protect middleware
    res.status(200).json({
      success: true,
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        profileImage: req.user.profileImage,
        addresses: req.user.addresses,
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
