const authService = require('../services/authService');
const mediaService = require('../services/mediaService');

const setTokenCookie = (res, token) => {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

const formatUserResponse = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone || '',
  role: user.role,
  profileImage: user.profileImage,
  isEmailVerified: user.isEmailVerified,
});

exports.signup = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;
    await authService.signup(name, email, password, phone);
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
    const { user, accessToken, refreshToken } = await authService.verifyEmail(token);
    setTokenCookie(res, refreshToken);
    res.status(200).json({
      success: true,
      message: 'Email verified successfully',
      accessToken,
      user: formatUserResponse(user),
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.resendVerification = async (req, res, next) => {
  try {
    const { email } = req.body;
    await authService.resendVerificationEmail(email);
    res.status(200).json({
      success: true,
      message: 'Verification email sent. Please check your inbox.',
    });
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
      user: formatUserResponse(user),
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: error.message,
      isUnverified: !!error.isUnverified,
    });
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
      user: formatUserResponse(user),
    });
  } catch (error) {
    res.status(401).json({ success: false, message: error.message });
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone } = req.body;
    const updatedUser = await authService.updateProfile(req.user._id, { name, phone });
    res.status(200).json({
      success: true,
      user: formatUserResponse(updatedUser),
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateAddresses = async (req, res, next) => {
  try {
    const { addresses } = req.body;
    if (!Array.isArray(addresses)) {
      return res.status(400).json({ success: false, message: 'Addresses must be an array' });
    }
    const updatedUser = await authService.updateAddresses(req.user._id, addresses);
    res.status(200).json({
      success: true,
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone || '',
        role: updatedUser.role,
        profileImage: updatedUser.profileImage,
        isEmailVerified: updatedUser.isEmailVerified,
        addresses: updatedUser.addresses,
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload an image file' });
    }

    // Upload to Cloudinary under ElleStyle/Avatars/<userId>
    const folderPath = `ElleStyle/Avatars/${req.user._id}`;
    const result = await mediaService.uploadImage(req.file.buffer, folderPath);

    // Update user profile image
    req.user.profileImage = result.secure_url;
    await req.user.save();

    res.status(200).json({
      success: true,
      message: 'Avatar uploaded successfully',
      user: formatUserResponse(req.user),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
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
      user: formatUserResponse(user),
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
    res.status(200).json({
      success: true,
      user: {
        ...formatUserResponse(req.user),
        addresses: req.user.addresses,
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Address Management
exports.addAddress = async (req, res, next) => {
  try {
    const { addressLine1, addressLine2, city, state, postalCode, country, isDefault } = req.body;
    
    if (isDefault) {
      req.user.addresses.forEach(addr => {
        addr.isDefault = false;
      });
    }

    req.user.addresses.push({ addressLine1, addressLine2, city, state, postalCode, country, isDefault });
    
    // If it's the first address, make it default
    if (req.user.addresses.length === 1) {
      req.user.addresses[0].isDefault = true;
    }

    await req.user.save();

    res.status(200).json({
      success: true,
      addresses: req.user.addresses,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateAddress = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { addressLine1, addressLine2, city, state, postalCode, country, isDefault } = req.body;

    const address = req.user.addresses.id(id);
    if (!address) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    if (isDefault) {
      req.user.addresses.forEach(addr => {
        addr.isDefault = false;
      });
    }

    address.addressLine1 = addressLine1 || address.addressLine1;
    address.addressLine2 = addressLine2 !== undefined ? addressLine2 : address.addressLine2;
    address.city = city || address.city;
    address.state = state || address.state;
    address.postalCode = postalCode || address.postalCode;
    address.country = country || address.country;
    if (isDefault !== undefined) {
      address.isDefault = isDefault;
    }

    await req.user.save();

    res.status(200).json({
      success: true,
      addresses: req.user.addresses,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteAddress = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const address = req.user.addresses.id(id);
    if (!address) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    req.user.addresses.pull(id);
    
    // If the deleted address was default, make the first remaining one default
    if (address.isDefault && req.user.addresses.length > 0) {
      req.user.addresses[0].isDefault = true;
    }

    await req.user.save();

    res.status(200).json({
      success: true,
      addresses: req.user.addresses,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.setDefaultAddress = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const address = req.user.addresses.id(id);
    if (!address) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    req.user.addresses.forEach(addr => {
      addr.isDefault = false;
    });

    address.isDefault = true;
    await req.user.save();

    res.status(200).json({
      success: true,
      addresses: req.user.addresses,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
