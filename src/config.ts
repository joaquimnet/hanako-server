export const PORT = process.env['PORT'];

export const database = {
  MONGO_URL: process.env['MONGO_URL'] || 'mongodb://localhost:27017',
};

export const JWT_SECRET = process.env['JWT_SECRET']!;
