// Simple test to verify API endpoints
const axios = require('axios');

const API_URL = 'http://localhost:3000/v1'; // Assuming the API runs on port 3000

async function testAPI() {
  try {
    console.log('Testing sweetness_levels endpoint...');
    const sweetnessResponse = await axios.get(`${API_URL}/sweetness_levels?fqnull=deleted_at`);
    console.log('Sweetness levels response:', JSON.stringify(sweetnessResponse.data, null, 2));

    console.log('\nTesting ice_levels endpoint...');
    const iceResponse = await axios.get(`${API_URL}/ice_levels?fqnull=deleted_at`);
    console.log('Ice levels response:', JSON.stringify(iceResponse.data, null, 2));

  } catch (error) {
    console.error('Error testing API:', error.response?.data || error.message);
  }
}

testAPI();
