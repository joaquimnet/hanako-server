import { Request, Response } from 'express';

const helloWorldService = {
  name: 'HelloWorldService',
  routes: {
    'GET /': 'sayHello',
  },
  actions: {
    sayHello: {
      handler(req: Request, res: Response) {
        res.send('Hello World');
      },
    },
  },
};

export default helloWorldService;
