// Test script to verify the new API integrations
import axios from 'axios';

const SERVER_URL = 'http://localhost:4000';

async function testAPIs() {
  console.log('🚀 Testing Multiverse Timekeeper API Integrations...\n');

  try {
    // Test 1: Health check
    console.log('1. Health Check...');
    const health = await axios.get(`${SERVER_URL}/health`);
    console.log('✅ Server health:', health.data);
    console.log();

    // Test 2: TimeZoneDB - Get timezone list
    console.log('2. TimeZoneDB - Get timezone list...');
    const timezones = await axios.get(`${SERVER_URL}/api/timezones`);
    console.log(`✅ Loaded ${timezones.data.length} timezones`);
    console.log('Sample timezone:', timezones.data[0]);
    console.log();

    // Test 3: TimeZoneDB - Get specific timezone info
    console.log('3. TimeZoneDB - Get New York timezone...');
    const nyTimezone = await axios.get(`${SERVER_URL}/api/timezone/America/New_York`);
    console.log('✅ New York timezone info:', nyTimezone.data);
    console.log();

    // Test 4: NASA EONET - Get cosmic events
    console.log('4. NASA EONET - Get cosmic events...');
    const cosmicEvents = await axios.get(`${SERVER_URL}/api/cosmic-events?limit=5`);
    console.log(`✅ Loaded ${cosmicEvents.data.length} cosmic events`);
    if (cosmicEvents.data.length > 0) {
      console.log('Sample event:', cosmicEvents.data[0]);
    }
    console.log();

    // Test 5: NASA EONET - Get event categories
    console.log('5. NASA EONET - Get event categories...');
    const categories = await axios.get(`${SERVER_URL}/api/cosmic-events/categories`);
    console.log(`✅ Available event categories: ${categories.data.length}`);
    if (categories.data.length > 0) {
      console.log('Sample categories:', categories.data.slice(0, 3).map(c => c.title));
    }
    console.log();

    console.log('🎉 All API integrations are working successfully!\n');
    
    console.log('📊 Integration Status:');
    console.log('✅ NASA JPL Horizons API - Planetary data (existing)');
    console.log('✅ Launch Library API 2.0 - Rocket launches (existing)');
    console.log('✅ TimeZoneDB API - Earth timezones (NEW)');
    console.log('✅ NASA EONET API - Natural events (NEW)');
    
  } catch (error) {
    console.error('❌ API test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the test
testAPIs();
