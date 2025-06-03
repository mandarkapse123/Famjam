const { google } = require('@googleapis/sheets');
const SPREADSHEET_ID = '146omDPgro3I1jbshVEGZqHKPaIOA4gjmjnFRyGbOG9s';

exports.handler = async (event) => {
  try {
    console.log('Deleting sheet data:', event.body);
    const { sheet, id } = JSON.parse(event.body);
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS),
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });
    const sheets = google.sheets({ version: 'v4', auth });
    const dataRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${sheet}!A2:E`
    });
    const rowIndex = dataRes.data.values ? dataRes.data.values.findIndex(row => parseInt(row[0]) === parseInt(id)) : -1;
    if (rowIndex === -1) throw new Error('Record not found');
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      resource: {
        requests: [{
          deleteDimension: {
            range: { sheetId: getSheetId(sheet), startIndex: rowIndex + 1, endIndex: rowIndex + 2, dimension: 'ROWS' }
          }
        }]
      }
    });
    console.log('Data deleted successfully');
    return { statusCode: 200, body: JSON.stringify({ success: true }) };
  } catch (error) {
    console.error('Error deleting sheet:', error);
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};

function getSheetId(sheetName) {
  const sheetIds = {
    'Reminders': 0,
    'Todos': 953034764,
    'Events': 1304848060,
    'Names': 131890993
  };
  return sheetIds[sheetName] || 0;
}
