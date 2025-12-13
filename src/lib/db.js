import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

/**
 * Executes a function within a transaction if possible.
 * Implements a Retry-on-Fail pattern for Standalone MongoDB instances.
 * * @param {Function} handler - Async function(session) => Promise
 */
export async function withTransaction(handler) {
  await dbConnect();
  const session = await mongoose.startSession();

  try {
    session.startTransaction();
    // Execute handler with session
    const result = await handler(session);
    await session.commitTransaction();
    return result;
  } catch (error) {
    // Attempt abort, but wrap in try-catch because aborting on standalone might also throw
    try {
        await session.abortTransaction();
    } catch (abortError) {
        // Ignore abort error if it's the transaction support error
    }

    // Check for "Transaction numbers are only allowed on a replica set member" error (Code 20)
    // or similar topology errors
    if (error.code === 20 || error.message?.includes('Transaction numbers are only allowed')) {
      console.warn("⚠️ Transaction failed (Standalone DB detected). Retrying in non-transactional mode.");
      // Retry without a transaction session (passing null lets mongoose execute normally)
      return await handler(null);
    }

    // Re-throw critical errors (validation, logic errors, etc.) that happened inside the transaction
    throw error;
  } finally {
    await session.endSession();
  }
}

export default dbConnect;