# AI Provider Observability Dashboard

## Forensic Verification Protocol

This dashboard is designed with zero fabrication, zero placeholders, and 100% deterministic data sources.

### Pre-Deployment Verification Steps

1. **Check for Fabricated Content**
   ```bash
   grep -r 'mock\|sample\|placeholder\|dummy' . --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=out
   ```
   **Expected Result:** Zero matches

2. **Verify Build Integrity**
   ```bash
   npm run build
   ```
   **Expected Result:** Zero errors, clean build

3. **Verify Export**
   ```bash
   npm run export
   ```
   **Expected Result:** Static files generated in `/out` directory

4. **Test Null States**
   - Open dashboard in clean browser (incognito mode)
   - Disable network or throttle to offline
   - All tiles should show explicit null state messages explaining data absence
   - No charts with fabricated data

### Data Source Verification

All data sources are machine-readable and deterministic:

1. **Stock Data:** Polygon.io API (requires API key in `.env`)
2. **Litigation Data:** CourtListener REST API (public)
3. **SEC Filings:** SEC EDGAR RSS feeds (public)
4. **Provider Health:** Direct API endpoint checks (requires provider API keys)
5. **Usage Data:** Client-side IndexedDB (browser storage)

### Environment Setup

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Add your API keys to `.env`

3. Install dependencies:
   ```bash
   npm install
   ```

4. Run development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000)

### Deployment to Netlify

1. Push this repository to GitHub

2. Connect repository to Netlify

3. Set environment variables in Netlify dashboard (match `.env` structure)

4. Deploy command: `npm run build`

5. Publish directory: `out`

6. Functions directory: `netlify/functions`

### Hash Verification

The `/verification` page shows SHA-256 hashes of all fetched data payloads. Use this to verify data integrity:

1. Navigate to `/verification`
2. View hash manifest
3. Download original JSON from `/public/data/`
4. Compute SHA-256 hash locally:
   ```bash
   shasum -a 256 public/data/stock-data.json
   ```
5. Compare with manifest hash

### Client-Side Request Interception

The dashboard monkeypatches `fetch` and `XMLHttpRequest` to capture AI API requests:

- Detects provider from request URL
- Extracts model, token counts from response headers/body
- Stores in IndexedDB
- Updates dashboard in real-time

Pattern follows [lobehub RFC #7575](https://github.com/lobehub/lobe-chat/discussions/7575)

### No LLM Processing

This dashboard **does not** use any LLM for:
- Sentiment analysis
- Content classification
- Data extraction beyond regex

All data processing is deterministic, rule-based code.

### Mobile Ready

Dashboard is fully responsive and tested on:
- Desktop (1920×1080)
- Tablet (768×1024)
- Mobile (375×667)

### Support

For issues, verify:
1. All API keys are set in `.env`
2. Network requests are not blocked
3. Browser supports IndexedDB
4. No ad blockers interfering with fetch interception