import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../../config';
import { User } from './user.model';

export async function auth(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    res.status(401).send({ message: 'Unauthorized' });
    return;
  }

  const isUserToken = !token.startsWith('HANAKO.');

  if (isUserToken) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);

      const user = await User.findById((decoded as any).id).select('-password');

      (req as any).user = user;
      next();
    } catch (err) {
      res.status(401).send({ message: 'Unauthorized' });
    }
    return;
  }

  const tokenOwner = await User.findOne({ 'tokens.token': token }).select('-password');

  if (!tokenOwner) {
    res.status(401).send({ message: 'Unauthorized' });
    return;
  }

  const tokenData = token.split('.');
  const userId = tokenData[1];

  if (userId !== tokenOwner._id.toString()) {
    res.status(401).send({ message: 'Unauthorized' });
    return;
  }

  (req as any).user = tokenOwner;
  next();
}
