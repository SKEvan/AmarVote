import { config } from 'dotenv';
import { resolve } from 'path';
import dbConnect from '../lib/mongodb.js';
import User from '../models/User.js';

config({ path: resolve(__dirname, '../.env.local') });

async function checkUsers() {
  try {
    await dbConnect();
    const users = await User.find({}).select('name email phone serviceId username role pollingCenterName thana location rank avatar');
    console.log('Total users:', users.length);
    console.log('\n' + JSON.stringify(users, null, 2));
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkUsers();
