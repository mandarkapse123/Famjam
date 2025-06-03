const { google } = require('@googleapis/sheets');
const SPREADSHEET_ID = '146omDPgro3I1jbshVEGZqHKPaIOA4gjmjnFRyGbOG9s';

exports.handler = async (event) => {
  try {
    console.log('Adding sheet data:', event.body);
    const { sheet, values } = JSON.parse(event.body);
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS),
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });
    const sheets = google.sheets({ version: 'v4', auth });
    const maxIdRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${sheet}!A2:A`
    });
    const maxId = maxIdRes.data.values ? Math.max(...maxIdRes.data.values.map(row => parseInt(row[0]) || 0)) : 0;
    const newValues = [maxId + 1, ...values.slice(1)];
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${sheet}!A:E`,
      valueInputOption: 'RAW',
      resource: { values: [newValues] }
    });
    console.log('Data added successfully');
    return { statusCode: 200, body: JSON.stringify({ success: true }) };
  } catch (error) {
    console.error('Error adding sheet data:', error);
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
