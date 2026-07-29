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

  async signup(name, email, password) {
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
      emailVerificationToken: hashedToken,
      emailVerificationExpire: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    });

    await emailService.sendVerificationEmail(user.email, user.name, token);
    return user;
  }

  async verifyEmail(token) {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpire: { $gt: Date.now() },
    });

    if (!user) {
      throw new Error('Invalid or expired verification token');
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpire = undefined;
    await user.save();

    await emailService.sendWelcomeEmail(user.email, user.name);
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
      throw new Error('Please verify your email before logging in');
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
      // If user exists but is not verified, and this isn't a google account yet, reject auto-link
      if (!user.isEmailVerified && !user.googleId) {
        throw new Error('Account exists but email is not verified. Please verify your email first.');
      }
      
      // Link Google account if not linked
      if (!user.googleId) {
        user.googleId = googleId;
        if (!user.profileImage || user.profileImage.includes('ui-avatars')) {
          user.profileImage = picture;
        }
        await user.save();
      }
    } else {
      // Create new user
      user = await User.create({
        name,
        email,
        googleId,
        profileImage: picture,
        isEmailVerified: email_verified, // Google verified
      });
      if (email_verified) {
        await emailService.sendWelcomeEmail(user.email, user.name);
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
    // Optionally rotate refresh token here, but keeping it simple as per original design.
    return { accessToken, user: rToken.user };
  }

  async logout(refreshTokenStr) {
    await RefreshToken.deleteOne({ token: refreshTokenStr });
  }
}

module.exports = new AuthService();
