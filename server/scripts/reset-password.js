import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

dotenv.config();

async function run() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('No MONGODB_URI found in server/.env');
    process.exit(1);
  }
  
  await mongoose.connect(uri);
  const hash = await bcrypt.hash('123456', 10);
  
  const result = await mongoose.connection.db.collection('users').updateOne(
    { username: 'seonho' },
    { $set: { passwordHash: hash } }
  );
  
  console.log('Password reset successfully for seonho:', result.modifiedCount > 0 ? 'UPDATED' : 'NOT FOUND');
  await mongoose.disconnect();
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});

