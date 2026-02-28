const { MongoClient } = require('mongodb');

const uri = 'mongodb://localhost:27017/election-monitoring';

async function checkIncidents() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB\n');
    
    const db = client.db();
    const incidents = await db.collection('incidents').find({}).toArray();
    
    console.log(`Total incidents: ${incidents.length}\n`);
    
    incidents.forEach((inc, index) => {
      console.log(`\n=== Incident ${index + 1} ===`);
      console.log(`ID: ${inc._id}`);
      console.log(`Title: ${inc.title}`);
      console.log(`Status: ${inc.status}`);
      console.log(`Severity: ${inc.severity}`);
      console.log(`Has gpsLocation: ${inc.gpsLocation ? 'YES' : 'NO'}`);
      console.log(`Has coordinates: ${inc.coordinates ? 'YES' : 'NO'}`);
      
      if (inc.gpsLocation) {
        console.log(`GPS Location: lat=${inc.gpsLocation.lat}, lng=${inc.gpsLocation.lng}`);
      }
      if (inc.coordinates) {
        console.log(`Coordinates: lat=${inc.coordinates.lat}, lng=${inc.coordinates.lng}`);
      }
    });
    
    // Check what would be shown on map
    console.log('\n\n=== MAP FILTER TEST ===');
    const activeIncidents = incidents.filter(inc => 
      inc.status !== 'Resolved' && 
      inc.status !== 'Dismissed'
    );
    console.log(`Incidents that should appear on map: ${activeIncidents.length}`);
    
    const withValidGPS = activeIncidents.filter(inc => {
      const lat = inc.gpsLocation?.lat || inc.coordinates?.lat;
      const lng = inc.gpsLocation?.lng || inc.coordinates?.lng;
      return lat && lng;
    });
    console.log(`Incidents with valid GPS: ${withValidGPS.length}`);
    
    withValidGPS.forEach(inc => {
      const lat = inc.gpsLocation?.lat || inc.coordinates?.lat;
      const lng = inc.gpsLocation?.lng || inc.coordinates?.lng;
      console.log(`  - ${inc._id}: ${inc.status} at (${lat}, ${lng})`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

checkIncidents();
