const { MongoClient } = require('mongodb');

const uri = 'mongodb://localhost:27017/election-monitoring';

async function migrateGPSLocation() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB\n');
    
    const db = client.db();
    const collection = db.collection('incidents');
    
    // Find all incidents
    const incidents = await collection.find({}).toArray();
    console.log(`Found ${incidents.length} incidents\n`);
    
    let updated = 0;
    let skipped = 0;
    
    for (const incident of incidents) {
      // If incident has coordinates but no gpsLocation, copy coordinates to gpsLocation
      if (incident.coordinates && incident.coordinates.lat && incident.coordinates.lng && !incident.gpsLocation) {
        await collection.updateOne(
          { _id: incident._id },
          { 
            $set: { 
              gpsLocation: {
                lat: incident.coordinates.lat,
                lng: incident.coordinates.lng
              }
            }
          }
        );
        console.log(`✓ Updated incident ${incident._id} - Added gpsLocation from coordinates`);
        updated++;
      } else if (incident.gpsLocation && incident.gpsLocation.lat && incident.gpsLocation.lng) {
        console.log(`- Incident ${incident._id} already has gpsLocation`);
        skipped++;
      } else {
        console.log(`⚠ Incident ${incident._id} has no valid coordinates`);
        skipped++;
      }
    }
    
    console.log(`\n✅ Migration complete!`);
    console.log(`   Updated: ${updated}`);
    console.log(`   Skipped: ${skipped}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

migrateGPSLocation();
