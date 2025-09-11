# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Google Apps Script (GAS) based attendance tracking system that records employee check-ins/check-outs with location data. The system consists of:

- **Code.gs**: Main server-side functions for handling form submissions, geocoding, and data management
- **Index.html**: Client-side web interface for attendance registration
- **Tests.gs**: Comprehensive unit tests for all major functions

## Architecture

### Core Components

1. **Web App Handler** (`doPost`): Processes attendance submissions with location validation
2. **Geocoding Service** (`getAddressFromCoordinates`): Converts coordinates to addresses using Google Maps API
3. **Data Sources**: Dynamically loads member and store lists from Google Sheets
4. **HTML Interface** (`doGet`): Serves the attendance form with real-time location capture

### Data Flow

1. User submits attendance via web form with geolocation
2. `doPost` validates all required parameters (name, inOut, coordinates, store, branch)
3. System geocodes coordinates to readable address
4. Data appended to main sheet: [timestamp, name, inOut, store, branch, latitude, longitude, address]

### Google Sheets Structure

- **Main Sheet**: Attendance records (8 columns as above)
- **Members Sheet**: Employee names in column A (starting row 2)
- **Stores Sheet**: Store names (column A) and branch names (column B) starting row 2

## Development Commands

### Testing
```javascript
// Run all unit tests
runAllTests()

// Run specific test categories
testGetAddressFromCoordinates()
testGetMembersList() 
testGetStoresList()
testDoPostValidInput()

// Setup test configuration
setupTestProperties()

// Performance testing
runPerformanceTest()
```

### Required Script Properties
```
SpreadSheet_ID: Google Sheets ID for data storage
Sheet_Name: Main attendance sheet name
Members_Sheet_Name: Sheet containing employee names (default: 'Members')
Stores_Sheet_Name: Sheet containing store/branch data (default: 'Stores')
Maps_API_KEY: Google Maps Geocoding API key
```

## Key Implementation Details

- **Parameter Validation**: All 6 parameters (name, inOut, latitude, longitude, store, branch) are required
- **Error Handling**: Graceful degradation when geocoding fails (still records attendance)
- **Security**: API keys stored in Script Properties, not hardcoded
- **Client-Side**: Uses navigator.geolocation with fallback error handling
- **Dynamic Dropdowns**: Store selection populates corresponding branch options

## Testing Strategy

The test suite covers:
- API integration with proper mocking
- Parameter validation and error cases
- Data structure integrity (8-column format)
- Configuration validation
- Performance benchmarking

Tests are designed to work in both configured and unconfigured environments.