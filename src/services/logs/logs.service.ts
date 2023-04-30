import { Request, Response } from 'express';
import { ILog, Log } from './logs.model';

const logsService = {
  name: 'LogsService',
  routes: {
    'POST /logs': 'saveLog',
  },
  actions: {
    saveLog: {
      async handler(req: Request, res: Response) {
        const bodies: ILog[] = [];

        if (Array.isArray(req.body)) {
          for (const body of req.body) {
            bodies.push((this as any).makeLogBody(body));
          }
        } else {
          bodies.push((this as any).makeLogBody(req.body));
        }

        const log = await Log.create(bodies);

        res.status(201).send(log);
      },
    },
  },
  methods: {
    makeLogBody(body: any): ILog {
      return {
        app: body.app || body.meta?.app,
        environment: body.environment || body.meta?.environment,
        message: body.message,
        level: body.level,
        timestamp: body.timestamp || body.meta?.timestamp,
        meta: body.meta,
      };
    },
  },
};

export default logsService;
