"""
Import Luckins-style B*.CSV files into the app JSON format.

Usage:
  python scripts/import_luckins_csv.py /path/to/B6071053.CSV /path/to/B6071054.CSV

If no paths are provided, the script looks in data/incoming/*.CSV.
"""
import glob, json, sys
from pathlib import Path
import pandas as pd

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "src" / "data" / "products.sample.json"

def clean(x):
    if pd.isna(x): return ""
    return str(x).strip()

def map_row(r):
    price = clean(r.get("Trade 1 Price")) or clean(r.get("Retail Price")) or "0"
    try: price = round(float(price), 2)
    except Exception: price = 0
    return {
        "id": clean(r.get("Item Code")),
        "tsi": clean(r.get("Item Code")),
        "supplierCode": clean(r.get("Supplier Code")),
        "catalogueNumber": clean(r.get("Catalogue Number 1")),
        "catalogueNumber2": clean(r.get("Catalogue Number 2")),
        "brand": clean(r.get("Brand Name")) or clean(r.get("Product Range Major")) or "Generic",
        "product": clean(r.get("Product")),
        "productType": clean(r.get("Product Type")),
        "description": clean(r.get("Short Description")) or " ".join([clean(r.get("Product")), clean(r.get("Product Type")), clean(r.get("Dimensions")), clean(r.get("Material/Colour/Finish"))]).strip(),
        "otherDescription": clean(r.get("Other Description")),
        "dimensions": clean(r.get("Dimensions")),
        "finish": clean(r.get("Material/Colour/Finish")),
        "commodityMajor": clean(r.get("Commodity - Major")),
        "commodityMinor": clean(r.get("Commodity - Minor")),
        "rangeMajor": clean(r.get("Product Range Major")),
        "rangeMinor": clean(r.get("Product Range Minor")),
        "ean": clean(r.get("EAN 1 Code")),
        "price": price,
        "priceUnit": clean(r.get("Price Unit")),
        "status": clean(r.get("Status")) or "Active",
        "supplierName": "Live supplier feed pending",
        "searchText": " ".join(clean(r.get(c)) for c in [
            "Catalogue Number 1","Brand Name","Product","Product Type","Other Description",
            "Dimensions","Material/Colour/Finish","Commodity - Major","Commodity - Minor","Short Description"
        ]).lower()
    }

def main():
    files = sys.argv[1:] or glob.glob(str(ROOT / "data" / "incoming" / "*.CSV"))
    if not files:
        raise SystemExit("No CSV files supplied. Put files in data/incoming or pass file paths.")
    rows = []
    for file in files:
        df = pd.read_csv(file, dtype=str, engine="python", on_bad_lines="skip")
        if "Item Code" in df.columns:
            rows.append(df)
    if not rows:
        raise SystemExit("No valid Luckins product CSV files found.")
    data = pd.concat(rows, ignore_index=True).drop_duplicates(subset=["Item Code","Supplier Code","Catalogue Number 1"])
    products = [map_row(r) for _, r in data.iterrows()]
    OUT.write_text(json.dumps(products))
    print(f"Imported {len(products)} products to {OUT}")

if __name__ == "__main__":
    main()
