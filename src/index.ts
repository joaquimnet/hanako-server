import { config } from 'dotenv';
config();
import ponaserv from 'ponaserv';
import express from 'express';
import cors from 'cors';
import { join } from 'path';
import morgan from 'morgan';

import { connect } from './database';
import { PORT } from './config';
import helmet from 'helmet';

const app = express();
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

ponaserv(app, {
  services: join(__dirname, 'services'),
});

connect()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error(err);
  });
