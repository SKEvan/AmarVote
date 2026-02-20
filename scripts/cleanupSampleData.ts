import { config } from 'dotenv';
import { resolve } from 'path';
import dbConnect from '../lib/mongodb';
import Incident from '../models/Incident';

// Load environment variables from .env.local
config({ path: resolve(__dirname, '../.env.local') });

async function cleanupSampleData() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await dbConnect();

    console.log('🧹 Cleaning up sample/test data...');

    // Remove all test/sample incidents
    // This includes incidents with test-like titles or patterns
    const result = await Incident.deleteMany({
      $or: [
        { title: 'Sample Incident' },
        { title: 'Test Incident' },
        { 'reportedBy.name': 'Sample Officer' },
        { 'reportedBy.name': 'Test Officer' },
        { description: /sample.*testing purposes/i },
        { description: /test/i },
        { title: /test/i },
        { title: /sample/i },
        { title: /qwerty/i },
        { title: /askmsask/i },
        { description: /backend verification/i }
      ]
    });

    console.log(`✅ Removed ${result.deletedCount} sample/test incident(s)`);

    console.log('✨ Cleanup completed successfully!\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error cleaning up sample data:', error);
    process.exit(1);
  }
}

cleanupSampleData();
