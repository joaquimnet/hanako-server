import { Schema, model } from 'mongoose';

export interface IUser {
  _id?: string;

  email: string;
  password?: string;

  tokens: {
    name: string;
    token: string;
    createdAt: Date;
  }[];
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: 'String',
      required: true,
    },
    tokens: [
      {
        name: {
          type: String,
          required: true,
        },
        token: {
          type: String,
          required: true,
        },
        createdAt: {
          type: Date,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  },
);

export interface UserDocument extends IUser, Document {}

export const User = model<IUser>('User', userSchema);
