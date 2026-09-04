# AtraOps — Asset Management System

Oilfield asset / rental operations SPA (client-side only).  
**Rebuilt 2026-07-29** with recovered browser data imported.

## Open the app

1. Double-click `OPEN-AtraOps.bat`, **or**
2. Double-click `index.html` (use **Microsoft Edge** if possible)

No install required. Data is stored in the browser (`localStorage`, keys `fieldops-*`).

## Project path (stable)

```
C:\Users\ben\oilfield-asset-management\
  index.html
  OPEN-AtraOps.bat
  README.md
  css\styles.css
  js\app.js
  js\recovered-data.js   ← your recovered Edge data (embedded backup)
```

## Recovered data included

On first load the app imports:

| Data | Contents |
|------|----------|
| Equipment lists | EL-DEMO01 (Chevron / RO-2026-0841), EL-DEMO-WT01 (WT), EL-DEMO02 (Shell closed) |
| Assets | Serials **123456**, **111111**, **DP-1985** |
| Delivery tickets | **DT-1** on EL-DEMO01 |
| Masters / docs / NCRs | Locations, categories, demo docs & NCRs |

If Edge still has live `fieldops-*` keys, those are preferred and normalized automatically.

### Force re-import from embedded backup

In the browser console (F12):

```js
AtraOps.reimportRecovered()
```

## Modules

| Module | Purpose |
|--------|---------|
| **Inventory** | Serial lookup, location/category search, asset details |
| **Tickets** | Search delivery tickets by EL/order, customer, ship dates |
| **Equipment List** | Rental orders — header, serial lines, well transfer, DTs, ledger |
| **Documents** | Controlled docs (demo) |
| **NCR** | Non-conformance (demo) |
| **Admin** | Serial register + master lists (`admin` / `admin123`) |

## Features

- Home module drag-and-drop order  
- Equipment List search, header, lines from inventory  
- UOM (EA / JT / FT), location mismatch warnings  
- Close EL / Well Transfer (no delete)  
- Delivery tickets w/ or w/o pricing — sequential DT-1, DT-2…  
- DT ledger on each EL; open from Tickets  
- Serial chips → asset details  

## Backups

Keep copies of:

- This folder (zip)  
- `atraops-fieldops-backup.json` on Desktop and `D:\`  

## Clear data (careful)

DevTools → Application → Local Storage → remove keys starting with `fieldops-`, then reload  
(or run `AtraOps.reimportRecovered()` to restore from embedded backup).
