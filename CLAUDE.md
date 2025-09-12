# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Google Apps Script (GAS) based inventory reporting system that records inventory data with location tracking. The system consists of:

- **Code.gs**: Main server-side functions for handling form submissions, geocoding, and data management
- **Index.html**: Client-side web interface for inventory reporting
- **Tests.gs**: Comprehensive unit tests for all major functions

## Architecture

### Core Components

1. **Web App Handler** (`doPost`): Processes inventory submissions with location validation
2. **Geocoding Service** (`getAddressFromCoordinates`): Converts coordinates to addresses using Google Maps API
3. **Data Sources**: Dynamically loads member, area, and store lists from Google Sheets
4. **HTML Interface** (`doGet`): Serves the inventory form with real-time location capture

### Data Flow

1. User submits inventory data via web form with geolocation
2. `doPost` validates all required parameters (name, area, coordinates, store, branch, inventory counts, expiration date)
3. System geocodes coordinates to readable address
4. Data appended to record sheet: [timestamp, name, area, store, branch, latitude, longitude, address, note, bottleCount, cartonCount, expirationDate, inventoryNote]

### Google Sheets Structure

- **Record Sheet**: Inventory records (14 columns as above)
- **Member Sheet**: Employee names in column B (starting row 2)
- **Area Sheet**: Area names in column A (starting row 2)
- **Store Sheet**: Store names (column A), area names (column B), and branch names (column C) starting row 2
- **Product Sheet**: Product types (column A) and product names (column B) starting row 2

## Development Commands

### Testing
```javascript
// Run all unit tests
runAllTests()

// Run specific test categories
testGetAddressFromCoordinates()
testGetMemberList() 
testGetAreaList()
testGetStoreList()
testGetProductList()
testDoPostValidInput()

// Setup test configuration
setupTestProperties()

// Performance testing
runPerformanceTest()
```

### Required Script Properties
```
SpreadSheet_ID: Google Sheets ID for data storage
Record_Sheet_Name: Main inventory records sheet name
Member_Sheet_Name: Sheet containing employee names (default: 'Member')
Area_Sheet_Name: Sheet containing area names (default: 'Area')
Store_Sheet_Name: Sheet containing store/branch data (default: 'Store')
Product_Sheet_Name: Sheet containing product data (default: 'Product')
Maps_API_KEY: Google Maps Geocoding API key
```

## Key Implementation Details

- **Parameter Validation**: All 9 parameters (name, area, latitude, longitude, store, branch, bottleCount, cartonCount, expirationDate) are required
- **Error Handling**: Graceful degradation when geocoding fails (still records inventory)
- **Security**: API keys stored in Script Properties, not hardcoded
- **Client-Side**: Uses navigator.geolocation with fallback error handling
- **Dynamic Dropdowns**: Store selection populates corresponding branch options
- **Calendar UI**: Date picker for expiration date selection
- **Inventory Fields**: Separate bottle/carton counts and inventory-specific notes

## Testing Strategy

The test suite covers:
- API integration with proper mocking
- Parameter validation and error cases
- Data structure integrity (14-column format)
- Configuration validation
- Performance benchmarking

Tests are designed to work in both configured and unconfigured environments.

## Current Data Structure

The Record sheet contains 14 columns:
1. **Timestamp**: Automatic timestamp
2. **Name**: User name from Member sheet (column B)
3. **Area**: Selected area from Area sheet (column A)
4. **Store**: Selected store from Store sheet (column A)
5. **Branch**: Selected branch from Store sheet (column B)
6. **Latitude**: GPS coordinates
7. **Longitude**: GPS coordinates
8. **Address**: Geocoded address from coordinates
9. **Note**: General notes (optional free text)
10. **Bottle Count**: Number of inventory bottles (required)
11. **Carton Count**: Number of inventory cartons (required)
12. **Expiration Date**: Product expiration date (required, date format)
13. **Inventory Note**: Inventory-specific notes (optional free text)
14. **Product Inventory**: JSON data containing individual product inventory details

## Product Management

The system includes a comprehensive product inventory feature:
- **Product Sheet**: Manages available products with types and names
- **Tabbed Interface**: Product tabs displayed at bottom of form (up to ~10 products)
- **Individual Tracking**: Each product can have separate bottle/carton counts and expiration dates
- **Dual Records**: Creates both summary and product-specific records
- **JSON Storage**: Product data stored as JSON in column 14 for complex queries