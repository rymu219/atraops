# AtraOps — Transfer to a New System

## What’s on `D:\`

| Path | Contents |
|------|----------|
| **`D:\AtraOps-Export\`** | Full app code (HTML/CSS/JS) |
| **`D:\AtraOps-Export.zip`** | Same code, zipped for USB/email |

## Two parts of the “backend”

1. **Code** — files in this folder (UI + logic)  
2. **Data** — browser storage (serials, master lists, documents, rack/bin)  

Code alone does **not** include serials/docs you entered. Export data from Admin as JSON.

---

## On this PC (before transfer)

### 1. Copy the code (already done)
- Folder: `D:\AtraOps-Export\`
- Or zip: `D:\AtraOps-Export.zip`

### 2. Export your data
1. Open `index.html` (Documents or D: copy)
2. **Admin** → login `admin` / `admin123`
3. Click **Export Backend JSON →**
4. Save the download (e.g. `AtraOps-backend-….json`) onto the **same USB/D: drive**

---

## On the new system

1. Copy `AtraOps-Export` folder (or unzip the zip) anywhere, e.g.  
   `C:\Users\<you>\Documents\AtraOps`
2. Open `index.html`
3. **Admin** → login → **Import Backend JSON** → choose the JSON file  
4. Confirm replace → done  

All serial details, master lists, document modules, and rack/bin data load into the new install.

---

## Replace an existing AtraOps backend

1. Back up the new system’s data first (**Export Backend JSON**) if needed  
2. Copy **code files** over the old folder (`index.html`, `css\`, `js\`)  
3. **Import Backend JSON** from this PC’s export to replace data  

---

## Included in JSON export

- Master categories, connection types, locations, descriptions  
- Admin assets / serial records  
- Document modules (revisions, files stored in browser)  
- Rack/bin overrides  
- Theme preference  

---

## Demo login

- Username: `admin`  
- Password: `admin123`  
