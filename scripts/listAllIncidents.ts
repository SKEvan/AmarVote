import { config } from 'dotenv';
import { resolve } from 'path';
import dbConnect from '../lib/mongodb';
import Incident from '../models/Incident';

// Load environment variables from .env.local
config({ path: resolve(__dirname, '../.env.local') });

async function listAllIncidents() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await dbConnect();

    console.log('📋 Fetching all incidents...\n');

    const incidents = await Incident.find({}).sort({ reportedAt: -1 });

    if (incidents.length === 0) {
      console.log('✅ No incidents found in database.');
    } else {
      console.log(`Found ${incidents.length} incident(s):\n`);
      incidents.forEach((incident, index) => {
        console.log(`${index + 1}. ID: ${incident._id}`);
        console.log(`   Title: ${incident.title}`);
        console.log(`   Status: ${incident.status}`);
        console.log(`   Severity: ${incident.severity}`);
        console.log(`   Reported By: ${incident.reportedBy?.name || 'Unknown'}`);
        console.log(`   Reported At: ${incident.reportedAt}`);
        console.log(`   Description: ${incident.description?.substring(0, 100)}...`);
        console.log('');
      });
    }

    console.log('✨ Listing completed successfully!\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error listing incidents:', error);
    process.exit(1);
  }
}

listAllIncidents();
