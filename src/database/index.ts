import { connect as connectMongo } from 'mongoose';
import { database } from '../config';

export async function connect() {
  await connectMongo(database.MONGO_URL);
}
