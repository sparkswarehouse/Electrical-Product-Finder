const SPREADSHEET_ID = 'YOUR_GOOGLE_SHEET_ID';

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function rowsToObjects(values) {
  if (!values || values.length < 2) return [];
  const headers = values[0];
  return values.slice(1).filter(row => row.some(Boolean)).map((row, rowIndex) => {
    const item = { rowNumber: rowIndex + 2 };
    headers.forEach((header, index) => item[header] = row[index] || '');
    return item;
  });
}

function doGet(e) {
  try {
    const action = e && e.parameter && e.parameter.action;
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);

    if (action === 'leads') {
      const sheet = spreadsheet.getSheetByName('Leads');
      const values = sheet.getDataRange().getValues();
      const leads = rowsToObjects(values).reverse().slice(0, 100);
      return jsonResponse({ ok: true, action: 'leads_listed', leads: leads });
    }

    if (action === 'clicks') {
      const sheet = spreadsheet.getSheetByName('Clicks');
      const values = sheet.getDataRange().getValues();
      const clicks = rowsToObjects(values).reverse().slice(0, 100);
      return jsonResponse({ ok: true, action: 'clicks_listed', clicks: clicks });
    }

    return jsonResponse({ ok: true, service: 'TradeFind AI Google Sheets Backend' });
  } catch (error) {
    return jsonResponse({ ok: false, error: String(error) });
  }
}

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents || '{}');
    const action = body.action;
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);

    if (action === 'lead') {
      const sheet = spreadsheet.getSheetByName('Leads');
      sheet.appendRow([
        new Date().toISOString(),
        body.name || '',
        body.company || '',
        body.email || '',
        body.phone || '',
        body.postcode || '',
        body.requiredBy || '',
        body.message || '',
        JSON.stringify(body.products || []),
        'new'
      ]);

      return jsonResponse({ ok: true, action: 'lead_saved' });
    }

    if (action === 'deleteLead') {
      const sheet = spreadsheet.getSheetByName('Leads');
      const rowNumber = Number(body.rowNumber);
      if (!rowNumber || rowNumber < 2) return jsonResponse({ ok: false, error: 'Invalid rowNumber' });
      sheet.deleteRow(rowNumber);
      return jsonResponse({ ok: true, action: 'lead_deleted', rowNumber: rowNumber });
    }

    if (action === 'click') {
      const sheet = spreadsheet.getSheetByName('Clicks');
      sheet.appendRow([
        new Date().toISOString(),
        body.productCode || '',
        body.productName || '',
        body.supplier || '',
        body.url || '',
        body.urlType || '',
        body.source || 'product-detail'
      ]);

      return jsonResponse({ ok: true, action: 'click_saved' });
    }

    return jsonResponse({ ok: false, error: 'Unknown action' });
  } catch (error) {
    return jsonResponse({ ok: false, error: String(error) });
  }
}
