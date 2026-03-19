import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jsonwebtoken from 'jsonwebtoken';
import { User } from '../models/User';

const generateTokens = (userId: string) => {
  const accessToken = jsonwebtoken.sign({ id: userId }, process.env.JWT_SECRET as string, { expiresIn: '15m' });
  const refreshToken = jsonwebtoken.sign({ id: userId }, process.env.JWT_REFRESH_SECRET as string, { expiresIn: '7d' });
  return { accessToken, refreshToken };
};

export const registerUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400).json({ error: { message: 'User already exists', status: 400 } });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    const { accessToken, refreshToken } = generateTokens(user.id);
    
    // In production, save refresh token to DB or hashed
    user.refreshTokens.push(refreshToken);
    await user.save();

    res.status(201).json({
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        email: user.email,
      },
      accessToken,
      refreshToken
    });
  } catch (error) {
    res.status(500).json({ error: { message: 'Server error', status: 500 } });
  }
};

export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user || !user.password) {
      res.status(401).json({ error: { message: 'Invalid email or password', status: 401 } });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ error: { message: 'Invalid email or password', status: 401 } });
      return;
    }

    const { accessToken, refreshToken } = generateTokens(user.id);

    // Save refresh token
    user.refreshTokens.push(refreshToken);
    await user.save();

    res.status(200).json({
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        email: user.email,
      },
      accessToken,
      refreshToken
    });
  } catch (error) {
    res.status(500).json({ error: { message: 'Server error', status: 500 } });
  }
};

export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(401).json({ error: { message: 'No refresh token provided', status: 401 } });
      return;
    }

    const decoded = jsonwebtoken.verify(refreshToken, process.env.JWT_REFRESH_SECRET as string) as { id: string };
    const user = await User.findById(decoded.id);

    if (!user || !user.refreshTokens.includes(refreshToken)) {
      res.status(403).json({ error: { message: 'Invalid refresh token', status: 403 } });
      return;
    }

    const newTokens = generateTokens(user.id);
    
    user.refreshTokens = user.refreshTokens.filter(t => t !== refreshToken);
    user.refreshTokens.push(newTokens.refreshToken);
    await user.save();

    res.status(200).json(newTokens);
  } catch (error) {
    res.status(403).json({ error: { message: 'Invalid refresh token', status: 403 } });
  }
};

export const logoutUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;
    
    if (refreshToken) {
      const decoded = jsonwebtoken.decode(refreshToken) as { id: string };
      if (decoded && decoded.id) {
        const user = await User.findById(decoded.id);
        if (user) {
          user.refreshTokens = user.refreshTokens.filter(t => t !== refreshToken);
          await user.save();
        }
      }
    }
    
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ error: { message: 'Server error', status: 500 } });
  }
};

export const getMe = async (req: any, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?.id);
    if (!user) {
      res.status(404).json({ error: { message: 'User not found', status: 404 } });
      return;
    }
    res.status(200).json({
      id: user.id,
      name: user.name,
      role: user.role,
      email: user.email,
    });
  } catch (error) {
    res.status(500).json({ error: { message: 'Server error', status: 500 } });
  }
};
