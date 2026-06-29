# Inventory API Data Documentation

This document describes what data this Laravel app reads from the external Inventory API used by stock sync.

## Environment Variables

Configured in `.env`:

- `INVENTORY_API_BASE_URL`: Base URL for the inventory service.
- `INVENTORY_CANADA_API_KEY`: API key sent in request header `X-API-Key`.
- `INVENTORY_CANADA_WAREHOUSE_ID`: Warehouse filter sent as query parameter `warehouse_id`.
- `INVENTORY_CANADA_WAREHOUSE_NAME`: Display label used in API responses from local DB endpoints.
- `INVENTORY_API_VERIFY_SSL`: SSL verification toggle for outgoing HTTP calls.
- `INVENTORY_API_CA_BUNDLE_PATH`: Custom CA bundle path (used when provided).

## Outbound API Request

Stock sync calls:

- Method: `GET`
- URL: `{INVENTORY_API_BASE_URL}/api/public/stocks`
- Query params: `warehouse_id={INVENTORY_CANADA_WAREHOUSE_ID}` (if warehouse id is non-zero)
- Headers: `X-API-Key: {INVENTORY_CANADA_API_KEY}`
- Accept: `application/json`

## Expected Response Shape

The sync accepts either:

1. Object form:

```json
{
  "data": [
    {
      "product_id": 101,
      "product_name": "Canvas Shirt",
      "barcode": "BC-001",
      "sku": "BC-001",
      "color_variant": { "name": "Black" },
      "size_variant": { "size": "M" },
      "stocks": 9
    }
  ]
}
```

2. Direct array form:

```json
[
  {
    "product_id": 101,
    "barcode": "BC-001",
    "stocks": 9
  }
]
```

## Fields Read From Inventory API

Each row from the Inventory API may contain many fields, but this app currently reads these:

- `product_id`
- `barcode` (string or array; arrays are joined with `-`)
- `sku`
- `product_name` (or fallback `product.name`)
- `color_variant.name` (fallbacks: `color`, `product.color`)
- `size_variant.size` (fallbacks: `size`, `product.size`)
- `stocks` (fallback `available_stock`)

## How Data Is Used

- Product matching priority (first successful match):
  1. `product_id`
  2. `barcode`
  3. `sku`
  4. Variant key from `product_name + color + size`
  5. Product name only

- Stock update behavior:
  - Reads numeric stock from `stocks` (or `available_stock`).
  - Applies `max(0, stock)`.
  - Updates only local `products.stock`.

## Data Exposed By Local Endpoints

After sync, local endpoints return data from your own database (not directly from upstream API):

- `POST /api/api-products/sync`: runs sync and returns counters (`synced`, `updated`, `skipped`).
- `GET /api/inventory/canada-warehouse-stocks`: returns local product rows with `stocks`, `warehouse_name`, variant info, etc.

## Important Note

The code reads inventory settings from `config('services.inventory.*')`. Ensure `config/services.php` contains an `inventory` config block mapped to the above env vars; otherwise sync will fail with missing configuration.
