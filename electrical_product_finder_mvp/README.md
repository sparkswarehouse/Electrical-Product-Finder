# AI Electrical Product Finder MVP

This is a deployable starter app for an AI-style electrical product finder.

## What is included

- React/Vite web app
- Product search using the uploaded Luckins-style sample data
- AI-style query parsing
- Product cards
- Alternative matching
- Supplier comparison mock data
- Quote basket
- Import script for Luckins CSV files
- Environment placeholders for Luckins/OpenAI/supplier feed details

## Run locally

```bash
npm install
npm run dev
```

Open the local URL shown in your terminal.

## Add real Luckins/OpenAI details later

Copy `.env.example` to `.env` and fill in:

```bash
VITE_OPENAI_API_KEY=
VITE_LUCKINS_API_BASE_URL=
VITE_LUCKINS_API_KEY=
VITE_SUPPLIER_FEED_URL=
VITE_ENABLE_LIVE_LUCKINS=true
```

## Import fresh Luckins CSV data

Put the CSV files into `/data/incoming`, then run:

```bash
npm run import:luckins
```

The script outputs `src/data/products.sample.json`.

## Important

This starter uses uploaded sample data only. Before using live Luckins data commercially, confirm your licence allows storage, indexing, search display, and any public/trade-user presentation.
