import { Schema, model } from 'mongoose';
import { IUser, User } from '../auth/user.model';

export interface ILog {
  app: string;
  environment: string;
  message: string;
  level: string;
  timestamp: Date;
  meta: any;
  user: IUser;
}

const logsSchema = new Schema<ILog>(
  {
    app: {
      type: String,
      required: true,
    },
    environment: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    level: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      required: true,
    },
    meta: {
      type: Object,
      required: false,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: User,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export interface LogsDocument extends ILog, Document {}

export const Log = model<ILog>('Log', logsSchema);
