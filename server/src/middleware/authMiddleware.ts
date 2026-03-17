import { Request, Response, NextFunction } from 'express';
import jsonwebtoken from 'jsonwebtoken';
import { User, IUser } from '../models/User';

export interface AuthRequest extends Request {
  user?: IUser;
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // Decode token
      const decoded = jsonwebtoken.verify(token, process.env.JWT_SECRET as string) as { id: string };

      // Get user from the token
      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        res.status(401).json({ error: { message: 'Not authorized, user not found', status: 401 } });
        return;
      }

      req.user = user;
      next();
    } catch (error) {
      res.status(401).json({ error: { message: 'Not authorized, token failed', status: 401 } });
    }
  } else {
    res.status(401).json({ error: { message: 'Not authorized, no token', status: 401 } });
  }
};

export const adminGuard = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ error: { message: 'Not authorized as admin', status: 403 } });
  }
};
