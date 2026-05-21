const SPREADSHEET_ID = 'YOUR_GOOGLE_SHEET_ID';

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet() {
  return jsonResponse({ ok: true, service: 'TradeFind AI Google Sheets Backend' });
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
