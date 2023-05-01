import { Request, Response } from 'express';
import { ILog, Log } from './logs.model';
import { auth } from '../auth/auth.middleware';
import { IUser } from '../auth/user.model';

const logsService = {
  name: 'LogsService',
  routes: {
    'POST /logs': 'saveLog',
    'GET /logs': 'getLogs',
    'GET /logs/apps': 'getApps',
    'GET /logs/apps/:app/environments': 'getAppEnvironments',
  },
  actions: {
    saveLog: {
      middleware: [auth],
      async handler(req: Request & { user: IUser }, res: Response) {
        const bodies: ILog[] = [];

        if (Array.isArray(req.body)) {
          for (const body of req.body) {
            bodies.push((this as any).makeLogBody(body, req.user));
          }
        } else {
          bodies.push((this as any).makeLogBody(req.body, req.user));
        }

        const log = await Log.create(bodies);

        res.status(201).send(log);
      },
    },
    getLogs: {
      middleware: [auth],
      params: {
        page: { type: 'number', optional: true, convert: true },
        limit: { type: 'number', optional: true, convert: true },
      },
      async handler(req: Request & { user: IUser }, res: Response) {
        const page = (req as any).$params.page || 1;
        const limit = (req as any).$params.limit || 10;

        const logs = await Log.find({ user: req.user._id })
          .sort({ timestamp: -1 })
          .skip((page - 1) * limit)
          .limit(limit);

        res.send(logs);
      },
    },
    getApps: {
      middleware: [auth],
      async handler(req: Request & { user: IUser }, res: Response) {
        const apps = await Log.distinct('app', { user: req.user._id });

        res.send(apps);
      },
    },
    getAppEnvironments: {
      middleware: [auth],
      params: {},
      async handler(req: Request & { user: IUser; $params: any }, res: Response) {
        const environments = await Log.distinct('environment', {
          user: req.user._id,
          app: req.$params.app,
        });

        res.send(environments);
      },
    },
  },
  methods: {
    makeLogBody(body: any, user: IUser): ILog {
      return {
        app: body.app || body.meta?.app,
        environment: body.environment || body.meta?.environment,
        message: body.message,
        level: body.level,
        timestamp: body.timestamp || body.meta?.timestamp,
        meta: body.meta,
        user,
      };
    },
  },
};

export default logsService;
