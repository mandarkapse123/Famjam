const { google } = require('@googleapis/sheets');
const SPREADSHEET_ID = '146omDPgro3I1jbshVEGZqHKPaIOA4gjmjnFRyGbOG9s';

exports.handler = async (event) => {
  try {
    console.log('Updating sheet data:', event.body);
    const { sheet, id, values } = JSON.parse(event.body);
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
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${sheet}!A${rowIndex + 2}:E${rowIndex + 2}`,
      valueInputOption: 'RAW',
      resource: { values: [values] }
    });
    console.log('Data updated successfully');
    return { statusCode: 200, body: JSON.stringify({ success: true }) };
  } catch (error) {
    console.error('Error updating sheet:', error);
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
