const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function clearOldIncidents() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const IncidentModel = mongoose.model('Incident', new mongoose.Schema({}, { strict: false }), 'incidents');
    
    // Delete all incidents with the hardcoded GPS coordinates
    const result = await IncidentModel.deleteMany({
      $or: [
        { 'gpsLocation.lat': 23.8103, 'gpsLocation.lng': 90.4125 },
        { 'coordinates.lat': 23.8103, 'coordinates.lng': 90.4125 },
        { gpsLocation: null },
        { gpsLocation: { $exists: false } }
      ]
    });

    console.log(`✅ Deleted ${result.deletedCount} old incidents with hardcoded or missing GPS coordinates`);
    
    // Show remaining incidents
    const remaining = await IncidentModel.countDocuments();
    console.log(`📊 Remaining incidents: ${remaining}`);
    
    await mongoose.connection.close();
    console.log('✅ Done!');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

clearOldIncidents();
