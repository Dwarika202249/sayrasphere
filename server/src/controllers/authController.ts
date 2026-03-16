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
