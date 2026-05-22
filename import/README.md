# TradeFind AI Import System

This folder contains the first-stage product import framework for TradeFind AI.

## Goal

Aggregate electrical products from multiple suppliers into a single searchable catalogue.

Initial suppliers:
- TLC Direct
- CEF
- Toolstation

## Import Strategy

### Phase 1
- Crawl/search supplier product pages
- Extract:
  - Product name
  - Brand
  - Product code
  - Image URL
  - Price
  - Supplier URL
  - Stock text
  - Category

### Phase 2
- Deduplicate products
- Match by:
  - EAN/GTIN
  - Manufacturer part code
  - Brand
  - Fuzzy matching

### Phase 3
- Sponsored supplier integrations
- Official APIs
- Live stock feeds
- Nightly updates

## Output

All products are normalised into:

```json
{
  "brand": "MK Electric",
  "name": "13A Double Socket",
  "code": "K2747WHI",
  "category": "Wiring Devices",
  "price": "£4.99",
  "imageUrl": "https://...",
  "suppliers": []
}
```

## Future

- Scheduled Vercel Cron imports
- Supabase storage
- AI equivalence engine
- Trade pricing
- Live availability
