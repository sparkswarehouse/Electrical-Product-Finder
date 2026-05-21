# TradeFind AI Google Sheets Backend

Use Google Sheets as the first live backend for TradeFind AI.

## 1. Create the Google Sheet

Create a Google Sheet called:

TradeFind AI Backend

Create these tabs exactly:

### Suppliers
Columns:
id, name, status, commercialStatus, supplierType, website, apiStatus, feedOptions, sponsored, priority, notes

### ProductLinks
Columns:
productCode, supplier, price, stock, url, urlType, confidence, sponsored, priority, lastChecked

### Leads
Columns:
createdAt, name, company, email, phone, postcode, requiredBy, message, productsJson, status

### Clicks
Columns:
createdAt, productCode, productName, supplier, url, urlType, source

## 2. Add Apps Script

Open Extensions > Apps Script.

Paste the contents of:

google-sheets/apps-script.js

Then set this value at the top of the script:

const SPREADSHEET_ID = 'YOUR_GOOGLE_SHEET_ID';

You can get the Sheet ID from the Google Sheet URL.

## 3. Deploy Apps Script as Web App

Click Deploy > New deployment.

Type: Web app
Execute as: Me
Who has access: Anyone with the link

Copy the Web App URL.

## 4. Add Vercel environment variable

In Vercel > Project > Settings > Environment Variables, add:

GOOGLE_SHEETS_WEB_APP_URL = your Apps Script Web App URL

Then redeploy the Vercel project.

## Important

This is an MVP backend. Do not share your Apps Script Web App URL publicly.
