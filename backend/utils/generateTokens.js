import jwt from 'jsonwebtoken';
import 'dotenv/config';

export const generateTokens = (res, userId) => {
  // Access Token — short lived
  const accessToken = jwt.sign({ id: userId }, process.env.SECRET_KEY, {
    expiresIn: '15m',
  });

  // Refresh Token — long lived
  const refreshToken = jwt.sign({ id: userId }, process.env.REFRESH_SECRET, {
    expiresIn: '7d',
  });

  // Set Access Token cookie
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000, // 15 mins
  });

  // Set Refresh Token cookie
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  return { accessToken, refreshToken };
};
