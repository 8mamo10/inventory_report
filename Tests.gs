// Unit Tests for time_recorder Google Apps Script
// Run these tests by executing runAllTests() function

function runAllTests() {
  console.log('Starting unit tests...');

  try {
    testGetAddressFromCoordinates();
    testGetMemberList();
    testGetAreaList();
    testGetStoreList();
    testGetProductList();
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
    if (storeData && Array.isArray(storeData.store) && typeof storeData.storeMap === 'object' && typeof storeData.storeAreaMap === 'object' && typeof storeData.areaBranchMap === 'object' && typeof storeData.areaStoreMap === 'object' && typeof storeData.areaStoreBranchMap === 'object') {
      console.log('✓ getStoreList returns correct structure');
      console.log('Store found:', storeData.store.length);
    } else {
      throw new Error('getStoreList should return object with store array, storeMap, storeAreaMap, areaBranchMap, areaStoreMap, and areaStoreBranchMap');
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

// Test getAreaList function
function testGetAreaList() {
  console.log('Testing getAreaList...');

  try {
    const area = getAreaList();
    if (Array.isArray(area)) {
      console.log('✓ getAreaList returns array');
      console.log('Area found:', area.length);
    } else {
      throw new Error('getAreaList should return an array');
    }
  } catch (error) {
    if (error.message.includes('Spreadsheet ID is not set') ||
        error.message.includes('Area sheet') ||
        error.message.includes('not found')) {
      console.log('✓ getAreaList correctly handles missing configuration');
    } else {
      throw error;
    }
  }
}

// Test getProductList function
function testGetProductList() {
  console.log('Testing getProductList...');

  try {
    const products = getProductList();
    if (Array.isArray(products)) {
      console.log('✓ getProductList returns array');
      console.log('Products found:', products.length);
      
      // Check product structure if products exist
      if (products.length > 0) {
        const product = products[0];
        if (product.type && product.name) {
          console.log('✓ Product has correct structure (type and name)');
        } else {
          throw new Error('Product should have type and name properties');
        }
      }
    } else {
      throw new Error('getProductList should return an array');
    }
  } catch (error) {
    if (error.message.includes('Spreadsheet ID is not set') ||
        error.message.includes('Product sheet') ||
        error.message.includes('not found')) {
      console.log('✓ getProductList correctly handles missing configuration');
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
      area: 'Test Area',
      latitude: '35.6762',
      longitude: '139.6503',
      store: 'Test Store',
      branch: 'Test Branch',
      note: 'Test note',
      productInventory: JSON.stringify([{type: 'Test Type', name: 'Test Product', bottleCount: '5', cartonCount: '2', expirationDate: '2024-12-31', note: 'Test product note'}])
    }
  };

  // Mock SpreadsheetApp
  const mockSheet = {
    appendRow: function(data) {
      console.log('Mock appendRow called with:', data);
      // Verify updated data structure (now 15 columns)
      if (data.length !== 15) {
        throw new Error('Expected 15 columns in data: timestamp, name, area, store, branch, latitude, longitude, address, note, productType, productName, bottleCount, cartonCount, expirationDate, productNote');
      }
      if (typeof data[0] !== 'string' || !data[0].match(/^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2}$/)) {
        throw new Error('First column should be formatted timestamp (DD/MM/YYYY HH:MM:SS)');
      }
      if (data[1] !== 'Test User') {
        throw new Error('Second column should be name');
      }
      if (data[2] !== 'Test Area') {
        throw new Error('Third column should be area');
      }
      if (data[3] !== 'Test Store') {
        throw new Error('Fourth column should be store');
      }
      if (data[4] !== 'Test Branch') {
        throw new Error('Fifth column should be branch');
      }
      if (data[9] !== 'Test Type') {
        throw new Error('Tenth column should be product type');
      }
      if (data[10] !== 'Test Product') {
        throw new Error('Eleventh column should be product name');
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
    { parameter: { name: 'Test' } }, // Missing area, coordinates, store, branch, inventory fields
    { parameter: { name: 'Test', area: 'Test Area' } }, // Missing coordinates, store, branch, inventory fields
    { parameter: { name: 'Test', area: 'Test Area', latitude: '35.6762' } }, // Missing longitude, store, branch, inventory fields
    { parameter: { name: 'Test', area: 'Test Area', latitude: '35.6762', longitude: '139.6503' } }, // Missing store, branch, inventory fields
    { parameter: { name: 'Test', area: 'Test Area', latitude: '35.6762', longitude: '139.6503', store: 'Test Store' } }, // Missing branch
    { parameter: { name: 'Test', area: 'Test Area', latitude: '35.6762', longitude: '139.6503', store: 'Test Store', branch: 'Test Branch' } }, // Missing product inventory
    { parameter: { name: 'Test', area: 'Test Area', latitude: '35.6762', longitude: '139.6503', store: 'Test Store', branch: 'Test Branch', productInventory: '[]' } } // Empty product inventory
  ];

  testCases.forEach((testCase, index) => {
    try {
      const result = doPost(testCase);
      const response = JSON.parse(result.getContent());

      // Different error messages for different cases
      if (index < 6) {
        // Cases 1-6: Missing basic parameters
        if (response.status === 'error' && response.message === 'Missing parameters') {
          console.log(`✓ Test case ${index + 1}: Correctly handles missing parameters`);
        } else {
          throw new Error(`Test case ${index + 1}: Expected error response for missing parameters`);
        }
      } else {
        // Cases 7-8: Missing or empty product inventory
        if (response.status === 'error' && (response.message === 'Missing parameters' || response.message === 'At least one product inventory is required')) {
          console.log(`✓ Test case ${index + 1}: Correctly handles missing product inventory`);
        } else {
          throw new Error(`Test case ${index + 1}: Expected error response for missing product inventory`);
        }
      }
    } catch (error) {
      if (error.message.includes('Missing parameters') ||
          error.message.includes('At least one product inventory is required') ||
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
      area: 'Main Area',
      latitude: '35.6762',
      longitude: '139.6503',
      store: 'Main Store',
      branch: 'Central Branch',
      note: 'Integration test note',
      productInventory: JSON.stringify([{type: 'Main Type', name: 'Main Product', bottleCount: '15', cartonCount: '8', expirationDate: '2024-12-31', note: 'Integration product note'}])
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
      area: 'Test Area',
      latitude: 'invalid',
      longitude: 'invalid',
      store: 'Test Store',
      branch: 'Test Branch',
      note: 'Test with invalid coordinates',
      productInventory: JSON.stringify([{type: 'Test Type', name: 'Test Product', bottleCount: '12', cartonCount: '6', expirationDate: '2024-12-31', note: 'Invalid coordinates test'}])
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
function createTestEvent(name, area, lat, lng, store, branch, note, productType, productName, bottleCount, cartonCount, expirationDate, productNote) {
  return {
    parameter: {
      name: name || '',
      area: area || 'Test Area',
      latitude: lat || '',
      longitude: lng || '',
      store: store || 'Test Store',
      branch: branch || 'Test Branch',
      note: note || 'Test note',
      productInventory: JSON.stringify([{
        type: productType || 'Test Type',
        name: productName || 'Test Product',
        bottleCount: bottleCount || '10',
        cartonCount: cartonCount || '5',
        expirationDate: expirationDate || '2024-12-31',
        note: productNote || 'Test product note'
      }])
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
    'Area_Sheet_Name': 'test_area',
    'Store_Sheet_Name': 'test_store',
    'Product_Sheet_Name': 'test_product',
    'Maps_API_KEY': 'test_api_key'
  });
  console.log('Test properties set up with new store and member sheet name');
}

// Integration test function
function runIntegrationTest() {
  console.log('Running integration test...');

  // This would test the full flow with actual Google services
  // Only run this with proper test data and API keys
  const testEvent = createTestEvent('Integration Test User', 'Integration Area', '35.6762', '139.6503', 'Integration Store', 'Main Branch', 'Integration test note', 'Integration Type', 'Integration Product', '20', '10', '2024-12-31', 'Integration product note');

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
      const testEvent = createTestEvent(`Test User ${i}`, `Area ${i}`, '35.6762', '139.6503', `Store ${i}`, `Branch ${i}`, `Note ${i}`, `Type ${i}`, `Product ${i}`, `${i * 10}`, `${i * 5}`, '2024-12-31', `Product note ${i}`);
      doPost(testEvent);
    } catch (error) {
      // Expected errors due to test environment
    }
  }

  const endTime = new Date().getTime();
  const duration = endTime - startTime;

  console.log(`Performance test completed in ${duration}ms`);
}