const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');
const emailService = require('./emailService');
const env = require('../config/env');

const googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID || 'dummy_client_id');

class AuthService {
  generateAccessToken(user) {
    return jwt.sign(
      { id: user._id, role: user.role },
      env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '15m' }
    );
  }

  async generateRefreshToken(user) {
    const token = crypto.randomBytes(40).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const refreshToken = new RefreshToken({
      token,
      user: user._id,
      expiresAt,
    });
    await refreshToken.save();
    return token;
  }

  async hashPassword(password) {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  }

  async comparePassword(enteredPassword, hashedPassword) {
    return await bcrypt.compare(enteredPassword, hashedPassword);
  }

  generateRandomToken() {
    const token = crypto.randomBytes(20).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    return { token, hashedToken };
  }

  async signup(name, email, password, phone = '') {
    let user = await User.findOne({ email });
    if (user) {
      throw new Error('User already exists');
    }

    const hashedPassword = await this.hashPassword(password);
    const { token, hashedToken } = this.generateRandomToken();

    user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone: phone || undefined,
      emailVerificationToken: hashedToken,
      emailVerificationExpire: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    });

    try {
      await emailService.sendVerificationEmail(user.email, user.name, token);
    } catch (err) {
      console.error('[signup] Failed to send verification email:', err.message);
    }
    return user;
  }

  async verifyEmail(token) {
    if (!token) {
      throw new Error('Verification token is required');
    }

    try {
      const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
      const user = await User.findOne({
        emailVerificationToken: hashedToken,
        emailVerificationExpire: { $gt: Date.now() },
      });

      if (!user) {
        throw new Error('Invalid or expired verification token. If your email is already verified, you can log in directly.');
      }

      user.isEmailVerified = true;
      user.emailVerificationToken = undefined;
      user.emailVerificationExpire = undefined;
      await user.save();

      try {
        await emailService.sendWelcomeEmail(user.email, user.name);
      } catch (err) {
        console.error('[verifyEmail] Failed to send welcome email:', err.message);
      }

      const accessToken = this.generateAccessToken(user);
      const refreshToken = await this.generateRefreshToken(user);

      return { user, accessToken, refreshToken };
    } catch (error) {
      console.error('[verifyEmail Error]:', error.message);
      throw error;
    }
  }

  async resendVerificationEmail(email) {
    if (!email) {
      throw new Error('Email address is required');
    }
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('User with this email does not exist');
    }
    if (user.isEmailVerified) {
      throw new Error('Your email is already verified. You can log in.');
    }

    const { token, hashedToken } = this.generateRandomToken();
    user.emailVerificationToken = hashedToken;
    user.emailVerificationExpire = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    await user.save();

    await emailService.sendVerificationEmail(user.email, user.name, token);
    return true;
  }

  async updateProfile(userId, { name, phone }) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (name !== undefined && name.trim()) {
      user.name = name.trim();
    }
    if (phone !== undefined) {
      user.phone = phone.trim();
    }

    await user.save();
    return user;
  }

  async updateAddresses(userId, addresses) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    user.addresses = addresses;
    await user.save();
    return user;
  }

  async login(email, password) {
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isMatch = await this.comparePassword(password, user.password);
    if (!isMatch) {
      throw new Error('Invalid credentials');
    }

    if (!user.isEmailVerified) {
      const err = new Error('Please verify your email before logging in');
      err.isUnverified = true;
      throw err;
    }

    const accessToken = this.generateAccessToken(user);
    const refreshToken = await this.generateRefreshToken(user);

    return { user, accessToken, refreshToken };
  }

  async googleAuth(credential) {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { email, name, picture, sub: googleId, email_verified } = payload;

    let user = await User.findOne({ email });

    if (user) {
      // Link Google account if not linked
      if (!user.googleId) {
        user.googleId = googleId;
      }
      user.isEmailVerified = true;
      if (!user.profileImage || user.profileImage.includes('ui-avatars')) {
        user.profileImage = picture;
      }
      await user.save();
    } else {
      // Create new user
      user = await User.create({
        name: name || 'User',
        email,
        googleId,
        profileImage: picture,
        isEmailVerified: email_verified !== false, // Google verified
      });
      if (user.isEmailVerified) {
        try {
          await emailService.sendWelcomeEmail(user.email, user.name);
        } catch (err) {
          console.error('[googleAuth] Failed to send welcome email:', err.message);
        }
      }
    }

    const accessToken = this.generateAccessToken(user);
    const refreshToken = await this.generateRefreshToken(user);

    return { user, accessToken, refreshToken };
  }

  async forgotPassword(email) {
    const user = await User.findOne({ email });
    if (!user) {
      // Return true to avoid email enumeration
      return true;
    }

    const { token, hashedToken } = this.generateRandomToken();
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 minutes
    await user.save();

    await emailService.sendPasswordResetEmail(user.email, user.name, token);
    return true;
  }

  async resetPassword(token, newPassword) {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      throw new Error('Invalid or expired reset token');
    }

    user.password = await this.hashPassword(newPassword);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    return true;
  }

  async refreshAuthToken(refreshTokenStr) {
    const rToken = await RefreshToken.findOne({ token: refreshTokenStr }).populate('user');
    if (!rToken) {
      throw new Error('Invalid refresh token');
    }
    
    if (rToken.expiresAt < new Date()) {
      await RefreshToken.deleteOne({ _id: rToken._id });
      throw new Error('Refresh token expired');
    }

    const accessToken = this.generateAccessToken(rToken.user);
    return { accessToken, user: rToken.user };
  }

  async logout(refreshTokenStr) {
    await RefreshToken.deleteOne({ token: refreshTokenStr });
  }
}

module.exports = new AuthService();
