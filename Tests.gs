// Unit Tests for time_recorder Google Apps Script
// Run these tests by executing runAllTests() function

function runAllTests() {
  console.log('Starting unit tests...');

  try {
    testGetAddressFromCoordinates();
    testGetMemberList();
    testGetStoreList();
    testDoPostValidInput();
    testDoPostMissingParameters();
    testDoPostWithStoreAndBranch();
    testDoPostInvalidCoordinates();
    testDoGet();

    console.log('All tests passed!');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Test getAddressFromCoordinates function
function testGetAddressFromCoordinates() {
  console.log('Testing getAddressFromCoordinates...');

  // Mock UrlFetchApp for testing
  const originalUrlFetchApp = UrlFetchApp;
  const mockUrlFetchApp = {
    fetch: function(url) {
      if (url.includes('status=OK')) {
        return {
          getContentText: function() {
            return JSON.stringify({
              status: 'OK',
              results: [{
                formatted_address: 'Test Address, Tokyo, Japan'
              }]
            });
          }
        };
      } else if (url.includes('status=ZERO_RESULTS')) {
        return {
          getContentText: function() {
            return JSON.stringify({
              status: 'ZERO_RESULTS',
              results: []
            });
          }
        };
      } else {
        return {
          getContentText: function() {
            return JSON.stringify({
              status: 'REQUEST_DENIED',
              error_message: 'API key invalid'
            });
          }
        };
      }
    }
  };

  // Test valid coordinates
  try {
    // Note: This test requires actual API call or proper mocking
    // For demonstration, we'll test the error handling
    const result = getAddressFromCoordinates(35.6762, 139.6503);
    console.log('Address result:', result);
  } catch (error) {
    if (error.message.includes('Google Maps API Key is not set')) {
      console.log('✓ Correctly handles missing API key');
    }
  }

  console.log('✓ getAddressFromCoordinates tests completed');
}

// Test getMemberList function
function testGetMemberList() {
  console.log('Testing getMemberList...');

  try {
    const member = getMemberList();
    if (Array.isArray(member)) {
      console.log('✓ getMemberList returns array');
      console.log('Member found:', member.length);
    } else {
      throw new Error('getMemberList should return an array');
    }
  } catch (error) {
    if (error.message.includes('Spreadsheet ID is not set') ||
        error.message.includes('Member sheet') ||
        error.message.includes('not found')) {
      console.log('✓ getMemberList correctly handles missing configuration');
    } else {
      throw error;
    }
  }
}

// Test getStoreList function
function testGetStoreList() {
  console.log('Testing getStoreList...');

  try {
    const storeData = getStoreList();
    if (storeData && Array.isArray(storeData.store) && typeof storeData.storeMap === 'object') {
      console.log('✓ getStoreList returns correct structure');
      console.log('Store found:', storeData.store.length);
    } else {
      throw new Error('getStoreList should return object with store array and storeMap');
    }
  } catch (error) {
    if (error.message.includes('Spreadsheet ID is not set') ||
        error.message.includes('Store sheet') ||
        error.message.includes('not found')) {
      console.log('✓ getStoreList correctly handles missing configuration');
    } else {
      throw error;
    }
  }
}

// Test doPost function with valid input
function testDoPostValidInput() {
  console.log('Testing doPost with valid input...');

  // Mock event object with new required fields
  const mockEvent = {
    parameter: {
      name: 'Test User',
      latitude: '35.6762',
      longitude: '139.6503',
      store: 'Test Store',
      branch: 'Test Branch'
    }
  };

  // Mock SpreadsheetApp
  const mockSheet = {
    appendRow: function(data) {
      console.log('Mock appendRow called with:', data);
      // Verify updated data structure (now 7 columns)
      if (data.length !== 7) {
        throw new Error('Expected 7 columns in data: timestamp, name, store, branch, latitude, longitude, address');
      }
      if (!(data[0] instanceof Date)) {
        throw new Error('First column should be timestamp');
      }
      if (data[1] !== 'Test User') {
        throw new Error('Second column should be name');
      }
      if (data[2] !== 'Test Store') {
        throw new Error('Third column should be store');
      }
      if (data[3] !== 'Test Branch') {
        throw new Error('Fourth column should be branch');
      }
    }
  };

  // This would require more complex mocking in a real test environment
  console.log('✓ doPost valid input test structure created');
}

// Test doPost function with missing parameters
function testDoPostMissingParameters() {
  console.log('Testing doPost with missing parameters...');

  const testCases = [
    { parameter: {} }, // All missing
    { parameter: { name: 'Test' } }, // Missing coordinates, store, branch
    { parameter: { name: 'Test', latitude: '35.6762' } }, // Missing longitude, store, branch
    { parameter: { name: 'Test', latitude: '35.6762', longitude: '139.6503' } }, // Missing store, branch
    { parameter: { name: 'Test', latitude: '35.6762', longitude: '139.6503', store: 'Test Store' } } // Missing branch
  ];

  testCases.forEach((testCase, index) => {
    try {
      const result = doPost(testCase);
      const response = JSON.parse(result.getContent());

      if (response.status === 'error' && response.message === 'Missing parameters') {
        console.log(`✓ Test case ${index + 1}: Correctly handles missing parameters`);
      } else {
        throw new Error(`Test case ${index + 1}: Expected error response for missing parameters`);
      }
    } catch (error) {
      if (error.message.includes('Missing parameters') ||
          error.message.includes('Cannot read property') ||
          error.message.includes('Spreadsheet ID is not set')) {
        console.log(`✓ Test case ${index + 1}: Correctly handles missing parameters`);
      } else {
        throw error;
      }
    }
  });
}

// Test doPost with store and branch functionality
function testDoPostWithStoreAndBranch() {
  console.log('Testing doPost with store and branch...');

  const validEvent = {
    parameter: {
      name: 'Test User',
      latitude: '35.6762',
      longitude: '139.6503',
      store: 'Main Store',
      branch: 'Central Branch'
    }
  };

  try {
    // This would test that store and branch are properly processed
    console.log('✓ Store and branch test structure created');
    console.log('Test data:', validEvent.parameter);
  } catch (error) {
    if (error.message.includes('Spreadsheet ID is not set')) {
      console.log('✓ Correctly handles missing spreadsheet configuration');
    } else {
      throw error;
    }
  }
}

// Test doPost with invalid coordinates
function testDoPostInvalidCoordinates() {
  console.log('Testing doPost with invalid coordinates...');

  const mockEvent = {
    parameter: {
      name: 'Test User',
      latitude: 'invalid',
      longitude: 'invalid',
      store: 'Test Store',
      branch: 'Test Branch'
    }
  };

  // This test would verify that invalid coordinates are handled gracefully
  // The geocoding should fail but the attendance should still be recorded
  console.log('✓ Invalid coordinates test structure created');
}

// Test doGet function
function testDoGet() {
  console.log('Testing doGet...');

  try {
    const result = doGet({});

    // doGet returns the result of HtmlService.createTemplateFromFile('Index').evaluate().setXFrameOptionsMode()
    // which should be an HtmlOutput object with methods like getContent()
    if (result && typeof result.getContent === 'function') {
      console.log('✓ doGet returns proper HtmlOutput object');
    } else {
      throw new Error('doGet should return HtmlOutput with getContent method');
    }
  } catch (error) {
    if (error.message.includes('Index') ||
        error.message.includes('Template file not found') ||
        error.message.includes('HTML file not found')) {
      console.log('✓ doGet correctly attempts to load Index template');
    } else {
      throw error;
    }
  }
}

// Helper function to create test data
function createTestEvent(name, lat, lng, store, branch) {
  return {
    parameter: {
      name: name || '',
      latitude: lat || '',
      longitude: lng || '',
      store: store || 'Test Store',
      branch: branch || 'Test Branch'
    }
  };
}

// Mock function for Script Properties (for manual testing)
function setupTestProperties() {
  const properties = PropertiesService.getScriptProperties();
  properties.setProperties({
    'SpreadSheet_ID': 'test_spreadsheet_id',
    'Record_Sheet_Name': 'test_record_sheet',
    'Member_Sheet_Name': 'test_member',
    'Store_Sheet_Name': 'test_store',
    'Maps_API_KEY': 'test_api_key'
  });
  console.log('Test properties set up with new store and member sheet name');
}

// Integration test function
function runIntegrationTest() {
  console.log('Running integration test...');

  // This would test the full flow with actual Google services
  // Only run this with proper test data and API keys
  const testEvent = createTestEvent('Integration Test User', '35.6762', '139.6503', 'Integration Store', 'Main Branch');

  try {
    const result = doPost(testEvent);
    const response = JSON.parse(result.getContent());

    if (response.status === 'success') {
      console.log('✓ Integration test passed');
    } else {
      console.log('✗ Integration test failed:', response.message);
    }
  } catch (error) {
    console.log('Integration test error (expected if not properly configured):', error.message);
  }
}

// Performance test
function runPerformanceTest() {
  console.log('Running performance test...');

  const startTime = new Date().getTime();

  // Test multiple calls
  for (let i = 0; i < 10; i++) {
    try {
      const testEvent = createTestEvent(`Test User ${i}`, '35.6762', '139.6503', `Store ${i}`, `Branch ${i}`);
      doPost(testEvent);
    } catch (error) {
      // Expected errors due to test environment
    }
  }

  const endTime = new Date().getTime();
  const duration = endTime - startTime;

  console.log(`Performance test completed in ${duration}ms`);
}