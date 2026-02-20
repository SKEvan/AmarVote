/**
 * Comprehensive Backend Connection Test
 * Tests all API endpoints, database connections, and data flows
 */

import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI environment variable is not set');
  process.exit(1);
}

const API_BASE = 'http://localhost:3003/api';

interface TestResult {
  name: string;
  status: 'PASS' | 'FAIL' | 'WARN';
  message: string;
  details?: any;
}

const results: TestResult[] = [];

function log(result: TestResult) {
  results.push(result);
  const icon = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⚠️ ';
  console.log(`${icon} ${result.name}: ${result.message}`);
  if (result.details) {
    console.log(`   Details:`, result.details);
  }
}

async function testMongoDBConnection() {
  try {
    await mongoose.connect(MONGODB_URI as string);
    log({
      name: 'MongoDB Connection',
      status: 'PASS',
      message: 'Successfully connected to MongoDB Atlas',
    });
    return true;
  } catch (error: any) {
    log({
      name: 'MongoDB Connection',
      status: 'FAIL',
      message: 'Failed to connect to MongoDB',
      details: error.message,
    });
    return false;
  }
}

async function testDatabaseCollections() {
  try {
    if (!mongoose.connection.db) {
      throw new Error('Database connection not established');
    }
    
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    const requiredCollections = ['users', 'politicalparties', 'pollingcenters', 'votes', 'incidents'];
    const missing = requiredCollections.filter(c => !collectionNames.includes(c));
    
    if (missing.length === 0) {
      log({
        name: 'Database Collections',
        status: 'PASS',
        message: `Found all ${requiredCollections.length} required collections`,
        details: collectionNames,
      });
    } else {
      log({
        name: 'Database Collections',
        status: 'WARN',
        message: `Missing collections: ${missing.join(', ')}`,
        details: { found: collectionNames, missing },
      });
    }
    
    // Get document counts
    for (const collectionName of collectionNames) {
      const count = await mongoose.connection.db.collection(collectionName).countDocuments();
      console.log(`   ${collectionName}: ${count} documents`);
    }
  } catch (error: any) {
    log({
      name: 'Database Collections',
      status: 'FAIL',
      message: 'Failed to list collections',
      details: error.message,
    });
  }
}

async function testAPIEndpoint(endpoint: string, method: string = 'GET', body?: any) {
  try {
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };
    
    if (body) {
      options.body = JSON.stringify(body);
    }
    
    const response = await fetch(`${API_BASE}${endpoint}`, options);
    const data = await response.json();
    
    if (response.ok) {
      log({
        name: `API ${method} ${endpoint}`,
        status: 'PASS',
        message: `Status ${response.status}`,
        details: typeof data === 'object' ? Object.keys(data) : data,
      });
      return data;
    } else {
      log({
        name: `API ${method} ${endpoint}`,
        status: 'WARN',
        message: `Status ${response.status}`,
        details: data,
      });
      return null;
    }
  } catch (error: any) {
    log({
      name: `API ${method} ${endpoint}`,
      status: 'FAIL',
      message: 'Request failed',
      details: error.message,
    });
    return null;
  }
}

async function testVoteSubmission() {
  const testVote = {
    pollingCenter: 'TEST-CENTER-001',
    pollingCenterName: 'Test Polling Center',
    location: 'Test Location',
    totalVotes: 100,
    totalVoters: 100,
    submittedBy: {
      userId: 'test-user-id',
      name: 'Test Officer',
      email: 'test@test.com',
    },
    partyVotes: {
      'PA': 30,
      'PB': 40,
      'PC': 30,
    },
    isCorrection: false,
  };
  
  console.log('\n📊 Testing Vote Submission...');
  const result = await testAPIEndpoint('/votes', 'POST', testVote);
  
  if (result) {
    console.log('   Vote ID:', result.voteId);
    console.log('   Breakdown:', result.vote?.partyVoteBreakdown?.length, 'parties');
  }
  
  return result;
}

async function testIncidentSubmission() {
  const testIncident = {
    title: 'Test Incident',
    description: 'This is a test incident for backend verification',
    severity: 'Low',
    location: 'Test Location',
    pollingCenterId: 'TEST-CENTER-001',
    reportedBy: {
      userId: 'test-user-id',
      name: 'Test Officer',
      role: 'Presiding Officer',
    },
    status: 'Reported',
  };
  
  console.log('\n🚨 Testing Incident Reporting...');
  const result = await testAPIEndpoint('/incidents', 'POST', testIncident);
  
  if (result) {
    console.log('   Incident ID:', result.incidentId);
    console.log('   Status:', result.incident?.status);
  }
  
  return result;
}

async function testUserOperations() {
  console.log('\n👤 Testing User Operations...');
  
  // Get all users
  const users = await testAPIEndpoint('/users');
  
  if (users && users.users && users.users.length > 0) {
    const testUser = users.users[0];
    console.log(`   Found ${users.users.length} users`);
    console.log(`   Test user: ${testUser.name} (${testUser.role})`);
    
    // Get specific user
    await testAPIEndpoint(`/users?userId=${testUser._id}`);
    
    // Test update (without actually changing data)
    console.log('   Skipping PATCH test to preserve data');
  }
}

async function runAllTests() {
  console.log('🔍 AmarVote Backend Connection Test Suite\n');
  console.log('=' .repeat(60));
  
  // 1. Database Tests
  console.log('\n📦 Database Tests:');
  const dbConnected = await testMongoDBConnection();
  
  if (dbConnected) {
    await testDatabaseCollections();
  } else {
    console.log('\n⚠️  Skipping database tests due to connection failure');
    process.exit(1);
  }
  
  // Wait for server to be ready
  console.log('\n⏳ Waiting for API server to be ready...');
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // 2. API Endpoint Tests
  console.log('\n🌐 API Endpoint Tests:');
  
  // Authentication
  await testAPIEndpoint('/auth/login', 'POST', {
    username: 'admin',
    password: 'admin123',
  });
  
  // Get endpoints
  await testAPIEndpoint('/users');
  await testAPIEndpoint('/political-parties');
  await testAPIEndpoint('/polling-centers');
  await testAPIEndpoint('/votes');
  await testAPIEndpoint('/incidents');
  await testAPIEndpoint('/audit-logs');
  
  // 3. Data Operations Tests
  await testVoteSubmission();
  await testIncidentSubmission();
  await testUserOperations();
  
  // 4. Summary
  console.log('\n' + '='.repeat(60));
  console.log('📋 Test Summary:\n');
  
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const warned = results.filter(r => r.status === 'WARN').length;
  
  console.log(`   Total Tests: ${results.length}`);
  console.log(`   ✅ Passed: ${passed}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   ⚠️  Warnings: ${warned}`);
  
  console.log('\n' + '='.repeat(60));
  
  if (failed > 0) {
    console.log('\n❌ Some tests failed. Please review the details above.');
    process.exit(1);
  } else if (warned > 0) {
    console.log('\n⚠️  All critical tests passed, but there are warnings.');
  } else {
    console.log('\n✅ All tests passed! Backend connections are working correctly.');
  }
  
  await mongoose.connection.close();
  process.exit(0);
}

runAllTests().catch(error => {
  console.error('❌ Test suite failed:', error);
  process.exit(1);
});
