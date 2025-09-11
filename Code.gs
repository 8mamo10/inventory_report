function doPost(e) {
  // スプレッドシートのIDをここに設定
  const spreadSheetId = PropertiesService.getScriptProperties().getProperty('SpreadSheet_ID');
  if (!spreadSheetId) {
    throw new Error("Spreadsheet ID is not set in Script Properties.");
  }

  // シート名を指定
  const sheetName = PropertiesService.getScriptProperties().getProperty('Sheet_Name');
  if (!sheetName) {
    throw new Error("Sheet Name is not set in Script Properties.");
  }

  // POSTリクエストで送られてきたデータを取得
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
  const sheet = ss.getSheetByName(sheetName);

  // タイムスタンプを追加
  const timestamp = new Date();
  let address = 'Fetching address...';

  try {
    // 緯度経度から住所を取得する関数を呼び出し
    address = getAddressFromCoordinates(latitude, longitude);
  } catch (err) {
    console.error("Failed to fetch address:", err);
    address = 'Failed to fetch address';
  }

  // 新しい行としてデータを追加
  sheet.appendRow([timestamp, name, inOut, store, branch, latitude, longitude, address]);

  return ContentService.createTextOutput(JSON.stringify({ status: 'success', message: 'Finish registration' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function getAddressFromCoordinates(lat, lng) {
  // スクリプトプロパティからAPIキーを取得する場合:
  const apiKey = PropertiesService.getScriptProperties().getProperty('Maps_API_KEY');
  if (!apiKey) {
    throw new Error("Google Maps API Key is not set in Script Properties.");
  }
  const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}&language=ja`;

  const response = UrlFetchApp.fetch(url);
  const json = JSON.parse(response.getContentText());

  if (json.status === 'OK' && json.results.length > 0) {
    // 最も正確な結果 (通常は results[0]) の formatted_address を返す
    return json.results[0].formatted_address;
  } else if (json.status === 'ZERO_RESULTS') {
    return 'Not found';
  } else {
    throw new Error(`Geocoding API Error: ${json.status} - ${json.error_message || ''}`);
  }
}

// ウェブアプリケーションとしてデプロイするための関数 (初回のみ実行)
function doGet() {
  // この関数はGETリクエストがあった場合に実行されます
  // 通常はここでHTMLファイルを提供します
  return HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL); // <iframe>で埋め込む場合などに必要
}

// HTMLファイルの内容を返す関数
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

// メンバーリストを取得する関数
function getMembersList() {
  const spreadSheetId = PropertiesService.getScriptProperties().getProperty('SpreadSheet_ID');
  if (!spreadSheetId) {
    throw new Error("Spreadsheet ID is not set in Script Properties.");
  }

  const membersSheetName = PropertiesService.getScriptProperties().getProperty('Members_Sheet_Name') || 'Members';

  const ss = SpreadsheetApp.openById(spreadSheetId);
  const membersSheet = ss.getSheetByName(membersSheetName);

  if (!membersSheet) {
    throw new Error(`Members sheet "${membersSheetName}" not found. Please create a sheet named "${membersSheetName}" with names in column A.`);
  }

  // 名前が入っている列（A列）からデータを取得（2行目から開始）
  const range = membersSheet.getRange('A2:A');
  const values = range.getValues();

  // 空白セルを除外し、重複を削除（シートの順序を維持）
  const members = values
    .map(row => row[0])
    .filter(name => name && name.toString().trim() !== '')
    .map(name => name.toString().trim())
    .filter((name, index, arr) => arr.indexOf(name) === index); // 重複削除

  return members;
}

// ストアリストを取得する関数
function getStoresList() {
  const spreadSheetId = PropertiesService.getScriptProperties().getProperty('SpreadSheet_ID');
  if (!spreadSheetId) {
    throw new Error("Spreadsheet ID is not set in Script Properties.");
  }

  const storesSheetName = PropertiesService.getScriptProperties().getProperty('Stores_Sheet_Name') || 'Stores';

  const ss = SpreadsheetApp.openById(spreadSheetId);
  const storesSheet = ss.getSheetByName(storesSheetName);

  if (!storesSheet) {
    throw new Error(`Stores sheet "${storesSheetName}" not found.`);
  }

  // ストア名と拠点名を取得（2行目から開始）
  const range = storesSheet.getRange('A2:B');
  const values = range.getValues();

  // 空白行を除外してデータを整理
  const storesData = values
    .filter(row => row[0] && row[0].toString().trim() !== '')
    .map(row => ({
      store: row[0].toString().trim(),
      branch: row[1] ? row[1].toString().trim() : ''
    }));

  // ストア名一覧を取得（重複削除、順序維持）
  const stores = [];
  const storeMap = new Map();

  storesData.forEach(item => {
    if (!storeMap.has(item.store)) {
      stores.push(item.store);
      storeMap.set(item.store, []);
    }
    if (item.branch) {
      storeMap.get(item.store).push(item.branch);
    }
  });

  return {
    stores: stores,
    storeMap: Object.fromEntries(storeMap)
  };
}
