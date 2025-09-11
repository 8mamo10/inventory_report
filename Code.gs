function doPost(e) {
  // Set the spreadsheet ID here
  const spreadSheetId = PropertiesService.getScriptProperties().getProperty('SpreadSheet_ID');
  if (!spreadSheetId) {
    throw new Error("Spreadsheet ID is not set in Script Properties.");
  }

  // Specify the sheet name
  const recordSheetName = PropertiesService.getScriptProperties().getProperty('Record_Sheet_Name');
  if (!recordSheetName) {
    throw new Error("Record Sheet Name is not set in Script Properties.");
  }

  // Get data sent via POST request
  const name = e.parameter.name;
  const inOut = e.parameter.inOut;
  const latitude = e.parameter.latitude;
  const longitude = e.parameter.longitude;
  const store = e.parameter.store || '';
  const branch = e.parameter.branch || '';

  if (!name || !inOut || !latitude || !longitude || !store || !branch) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: 'Missing parameters' }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  const ss = SpreadsheetApp.openById(spreadSheetId);
  const sheet = ss.getSheetByName(recordSheetName);

  // Add timestamp
  const timestamp = new Date();
  let address = 'Fetching address...';

  try {
    // Call function to get address from latitude and longitude
    address = getAddressFromCoordinates(latitude, longitude);
  } catch (err) {
    console.error("Failed to fetch address:", err);
    address = 'Failed to fetch address';
  }

  // Add data as a new row
  sheet.appendRow([timestamp, name, inOut, store, branch, latitude, longitude, address]);

  return ContentService.createTextOutput(JSON.stringify({ status: 'success', message: 'Finish registration' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function getAddressFromCoordinates(lat, lng) {
  // Get API key from script properties:
  const apiKey = PropertiesService.getScriptProperties().getProperty('Maps_API_KEY');
  if (!apiKey) {
    throw new Error("Google Maps API Key is not set in Script Properties.");
  }
  const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}&language=ja`;

  const response = UrlFetchApp.fetch(url);
  const json = JSON.parse(response.getContentText());

  if (json.status === 'OK' && json.results.length > 0) {
    // Return the formatted_address of the most accurate result (usually results[0])
    return json.results[0].formatted_address;
  } else if (json.status === 'ZERO_RESULTS') {
    return 'Not found';
  } else {
    throw new Error(`Geocoding API Error: ${json.status} - ${json.error_message || ''}`);
  }
}

// Function for deploying as a web application (execute only once initially)
function doGet() {
  // This function is executed when there is a GET request
  // Usually HTML files are provided here
  return HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL); // Required for embedding in <iframe> etc.
}

// Function to return HTML file content
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

// Function to get member list
function getMemberList() {
  const spreadSheetId = PropertiesService.getScriptProperties().getProperty('SpreadSheet_ID');
  if (!spreadSheetId) {
    throw new Error("Spreadsheet ID is not set in Script Properties.");
  }

  const memberSheetName = PropertiesService.getScriptProperties().getProperty('Member_Sheet_Name') || 'Member';

  const ss = SpreadsheetApp.openById(spreadSheetId);
  const memberSheet = ss.getSheetByName(memberSheetName);

  if (!memberSheet) {
    throw new Error(`Member sheet "${memberSheetName}" not found. Please create a sheet named "${memberSheetName}" with names in column A.`);
  }

  // Get data from column with names (column A) starting from row 2
  const range = memberSheet.getRange('A2:A');
  const values = range.getValues();

  // Exclude blank cells and remove duplicates (maintain sheet order)
  const member = values
    .map(row => row[0])
    .filter(name => name && name.toString().trim() !== '')
    .map(name => name.toString().trim())
    .filter((name, index, arr) => arr.indexOf(name) === index); // Remove duplicates

  return member;
}

// Function to get store list
function getStoreList() {
  const spreadSheetId = PropertiesService.getScriptProperties().getProperty('SpreadSheet_ID');
  if (!spreadSheetId) {
    throw new Error("Spreadsheet ID is not set in Script Properties.");
  }

  const storeSheetName = PropertiesService.getScriptProperties().getProperty('Store_Sheet_Name') || 'Store';

  const ss = SpreadsheetApp.openById(spreadSheetId);
  const storeSheet = ss.getSheetByName(storeSheetName);

  if (!storeSheet) {
    throw new Error(`Store sheet "${storeSheetName}" not found.`);
  }

  // Get store names and branch names starting from row 2
  const range = storeSheet.getRange('A2:B');
  const values = range.getValues();

  // Exclude blank rows and organize data
  const storeData = values
    .filter(row => row[0] && row[0].toString().trim() !== '')
    .map(row => ({
      store: row[0].toString().trim(),
      branch: row[1] ? row[1].toString().trim() : ''
    }));

  // Get store name list (remove duplicates, maintain order)
  const store = [];
  const storeMap = new Map();

  storeData.forEach(item => {
    if (!storeMap.has(item.store)) {
      store.push(item.store);
      storeMap.set(item.store, []);
    }
    if (item.branch) {
      storeMap.get(item.store).push(item.branch);
    }
  });

  return {
    store: store,
    storeMap: Object.fromEntries(storeMap)
  };
}
