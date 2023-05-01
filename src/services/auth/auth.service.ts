import { Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

import { IUser, User } from './user.model';
import { JWT_SECRET } from '../../config';
import { auth } from './auth.middleware';

const logsService = {
  name: 'LogsService',
  routes: {
    'POST /users': 'createUser',
    'POST /auth/login': 'login',
    'GET /auth/api-token': 'getApiTokens',
    'POST /auth/api-token': 'createApiToken',
    'DELETE /auth/api-token': 'deleteApiToken',
  },
  actions: {
    createUser: {
      middleware: [
        rateLimit({
          windowMs: 15 * 60 * 1000,
          max: 20,
          standardHeaders: true,
          legacyHeaders: false,
        }),
      ],
      params: {
        email: 'email',
        password: { type: 'string', min: 6 },
        confirmPassword: { type: 'equal', field: 'password' },
      },
      async handler(req: Request, res: Response) {
        const user = await User.create({
          email: req.body.email,
          password: bcrypt.hashSync(req.body.password, 10),
        });

        delete user.password;

        res.status(201).send(user);
      },
    },
    login: {
      middleware: [
        rateLimit({
          windowMs: 15 * 60 * 1000,
          max: 20,
          standardHeaders: true,
          legacyHeaders: false,
        }),
      ],
      params: {
        email: 'email',
        password: 'string',
        rememberMe: { type: 'boolean', optional: true },
      },
      async handler(req: Request, res: Response) {
        const user = await User.findOne({ email: req.body.email });

        if (!user) {
          res.status(401).send({ message: 'Invalid credentials' });
          return;
        }

        if (!bcrypt.compareSync(req.body.password, user.password!)) {
          res.status(401).send({ message: 'Invalid credentials' });
          return;
        }

        const token = jwt.sign({ id: user._id }, JWT_SECRET!, {
          expiresIn: req.body.rememberMe ? '7d' : '1d',
        });

        res.status(200).send({ token });
      },
    },
    getApiTokens: {
      middleware: [
        rateLimit({
          windowMs: 15 * 60 * 1000,
          max: 20,
          standardHeaders: true,
          legacyHeaders: false,
        }),
        auth
      ],
      async handler(req: Request, res: Response) {
        const user = (req as any).user as IUser;

        res.status(200).send(user.tokens);
      },
    },
    createApiToken: {
      middleware: [
        rateLimit({
          windowMs: 15 * 60 * 1000,
          max: 20,
          standardHeaders: true,
          legacyHeaders: false,
        }),
        auth
      ],
      params: {
        name: 'string',
      },
      async handler(req: Request, res: Response) {
        const userId = (req as any).user._id;
        const token = `HANAKO.${userId}.${Date.now()}.${(this as any).randomBytes(9)}`;

        await User.updateOne(
          { _id: userId },
          {
            $push: {
              tokens: {
                name: req.body.name,
                token,
                createdAt: new Date(),
              },
            },
          },
        );

        res.status(201).send({ token });
      },
    },
    deleteApiToken: {
      middleware: [
        rateLimit({
          windowMs: 15 * 60 * 1000,
          max: 20,
          standardHeaders: true,
          legacyHeaders: false,
        }),
        auth
      ],
      params: {
        token: 'string',
      },
      async handler(req: Request, res: Response) {
        const user = (req as any).user as IUser;
        const token = req.body.token;

        if (!user.tokens.find((t) => t.token === token)) {
          res.status(404).send({ message: 'Token not found' });
          return;
        }

        await User.updateOne(
          { _id: user._id },
          {
            $pull: {
              tokens: {
                token,
              },
            },
          },
        );

        res.status(204).send();
      },
    },
  },
  methods: {
    randomBytes(length: number) {
      return crypto.randomBytes(length).toString('hex');
    },
  },
};

export default logsService;
