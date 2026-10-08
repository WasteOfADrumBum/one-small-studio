import mongoose from 'mongoose';

// Serverless functions reuse warm instances, so keep one connection per instance.
let connecting: Promise<typeof mongoose> | null = null;

export const hasDatabase = () => Boolean(process.env.MONGODB_URI);

export function connectDb(): Promise<typeof mongoose> {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is not set');
  connecting ??= mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 }).catch((err) => {
    connecting = null;
    throw err;
  });
  return connecting;
}
