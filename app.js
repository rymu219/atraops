/**
 * AtraOps Asset Management System — Client-side SPA
 * IIFE, no build tools. localStorage keys: fieldops-*
 */
(function () {
  "use strict";

  /* ========================================================================
   * Constants & storage helpers
   * ======================================================================== */
  var PREFIX = "fieldops-";
  var KEYS = {
    theme: PREFIX + "theme",
    homeOrder: PREFIX + "home-modules-order",
    assets: PREFIX + "assets",
    assetsLegacy: PREFIX + "assets-v1",
    masters: PREFIX + "masters-v1",
    equipmentLists: PREFIX + "equipment-lists-v5",
    equipmentDts: PREFIX + "equipment-dts-v2",
    dtSeq: PREFIX + "equipment-dt-seq",
    elSeq: PREFIX + "equipment-el-seq",
    jobSeq: PREFIX + "equipment-job-seq",
    jobs: PREFIX + "jobs-v1",
    billingDrafts: PREFIX + "billing-drafts-v1",
    receivingReports: PREFIX + "receiving-reports-v1",
    rrSeq: PREFIX + "rr-seq",
    docs: PREFIX + "docs-v1",
    docLibrary: PREFIX + "doc-library-v1",
    ncrs: PREFIX + "ncrs-v1",
    cardexHistory: PREFIX + "cardex-history-v1",
    locations: PREFIX + "locations",
    categories: PREFIX + "master-categories",
    connections: PREFIX + "connection-types",
    descriptions: PREFIX + "descriptions",
    descriptionsByCategory: PREFIX + "descriptions-by-category",
    customers: PREFIX + "customers",
    vendors: PREFIX + "vendors",
    vendorRecords: PREFIX + "vendor-records-v1",
    vendorFiles: PREFIX + "vendor-files-v1",
    scoreConfig: PREFIX + "score-config-v1",
    scoreConfigDraft: PREFIX + "score-config-draft-v1",
    scoreConfigLog: PREFIX + "score-config-log-v1",
    supplierScores: PREFIX + "supplier-scores-v1",
    rackBin: PREFIX + "rack-bin",
    assetDocs: PREFIX + "asset-docs",
    migrated: PREFIX + "migrated-v4",
    utilRentRef: PREFIX + "util-rent-ref-v1",
  };

  var ADMIN_USER = "admin";
  var ADMIN_PASS = "admin123";

  var DEFAULT_LOCATIONS = [
    "Broussard",
    "Houma",
    "Odessa",
    "Midland",
    "Houston Yard",
    "Offshore Staging",
  ];

  var DEFAULT_CATEGORIES = [
    "Drill Pipe",
    "HWDP",
    "Collars",
    "Subs",
    "Handling Tools",
    "BOP Equipment",
    "Mud Motors",
    "MWD/LWD",
    "Casing Accessories",
    "BHXO",
    "Other",
  ];

  var DEFAULT_CUSTOMERS = ["Chevron", "Shell"];

  var DEFAULT_CONNECTIONS = [
    "NC50",
    "NC38",
    "NC46",
    "XT57",
    "FH",
    "IF",
    "REG",
    "Other",
  ];

  /* Descriptions belong to a master category (serial form filters by category) */
  var DEFAULT_DESCRIPTIONS_BY_CATEGORY = {
    "Drill Pipe": [
      "5\" 19.50# S-135 NC50 R2 Drill Pipe",
      "4-1/2\" 16.60# S-135 NC46 R2 Drill Pipe",
      "6-5/8\" 27.70# S-135 FH R2 Drill Pipe",
    ],
    HWDP: ["5\" HWDP NC50"],
    Collars: ["6-1/2\" Drill Collar"],
    Subs: ["Crossover Sub NC50 x NC38"],
    "Handling Tools": ["Elevator", "Spider", "Kelly Valve"],
    "BOP Equipment": ["Safety Valve"],
    "Mud Motors": [],
    "MWD/LWD": [],
    "Casing Accessories": [],
    BHXO: ["BHXO Assembly", "BHXO Sub", "BHXO Crossover"],
    Other: [],
  };

  var DEFAULT_DESCRIPTIONS = (function () {
    var out = [];
    Object.keys(DEFAULT_DESCRIPTIONS_BY_CATEGORY).forEach(function (cat) {
      (DEFAULT_DESCRIPTIONS_BY_CATEGORY[cat] || []).forEach(function (d) {
        out.push(d);
      });
    });
    return out;
  })();

  var DOC_MODULES = [
    { id: "tech", name: "Technical Documentation", desc: "Specs, drawings, OEM manuals" },
    { id: "certs", name: "Certificates", desc: "Inspection certs, material certs, calibration" },
    { id: "procedures", name: "Procedures", desc: "SOPs, work instructions, HSE" },
    { id: "qa", name: "QA / QC", desc: "Quality records and inspection plans" },
    { id: "shipping", name: "Shipping Docs", desc: "Bills of lading, packing lists" },
  ];

  /* Admin serial document modules (from D:\AtraOps-Export) */
  var ADMIN_DOC_MODULES = [
    { id: "coc", title: "Certificate of Conformance (COC)" },
    { id: "mtr", title: "Material Test Report (MTR)" },
    { id: "inspection", title: "Inspection Certificate" },
    { id: "maintenance", title: "Maintenance Record" },
    { id: "calibration", title: "Calibration Certificate" },
    { id: "picture", title: "Asset Picture" },
    { id: "receiving", title: "Receiving Report" },
    { id: "ndt", title: "NDT Report" },
    { id: "dim", title: "Dimensional Report" },
    { id: "other", title: "Other Documents" },
  ];

  var HOME_MODULES = [
    { id: "jobs", title: "Jobs", desc: "Jobs own ELs — view DTs, RRs, and active rentals by job", route: "jobs", icon: "◆" },
    { id: "cardex", title: "Inventory", desc: "Serial lookup, location & category search, asset details", route: "cardex", icon: "▣" },
    { id: "tickets", title: "Tickets", desc: "Delivery tickets and receiving tickets / reports", route: "tickets", icon: "☰" },
    { id: "equipment", title: "Equipment List", desc: "Rental orders, serials, well transfer, DTs", route: "equipment", icon: "⚙" },
    { id: "documents", title: "Documents", desc: "Quality Manual & Customer Quality Requirements", route: "documents", icon: "📄" },
    { id: "ncr", title: "NCR", desc: "API Q2 non-conformance — risk matrix, CAPA, notify", route: "ncr", icon: "⚠" },
    { id: "vendors", title: "Vendors", desc: "Add suppliers — approval info, SAR, supporting documents", route: "vendors", icon: "⬡" },
    { id: "supplier-score", title: "Supplier Score", desc: "Composite supplier performance score, tier, and trend", route: "supplier-score", icon: "◎" },
    { id: "queue", title: "The Queue", desc: "Routing queue — need date, status, serials, and work instructions", route: "queue", icon: "▤" },
  ];

  /* Sample cardex / inventory assets */
  var SAMPLE_ASSETS = [
    {
      serial: "123456",
      itemNo: "DP-5000",
      description: "5\" 19.50# S-135 NC50 R2 Drill Pipe",
      category: "Drill Pipe",
      connection: "NC50",
      location: "Broussard",
      store: "Broussard",
      status: "Out",
      uom: "JT",
      condition: "Serviceable",
      manufacturer: "Grant Prideco",
      length: "31.2",
      weight: "608",
      materialSpec: "S-135 / 19.50#",
      rackBin: "A-12-03",
      lastDeliveryTicket: "1",
      notes: "Demo serial on rent via DT 1 / RO-2026-0841",
    },
    {
      serial: "789012",
      itemNo: "DP-5000",
      description: "5\" 19.50# S-135 NC50 R2 Drill Pipe",
      category: "Drill Pipe",
      connection: "NC50",
      location: "Broussard",
      store: "Broussard",
      status: "In",
      uom: "JT",
      condition: "Serviceable",
      manufacturer: "Grant Prideco",
      length: "30.8",
      weight: "602",
      materialSpec: "S-135 / 19.50#",
      rackBin: "A-12-04",
      notes: "",
    },
    {
      serial: "FT-1001",
      itemNo: "CT-2000",
      description: "Coiled Tubing String Segment",
      category: "Other",
      connection: "Other",
      location: "Houma",
      store: "Houma",
      status: "In",
      uom: "FT",
      condition: "Serviceable",
      manufacturer: "Tenaris",
      length: "1500",
      weight: "",
      materialSpec: "QT-800",
      rackBin: "CT-01",
      notes: "UOM FT — qty editable on EL lines",
    },
    {
      serial: "HW-4401",
      itemNo: "HW-500",
      description: "5\" HWDP NC50",
      category: "HWDP",
      connection: "NC50",
      location: "Odessa",
      store: "Odessa",
      status: "In",
      uom: "JT",
      condition: "Serviceable",
      manufacturer: "NOV",
      length: "30.5",
      weight: "950",
      materialSpec: "HWDP NC50",
      rackBin: "B-02",
      notes: "",
    },
    {
      serial: "SUB-901",
      itemNo: "SUB-NC",
      description: "Crossover Sub NC50 x NC38",
      category: "Subs",
      connection: "NC50",
      location: "Midland",
      store: "Midland",
      status: "In",
      uom: "EA",
      condition: "Serviceable",
      manufacturer: "In-house",
      length: "2.5",
      weight: "85",
      materialSpec: "NC50 x NC38",
      rackBin: "SUB-R1",
      notes: "",
    },
    {
      serial: "DP-3344",
      itemNo: "DP-4500",
      description: "4-1/2\" 16.60# S-135 NC46 R2 Drill Pipe",
      category: "Drill Pipe",
      connection: "NC46",
      location: "Houston Yard",
      store: "Houston Yard",
      status: "In",
      uom: "JT",
      condition: "Serviceable",
      manufacturer: "Vallourec",
      length: "31.0",
      weight: "515",
      materialSpec: "S-135 / 16.60#",
      rackBin: "C-08",
      notes: "",
    },
    {
      serial: "DC-2200",
      itemNo: "DC-650",
      description: "6-1/2\" Drill Collar",
      category: "Collars",
      connection: "IF",
      location: "Broussard",
      store: "Broussard",
      status: "In",
      uom: "JT",
      condition: "Serviceable",
      manufacturer: "Drilco",
      length: "30.0",
      weight: "2800",
      materialSpec: "6-1/2\" DC",
      rackBin: "DC-01",
      notes: "",
    },
    {
      serial: "ELV-12",
      itemNo: "HT-ELV",
      description: "Elevator",
      category: "Handling Tools",
      connection: "Other",
      location: "Offshore Staging",
      store: "Offshore Staging",
      status: "In",
      uom: "EA",
      condition: "Serviceable",
      manufacturer: "BJ",
      length: "",
      weight: "420",
      materialSpec: "HT Elevator",
      rackBin: "HT-03",
      notes: "",
    },
  ];

  /* ========================================================================
   * State
   * ======================================================================== */
  var state = {
    route: "home",
    params: {},
    adminAuthed: false,
    adminTab: "hub",
    adminMasterKey: null,
    adminDescCategory: null,
    serialDuplicateDraft: null,
    cardexSerials: [],
    cardexResults: null,
    cardexFilter: null,
    histDateSort: "desc",
    ticketsFilter: { status: "Open" },
    ticketsResults: null,
    ticketsPage: 1,
    ticketsMode: "hub", /* hub | delivery | receiving */
    recvSerials: [],
    recvReview: null,
    rrSearchFilter: {},
    rrSearchResults: null,
    elFilter: { status: "Open" },
    elResults: null,
    elPage: 1,
    elTab: "header",
    elDraft: null,
    jobFilter: { status: "Open" },
    jobPage: 1,
    jobTab: "els",
    jobDraft: null,
    vendorFilter: {},
    vendorPage: 1,
    vendorTab: "info",
    vendorDraft: null,
    scoreFilter: {},
    scorePage: 1,
    scoreExpandCat: null,
    adminScoreSubtab: "categories",
    scorePreview: null,
    scoreUserPeriod: { preset: "12m", start: "", end: "" },
    ncrFilter: { status: "" },
    ncrTab: "title",
    ncrDraft: null,
    queueFilter: null,
    queuePage: 1,
    utilFilter: null,
    toastTimer: null,
  };

  /* ========================================================================
   * Utilities
   * ======================================================================== */
  function escapeHtml(str) {
    if (str == null) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function $(sel, root) {
    return (root || document).querySelector(sel);
  }

  function $$(sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  }

  function storageGet(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      if (raw == null) return fallback;
      return JSON.parse(raw);
    } catch (e) {
      return fallback;
    }
  }

  function storageSet(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error("storageSet failed", key, e);
      return false;
    }
  }

  function todayISO() {
    var d = new Date();
    var m = String(d.getMonth() + 1).padStart(2, "0");
    var day = String(d.getDate()).padStart(2, "0");
    return d.getFullYear() + "-" + m + "-" + day;
  }

  /** Full date-time stamp for EL creation / audit (ISO). */
  function nowISO() {
    return new Date().toISOString();
  }

  function formatFileSize(n) {
    var b = parseInt(n, 10) || 0;
    if (b < 1024) return b + " B";
    if (b < 1024 * 1024) return (b / 1024).toFixed(1) + " KB";
    return (b / (1024 * 1024)).toFixed(1) + " MB";
  }

  function formatDate(iso) {
    if (!iso) return "—";
    try {
      var p = String(iso).split("T")[0].split("-");
      if (p.length === 3) return p[1] + "/" + p[2] + "/" + p[0];
      return iso;
    } catch (e) {
      return iso;
    }
  }

  /** DT numbers are plain integers (1, 2, 3…) — strip legacy "DT-" prefix for display/storage. */
  function formatDtNo(no) {
    var s = String(no == null ? "" : no).trim();
    if (!s) return "";
    return s.replace(/^DT-?/i, "") || s;
  }

  function uid(prefix) {
    return (prefix || "id") + "-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 7);
  }

  function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function toast(msg, type) {
    var host = $("#toast-host");
    if (!host) {
      host = document.createElement("div");
      host.id = "toast-host";
      host.className = "toast-host";
      document.body.appendChild(host);
    }
    var el = document.createElement("div");
    el.className = "toast toast-" + (type || "success");
    el.textContent = msg;
    host.appendChild(el);
    setTimeout(function () {
      if (el.parentNode) el.parentNode.removeChild(el);
    }, 3200);
  }

  /* ========================================================================
   * Masters & assets
   * ======================================================================== */
  /* 20 fillable inventory / cardex fields (matches original AtraOps asset form) */
  var ASSET_FIELDS = [
    { key: "serial", label: "Serial number", required: true },
    { key: "status", label: "Status", type: "status" },
    { key: "location", label: "Location", type: "location" },
    { key: "store", label: "Store", type: "location" },
    { key: "category", label: "Master category", type: "category" },
    { key: "description", label: "Description", type: "description", span: true },
    { key: "qtyOwned", label: "Qty owned" },
    { key: "qtyOnOrder", label: "Qty on order" },
    { key: "connection1End", label: "Connection 1 end", type: "connEnd" },
    { key: "connection1Type", label: "Connection 1 type", type: "connection" },
    { key: "connection2End", label: "Connection 2 end", type: "connEnd" },
    { key: "connection2Type", label: "Connection 2 type", type: "connection" },
    { key: "manufactureSerial", label: "Manufacture serial" },
    { key: "vendor", label: "Vendor" },
    { key: "datePurchased", label: "Date purchased", type: "date" },
    { key: "purchaseAmount", label: "Purchase amount" },
    { key: "vendorInvoice", label: "Vendor invoice" },
    { key: "purchasePo", label: "Purchase PO" },
    { key: "rackBin", label: "Rack / bin location" },
    { key: "uom", label: "Unit of measurement", type: "uom" },
  ];

  /* Admin Edit Serial — primary fields (location from master Locations list; no separate Store) */
  var SERIAL_ADMIN_FIELDS = [
    { key: "serial", label: "Serial number", required: true },
    { key: "location", label: "Asset location", type: "location" },
    { key: "rackBin", label: "Rack / bin" },
    { key: "category", label: "Master category", type: "category" },
    { key: "description", label: "Description", type: "description", span: true },
    { key: "connection1Type", label: "Connection 1", type: "connection" },
    { key: "connection1End", label: "Connection 1 end", type: "connEnd" },
    { key: "connection2Type", label: "Connection 2", type: "connection" },
    { key: "connection2End", label: "Connection 2 end", type: "connEnd" },
    { key: "materialSpec", label: "Material spec" },
    { key: "materialGrade", label: "Material grade" },
    { key: "weight", label: "Weight" },
    { key: "uom", label: "UOM (unit of measurement)", type: "uom" },
    { key: "vendor", label: "Vendor" },
    { key: "manufactureSerial", label: "OEM serial number" },
    { key: "datePurchased", label: "Purchase date", type: "date" },
    { key: "dateInService", label: "Date in service", type: "date" },
    { key: "purchasePo", label: "PO" },
    { key: "purchaseAmount", label: "Purchase amount" },
    { key: "vendorInvoice", label: "Invoice" },
    { key: "qtyOwned", label: "Qty owned" },
    { key: "qtyOnHand", label: "Qty on hand" },
  ];

  /* Module-fed fields (same grid; no special “system fields” banner on inventory view) */
  var SERIAL_ADMIN_AUTO_FIELDS = [
    { key: "lastInspection", label: "Last inspection", type: "date", auto: true },
    { key: "lastMaintenanceReport", label: "Last maintenance report", auto: true },
    { key: "lastDeliveryTicket", label: "Last DT", auto: true, link: "dt" },
    { key: "lastReceivingReport", label: "Last RR", auto: true, link: "rr" },
    { key: "oldSerialConversion", label: "Old serial number", auto: true, link: "serial" },
    { key: "retirementDate", label: "Retirement date", type: "date", auto: true },
    { key: "notes", label: "Notes", span: true, auto: true },
  ];

  function emptyAssetRecord() {
    return {
      id: "",
      serial: "",
      status: "In",
      location: "",
      store: "",
      description: "",
      category: "",
      qtyOwned: "1",
      qtyOnHand: "1",
      qtyOnOrder: "0",
      connection1End: "",
      connection1Type: "",
      connection2End: "",
      connection2Type: "",
      manufactureSerial: "",
      vendor: "",
      datePurchased: "",
      dateInService: "",
      purchaseAmount: "",
      vendorInvoice: "",
      purchasePo: "",
      rackBin: "",
      uom: "EA",
      /* derived / legacy */
      itemNo: "",
      connection: "",
      condition: "Serviceable",
      manufacturer: "",
      length: "",
      weight: "",
      notes: "",
      lastDeliveryTicket: "",
      lastDtDate: "",
      lastReturnDate: "",
      lastRig: "",
      lastReceivingReport: "",
      materialGrade: "",
      materialSpec: "",
      materialType: "",
      lastInspection: "",
      lastInspectionStatus: "",
      lastCoc: "",
      lastMaintenanceReport: "",
      oldSerialConversion: "",
      retirementDate: "",
      docModulesMeta: null,
    };
  }

  /* Normalize recovered / multi-version records into app shape */
  function normalizeAsset(a) {
    if (!a || typeof a !== "object") return emptyAssetRecord();
    var serial = a.serial || a.serialNumber || "";
    var uom = a.uom || a.unitOfMeasurement || a.unitOfMeasure || "EA";
    if (String(uom).toLowerCase() === "each") uom = "EA";
    if (String(uom).toLowerCase() === "joint" || String(uom).toLowerCase() === "jt") uom = "JT";
    if (String(uom).toLowerCase() === "ft" || String(uom).toLowerCase() === "feet") uom = "FT";
    var c1t = a.connection1Type || "";
    var c2t = a.connection2Type || "";
    var conn =
      a.connection ||
      (c1t && c2t ? c1t + " / " + c2t : c1t || c2t) ||
      "";
    var out = emptyAssetRecord();
    out.id = a.id || out.id;
    out.serial = String(serial);
    out.status = a.status || "In";
    out.location = a.location || a.store || "";
    out.store = a.store || a.location || "";
    out.description = a.description || "";
    out.category = a.category || a.masterCategory || "";
    out.qtyOwned = a.qtyOwned != null ? String(a.qtyOwned) : a.owned != null ? String(a.owned) : "1";
    out.qtyOnHand =
      a.qtyOnHand != null
        ? String(a.qtyOnHand)
        : a.onHand != null
          ? String(a.onHand)
          : out.qtyOwned || "1";
    out.qtyOnOrder = a.qtyOnOrder != null ? String(a.qtyOnOrder) : "0";
    out.connection1End = a.connection1End || "";
    out.connection1Type = c1t || (a.connection && !c2t ? a.connection : "") || "";
    out.connection2End = a.connection2End || "";
    out.connection2Type = c2t || "";
    out.manufactureSerial = a.manufactureSerial || a.oemSerial || "";
    out.vendor = a.vendor || a.manufacturer || "";
    out.datePurchased = a.datePurchased || a.purchaseDate || "";
    out.dateInService = a.dateInService || "";
    out.purchaseAmount = a.purchaseAmount || "";
    out.vendorInvoice = a.vendorInvoice || a.invoice || "";
    out.purchasePo = a.purchasePo || a.po || "";
    out.rackBin = a.rackBin || a.rackBinLocation || "";
    out.uom = uom;
    out.itemNo = a.itemNo || a.itemNumber || "";
    out.connection = conn;
    out.condition = a.condition || a.lastInspectionStatus || "Serviceable";
    out.manufacturer = a.manufacturer || a.vendor || "";
    out.length = a.length || "";
    out.weight = a.weight || "";
    out.notes = a.notes || "";
    out.lastDeliveryTicket = a.lastDeliveryTicket || a.lastDt || "";
    out.lastDtDate = a.lastDtDate || "";
    out.lastReturnDate = a.lastReturnDate || "";
    out.lastRig = a.lastRig || "";
    out.lastReceivingReport = a.lastReceivingReport || "";
    out.materialGrade = a.materialGrade || "";
    out.materialSpec = a.materialSpec || "";
    out.materialType = a.materialType || "";
    out.lastInspection = a.lastInspection || a.lastInspectionDate || "";
    out.lastInspectionStatus = a.lastInspectionStatus || "";
    out.lastCoc = a.lastCoc || "";
    out.lastMaintenanceReport = a.lastMaintenanceReport || a.lastMaintenance || "";
    out.oldSerialConversion = a.oldSerialConversion || a.oldSerial || "";
    out.retirementDate = a.retirementDate || "";
    out.docModulesMeta = a.docModulesMeta || null;
    return out;
  }

  /** Build HTML for inventory / serial forms. prefix e.g. "af" or "inv" */
  function renderAssetFormHtml(rec, prefix, opts) {
    opts = opts || {};
    var masters = loadMasters();
    var serialReadonly = !!opts.serialReadonly;
    var fieldList = opts.fields || ASSET_FIELDS;
    var autoList = opts.autoFields || null;
    var dis = opts.disabled ? " disabled" : "";
    var hideHint = !!opts.hideDefaultHint;

    function optsHtml(list, selected, allowEmpty, emptyLabel) {
      var h = allowEmpty
        ? '<option value="">' + escapeHtml(emptyLabel || "") + "</option>"
        : "";
      (list || []).forEach(function (c) {
        h +=
          '<option value="' +
          escapeHtml(c) +
          '"' +
          (selected === c ? " selected" : "") +
          ">" +
          escapeHtml(c) +
          "</option>";
      });
      return h;
    }

    function fieldHtml(def) {
      var id = prefix + "-" + def.key;
      var val = rec[def.key] != null ? rec[def.key] : "";
      var span = def.span ? " form-span-2" : "";
      var req = def.required ? " required" : "";
      var label = escapeHtml(def.label) + (def.required ? " *" : "");
      var fieldDis = dis || (def.auto ? " disabled" : "");
      var autoNote = def.auto
        ? '<span class="form-hint" style="display:block;margin-top:0.2rem">Auto-filled when modules come online</span>'
        : "";

      if (def.type === "status") {
        return (
          '<label class="field' +
          span +
          req +
          '"><span>' +
          label +
          '</span><select id="' +
          id +
          '" class="form-control"' +
          fieldDis +
          ">" +
          '<option value="In"' +
          (val === "In" ? " selected" : "") +
          ">In</option>" +
          '<option value="Out"' +
          (val === "Out" ? " selected" : "") +
          ">Out</option>" +
          '<option value="Quarantine"' +
          (val === "Quarantine" ? " selected" : "") +
          ">Quarantine</option>" +
          '<option value="Scrapped"' +
          (val === "Scrapped" ? " selected" : "") +
          ">Scrapped</option>" +
          "</select></label>"
        );
      }
      if (def.type === "location") {
        var locs = masters.locations.slice();
        if (val && locs.indexOf(val) === -1) locs.unshift(val);
        return (
          '<label class="field' +
          span +
          '"><span>' +
          label +
          '</span><select id="' +
          id +
          '" class="form-control"' +
          fieldDis +
          ">" +
          optsHtml(locs, val, true) +
          "</select></label>"
        );
      }
      if (def.type === "category") {
        var cats = masters.categories.slice();
        if (val && cats.indexOf(val) === -1) cats.unshift(val);
        return (
          '<label class="field' +
          span +
          '"><span>' +
          label +
          '</span><select id="' +
          id +
          '" class="form-control"' +
          fieldDis +
          ">" +
          optsHtml(cats, val, true, "Select…") +
          "</select></label>"
        );
      }
      if (def.type === "connection") {
        var conns = masters.connections.slice();
        if (val && conns.indexOf(val) === -1) conns.unshift(val);
        return (
          '<label class="field' +
          span +
          '"><span>' +
          label +
          '</span><select id="' +
          id +
          '" class="form-control"' +
          fieldDis +
          ">" +
          optsHtml(conns, val, true, "Select…") +
          "</select></label>"
        );
      }
      if (def.type === "connEnd") {
        return (
          '<label class="field' +
          span +
          '"><span>' +
          label +
          '</span><select id="' +
          id +
          '" class="form-control"' +
          fieldDis +
          ">" +
          '<option value=""></option>' +
          '<option value="Box"' +
          (val === "Box" ? " selected" : "") +
          ">Box</option>" +
          '<option value="Pin"' +
          (val === "Pin" ? " selected" : "") +
          ">Pin</option>" +
          '<option value="Box/Pin"' +
          (val === "Box/Pin" ? " selected" : "") +
          ">Box/Pin</option>" +
          '<option value="N/A"' +
          (val === "N/A" ? " selected" : "") +
          ">N/A</option>" +
          "</select></label>"
        );
      }
      if (def.type === "uom") {
        var uoms = ["EA", "JT", "FT", "SET", "each", "joint"];
        var uh =
          '<label class="field' +
          span +
          '"><span>' +
          label +
          '</span><select id="' +
          id +
          '" class="form-control"' +
          fieldDis +
          ">";
        uoms.forEach(function (u) {
          uh +=
            '<option value="' +
            u +
            '"' +
            (String(val) === u ? " selected" : "") +
            ">" +
            u +
            "</option>";
        });
        uh += "</select></label>";
        return uh;
      }
      if (def.type === "description") {
        var catForDesc = rec.category || rec.masterCategory || "";
        var descList = getDescriptionsForCategory(catForDesc);
        if (val && descList.indexOf(val) === -1) descList = [val].concat(descList);
        var emptyLabel = catForDesc
          ? descList.length
            ? "Select description…"
            : "No descriptions for this category — add under Master Lists"
          : "Select master category first";
        var descOpts =
          '<option value="">' +
          escapeHtml(emptyLabel) +
          "</option>" +
          descList
            .map(function (d) {
              return (
                '<option value="' +
                escapeHtml(d) +
                '"' +
                (val === d ? " selected" : "") +
                ">" +
                escapeHtml(d) +
                "</option>"
              );
            })
            .join("");
        return (
          '<label class="field form-span-2' +
          req +
          '"><span>' +
          label +
          '</span><select id="' +
          id +
          '" class="form-control"' +
          fieldDis +
          (catForDesc ? "" : " disabled") +
          ">" +
          descOpts +
          "</select>" +
          '<span class="form-hint" style="display:block;margin-top:0.25rem">Linked to master category — only that category&rsquo;s descriptions appear.</span></label>'
        );
      }
      var inputType = def.type === "date" ? "date" : "text";
      var ro =
        (def.key === "serial" && serialReadonly) || def.auto ? " readonly" : "";
      return (
        '<label class="field' +
        span +
        req +
        '"><span>' +
        label +
        '</span><input type="' +
        inputType +
        '" id="' +
        id +
        '" class="form-control' +
        (def.auto ? " input-readonly" : "") +
        '" value="' +
        escapeHtml(val) +
        '"' +
        ro +
        fieldDis +
        " />" +
        autoNote +
        "</label>"
      );
    }

    /* Inventory read-only: same field set as admin serial, no “system fields” banner, links when populated */
    if (opts.inventoryReadonly) {
      return renderInventoryAssetReadonlyHtml(rec, fieldList, autoList);
    }

    var html = '<div class="form-grid-4 asset-20-fields">';
    fieldList.forEach(function (def) {
      html += fieldHtml(def);
    });
    html += "</div>";
    if (autoList && autoList.length) {
      if (opts.flatAuto) {
        html += '<div class="form-grid-4 asset-20-fields mt-1">';
        autoList.forEach(function (def) {
          html += fieldHtml(def);
        });
        html += "</div>";
      } else {
        html +=
          '<div class="serial-auto-fields mt-2">' +
          '<h3 class="panel-title" style="font-size:0.95rem;margin:0.75rem 0 0.5rem">System fields (auto-populated later)</h3>' +
          '<p class="form-hint mb-1">These stay blank until inspection, maintenance, DT, and retirement modules fill them.</p>' +
          '<div class="form-grid-4 asset-20-fields">';
        autoList.forEach(function (def) {
          html += fieldHtml(def);
        });
        html += "</div></div>";
      }
    }
    if (!hideHint) {
      html +=
        '<p class="form-hint mt-1">20 inventory fields — same cardex record used on Equipment List lines and DTs. Description list follows master category.</p>';
    }
    return html;
  }

  /**
   * Read-only inventory details: sectioned cards (same fields as admin serial).
   * Populated linkable values (Last DT, Last RR, old serial) are clickable; nothing is editable.
   */
  function renderInventoryAssetReadonlyHtml(rec, fieldList, autoList) {
    var allDefs = (fieldList || SERIAL_ADMIN_FIELDS).concat(autoList || SERIAL_ADMIN_AUTO_FIELDS || []);
    var byKey = {};
    allDefs.forEach(function (d) {
      byKey[d.key] = d;
    });

    var sections = [
      {
        id: "documents",
        title: "Documents",
        icon: "📄",
        kind: "documents",
      },
      {
        id: "connections",
        title: "Connections",
        icon: "⟷",
        keys: ["connection1Type", "connection1End", "connection2Type", "connection2End"],
      },
      {
        id: "material",
        title: "Material & measurement",
        icon: "⚙",
        keys: ["materialSpec", "materialGrade", "weight", "uom"],
      },
      {
        id: "purchase",
        title: "Purchase & quantities",
        icon: "$",
        keys: [
          "vendor",
          "manufactureSerial",
          "datePurchased",
          "dateInService",
          "purchasePo",
          "purchaseAmount",
          "vendorInvoice",
          "qtyOwned",
          "qtyOnHand",
        ],
      },
      {
        id: "activity",
        title: "Activity & history",
        icon: "◷",
        keys: [
          "lastInspection",
          "lastMaintenanceReport",
          "lastDeliveryTicket",
          "lastReceivingReport",
          "oldSerialConversion",
          "retirementDate",
          "notes",
        ],
      },
    ];

    function displayVal(def) {
      var val = rec[def.key];
      if (val == null || String(val).trim() === "") return "";
      if (def.type === "date") return formatDate(val) || String(val);
      return String(val);
    }
    function valueHtml(def) {
      var raw = rec[def.key];
      var shown = displayVal(def);
      if (!shown) {
        return '<span class="inv-ro-empty">—</span>';
      }
      var link = def.link || null;
      if (link === "dt" && raw) {
        return (
          '<button type="button" class="table-link mono inv-ro-link" data-inv-link="equipment-dt" data-inv-id="' +
          escapeHtml(String(raw)) +
          '">' +
          escapeHtml(shown) +
          "</button>"
        );
      }
      if (link === "rr" && raw) {
        return (
          '<button type="button" class="table-link mono inv-ro-link" data-inv-link="tickets-rr" data-inv-id="' +
          escapeHtml(String(raw)) +
          '">' +
          escapeHtml(shown) +
          "</button>"
        );
      }
      if (link === "serial" && raw && findCardexRecord(raw)) {
        return (
          '<button type="button" class="table-link mono inv-ro-link" data-inv-link="cardex-details" data-inv-serial="' +
          escapeHtml(String(raw)) +
          '">' +
          escapeHtml(shown) +
          "</button>"
        );
      }
      return '<span class="inv-ro-value">' + escapeHtml(shown) + "</span>";
    }

    function cellHtml(def) {
      if (!def) return "";
      var span = def.span || def.key === "description" || def.key === "notes" ? " inv-ro-cell-wide" : "";
      var hasVal = displayVal(def) !== "";
      return (
        '<div class="inv-ro-cell' +
        span +
        (hasVal ? "" : " inv-ro-cell-empty") +
        '"><span class="inv-ro-label">' +
        escapeHtml(def.label) +
        '</span><div class="inv-ro-val">' +
        valueHtml(def) +
        "</div></div>"
      );
    }

    var html = '<div class="inv-ro-layout">';
    html +=
      '<div class="inv-ro-hero">' +
      '<div class="inv-ro-hero-main">' +
      '<div class="inv-ro-hero-serial mono">' +
      escapeHtml(rec.serial || "—") +
      "</div>" +
      '<div class="inv-ro-hero-desc">' +
      escapeHtml(rec.description || "No description") +
      "</div>" +
      "</div>" +
      '<div class="inv-ro-hero-meta">' +
      '<span class="badge badge-' +
      (rec.status === "In" ? "in" : "out") +
      ' inv-ro-status">' +
      escapeHtml(rec.status || "—") +
      "</span>" +
      '<span class="inv-ro-hero-chip">' +
      escapeHtml(rec.location || rec.store || "No location") +
      "</span>" +
      (rec.category
        ? '<span class="inv-ro-hero-chip">' + escapeHtml(rec.category) + "</span>"
        : "") +
      (rec.rackBin
        ? '<span class="inv-ro-hero-chip mono">Rack ' + escapeHtml(rec.rackBin) + "</span>"
        : "") +
      "</div></div>";

    function documentsBodyHtml() {
      var links = ADMIN_DOC_MODULES.map(function (m) {
        var bucket = getModuleDocs(rec, m.id);
        var cur = bucket.current;
        var hasDoc = !!(cur && (cur.name || cur.dataUrl || cur.rev));
        var expSt = hasDoc ? getDocExpirationStatus(cur) : null;
        var titleAttr = hasDoc
          ? (cur && cur.name
              ? "Open " + cur.name + (cur.rev ? " · rev " + cur.rev : "")
              : "Document on file — click to open") +
            (expSt ? " · " + expSt.label : "")
          : "No document on file";
        /* Always a button so click handlers work reliably with admin-stored files */
        return (
          '<div class="inv-doc-item' +
          (expSt ? (expSt.expired ? " inv-doc-item-expired" : expSt.na ? "" : " inv-doc-item-valid") : "") +
          '">' +
          '<button type="button" class="serial-doc-link inv-doc-link ' +
          (hasDoc ? "serial-doc-link-has-doc" : "serial-doc-link-empty serial-doc-link-disabled") +
          '" data-inv-doc-module="' +
          escapeHtml(m.id) +
          '" ' +
          (hasDoc ? "" : "disabled ") +
          'title="' +
          escapeHtml(titleAttr) +
          '">' +
          escapeHtml(m.title) +
          (hasDoc && cur && cur.rev
            ? ' <span class="inv-doc-rev">rev ' + escapeHtml(String(cur.rev)) + "</span>"
            : "") +
          "</button>" +
          (hasDoc ? renderDocExpirationHtml(cur) : "") +
          "</div>"
        );
      }).join("");
      return (
        '<div class="inv-ro-docs-body">' +
        '<div class="serial-doc-links inv-ro-doc-links">' +
        links +
        "</div>" +
        '<p class="form-hint inv-ro-docs-hint">Blue = document uploaded in Admin (click to open). Expiration under the link: <span class="doc-exp-valid">green = in date</span>, <span class="doc-exp-expired">red = expired</span>.</p>' +
        "</div>"
      );
    }

    sections.forEach(function (sec) {
      html +=
        '<section class="inv-ro-card inv-ro-card-' +
        sec.id +
        '">' +
        '<header class="inv-ro-card-head">' +
        '<span class="inv-ro-card-icon" aria-hidden="true">' +
        sec.icon +
        "</span>" +
        "<h3 class=\"inv-ro-card-title\">" +
        escapeHtml(sec.title) +
        "</h3></header>";
      if (sec.kind === "documents") {
        html += documentsBodyHtml();
      } else {
        html += '<div class="inv-ro-card-body">';
        (sec.keys || []).forEach(function (k) {
          html += cellHtml(byKey[k] || { key: k, label: k });
        });
        html += "</div>";
      }
      html += "</section>";
    });

    html +=
      '<p class="form-hint inv-ro-footnote">View only — changes are made in Admin → Serial Numbers.</p></div>';
    return html;
  }

  function bindInventoryReadonlyLinks(root) {
    root = root || document;
    $$("[data-inv-link]", root).forEach(function (b) {
      b.addEventListener("click", function () {
        var route = b.getAttribute("data-inv-link");
        var id = b.getAttribute("data-inv-id");
        var sn = b.getAttribute("data-inv-serial");
        if (sn) navigate(route, { serial: sn });
        else if (id) navigate(route, { id: id });
        else navigate(route);
      });
    });
  }

  /** When master category changes, refresh description options from master lists */
  function bindCategoryDescriptionFields(prefix, root) {
    root = root || document;
    var catEl = $("#" + prefix + "-category", root);
    var descEl = $("#" + prefix + "-description", root);
    if (!catEl || !descEl) return;

    function fillDescriptions(cat, selected) {
      var list = getDescriptionsForCategory(cat);
      if (selected && list.indexOf(selected) === -1) list = [selected].concat(list);
      var emptyLabel = cat
        ? list.length
          ? "Select description…"
          : "No descriptions for this category — add under Master Lists"
        : "Select master category first";
      var html = '<option value="">' + escapeHtml(emptyLabel) + "</option>";
      list.forEach(function (d) {
        html +=
          '<option value="' +
          escapeHtml(d) +
          '"' +
          (selected && d === selected ? " selected" : "") +
          ">" +
          escapeHtml(d) +
          "</option>";
      });
      descEl.innerHTML = html;
      descEl.disabled = !cat;
      if (!cat || !selected || list.indexOf(selected) === -1) {
        descEl.value = selected && list.indexOf(selected) !== -1 ? selected : "";
      } else {
        descEl.value = selected;
      }
    }

    catEl.addEventListener("change", function () {
      /* switching category clears description so only valid master items apply */
      fillDescriptions(catEl.value, "");
    });
  }

  /** Read form values into an asset object (merged onto base; preserves unlisted fields) */
  function readAssetForm(prefix, base, root, fieldDefs) {
    root = root || document;
    fieldDefs = fieldDefs || ASSET_FIELDS;
    function g(key) {
      var el = $("#" + prefix + "-" + key, root);
      return el ? String(el.value || "").trim() : "";
    }
    var out = base ? deepClone(base) : emptyAssetRecord();
    fieldDefs.forEach(function (def) {
      if (def.auto) return; /* auto fields not edited on form */
      var el = $("#" + prefix + "-" + def.key, root);
      if (!el) return;
      out[def.key] = g(def.key);
    });
    /* keep derived fields in sync */
    out.serialNumber = out.serial;
    out.masterCategory = out.category;
    out.unitOfMeasurement = out.uom;
    out.rackBinLocation = out.rackBin;
    out.manufacturer = out.vendor;
    out.oemSerial = out.manufactureSerial;
    out.owned = out.qtyOwned;
    out.onHand = out.qtyOnHand;
    out.connection =
      out.connection1Type && out.connection2Type
        ? out.connection1Type + " / " + out.connection2Type
        : out.connection1Type || out.connection2Type || out.connection || "";
    /* store mirrors location when present; do not invent blanks over existing data */
    if (out.location && !out.store) out.store = out.location;
    if (out.store && !out.location) out.location = out.store;
    out.updatedAt = new Date().toISOString();
    if (!out.id) out.id = "AST-" + Date.now().toString(36).toUpperCase();
    if (!out.createdAt) out.createdAt = out.updatedAt;
    return normalizeAsset(out);
  }

  function normalizeLine(ln) {
    if (!ln || typeof ln !== "object") return emptyLine();
    var serials = [];
    if (Array.isArray(ln.serials)) {
      serials = ln.serials.map(function (s) {
        if (s && typeof s === "object") {
          return {
            serial: s.serial || s.serialNumber || "",
            location: s.location || "",
            /* onRent is billing state for THIS EL only — never infer from lastDtId alone */
            onRent: s.onRent != null ? !!s.onRent : !!(s.status === "Out"),
            onRentAt: s.onRentAt || "",
            lastDtId: s.lastDtId || "",
          };
        }
        return {
          serial: String(s || ""),
          location: "",
          onRent: false,
          onRentAt: "",
          lastDtId: "",
        };
      });
    } else if (typeof ln.serials === "string" && ln.serials.trim()) {
      serials = ln.serials.split(/[,;\n]+/).map(function (s) {
        return {
          serial: s.trim(),
          location: "",
          onRent: false,
          onRentAt: "",
          lastDtId: "",
        };
      }).filter(function (x) { return x.serial; });
    }
    var uom = ln.uom || "EA";
    var type = ln.type || "RENT";
    if (String(type).toUpperCase() === "RENT") type = "Rental";
    return {
      id: ln.id || uid("ln"),
      itemNo: ln.itemNo != null ? String(ln.itemNo) : "",
      description: ln.description || "",
      uom: uom,
      qty: ln.qty != null ? ln.qty : serials.length || 1,
      type: type,
      serials: serials,
      selectedForDt: !!ln.selectedForDt,
      minDays: ln.minDays || "",
      minAmt: ln.minAmt || "",
      addAmt: ln.addAmt || "",
      lastDtId: ln.lastDtId || "",
      lastDtType: ln.lastDtType || "",
      onRentAt: ln.onRentAt || ln.onRentDate || "",
    };
  }

  function normalizeEquipmentList(el) {
    if (!el || typeof el !== "object") return emptyEquipmentList();
    var h = el.header || {};
    var linesSrc = el.lines || el.lineItems || [];
    var out = emptyEquipmentList();
    out.id = el.id || out.id;
    out.elNo = el.elNo || el.id || "";
    out.orderNo = el.orderNo || h.orderNo || "";
    out.status = el.status || "Open";
    out.company = el.company || h.company || el.customer || "";
    out.customer = el.customer || el.company || h.company || "";
    out.well = el.well || h.well || "";
    out.rig = el.rig || h.rig || "";
    out.jobNo = el.jobNo || h.jobNo || h.job || "";
    out.salesPerson = el.salesPerson || h.salesmanField || h.preparedBy || el.createdBy || "";
    out.location = el.location || h.store || el.store || "";
    out.store = el.store || h.store || el.location || "";
    out.createdBy = el.createdBy || h.preparedBy || "demo.user";
    out.createdAt = el.createdAt || h.dateOrdered || todayISO();
    out.shipDate = el.shipDate || (h.delivDateTime ? String(h.delivDateTime).slice(0, 10) : "") || h.startRent || "";
    out.returnDate = el.returnDate || "";
    out.poNumber = el.poNumber || h.poNumber || "";
    out.afe = el.afe || h.afe || "";
    out.contact = el.contact || h.preparedBy || "";
    out.phone = el.phone || h.phone || "";
    out.email = el.email || h.customerEmail || "";
    out.shipTo = el.shipTo || h.shipTo || "";
    out.billTo = el.billTo || h.billingAddress || "";
    out.notes = el.notes || (h.jobDescription || "");
    out.transferType = el.transferType || (el.transferFromId ? "well-transfer" : "");
    out.needsHeaderUpdate = !!el.needsHeaderUpdate;
    out.sourceElId = el.sourceElId || el.transferFromId || "";
    out.transferFromOrderNo = el.transferFromOrderNo || "";
    out.headerSaved = el.headerSaved != null ? !!el.headerSaved : true;
    out.header = h;
    out.extras = el.extras || {
      odIdRequirements: "",
      inspectionProcedures: "",
      inspectionCompany: "",
      monitor: "",
      paint: "",
      dope: "",
    };
    out.dtLedger = el.dtLedger || [];
    out.rrLedger = el.rrLedger || [];
    out.updatedAt = el.updatedAt || "";
    /* full original header fields (kept in sync with flat props) */
    out.leaseOcsg = el.leaseOcsg || h.leaseOcsg || "";
    out.areaBlock = el.areaBlock || h.areaBlock || "";
    out.delivDateTime = el.delivDateTime || h.delivDateTime || "";
    out.startRent = el.startRent || h.startRent || "";
    out.dateOrdered = el.dateOrdered || h.dateOrdered || "";
    out.shipVia = el.shipVia || h.shipVia || "";
    out.job = el.job || h.job || "";
    out.supplyDept = el.supplyDept || h.supplyDept || "";
    out.estDuration = el.estDuration || h.estDuration || "";
    out.basin = el.basin || h.basin || "";
    out.geoLocation = el.geoLocation || h.geoLocation || "";
    out.taxCode = el.taxCode || h.taxCode || "";
    out.currency = el.currency || h.currency || "USD";
    out.preparedBy = el.preparedBy || h.preparedBy || el.createdBy || "";
    out.salesmanField = el.salesmanField || h.salesmanField || el.salesPerson || "";
    out.salesmanCorporate = el.salesmanCorporate || h.salesmanCorporate || "";
    out.jobDescription = el.jobDescription || h.jobDescription || el.notes || "";
    out.lines = (linesSrc || []).map(normalizeLine);
    return out;
  }

  /** Pull one or more serial numbers from a DT/EL line (serial, serials string/array, assets). */
  function extractSerialsFromDtLine(ln) {
    if (!ln || typeof ln !== "object") return [];
    var out = [];
    var seen = {};
    function push(sn) {
      var s = String(sn || "").trim();
      if (!s) return;
      /* multi-serial pasted as one cell */
      if (/[\n,;]/.test(s)) {
        s.split(/[\n,;]+/).forEach(function (part) {
          var p = String(part || "").trim();
          if (!p) return;
          var pk = p.toUpperCase();
          if (seen[pk]) return;
          seen[pk] = true;
          out.push(p);
        });
        return;
      }
      var k = s.toUpperCase();
      if (seen[k]) return;
      seen[k] = true;
      out.push(s);
    }
    if (ln.serial) push(ln.serial);
    if (Array.isArray(ln.serials)) {
      ln.serials.forEach(function (s) {
        if (s && typeof s === "object") push(s.serial || s.serialNumber);
        else push(s);
      });
    } else if (typeof ln.serials === "string" && ln.serials.trim()) {
      ln.serials.split(/[\n,;]+/).forEach(function (part) {
        push(part);
      });
    }
    if (Array.isArray(ln.assets)) {
      ln.assets.forEach(function (a) {
        if (a) push(a.serial || a.serialNumber);
      });
    }
    return out;
  }

  /**
   * Prefer an existing line description; if blank, pull from cardex / inventory by serial.
   * Fixes recovered DTs (e.g. DT-1 serial 123456) where description was never written on the line.
   */
  function bindSerialAutoDescription(serialEl, descEl) {
    if (!serialEl) return;
    function fill() {
      var sn = String(serialEl.value || "").trim();
      if (!sn) return;
      var rec = findCardexRecord(sn);
      if (rec) {
        if (descEl) {
          descEl.value = rec.description || rec.itemNo || descEl.value || "";
        }
      } else {
        toast("Serial " + sn + " not found in inventory", "error");
      }
    }
    serialEl.addEventListener("blur", fill);
    serialEl.addEventListener("change", fill);
    serialEl.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        fill();
      }
    });
  }

  function resolveSerialDescription(serial, existing) {
    var desc = String(existing || "").trim();
    if (desc) return desc;
    if (!serial) return "";
    try {
      var rec = findCardexRecord(serial);
      if (rec && rec.description) return String(rec.description).trim();
    } catch (e) {}
    return "";
  }

  function normalizeDt(d) {
    if (!d || typeof d !== "object") return null;
    var cust = d.customer;
    var company = "";
    var phone = "";
    var email = "";
    var shipTo = "";
    if (cust && typeof cust === "object") {
      company = cust.company || "";
      phone = cust.phone || "";
      email = cust.email || "";
      shipTo = cust.shipTo || "";
    } else {
      company = d.customer || d.company || "";
      phone = d.phone || "";
      email = d.email || "";
      shipTo = d.shipTo || "";
    }
    var job = d.job && typeof d.job === "object" ? d.job : {};
    var lines = [];
    (d.lines || []).forEach(function (ln) {
      var rawDesc =
        ln.description ||
        (ln.assets && ln.assets[0] && ln.assets[0].description) ||
        "";
      var serialList = extractSerialsFromDtLine(ln);
      if (!serialList.length) {
        /* keep a line even without serial so billing/qty can still surface */
        serialList = [""];
      }
      serialList.forEach(function (serial) {
        var sn = String(serial || "").trim();
        var qtyEach =
          serialList.length > 1 && String(ln.uom || "").toUpperCase() !== "FT"
            ? 1
            : ln.qty != null
              ? ln.qty
              : 1;
        lines.push({
          itemNo: ln.itemNo != null ? String(ln.itemNo) : "",
          serial: sn,
          description: resolveSerialDescription(sn, rawDesc),
          uom: ln.uom || "EA",
          qty: qtyEach,
          unitPrice: ln.unitPrice || ln.minAmt || "",
          amount: ln.amount || ln.minAmt || "",
          minDays: ln.minDays || "",
          minAmt: ln.minAmt || "",
          addAmt: ln.addAmt || "",
        });
      });
    });
    var rawId = d.id || d.dtNo || d.number || "";
    var num = formatDtNo(rawId) || formatDtNo(d.dtNo) || String(d.number || "");
    var id = num || String(rawId);
    return {
      id: id,
      dtNo: num || id,
      number: d.number != null ? d.number : parseInt(num, 10) || null,
      elId: d.elId || d.orderId || "",
      orderNo: d.orderNo || "",
      elNo: d.elNo || d.orderId || d.elId || "",
      customer: company,
      company: company,
      well: d.well || job.well || "",
      jobNo: d.jobNo || job.jobNo || job.job || "",
      shipDate: d.shipDate || d.onRentDate || (d.completedAt ? String(d.completedAt).slice(0, 10) : "") || "",
      type: d.type || "Delivery Ticket",
      status: d.status || (d.completed ? "Completed" : "Open"),
      completed: d.completed != null ? !!d.completed : String(d.status || "").toLowerCase() === "completed",
      completedAt: d.completedAt || "",
      shipTo: shipTo || d.shipTo || job.location || "",
      contact: d.contact || job.preparedBy || "",
      phone: phone || d.phone || "",
      email: email || d.email || "",
      withPricing: d.withPricing != null ? !!d.withPricing : true,
      lines: lines,
      lineIds: d.lineIds || [],
      notes: d.notes || "",
      createdAt: d.createdAt || "",
      /* Receiving: DT stays open until every serial is received in */
      receiveStatus: d.receiveStatus || "",
      receivedSerials: d.receivedSerials && typeof d.receivedSerials === "object" ? d.receivedSerials : {},
      partialReceiveCount: d.partialReceiveCount != null ? parseInt(d.partialReceiveCount, 10) || 0 : 0,
      rrIds: Array.isArray(d.rrIds) ? d.rrIds.slice() : [],
      destType: d.destType || (d.vendorId || d.vendorName ? "vendor" : d.elId ? "customer" : "customer"),
      vendorId: d.vendorId || "",
      vendorName: d.vendorName || "",
      dueDate: d.dueDate || "",
      store: d.store || d.location || "",
    };
  }

  function dtAllSerials(dt) {
    var list = [];
    var seen = {};
    (dt && dt.lines ? dt.lines : []).forEach(function (ln) {
      var sn = String(ln.serial || "").trim();
      if (!sn) return;
      var k = sn.toUpperCase();
      if (seen[k]) return;
      seen[k] = true;
      list.push(sn);
    });
    return list;
  }

  function dtIsSerialReceived(dt, serial) {
    if (!dt || !serial) return false;
    var map = dt.receivedSerials || {};
    var k = String(serial).toUpperCase();
    if (map[k] || map[serial]) return true;
    return false;
  }

  function dtOutstandingSerials(dt) {
    return dtAllSerials(dt).filter(function (sn) {
      return !dtIsSerialReceived(dt, sn);
    });
  }

  function dtIsFullyReceived(dt) {
    if (!dt) return false;
    if (dt.receiveStatus === "received") return true;
    var all = dtAllSerials(dt);
    if (!all.length) return false;
    /* Only fully received when every serial is marked via RR — not merely legacy completed */
    var map = dt.receivedSerials || {};
    if (!Object.keys(map).length) return false;
    return all.every(function (sn) {
      return dtIsSerialReceived(dt, sn);
    });
  }

  function refreshDtReceiveStatus(dt) {
    if (!dt) return dt;
    if (!dt.receivedSerials || typeof dt.receivedSerials !== "object") dt.receivedSerials = {};
    var all = dtAllSerials(dt);
    var out = dtOutstandingSerials(dt);
    var hasAnyRecv = Object.keys(dt.receivedSerials).length > 0;
    if (all.length && out.length === 0) {
      dt.receiveStatus = "received";
      dt.status = "Completed";
      dt.completed = true;
      if (!dt.completedAt) dt.completedAt = new Date().toISOString();
    } else if (hasAnyRecv) {
      dt.receiveStatus = "partial";
      dt.status = "Open";
      dt.completed = false;
    } else {
      dt.receiveStatus = "open";
      /* New model: open until received. Legacy completed seeds still searchable as closed until first receive workflow. */
      if (dt.completed && String(dt.status || "").toLowerCase() === "completed") {
        /* keep completed for old fully-shipped seeds that never used RR — treat as receivable via receiving UI */
        dt.receiveStatus = "open";
      } else {
        dt.status = "Open";
        dt.completed = false;
      }
    }
    return dt;
  }

  function formatRrLabel(rrNo, partialIndex, isPartial) {
    var n = String(rrNo || "");
    if (isPartial && partialIndex) return n + "-" + partialIndex;
    return n;
  }

  /**
   * One-time cleanup: feature is new — drop any empty/test RR lists so Receiving
   * never shows reports the user did not create via Receive all/selected.
   */
  function migrateReceivingReportsClean() {
    if (storageGet(PREFIX + "rr-clean-v1", null) === true) return;
    storageSet(KEYS.receivingReports, []);
    storageSet(KEYS.rrSeq, 0);
    try {
      var rawDts = storageGet(KEYS.equipmentDts, []) || [];
      var cleaned = rawDts.map(function (d) {
        if (!d || typeof d !== "object") return d;
        d.receivedSerials = {};
        d.partialReceiveCount = 0;
        d.rrIds = [];
        d.receiveStatus = "open";
        /* shipped tools still out until a real receive */
        if (d.lines && d.lines.length) {
          d.completed = false;
          d.status = "Open";
          d.completedAt = "";
        }
        return d;
      });
      storageSet(KEYS.equipmentDts, cleaned);
      var lists = storageGet(KEYS.equipmentLists, []) || [];
      lists.forEach(function (el) {
        if (el) el.rrLedger = [];
      });
      storageSet(KEYS.equipmentLists, lists);
    } catch (e) {}
    storageSet(PREFIX + "rr-clean-v1", true);
  }

  function loadReceivingReports() {
    migrateReceivingReportsClean();
    return storageGet(KEYS.receivingReports, []) || [];
  }

  function saveReceivingReports(list) {
    storageSet(KEYS.receivingReports, list || []);
  }

  function getReceivingReport(id) {
    var list = loadReceivingReports();
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === id || String(list[i].rrLabel) === String(id) || String(list[i].rrNo) === String(id)) {
        return list[i];
      }
    }
    return null;
  }

  function nextRrNo() {
    var seq = parseInt(storageGet(KEYS.rrSeq, 0), 10) || 0;
    loadReceivingReports().forEach(function (r) {
      var n = parseInt(r.rrNo, 10);
      if (!isNaN(n) && n > seq) seq = n;
    });
    seq += 1;
    storageSet(KEYS.rrSeq, seq);
    return seq;
  }

  function rrBelongsToEl(r, el) {
    if (!r || !el) return false;
    var ledger = elRrLedgerIdSet(el);
    if (Object.keys(ledger).length > 0) {
      return !!(
        ledger[String(r.id || "")] ||
        ledger[String(r.rrLabel || "")] ||
        ledger[String(r.rrNo || "")]
      );
    }
    if (r.createdOnElId != null && r.createdOnElId !== "") {
      return (
        String(r.createdOnElId) === String(el.id) ||
        String(r.createdOnElId) === String(el.elNo)
      );
    }
    return false;
  }

  function getRrsForEl(elOrId) {
    if (!elOrId) return [];
    var el = typeof elOrId === "object" ? elOrId : getEquipmentList(elOrId);
    if (!el) return [];
    return loadReceivingReports()
      .filter(function (r) {
        return rrBelongsToEl(r, el);
      })
      .sort(function (a, b) {
        return (parseInt(a.rrNo, 10) || 0) - (parseInt(b.rrNo, 10) || 0);
      });
  }

  function getRrsForDt(dtId) {
    if (!dtId) return [];
    var key = formatDtNo(dtId);
    return loadReceivingReports()
      .filter(function (r) {
        return (
          r.dtId === dtId ||
          r.dtNo === dtId ||
          formatDtNo(r.dtId) === key ||
          formatDtNo(r.dtNo) === key
        );
      })
      .sort(function (a, b) {
        return (parseInt(a.rrNo, 10) || 0) - (parseInt(b.rrNo, 10) || 0);
      });
  }

  function getRrsForLine(el, ln) {
    var serialKeys = {};
    (ln.serials || []).forEach(function (s) {
      var sn = typeof s === "string" ? s : s && s.serial;
      if (sn) serialKeys[String(sn).toUpperCase()] = true;
    });
    var hits = [];
    var seen = {};
    /* Only RRs created on this EL (not other lists that once held the serial) */
    getRrsForEl(el).forEach(function (r) {
      if (!rrBelongsToEl(r, el)) return;
      var match = false;
      (r.serials || []).forEach(function (sn) {
        if (serialKeys[String(sn).toUpperCase()]) match = true;
      });
      (r.lines || []).forEach(function (dl) {
        if (serialKeys[String(dl.serial || "").toUpperCase()]) match = true;
      });
      if (!match) return;
      if (seen[r.id]) return;
      seen[r.id] = true;
      hits.push(r);
    });
    return hits;
  }

  /**
   * Receive selected (or all outstanding) serials on a DT.
   * Creates a Receiving Report (RR#), marks serials In, keeps DT open until all received.
   */
  function processDtReceive(dt, serialsToReceive, opts) {
    opts = opts || {};
    if (!dt) throw new Error("No delivery ticket");
    refreshDtReceiveStatus(dt);
    var outstanding = dtOutstandingSerials(dt);
    var want = (serialsToReceive || []).map(function (s) {
      return String(s || "").trim();
    }).filter(Boolean);
    if (!want.length) throw new Error("Select at least one serial to receive");

    var wantKeys = {};
    want.forEach(function (s) {
      wantKeys[s.toUpperCase()] = s;
    });
    var toRecv = outstanding.filter(function (sn) {
      return wantKeys[String(sn).toUpperCase()];
    });
    if (!toRecv.length) throw new Error("Selected serials are already received or not on this DT");

    var remainingAfter = outstanding.filter(function (sn) {
      return !wantKeys[String(sn).toUpperCase()];
    });
    var isPartial = remainingAfter.length > 0;
    var isFinal = !isPartial;

    dt.partialReceiveCount = (parseInt(dt.partialReceiveCount, 10) || 0) + 1;
    var partialIndex = dt.partialReceiveCount;
    var rrNo = nextRrNo();
    /* Partial receives: N-1, N-2, N-3… Full receive in one shot: plain N */
    var wasEmpty = Object.keys(dt.receivedSerials || {}).length === 0;
    var labelIsPartial = isPartial || (!wasEmpty && isFinal);
    var rrLabel = formatRrLabel(rrNo, partialIndex, labelIsPartial || isPartial);
    if (isPartial) {
      rrLabel = formatRrLabel(rrNo, partialIndex, true);
    } else if (!wasEmpty) {
      /* final partial batch that closes DT */
      rrLabel = formatRrLabel(rrNo, partialIndex, true);
    } else {
      rrLabel = String(rrNo);
    }

    var stamp = new Date().toISOString();
    var el = getEquipmentList(dt.elId);
    var rrLines = [];
    if (!dt.receivedSerials) dt.receivedSerials = {};

    toRecv.forEach(function (sn) {
      var dln = null;
      (dt.lines || []).forEach(function (ln) {
        if (String(ln.serial || "").toUpperCase() === String(sn).toUpperCase()) dln = ln;
      });
      dt.receivedSerials[String(sn).toUpperCase()] = {
        at: stamp,
        rrLabel: rrLabel,
      };
      setAssetStatus(sn, "In", {
        note: "RR " + rrLabel + " · DT " + formatDtNo(dt.dtNo || dt.id),
        lastReceivingReport: rrLabel,
        lastReturnDate: String(stamp).slice(0, 10),
      });
      if (el) {
        (el.lines || []).forEach(function (ln) {
          (ln.serials || []).forEach(function (s) {
            if (String(s.serial).toUpperCase() === String(sn).toUpperCase()) {
              s.onRent = false;
              s.receivedAt = stamp;
              s.lastRrId = rrLabel;
            }
          });
        });
      }
      rrLines.push({
        serial: sn,
        description: resolveSerialDescription(sn, (dln && dln.description) || ""),
        itemNo: (dln && dln.itemNo) || "",
        uom: (dln && dln.uom) || "",
        qty: dln && dln.qty != null ? dln.qty : 1,
      });
    });

    refreshDtReceiveStatus(dt);

    var hdr = el ? snapshotElHeader(el) : resolveTicketHeader(dt, null);
    var rr = {
      id: uid("RR"),
      rrNo: rrNo,
      rrLabel: rrLabel,
      partialIndex: partialIndex,
      isPartial: isPartial || labelIsPartial,
      isFinal: isFinal,
      elId: dt.elId,
      orderId: dt.elId,
      createdOnElId: (el && (el.id || el.elNo)) || dt.createdOnElId || dt.elId,
      orderNo: hdr.orderNo || dt.orderNo || "",
      elNo: hdr.elNo || dt.elNo || "",
      jobNo: hdr.jobNo || dt.jobNo || "",
      afe: hdr.afe || "",
      poNumber: hdr.poNumber || "",
      rig: hdr.rig || dt.rig || "",
      phone: hdr.phone || dt.phone || "",
      contact: hdr.contact || dt.contact || "",
      shipTo: hdr.shipTo || dt.shipTo || "",
      billTo: hdr.billTo || "",
      location: hdr.location || "",
      store: hdr.store || "",
      shipDate: hdr.shipDate || dt.shipDate || "",
      returnDate: hdr.returnDate || "",
      salesPerson: hdr.salesPerson || "",
      dtId: dt.id || dt.dtNo,
      dtNo: formatDtNo(dt.dtNo || dt.id),
      customer: hdr.customer || dt.customer || dt.company || "",
      company: hdr.company || dt.company || dt.customer || "",
      well: hdr.well || dt.well || "",
      serials: toRecv.slice(),
      lines: rrLines,
      createdAt: stamp,
      notes: opts.notes || hdr.notes || "",
      header: hdr,
    };

    if (!dt.rrIds) dt.rrIds = [];
    dt.rrIds.push(rr.id);

    var dts = loadDts();
    for (var i = 0; i < dts.length; i++) {
      if (
        dts[i].id === dt.id ||
        formatDtNo(dts[i].dtNo || dts[i].id) === formatDtNo(dt.dtNo || dt.id)
      ) {
        dts[i] = dt;
        break;
      }
    }
    saveDts(dts);

    var rrs = loadReceivingReports();
    rrs.push(rr);
    saveReceivingReports(rrs);

    if (dt.destType === "vendor") {
      refreshSupplierScoreForVendorName(dt.vendorName || dt.customer || dt.company);
    }

    if (el) {
      if (!el.rrLedger) el.rrLedger = [];
      el.rrLedger.push({
        rrId: rr.id,
        rrLabel: rr.rrLabel,
        dtId: dt.id || dt.dtNo,
        dtNo: formatDtNo(dt.dtNo || dt.id),
        at: stamp,
        isPartial: rr.isPartial,
        isFinal: rr.isFinal,
      });
      /* update dt ledger status */
      if (el.dtLedger) {
        el.dtLedger.forEach(function (entry) {
          if (
            entry.dtId === dt.id ||
            entry.dtId === dt.dtNo ||
            formatDtNo(entry.dtId) === formatDtNo(dt.dtNo || dt.id)
          ) {
            entry.status = dt.receiveStatus === "received" ? "Received" : "Open";
            entry.receiveStatus = dt.receiveStatus;
          }
        });
      }
      saveEquipmentList(el);
      if (state.elDraft && state.elDraft.id === el.id) state.elDraft = deepClone(el);
    }

    try {
      reconcileSerialBillingStatus();
    } catch (eRec) {}

    return { rr: rr, dt: dt };
  }

  function cloneDescriptionsByCategory(src) {
    var out = {};
    if (!src || typeof src !== "object") return out;
    Object.keys(src).forEach(function (cat) {
      out[cat] = uniqStrings(src[cat] || []);
    });
    return out;
  }

  function flattenDescriptionsByCategory(map) {
    var out = [];
    if (!map || typeof map !== "object") return out;
    Object.keys(map).forEach(function (cat) {
      (map[cat] || []).forEach(function (d) {
        out.push(d);
      });
    });
    return uniqStrings(out);
  }

  function countDescriptionsByCategory(map) {
    var n = 0;
    if (!map || typeof map !== "object") return 0;
    Object.keys(map).forEach(function (cat) {
      n += (map[cat] || []).length;
    });
    return n;
  }

  /** Guess category for a legacy flat description string */
  function inferDescriptionCategory(desc, categories) {
    var d = String(desc || "").toLowerCase();
    if (!d) return "Other";
    var cats = (categories || []).slice().sort(function (a, b) {
      return b.length - a.length;
    });
    var i;
    for (i = 0; i < cats.length; i++) {
      var c = cats[i];
      if (c && d.indexOf(String(c).toLowerCase()) !== -1) return c;
    }
    if (d.indexOf("drill pipe") !== -1) return "Drill Pipe";
    if (d.indexOf("hwdp") !== -1) return "HWDP";
    if (d.indexOf("collar") !== -1) return "Collars";
    if (d.indexOf("crossover") !== -1 || d.indexOf(" sub") !== -1) return "Subs";
    if (d.indexOf("elevator") !== -1 || d.indexOf("spider") !== -1 || d.indexOf("kelly") !== -1) {
      return "Handling Tools";
    }
    if (d.indexOf("bop") !== -1 || d.indexOf("valve") !== -1) return "BOP Equipment";
    if (d.indexOf("bhxo") !== -1) return "BHXO";
    return "Other";
  }

  function ensureDescriptionsByCategory(m) {
    var map = {};
    var cats = uniqStrings((m.categories || []).concat(DEFAULT_CATEGORIES));

    /* Prefer existing map */
    if (m.descriptionsByCategory && typeof m.descriptionsByCategory === "object" && !Array.isArray(m.descriptionsByCategory)) {
      map = cloneDescriptionsByCategory(m.descriptionsByCategory);
    } else {
      /* seed defaults */
      map = cloneDescriptionsByCategory(DEFAULT_DESCRIPTIONS_BY_CATEGORY);
      /* migrate flat description arrays into categories */
      var flat = [];
      if (Array.isArray(m.descriptions)) flat = flat.concat(m.descriptions);
      var storedFlat = storageGet(KEYS.descriptions, null);
      if (Array.isArray(storedFlat)) flat = flat.concat(storedFlat);
      flat = uniqStrings(flat);
      /* asset-driven associations first */
      try {
        loadAssets().forEach(function (a) {
          var cat = (a.category || a.masterCategory || "").trim();
          var desc = (a.description || "").trim();
          if (!cat || !desc) return;
          if (!map[cat]) map[cat] = [];
          if (map[cat].indexOf(desc) === -1) map[cat].push(desc);
        });
      } catch (e) {}
      flat.forEach(function (desc) {
        /* skip if already placed under some category */
        var already = Object.keys(map).some(function (c) {
          return (map[c] || []).indexOf(desc) !== -1;
        });
        if (already) return;
        var cat = inferDescriptionCategory(desc, cats);
        if (!map[cat]) map[cat] = [];
        map[cat].push(desc);
      });
    }

    /* ensure every category key exists; seed defaults only for brand-new keys */
    cats.forEach(function (c) {
      if (!Object.prototype.hasOwnProperty.call(map, c)) {
        map[c] = (DEFAULT_DESCRIPTIONS_BY_CATEGORY[c] || []).slice();
      }
      if (!map[c]) map[c] = [];
      map[c] = uniqStrings(map[c]);
    });
    /* merge dedicated storage key if present */
    var storedMap = storageGet(KEYS.descriptionsByCategory, null);
    if (storedMap && typeof storedMap === "object" && !Array.isArray(storedMap)) {
      Object.keys(storedMap).forEach(function (cat) {
        if (!map[cat]) map[cat] = [];
        map[cat] = uniqStrings((map[cat] || []).concat(storedMap[cat] || []));
      });
    }

    m.descriptionsByCategory = map;
    m.descriptions = flattenDescriptionsByCategory(map);
    return m;
  }

  function getDescriptionsForCategory(category) {
    var m = loadMasters();
    var cat = String(category || "").trim();
    if (!cat) return [];
    var map = m.descriptionsByCategory || {};
    if (map[cat] && map[cat].length) return map[cat].slice();
    /* case-insensitive fallback */
    var key = Object.keys(map).find(function (k) {
      return String(k).toLowerCase() === cat.toLowerCase();
    });
    return key ? (map[key] || []).slice() : [];
  }

  /** Keep master description list aligned when a serial is saved */
  function ensureDescriptionInCategory(category, description) {
    var cat = String(category || "").trim();
    var desc = String(description || "").trim();
    if (!cat || !desc) return;
    var m = loadMasters();
    if (!m.descriptionsByCategory) m.descriptionsByCategory = {};
    if (!m.descriptionsByCategory[cat]) m.descriptionsByCategory[cat] = [];
    if (m.descriptionsByCategory[cat].indexOf(desc) === -1) {
      m.descriptionsByCategory[cat].push(desc);
      saveMasters(m);
    }
  }

  function loadMasters() {
    var m = storageGet(KEYS.masters, null);
    if (!m) {
      m = {
        locations: DEFAULT_LOCATIONS.slice(),
        categories: DEFAULT_CATEGORIES.slice(),
        connections: DEFAULT_CONNECTIONS.slice(),
        descriptions: DEFAULT_DESCRIPTIONS.slice(),
        descriptionsByCategory: cloneDescriptionsByCategory(DEFAULT_DESCRIPTIONS_BY_CATEGORY),
        customers: DEFAULT_CUSTOMERS.slice(),
        vendors: [],
      };
    }
    if (!Array.isArray(m.customers)) m.customers = DEFAULT_CUSTOMERS.slice();
    if (!Array.isArray(m.vendors)) m.vendors = [];
    /* merge dedicated keys from recovered app */
    var locs = storageGet(KEYS.locations, null);
    var cats = storageGet(KEYS.categories, null);
    var conns = storageGet(KEYS.connections, null);
    var descs = storageGet(KEYS.descriptions, null);
    var custs = storageGet(KEYS.customers, null);
    var vends = storageGet(KEYS.vendors, null);
    if (Array.isArray(locs) && locs.length) m.locations = uniqStrings((m.locations || []).concat(locs));
    if (Array.isArray(cats) && cats.length) m.categories = uniqStrings((m.categories || []).concat(cats));
    if (Array.isArray(conns) && conns.length) m.connections = uniqStrings((m.connections || []).concat(conns));
    if (Array.isArray(descs) && descs.length) m.descriptions = uniqStrings((m.descriptions || []).concat(descs));
    if (Array.isArray(custs) && custs.length) m.customers = uniqStrings((m.customers || []).concat(custs));
    if (Array.isArray(vends) && vends.length) m.vendors = uniqStrings((m.vendors || []).concat(vends));
    /* always keep BHXO available as a master category option */
    m.categories = uniqStrings((m.categories || []).concat(["BHXO"]));
    ensureDescriptionsByCategory(m);
    sortAllMasterLists(m);
    storageSet(KEYS.masters, m);
    return m;
  }

  /** Unique strings, sorted A→Z (case-insensitive) for clean master-list UI */
  function uniqStrings(arr) {
    var seen = {};
    var out = [];
    (arr || []).forEach(function (x) {
      var s = String(x || "").trim();
      if (!s) return;
      var k = s.toUpperCase();
      if (seen[k]) return;
      seen[k] = true;
      out.push(s);
    });
    out.sort(function (a, b) {
      return String(a).localeCompare(String(b), undefined, { sensitivity: "base" });
    });
    return out;
  }

  /** Keep categories, locations, connections, and per-category descriptions A→Z */
  function sortAllMasterLists(m) {
    if (!m || typeof m !== "object") return m;
    if (Array.isArray(m.categories)) m.categories = uniqStrings(m.categories);
    if (Array.isArray(m.locations)) m.locations = uniqStrings(m.locations);
    if (Array.isArray(m.connections)) m.connections = uniqStrings(m.connections);
    if (Array.isArray(m.descriptions)) m.descriptions = uniqStrings(m.descriptions);
    if (Array.isArray(m.customers)) m.customers = uniqStrings(m.customers);
    if (Array.isArray(m.vendors)) m.vendors = uniqStrings(m.vendors);
    if (m.descriptionsByCategory && typeof m.descriptionsByCategory === "object") {
      Object.keys(m.descriptionsByCategory).forEach(function (cat) {
        m.descriptionsByCategory[cat] = uniqStrings(m.descriptionsByCategory[cat] || []);
      });
    }
    return m;
  }

  function saveMasters(m) {
    ensureDescriptionsByCategory(m);
    sortAllMasterLists(m);
    storageSet(KEYS.masters, m);
    if (m.locations) storageSet(KEYS.locations, m.locations);
    if (m.categories) storageSet(KEYS.categories, m.categories);
    if (m.connections) storageSet(KEYS.connections, m.connections);
    if (m.descriptions) storageSet(KEYS.descriptions, m.descriptions);
    if (m.descriptionsByCategory) storageSet(KEYS.descriptionsByCategory, m.descriptionsByCategory);
    if (m.customers) storageSet(KEYS.customers, m.customers);
    if (m.vendors) storageSet(KEYS.vendors, m.vendors);
  }

  function getCustomerVendorSelectHtml(selected) {
    var m = loadMasters();
    var customers = m.customers || [];
    var vendors = getVendorNames();
    var sel = String(selected || "");
    function opts(list) {
      return (list || [])
        .map(function (name) {
          return (
            '<option value="' +
            escapeHtml(name) +
            '"' +
            (name === sel ? " selected" : "") +
            ">" +
            escapeHtml(name) +
            "</option>"
          );
        })
        .join("");
    }
    var html = '<option value="">All</option>';
    if (customers.length) {
      html += '<optgroup label="Customers">' + opts(customers) + "</optgroup>";
    }
    if (vendors.length) {
      html += '<optgroup label="Vendors">' + opts(vendors) + "</optgroup>";
    }
    var combined = customers.concat(vendors);
    if (sel && combined.indexOf(sel) === -1) {
      html +=
        '<option value="' +
        escapeHtml(sel) +
        '" selected>' +
        escapeHtml(sel) +
        "</option>";
    }
    return html;
  }

  function loadAssets() {
    var list = storageGet(KEYS.assets, null);
    if (!list || !list.length) list = storageGet(KEYS.assetsLegacy, []);
    return (list || []).map(normalizeAsset);
  }

  function saveAssets(list) {
    storageSet(KEYS.assets, (list || []).map(normalizeAsset));
  }

  function getCardexCatalog() {
    var admin = loadAssets();
    var map = {};
    /* recovered assets take priority over demo samples */
    SAMPLE_ASSETS.forEach(function (a) {
      map[String(a.serial).toUpperCase()] = deepClone(a);
    });
    admin.forEach(function (a) {
      if (a && a.serial) {
        map[String(a.serial).toUpperCase()] = deepClone(normalizeAsset(a));
      }
    });
    return Object.keys(map).map(function (k) {
      return map[k];
    });
  }

  function findCardexRecord(serial) {
    if (!serial) return null;
    var key = String(serial).trim().toUpperCase();
    var catalog = getCardexCatalog();
    for (var i = 0; i < catalog.length; i++) {
      if (String(catalog[i].serial).toUpperCase() === key) return catalog[i];
    }
    return null;
  }

  function upsertAsset(record) {
    var list = loadAssets();
    var key = String(record.serial).toUpperCase();
    var found = false;
    for (var i = 0; i < list.length; i++) {
      if (String(list[i].serial).toUpperCase() === key) {
        list[i] = deepClone(record);
        found = true;
        break;
      }
    }
    if (!found) {
      /* if only in sample, still save admin overlay */
      list.push(deepClone(record));
    }
    saveAssets(list);
  }

  function setAssetStatus(serial, status, extra) {
    var rec = findCardexRecord(serial);
    if (!rec) return;
    rec.status = status;
    if (extra) {
      Object.keys(extra).forEach(function (k) {
        rec[k] = extra[k];
      });
    }
    upsertAsset(rec);
    appendCardexHistory(serial, status === "Out" ? "Issued / Out" : "Returned / In", extra && extra.note ? extra.note : "");
  }

  function appendCardexHistory(serial, event, detail, at) {
    var all = storageGet(KEYS.cardexHistory, {});
    var key = String(serial).toUpperCase();
    if (!all[key]) all[key] = [];
    all[key].unshift({
      date: at || new Date().toISOString(),
      event: event,
      detail: detail || "",
    });
    if (all[key].length > 100) all[key] = all[key].slice(0, 100);
    storageSet(KEYS.cardexHistory, all);
  }

  function getCardexHistory(serial) {
    var all = storageGet(KEYS.cardexHistory, {});
    return all[String(serial).toUpperCase()] || [];
  }

  /** Count how many assets we own with the same description (fleet total). */
  function countOwnedByDescription(description) {
    var desc = description || "";
    var n = 0;
    getCardexCatalog().forEach(function (a) {
      if ((a.description || "") === desc) n += 1;
    });
    return n;
  }

  /** On hand at store: same description, same store/location, status In. */
  function countOnHandAtStore(description, store) {
    var desc = description || "";
    var loc = store || "";
    var n = 0;
    getCardexCatalog().forEach(function (a) {
      if ((a.description || "") !== desc) return;
      var aLoc = a.store || a.location || "";
      if (loc && aLoc !== loc) return;
      if (String(a.status || "").toLowerCase() === "out") return;
      n += 1;
    });
    return n;
  }

  /**
   * Current open EL this serial is committed to (single).
   * Prefers well-transfer / newest list over older source ELs when both still Open.
   * Returns [] or [{ id, label }].
   */
  function findSerialElCommitments(serial) {
    var key = String(serial || "").trim().toUpperCase();
    if (!key) return [];
    var candidates = [];
    var seen = {};

    loadEquipmentLists().forEach(function (el) {
      if (String(el.status || "").toLowerCase() === "closed") return;
      var onRent = false;
      var lastDt = "";
      var found = false;
      (el.lines || []).forEach(function (ln) {
        (ln.serials || []).forEach(function (s) {
          var sn = typeof s === "string" ? s : s && s.serial;
          if (String(sn || "").toUpperCase() !== key) return;
          found = true;
          if (typeof s === "object" && s) {
            if (s.onRent) onRent = true;
            if (s.lastDtId) lastDt = s.lastDtId;
          }
          if (ln.lastDtId) lastDt = ln.lastDtId || lastDt;
        });
      });
      if (!found) return;
      var id = el.id || el.elNo || el.orderNo || "";
      /* Prefer order no in UI (what users look up) */
      var label = displayElLabel(el);
      if (!id || seen[id]) return;
      seen[id] = true;
      candidates.push({
        id: id,
        label: label,
        sourceElId: el.sourceElId || "",
        transferType: el.transferType || "",
        onRent: onRent,
        lastDt: lastDt,
        createdAt: el.createdAt || el.shipDate || "",
        score: 0,
      });
    });

    if (!candidates.length) return [];

    /* Drop source ELs when a child well-transfer (or other) list also has this serial */
    var superseded = {};
    candidates.forEach(function (c) {
      if (c.sourceElId) {
        superseded[c.sourceElId] = true;
      }
    });
    candidates = candidates.filter(function (c) {
      return !superseded[c.id] && !superseded[c.label];
    });
    if (!candidates.length) return [];

    candidates.forEach(function (c) {
      var score = 0;
      if (c.onRent) score += 50;
      if (c.transferType === "well-transfer") score += 30;
      if (c.lastDt) score += 10;
      if (c.createdAt) {
        var t = Date.parse(c.createdAt);
        if (!isNaN(t)) score += Math.floor(t / 1e11); /* newer dates rank slightly higher */
      }
      c.score = score;
    });

    candidates.sort(function (a, b) {
      if (b.score !== a.score) return b.score - a.score;
      return String(b.createdAt).localeCompare(String(a.createdAt));
    });

    var best = candidates[0];
    return [{ id: best.id, label: best.label }];
  }

  /** Best Last DT for a serial from asset fields or EL/DT lines. */
  function resolveLastDt(a, serial) {
    if (a && (a.lastDeliveryTicket || a.lastDtId)) {
      return a.lastDeliveryTicket || a.lastDtId;
    }
    var key = String(serial || (a && a.serial) || "").trim().toUpperCase();
    var best = "";
    loadEquipmentLists().forEach(function (el) {
      (el.lines || []).forEach(function (ln) {
        (ln.serials || []).forEach(function (s) {
          if (typeof s === "string") {
            if (String(s).toUpperCase() === key && ln.lastDtId) best = ln.lastDtId;
          } else if (s && String(s.serial || "").toUpperCase() === key) {
            if (s.lastDtId) best = s.lastDtId;
          }
        });
      });
    });
    return best || "";
  }

  /* ========================================================================
   * Equipment lists & DTs — seed + CRUD
   * ======================================================================== */
  /** EL numbers: 00001, 00002, … */
  function formatElNo(n) {
    var num = parseInt(n, 10);
    if (!isFinite(num) || num < 1) num = 1;
    var s = String(num);
    while (s.length < 5) s = "0" + s;
    return s;
  }

  function parseElNoNum(val) {
    var s = String(val || "").trim();
    if (/^\d+$/.test(s)) return parseInt(s, 10);
    return NaN;
  }

  function nextElNo() {
    var seq = parseInt(storageGet(KEYS.elSeq, 0), 10) || 0;
    try {
      (storageGet(KEYS.equipmentLists, []) || []).forEach(function (el) {
        if (!el) return;
        var n = parseElNoNum(el.elNo);
        if (!isNaN(n) && n > seq) seq = n;
      });
    } catch (e) {}
    seq += 1;
    storageSet(KEYS.elSeq, seq);
    return formatElNo(seq);
  }

  /** Job numbers: auto 51000, 51001, … */
  function nextJobNo() {
    var seq = parseInt(storageGet(KEYS.jobSeq, 50999), 10);
    if (!isFinite(seq) || seq < 50999) seq = 50999;
    try {
      (storageGet(KEYS.equipmentLists, []) || []).forEach(function (el) {
        if (!el) return;
        var n = parseInt(String(el.jobNo || "").replace(/\D/g, ""), 10);
        if (isFinite(n) && n >= 51000 && n > seq) seq = n;
      });
      (storageGet(KEYS.jobs, []) || []).forEach(function (j) {
        if (!j) return;
        var n2 = parseInt(String(j.jobNo || "").replace(/\D/g, ""), 10);
        if (isFinite(n2) && n2 >= 51000 && n2 > seq) seq = n2;
      });
    } catch (e) {}
    seq += 1;
    if (seq < 51000) seq = 51000;
    storageSet(KEYS.jobSeq, seq);
    return String(seq);
  }

  /* ========================================================================
   * Jobs — parent of ELs (header mirrors EL header)
   * ======================================================================== */
  function emptyJob() {
    return {
      id: "",
      jobNo: "",
      status: "Open",
      company: "",
      customer: "",
      phone: "",
      well: "",
      rig: "",
      afe: "",
      location: "",
      store: "",
      poNumber: "",
      contact: "",
      salesPerson: "",
      salesmanField: "",
      shipTo: "",
      billTo: "",
      notes: "",
      createdAt: "",
      createdBy: "demo.user",
      elIds: [],
      updatedAt: "",
    };
  }

  function normalizeJob(j) {
    if (!j || typeof j !== "object") return null;
    var out = emptyJob();
    out.id = j.id || (j.jobNo ? "JOB-" + j.jobNo : uid("JOB"));
    out.jobNo = String(j.jobNo || "").trim() || String(out.id).replace(/^JOB-/i, "");
    out.status = j.status || "Open";
    out.company = j.company || j.customer || "";
    out.customer = j.customer || j.company || "";
    out.phone = j.phone || "";
    out.well = j.well || "";
    out.rig = j.rig || "";
    out.afe = j.afe || "";
    out.location = j.location || j.store || "";
    out.store = j.store || j.location || "";
    out.poNumber = j.poNumber || "";
    out.contact = j.contact || "";
    out.salesPerson = j.salesPerson || j.salesmanField || "";
    out.salesmanField = j.salesmanField || j.salesPerson || "";
    out.shipTo = j.shipTo || "";
    out.billTo = j.billTo || "";
    out.notes = j.notes || "";
    out.createdAt = j.createdAt || "";
    out.createdBy = j.createdBy || "demo.user";
    out.elIds = Array.isArray(j.elIds) ? j.elIds.map(String) : [];
    out.updatedAt = j.updatedAt || "";
    return out;
  }

  /** Build a Job record with the same header fields as an EL (e.g. EL 00002). */
  function jobFromElHeader(el) {
    var j = emptyJob();
    if (!el) return j;
    j.jobNo = String(el.jobNo || "").trim() || nextJobNo();
    j.id = "JOB-" + j.jobNo;
    j.status = "Open";
    j.company = el.company || el.customer || "";
    j.customer = el.customer || el.company || "";
    j.phone = el.phone || "";
    j.well = el.well || "";
    j.rig = el.rig || "";
    j.afe = el.afe || "";
    j.location = el.location || el.store || "";
    j.store = el.store || el.location || "";
    j.poNumber = el.poNumber || "";
    j.contact = el.contact || "";
    j.salesPerson = el.salesmanField || el.salesPerson || "";
    j.salesmanField = el.salesmanField || el.salesPerson || "";
    j.shipTo = el.shipTo || "";
    j.billTo = el.billTo || "";
    j.notes = el.notes || el.jobDescription || "";
    j.createdAt = el.createdAt || nowISO();
    j.createdBy = el.createdBy || el.preparedBy || "demo.user";
    var eid = el.id || el.elNo;
    j.elIds = eid ? [String(eid)] : [];
    return normalizeJob(j);
  }

  function applyJobHeaderToEl(el, job) {
    if (!el || !job) return el;
    el.jobNo = job.jobNo || el.jobNo;
    el.jobId = job.id || el.jobId;
    el.company = job.company || el.company;
    el.customer = job.customer || job.company || el.customer;
    el.phone = job.phone || el.phone;
    el.well = job.well || el.well;
    el.rig = job.rig || el.rig;
    el.afe = job.afe || el.afe;
    el.location = job.location || job.store || el.location;
    el.store = job.store || job.location || el.store;
    el.poNumber = job.poNumber || el.poNumber;
    el.contact = job.contact || el.contact;
    el.salesPerson = job.salesmanField || job.salesPerson || el.salesPerson;
    el.salesmanField = job.salesmanField || job.salesPerson || el.salesmanField;
    el.shipTo = job.shipTo || el.shipTo;
    el.billTo = job.billTo || el.billTo;
    if (job.notes && !el.notes) el.notes = job.notes;
    return el;
  }

  function loadJobs() {
    seedJobsIfNeeded();
    return (storageGet(KEYS.jobs, []) || []).map(normalizeJob).filter(Boolean);
  }

  function saveJobs(list) {
    storageSet(KEYS.jobs, (list || []).map(normalizeJob).filter(Boolean));
  }

  function getJob(id) {
    if (id == null || id === "") return null;
    var key = String(id);
    var list = loadJobs();
    for (var i = 0; i < list.length; i++) {
      var j = list[i];
      if (
        j.id === key ||
        j.jobNo === key ||
        String(j.jobNo) === key ||
        "JOB-" + j.jobNo === key
      ) {
        return j;
      }
    }
    return null;
  }

  function saveJob(job) {
    var list = loadJobs();
    var norm = normalizeJob(job);
    if (!norm.jobNo) norm.jobNo = nextJobNo();
    if (!norm.id) norm.id = "JOB-" + norm.jobNo;
    norm.updatedAt = nowISO();
    var found = false;
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === norm.id || String(list[i].jobNo) === String(norm.jobNo)) {
        list[i] = norm;
        found = true;
        break;
      }
    }
    if (!found) list.push(norm);
    saveJobs(list);
    return norm;
  }

  /** Keep Job.elIds in sync when an EL is saved under a job number. */
  function ensureJobForEl(el) {
    if (!el) return null;
    var jobNo = String(el.jobNo || "").trim();
    if (!jobNo) return null;
    var list = storageGet(KEYS.jobs, []) || [];
    var found = null;
    var idx = -1;
    for (var i = 0; i < list.length; i++) {
      var n = normalizeJob(list[i]);
      if (n && (String(n.jobNo) === jobNo || n.id === el.jobId)) {
        found = n;
        idx = i;
        break;
      }
    }
    if (!found) {
      found = jobFromElHeader(el);
      list.push(found);
    } else {
      var eid = String(el.id || el.elNo || "");
      if (eid && found.elIds.indexOf(eid) < 0) found.elIds.push(eid);
      /* Prefer EL 00002 as the canonical header source when linking */
      if (String(el.elNo || el.id) === "00002" || String(el.id) === "00002") {
        var refreshed = jobFromElHeader(el);
        refreshed.elIds = found.elIds.slice();
        if (refreshed.elIds.indexOf(eid) < 0 && eid) refreshed.elIds.push(eid);
        found = refreshed;
      }
      if (idx >= 0) list[idx] = found;
    }
    storageSet(KEYS.jobs, list.map(normalizeJob).filter(Boolean));
    return found;
  }

  /**
   * Seed jobs from equipment lists. Working example: Job 51000 from EL 00002
   * (identical header fields; EL 00002 + same jobNo ELs attached).
   */
  function seedJobsIfNeeded() {
    var raw = storageGet(KEYS.jobs, null);
    if (raw && raw.length) {
      /* still attach EL 00002 if present */
      try {
        var el2exist = null;
        (storageGet(KEYS.equipmentLists, []) || []).forEach(function (el) {
          if (el && (el.elNo === "00002" || el.id === "00002")) el2exist = el;
        });
        if (el2exist) ensureJobForEl(el2exist);
      } catch (e0) {}
      return;
    }

    var byNo = {};
    var els = storageGet(KEYS.equipmentLists, []) || [];
    els.forEach(function (el) {
      if (!el) return;
      var no = String(el.jobNo || "").trim();
      if (!no) return;
      if (!byNo[no]) {
        byNo[no] = jobFromElHeader(el);
        byNo[no].elIds = [];
      }
      var eid = String(el.id || el.elNo || "");
      if (eid && byNo[no].elIds.indexOf(eid) < 0) byNo[no].elIds.push(eid);
    });

    /* Canonical working job: overwrite header from EL 00002 when available */
    var el2 = null;
    els.forEach(function (el) {
      if (el && (String(el.elNo) === "00002" || String(el.id) === "00002")) el2 = el;
    });
    if (el2) {
      var j2 = jobFromElHeader(el2);
      var no2 = String(el2.jobNo || j2.jobNo);
      if (byNo[no2] && byNo[no2].elIds && byNo[no2].elIds.length) {
        j2.elIds = byNo[no2].elIds.slice();
      }
      var e2id = String(el2.id || el2.elNo || "00002");
      if (j2.elIds.indexOf(e2id) < 0) j2.elIds.push(e2id);
      /* also include closed source EL 00001 on same job if present */
      els.forEach(function (el) {
        if (!el) return;
        if (String(el.jobNo) !== no2) return;
        var id = String(el.id || el.elNo || "");
        if (id && j2.elIds.indexOf(id) < 0) j2.elIds.push(id);
      });
      byNo[no2] = j2;
    }

    var list = Object.keys(byNo).map(function (k) {
      return byNo[k];
    });
    if (list.length) storageSet(KEYS.jobs, list.map(normalizeJob).filter(Boolean));
  }

  function getElsForJob(job) {
    if (!job) return [];
    var all = loadEquipmentLists();
    var idSet = {};
    (job.elIds || []).forEach(function (id) {
      idSet[String(id)] = true;
    });
    var jKeys = jobNoKeys(job);
    return all.filter(function (el) {
      if (!el) return false;
      if (idSet[String(el.id)] || idSet[String(el.elNo)]) return true;
      if (el.jobId && (el.jobId === job.id || el.jobId === job.jobNo)) return true;
      var elJob = String(el.jobNo || (el.header && el.header.jobNo) || "").trim();
      if (!elJob) return false;
      for (var i = 0; i < jKeys.length; i++) {
        if (
          elJob === jKeys[i] ||
          elJob.replace(/^JOB-?/i, "") === String(jKeys[i]).replace(/^JOB-?/i, "")
        ) {
          return true;
        }
      }
      return false;
    });
  }

  function jobNoKeys(jobOrNo) {
    var raw =
      jobOrNo && typeof jobOrNo === "object"
        ? String(jobOrNo.jobNo || jobOrNo.id || "")
        : String(jobOrNo || "");
    raw = raw.trim();
    if (!raw) return [];
    var keys = [raw];
    var bare = raw.replace(/^JOB-?/i, "");
    if (bare && bare !== raw) {
      keys.push(bare);
      keys.push("JOB-" + bare);
    } else if (bare) {
      keys.push("JOB-" + bare);
    }
    return keys;
  }

  function dtMatchesJobNo(d, job) {
    if (!d || !job) return false;
    var keys = jobNoKeys(job);
    var candidates = [
      d.jobNo,
      d.job && d.job.jobNo,
      d.job && d.job.job,
      d.header && d.header.jobNo,
    ];
    for (var i = 0; i < candidates.length; i++) {
      var c = String(candidates[i] || "").trim();
      if (!c) continue;
      for (var j = 0; j < keys.length; j++) {
        if (c === keys[j] || c.replace(/^JOB-?/i, "") === keys[j].replace(/^JOB-?/i, "")) {
          return true;
        }
      }
    }
    return false;
  }

  function getDtsForJob(job) {
    var seen = {};
    var out = [];
    function push(d) {
      if (!d) return;
      var k = String(d.id || d.dtNo || "");
      if (!k || seen[k]) return;
      seen[k] = true;
      out.push(d);
    }
    getElsForJob(job).forEach(function (el) {
      getDtsForEl(el).forEach(push);
    });
    /* Also include DTs stamped with this job number (recovered data / weak EL link) */
    loadDts().forEach(function (d) {
      if (dtMatchesJobNo(d, job)) push(d);
    });
    out.sort(function (a, b) {
      return (parseInt(formatDtNo(a.dtNo || a.id), 10) || 0) - (parseInt(formatDtNo(b.dtNo || b.id), 10) || 0);
    });
    return out;
  }

  function getRrsForJob(job) {
    var seen = {};
    var out = [];
    getElsForJob(job).forEach(function (el) {
      getRrsForEl(el).forEach(function (r) {
        var k = String(r.id || r.rrLabel || r.rrNo || "");
        if (!k || seen[k]) return;
        seen[k] = true;
        out.push(r);
      });
    });
    out.sort(function (a, b) {
      return (parseInt(a.rrNo, 10) || 0) - (parseInt(b.rrNo, 10) || 0);
    });
    return out;
  }

  /* ========================================================================
   * Billing — Job draft from DT active → RR received (per EL / serial)
   * ======================================================================== */

  /** Parse YYYY-MM-DD (or ISO) to local midnight Date, or null. */
  function parseBillingDay(iso) {
    if (!iso) return null;
    var s = String(iso).trim();
    var day = s.indexOf("T") >= 0 ? s.split("T")[0] : s.slice(0, 10);
    var p = day.split("-");
    if (p.length !== 3) return null;
    var y = parseInt(p[0], 10);
    var m = parseInt(p[1], 10) - 1;
    var d = parseInt(p[2], 10);
    if (!isFinite(y) || !isFinite(m) || !isFinite(d)) return null;
    var dt = new Date(y, m, d);
    if (isNaN(dt.getTime())) return null;
    return dt;
  }

  /** Inclusive calendar days between start and end (min 1 when both valid). */
  function calendarDaysInclusive(startIso, endIso) {
    var a = parseBillingDay(startIso);
    var b = parseBillingDay(endIso);
    if (!a || !b) return 0;
    var ms = b.getTime() - a.getTime();
    var days = Math.floor(ms / 86400000) + 1;
    return days < 1 ? 1 : days;
  }

  /**
   * Rental charge from min days / min amount / additional daily amount.
   * actualDays <= minDays → minAmt
   * else → minAmt + (actualDays - minDays) * addAmt
   */
  function computeRentalCharge(actualDays, minDays, minAmt, addAmt) {
    var actual = parseInt(actualDays, 10) || 0;
    if (actual < 0) actual = 0;
    var minD = parseInt(minDays, 10);
    if (!isFinite(minD) || minD < 0) minD = 0;
    var minA = parseFloat(minAmt);
    if (isNaN(minA)) minA = 0;
    var add = parseFloat(addAmt);
    if (isNaN(add)) add = 0;
    var billDays = Math.max(actual, minD || 0);
    if (billDays < 1 && actual >= 1) billDays = actual;
    var extended = 0;
    if (minD > 0) {
      if (actual <= minD) extended = minA;
      else extended = minA + (actual - minD) * add;
    } else {
      /* no min days: treat minAmt as period base or use add * actual */
      if (add > 0) extended = (minA > 0 ? minA : 0) + actual * add;
      else extended = minA;
    }
    if (extended < 0) extended = 0;
    return {
      actualDays: actual,
      minDays: minD,
      billDays: billDays,
      minAmt: minA,
      addAmt: add,
      extended: Math.round(extended * 100) / 100,
      metMin: minD <= 0 || actual >= minD,
    };
  }

  function loadBillingDrafts() {
    var bag = storageGet(KEYS.billingDrafts, null);
    if (!bag || typeof bag !== "object" || Array.isArray(bag)) return {};
    return bag;
  }

  function saveBillingDrafts(bag) {
    storageSet(KEYS.billingDrafts, bag || {});
  }

  function getBillingDraftForJob(jobIdOrNo) {
    var bag = loadBillingDrafts();
    var key = String(jobIdOrNo || "");
    if (bag[key]) return bag[key];
    var job = getJob(jobIdOrNo);
    if (job) {
      if (bag[job.id]) return bag[job.id];
      if (bag[job.jobNo]) return bag[job.jobNo];
      if (bag["JOB-" + job.jobNo]) return bag["JOB-" + job.jobNo];
    }
    return null;
  }

  function saveBillingDraftForJob(draft) {
    if (!draft) return;
    var bag = loadBillingDrafts();
    var key = draft.jobId || draft.jobNo;
    if (!key) return;
    bag[key] = draft;
    if (draft.jobNo && draft.jobId && draft.jobNo !== draft.jobId) {
      bag[draft.jobNo] = draft;
    }
    saveBillingDrafts(bag);
    return draft;
  }

  /**
   * Auto-populate billing lines for a job from ELs → DTs → RR receive dates.
   * Grouped by EL (ship-to / shop). One line per DT serial.
   * Also picks up DTs stamped with this job number when EL ledger links are missing.
   */
  function buildBillingDraftForJob(job, opts) {
    opts = opts || {};
    var asOf = opts.asOfDate || todayISO();
    if (!job) return null;
    var els = getElsForJob(job);
    var elById = {};
    els.forEach(function (el) {
      if (!el) return;
      elById[String(el.id || "")] = el;
      elById[String(el.elNo || "")] = el;
      if (el.orderNo) elById[String(el.orderNo)] = el;
    });

    /* Collect DTs: per-EL + any DT with matching jobNo */
    var dts = getDtsForJob(job);
    var groupsMap = {}; /* elKey -> { el meta, lines, subtotal } */
    var grandTotal = 0;
    var lineCount = 0;
    var stillOutCount = 0;
    var missingRateCount = 0;

    function ensureGroup(el, dt) {
      var elObj = el || null;
      if (!elObj && dt) {
        elObj =
          elById[String(dt.elId || "")] ||
          elById[String(dt.orderId || "")] ||
          elById[String(dt.elNo || "")] ||
          getEquipmentList(dt.elId || dt.orderId || dt.elNo);
      }
      var elId = elObj
        ? elObj.id || elObj.elNo
        : (dt && (dt.elId || dt.orderId || dt.elNo)) || "unknown";
      var key = String(elId);
      if (!groupsMap[key]) {
        groupsMap[key] = {
          elId: elId,
          elNo: elObj ? displayElLabel(elObj) : String(elId),
          shipTo:
            (elObj && (elObj.shipTo || (elObj.header && elObj.header.shipTo))) ||
            (dt && dt.shipTo) ||
            "",
          store: (elObj && (elObj.location || elObj.store)) || "",
          company: (elObj && (elObj.company || elObj.customer)) || (dt && (dt.company || dt.customer)) || "",
          status: (elObj && elObj.status) || "",
          el: elObj,
          lines: [],
          subtotal: 0,
        };
      }
      return groupsMap[key];
    }

    function addBillingLine(el, dt, dln, serial) {
      var sn = String(serial || "").trim();
      /* Allow blank serial only if description exists (qty line) */
      if (!sn && !(dln && dln.description)) return;
      var g = ensureGroup(el, dt);
      var elObj = g.el;
      refreshDtReceiveStatus(dt);
      var start =
        dt.shipDate ||
        (dt.createdAt ? String(dt.createdAt).slice(0, 10) : "") ||
        (dt.onRentDate ? String(dt.onRentDate).slice(0, 10) : "") ||
        "";
      var recv = null;
      var map = dt.receivedSerials || {};
      var rk = sn.toUpperCase();
      if (sn) {
        if (map[rk]) recv = map[rk];
        else if (map[sn]) recv = map[sn];
      }
      var end = "";
      var stillOut = true;
      var rrLabel = "";
      if (recv && recv.at) {
        end = String(recv.at).slice(0, 10);
        stillOut = false;
        rrLabel = recv.rrLabel || "";
      } else if (String(dt.receiveStatus || "").toLowerCase() === "received" && dt.completedAt) {
        end = String(dt.completedAt).slice(0, 10);
        stillOut = false;
      } else {
        end = asOf;
        stillOut = true;
      }

      var minDays = dln.minDays;
      var minAmt = dln.minAmt != null && dln.minAmt !== "" ? dln.minAmt : dln.unitPrice;
      var addAmt = dln.addAmt;
      if (elObj && ((minDays === "" || minDays == null) || (minAmt === "" || minAmt == null))) {
        (elObj.lines || []).forEach(function (eln) {
          var hit = (eln.serials || []).some(function (s) {
            var ssn = typeof s === "string" ? s : s && s.serial;
            return sn && String(ssn || "").toUpperCase() === rk;
          });
          if (!hit && eln.description && dln.description && eln.description === dln.description) hit = true;
          if (!hit) return;
          if (minDays === "" || minDays == null) minDays = eln.minDays;
          if (minAmt === "" || minAmt == null) minAmt = eln.minAmt;
          if (addAmt === "" || addAmt == null) addAmt = eln.addAmt;
        });
      }

      var actualDays = start ? calendarDaysInclusive(start, end) : 0;
      if (!start) {
        /* still emit a line so user sees the DT; days 0 flagged */
        actualDays = 0;
      }
      var charge = computeRentalCharge(actualDays, minDays, minAmt, addAmt);
      var missingRate =
        (parseFloat(charge.minAmt) || 0) === 0 && (parseFloat(charge.addAmt) || 0) === 0;
      if (missingRate) missingRateCount += 1;
      if (stillOut) stillOutCount += 1;

      g.subtotal += charge.extended;
      lineCount += 1;
      g.lines.push({
        id: uid("bl"),
        elId: g.elId,
        elNo: g.elNo,
        shipTo: g.shipTo,
        store: g.store,
        dtId: dt.id || dt.dtNo,
        dtNo: formatDtNo(dt.dtNo || dt.id),
        rrLabel: rrLabel,
        serial: sn || "—",
        description: resolveSerialDescription(sn, (dln && dln.description) || ""),
        uom: (dln && dln.uom) || "EA",
        qty: dln && dln.qty != null ? dln.qty : 1,
        startDate: start,
        endDate: end,
        stillOut: stillOut,
        actualDays: charge.actualDays,
        minDays: charge.minDays,
        billDays: charge.billDays,
        minAmt: charge.minAmt,
        addAmt: charge.addAmt,
        extended: charge.extended,
        metMin: charge.metMin,
        missingRate: missingRate,
        source: "auto",
      });
    }

    dts.forEach(function (dt) {
      var el =
        elById[String(dt.elId || "")] ||
        elById[String(dt.orderId || "")] ||
        elById[String(dt.elNo || "")] ||
        getEquipmentList(dt.elId || dt.orderId || dt.elNo) ||
        null;
      var dtLines = dt.lines || [];
      if (!dtLines.length) return;
      dtLines.forEach(function (dln) {
        var serials = extractSerialsFromDtLine(dln);
        if (!serials.length && dln.serial) serials = [dln.serial];
        if (!serials.length) {
          /* qty-only / missing serial — still bill the line once */
          addBillingLine(el, dt, dln, "");
          return;
        }
        serials.forEach(function (sn) {
          addBillingLine(el, dt, dln, sn);
        });
      });
    });

    var groups = Object.keys(groupsMap).map(function (k) {
      var g = groupsMap[k];
      g.subtotal = Math.round(g.subtotal * 100) / 100;
      grandTotal += g.subtotal;
      return g;
    });
    groups.sort(function (a, b) {
      return String(a.elNo).localeCompare(String(b.elNo));
    });

    return {
      id: uid("BILL"),
      jobId: job.id || "JOB-" + job.jobNo,
      jobNo: job.jobNo,
      company: job.company || job.customer || "",
      well: job.well || "",
      asOfDate: asOf,
      status: "Draft",
      populatedAt: nowISO(),
      createdAt: nowISO(),
      groups: groups,
      lineCount: lineCount,
      stillOutCount: stillOutCount,
      missingRateCount: missingRateCount,
      grandTotal: Math.round(grandTotal * 100) / 100,
      dtCount: dts.length,
      elCount: els.length,
    };
  }

  function renderJobBillingPanel(job) {
    var draft = getBillingDraftForJob(job.id || job.jobNo);
    var html =
      '<div class="billing-panel">' +
      '<div class="billing-toolbar btn-group mb-2">' +
      '<button type="button" class="btn btn-primary btn-sm" id="bill-autopop">Auto-populate all costs</button>' +
      (draft
        ? '<button type="button" class="btn btn-secondary btn-sm" id="bill-print">Print PDF</button>' +
          '<button type="button" class="btn btn-ghost btn-sm" id="bill-clear">Clear draft</button>'
        : "") +
      "</div>";

    if (!draft || !(draft.groups || []).length) {
      html +=
        '<div class="empty-state">' +
        "<p><strong>No billing draft yet.</strong></p>" +
        "<p>Click <strong>Auto-populate all costs</strong> to build charges from this job&rsquo;s DTs " +
        "(by EL link or matching job number): " +
        "<em>DT active → receive date</em> (or today if still out), " +
        "using min days / min $ / add $ from the ticket lines. Grouped by EL (ship to / shop).</p>" +
        "<p class=\"form-hint\">If auto-populate still finds nothing, the DTs may have no line items/serials — open a DT and confirm serials and rates are on the lines.</p>" +
        "</div></div>";
      return html;
    }

    html +=
      '<div class="billing-summary panel mb-2"><div class="panel-body">' +
      '<div class="dt-meta-grid ticket-el-header">' +
      '<div><span class="kv-label">As of</span><div class="kv-value">' +
      escapeHtml(formatDate(draft.asOfDate)) +
      "</div></div>" +
      '<div><span class="kv-label">Populated</span><div class="kv-value">' +
      escapeHtml(formatDateTime(draft.populatedAt)) +
      "</div></div>" +
      '<div><span class="kv-label">Lines</span><div class="kv-value">' +
      draft.lineCount +
      "</div></div>" +
      '<div><span class="kv-label">Still out</span><div class="kv-value">' +
      draft.stillOutCount +
      "</div></div>" +
      '<div><span class="kv-label">Missing rates</span><div class="kv-value">' +
      draft.missingRateCount +
      "</div></div>" +
      '<div><span class="kv-label">Job total</span><div class="kv-value mono" style="font-weight:700">' +
      escapeHtml(formatMoney(draft.grandTotal)) +
      "</div></div>" +
      "</div>" +
      (draft.stillOutCount
        ? '<p class="form-hint mb-0 mt-1">Still-out tools use <strong>today</strong> as end date until received.</p>'
        : "") +
      (draft.missingRateCount
        ? '<p class="form-hint mb-0 mt-1" style="color:var(--warn,#e6a23c)">Some lines have $0 rates — set min/add amounts on the EL or DT line.</p>'
        : "") +
      "</div></div>";

    (draft.groups || []).forEach(function (g) {
      html +=
        '<div class="panel mb-2 billing-el-group">' +
        '<div class="panel-header panel-header-compact">' +
        '<h2 class="panel-title mono">EL ' +
        escapeHtml(g.elNo) +
        "</h2>" +
        '<span class="text-muted" style="font-size:0.8rem">Ship to: ' +
        escapeHtml(g.shipTo || "—") +
        (g.store ? " · Store " + escapeHtml(g.store) : "") +
        '</span><span class="mono" style="font-weight:700;margin-left:auto">' +
        escapeHtml(formatMoney(g.subtotal)) +
        "</span></div>" +
        '<div class="table-wrap"><table class="table table-billing"><thead><tr>' +
        "<th>DT</th><th>Serial</th><th>Description</th>" +
        "<th>Out</th><th>In / As of</th><th>Actual</th><th>Min</th><th>Bill days</th>" +
        "<th>Min $</th><th>Add $/d</th><th>Extended</th><th>Status</th>" +
        "</tr></thead><tbody>";

      (g.lines || []).forEach(function (ln) {
        var stBadge = ln.stillOut
          ? '<span class="badge badge-out">Still out</span>'
          : '<span class="badge badge-in">Received</span>';
        if (ln.missingRate) stBadge += ' <span class="badge badge-warn">No rate</span>';
        if (!ln.metMin && !ln.stillOut) stBadge += ' <span class="badge badge-info">Under min</span>';
        html +=
          "<tr" +
          (ln.missingRate ? ' class="billing-row-warn"' : "") +
          ">" +
          '<td class="mono"><button type="button" class="table-link" data-dt="' +
          escapeHtml(ln.dtId) +
          '">DT-' +
          escapeHtml(ln.dtNo) +
          "</button></td>" +
          '<td class="mono"><button type="button" class="table-link" data-serial="' +
          escapeHtml(ln.serial) +
          '">' +
          escapeHtml(ln.serial) +
          "</button></td>" +
          '<td class="wrap-cell">' +
          escapeHtml(ln.description || "—") +
          "</td>" +
          "<td>" +
          escapeHtml(formatDate(ln.startDate)) +
          "</td>" +
          "<td>" +
          escapeHtml(formatDate(ln.endDate)) +
          (ln.rrLabel ? ' <span class="text-muted">RR ' + escapeHtml(String(ln.rrLabel)) + "</span>" : "") +
          "</td>" +
          '<td class="num-cell">' +
          ln.actualDays +
          "</td>" +
          '<td class="num-cell">' +
          (ln.minDays || "—") +
          "</td>" +
          '<td class="num-cell"><strong>' +
          ln.billDays +
          "</strong></td>" +
          '<td class="num-cell">' +
          escapeHtml(formatMoney(ln.minAmt)) +
          "</td>" +
          '<td class="num-cell">' +
          escapeHtml(formatMoney(ln.addAmt)) +
          "</td>" +
          '<td class="num-cell"><strong>' +
          escapeHtml(formatMoney(ln.extended)) +
          "</strong></td>" +
          "<td>" +
          stBadge +
          "</td>" +
          "</tr>";
      });

      html +=
        "</tbody></table></div>" +
        '<div class="billing-el-subtotal">EL subtotal: <strong class="mono">' +
        escapeHtml(formatMoney(g.subtotal)) +
        "</strong></div></div>";
    });

    html +=
      '<div class="billing-grand panel"><div class="panel-body" style="display:flex;justify-content:space-between;align-items:center">' +
      "<span>Job grand total</span>" +
      '<strong class="mono" style="font-size:1.15rem">' +
      escapeHtml(formatMoney(draft.grandTotal)) +
      "</strong></div></div></div>";
    return html;
  }

  function bindJobBillingPanel(main, job) {
    var autoBtn = $("#bill-autopop", main);
    if (autoBtn) {
      autoBtn.addEventListener("click", function () {
        var draft = buildBillingDraftForJob(job, { asOfDate: todayISO() });
        if (!draft || !draft.lineCount) {
          var dtsN = draft && draft.dtCount != null ? draft.dtCount : getDtsForJob(job).length;
          var elsN = draft && draft.elCount != null ? draft.elCount : getElsForJob(job).length;
          toast(
            "No billable lines found (" +
              elsN +
              " EL(s), " +
              dtsN +
              " DT(s)). Check DT lines have serials and this job number matches.",
            "error"
          );
          return;
        }
        saveBillingDraftForJob(draft);
        toast(
          "Billing populated: " +
            draft.lineCount +
            " line(s) from " +
            (draft.dtCount || "?") +
            " DT(s), total " +
            formatMoney(draft.grandTotal) +
            (draft.stillOutCount ? " · " + draft.stillOutCount + " still out" : "")
        );
        state.jobTab = "billing";
        viewJobDetail(main);
      });
    }
    var clearBtn = $("#bill-clear", main);
    if (clearBtn) {
      clearBtn.addEventListener("click", function () {
        if (!confirm("Clear billing draft for this job?")) return;
        var bag = loadBillingDrafts();
        delete bag[job.id];
        delete bag[job.jobNo];
        delete bag["JOB-" + job.jobNo];
        saveBillingDrafts(bag);
        toast("Billing draft cleared");
        state.jobTab = "billing";
        viewJobDetail(main);
      });
    }
    var printBtn = $("#bill-print", main);
    if (printBtn) {
      printBtn.addEventListener("click", function () {
        printJobBilling(job);
      });
    }
  }

  function printJobBilling(job) {
    var draft = getBillingDraftForJob(job.id || job.jobNo);
    if (!draft || !(draft.groups || []).length) {
      toast("No billing draft to print — auto-populate first", "error");
      return;
    }
    var body =
      "<h1>Billing · Job " +
      escapeHtml(draft.jobNo) +
      "</h1>" +
      '<p class="sub">' +
      escapeHtml(draft.company || "") +
      (draft.well ? " · " + escapeHtml(draft.well) : "") +
      " · As of " +
      escapeHtml(formatDate(draft.asOfDate)) +
      " · " +
      escapeHtml(formatDateTime(draft.populatedAt)) +
      "</p>";

    (draft.groups || []).forEach(function (g) {
      body +=
        "<h2 style=\"font-size:14px;margin:18px 0 6px\">EL " +
        escapeHtml(g.elNo) +
        " · Ship to: " +
        escapeHtml(g.shipTo || "—") +
        "</h2>" +
        "<table><thead><tr>" +
        "<th>DT</th><th>Serial</th><th>Description</th><th>Out</th><th>In</th>" +
        "<th>Actual</th><th>Min</th><th>Bill days</th><th>Min $</th><th>Add</th><th>Extended</th><th>Status</th>" +
        "</tr></thead><tbody>";
      (g.lines || []).forEach(function (ln) {
        body +=
          "<tr><td>DT-" +
          escapeHtml(ln.dtNo) +
          "</td><td>" +
          escapeHtml(ln.serial) +
          "</td><td>" +
          escapeHtml(ln.description || "") +
          "</td><td>" +
          escapeHtml(formatDate(ln.startDate)) +
          "</td><td>" +
          escapeHtml(formatDate(ln.endDate)) +
          "</td><td>" +
          ln.actualDays +
          "</td><td>" +
          (ln.minDays || "—") +
          "</td><td>" +
          ln.billDays +
          "</td><td>" +
          escapeHtml(formatMoney(ln.minAmt)) +
          "</td><td>" +
          escapeHtml(formatMoney(ln.addAmt)) +
          "</td><td>" +
          escapeHtml(formatMoney(ln.extended)) +
          "</td><td>" +
          (ln.stillOut ? "Still out" : "Received") +
          "</td></tr>";
      });
      body +=
        '</tbody></table><div class="total">EL subtotal: ' +
        escapeHtml(formatMoney(g.subtotal)) +
        "</div>";
    });
    body +=
      '<div class="total" style="font-size:15px;margin-top:16px">Job total: ' +
      escapeHtml(formatMoney(draft.grandTotal)) +
      "</div>";
    printHtmlDocument("Billing Job " + draft.jobNo, body);
  }

  /**
   * Serials currently Out / on rent for billing on this job.
   * Only the EL that owns the open (unreceived) DT counts — never closed/old ELs.
   */
  function getActiveRentalsForJob(job) {
    var seen = {};
    var out = [];
    getElsForJob(job).forEach(function (el) {
      if (String(el.status || "").toLowerCase() === "closed") return;
      (el.lines || []).forEach(function (ln) {
        (ln.serials || []).forEach(function (s) {
          var sn = typeof s === "string" ? s : s && s.serial;
          if (!sn) return;
          var key = String(sn).toUpperCase();
          if (seen[key]) return;
          if (!isSerialOnRentForEl(sn, el)) return;
          var asset = findCardexRecord(sn);
          var ctx = getSerialOpenRentContext(sn);
          seen[key] = true;
          out.push({
            serial: sn,
            description: resolveSerialDescription(sn, (ln && ln.description) || (asset && asset.description) || ""),
            elNo: displayElLabel(el),
            elId: el.id || el.elNo,
            status: "Out",
            onRentAt: (s && s.onRentAt) || (ctx && ctx.onRentAt) || ln.onRentAt || "",
            lastDtId: (ctx && ctx.dtId) || (s && s.lastDtId) || ln.lastDtId || "",
            location: (asset && (asset.location || asset.store)) || el.location || el.store || "",
            company: el.company || el.customer || job.company || "",
          });
        });
      });
    });
    return out;
  }

  function snapshotJobHeader(job) {
    if (!job || typeof job !== "object") return {};
    return {
      orderNo: "",
      elNo: "",
      company: job.company || job.customer || "",
      customer: job.customer || job.company || "",
      phone: job.phone || "",
      well: job.well || "",
      rig: job.rig || "",
      jobNo: job.jobNo || "",
      afe: job.afe || "",
      location: job.location || job.store || "",
      store: job.store || job.location || "",
      shipDate: "",
      returnDate: "",
      createdAt: job.createdAt || "",
      poNumber: job.poNumber || "",
      contact: job.contact || "",
      salesPerson: job.salesmanField || job.salesPerson || "",
      salesmanField: job.salesmanField || job.salesPerson || "",
      shipTo: job.shipTo || "",
      billTo: job.billTo || "",
      notes: job.notes || "",
      email: "",
    };
  }

  /** Resolve a job by number (create from an EL header if missing), then open Jobs detail. */
  function openJobByNo(jobNo) {
    var jn = String(jobNo || "").trim();
    if (!jn || jn === "—") {
      toast("No job number", "error");
      return;
    }
    var job = getJob(jn);
    if (!job) {
      var lists = loadEquipmentLists();
      for (var i = 0; i < lists.length; i++) {
        if (String(lists[i].jobNo || "") === jn) {
          job = ensureJobForEl(lists[i]);
          break;
        }
      }
    }
    if (!job) {
      toast("Job " + jn + " not found", "error");
      return;
    }
    navigate("jobs-detail", { id: job.id || job.jobNo });
  }

  /** Clickable Job No control used on EL pages and lists. */
  function jobNoLinkHtml(jobNo) {
    var jn = String(jobNo || "").trim();
    if (!jn) return "—";
    return (
      '<button type="button" class="table-link mono job-no-link" data-job-link="' +
      escapeHtml(jn) +
      '" title="Open Job ' +
      escapeHtml(jn) +
      '">' +
      escapeHtml(jn) +
      "</button>"
    );
  }

  function bindJobLinks(root) {
    if (!root) return;
    $$("[data-job-link]", root).forEach(function (b) {
      b.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        openJobByNo(b.getAttribute("data-job-link"));
      });
    });
  }

  function displayElLabel(el) {
    if (!el) return "—";
    var n = el.elNo || el.id || "";
    var parsed = parseElNoNum(n);
    if (!isNaN(parsed)) return formatElNo(parsed);
    return n || "—";
  }

  function emptyEquipmentList() {
    return {
      id: "",
      orderNo: "", /* legacy; not used in UI — kept for older DTs */
      elNo: "",
      status: "Open",
      company: "",
      customer: "",
      well: "",
      rig: "",
      jobNo: "",
      salesPerson: "",
      location: "",
      store: "",
      createdBy: "demo.user",
      createdAt: nowISO(),
      shipDate: "", /* not on EL header — DTs carry ship date */
      returnDate: "",
      poNumber: "",
      afe: "",
      contact: "",
      phone: "",
      email: "",
      shipTo: "",
      billTo: "",
      notes: "",
      transferType: "",
      needsHeaderUpdate: false,
      sourceElId: "",
      lines: [],
    };
  }

  function emptyLine() {
    return {
      id: uid("ln"),
      itemNo: "",
      description: "",
      uom: "JT",
      qty: 1,
      type: "Rental",
      serials: [],
      selectedForDt: false,
    };
  }

  function readRecoveredBag() {
    /* Prefer live localStorage (Edge recovery), then embedded backup file */
    var bag = {};
    var keys = [
      KEYS.equipmentLists,
      KEYS.equipmentDts,
      KEYS.dtSeq,
      KEYS.assets,
      KEYS.masters,
      KEYS.docs,
      KEYS.ncrs,
      KEYS.theme,
      KEYS.homeOrder,
      KEYS.locations,
      KEYS.categories,
      KEYS.connections,
      KEYS.descriptions,
      KEYS.descriptionsByCategory,
      KEYS.rackBin,
      KEYS.assetDocs,
      "fieldops-equipment-lists",
      "fieldops-equipment-lists-v2",
      "fieldops-equipment-lists-v3",
      "fieldops-equipment-lists-v4",
      "fieldops-equipment-dts",
    ];
    keys.forEach(function (k) {
      try {
        var raw = localStorage.getItem(k);
        if (raw != null) bag[k] = JSON.parse(raw);
      } catch (e) {}
    });
    var emb = typeof window !== "undefined" ? window.ATRAOPS_RECOVERED : null;
    if (emb && typeof emb === "object") {
      Object.keys(emb).forEach(function (k) {
        if (bag[k] == null) bag[k] = emb[k];
      });
    }
    return bag;
  }

  function importRecoveredDataIfNeeded(force) {
    if (!force && storageGet(KEYS.migrated, null) === true) {
      /* still re-normalize in case shapes drift */
      migrateNormalizeExisting();
      return;
    }
    var bag = readRecoveredBag();
    var lists =
      bag[KEYS.equipmentLists] ||
      bag["fieldops-equipment-lists-v5"] ||
      bag["fieldops-equipment-lists-v4"] ||
      bag["fieldops-equipment-lists-v3"] ||
      bag["fieldops-equipment-lists-v2"] ||
      bag["fieldops-equipment-lists"] ||
      [];
    var dts =
      bag[KEYS.equipmentDts] ||
      bag["fieldops-equipment-dts-v2"] ||
      bag["fieldops-equipment-dts"] ||
      [];
    var assets = bag[KEYS.assets] || bag["fieldops-assets"] || bag[KEYS.assetsLegacy] || [];
    var masters = bag[KEYS.masters] || bag["fieldops-masters-v1"] || null;
    var docs = bag[KEYS.docs] || bag["fieldops-docs-v1"] || null;
    var ncrs = bag[KEYS.ncrs] || bag["fieldops-ncrs-v1"] || null;
    var theme = bag[KEYS.theme] || bag["fieldops-theme"] || "dark";
    var homeOrder = bag[KEYS.homeOrder] || bag["fieldops-home-modules-order"] || null;
    var seq = bag[KEYS.dtSeq] != null ? bag[KEYS.dtSeq] : bag["fieldops-equipment-dt-seq"];

    /* Assets first so DT/RR normalize can resolve blank line descriptions from cardex */
    if (Array.isArray(assets) && assets.length) {
      storageSet(KEYS.assets, assets.map(normalizeAsset));
    }
    if (Array.isArray(lists) && lists.length) {
      storageSet(KEYS.equipmentLists, lists.map(normalizeEquipmentList));
    }
    if (Array.isArray(dts) && dts.length) {
      storageSet(KEYS.equipmentDts, dts.map(normalizeDt).filter(Boolean));
    }
    if (masters && typeof masters === "object") {
      storageSet(KEYS.masters, masters);
    }
    if (Array.isArray(bag[KEYS.locations] || bag["fieldops-locations"])) {
      storageSet(KEYS.locations, bag[KEYS.locations] || bag["fieldops-locations"]);
    }
    if (Array.isArray(bag[KEYS.categories] || bag["fieldops-master-categories"])) {
      storageSet(KEYS.categories, bag[KEYS.categories] || bag["fieldops-master-categories"]);
    }
    if (Array.isArray(bag[KEYS.connections] || bag["fieldops-connection-types"])) {
      storageSet(KEYS.connections, bag[KEYS.connections] || bag["fieldops-connection-types"]);
    }
    if (Array.isArray(bag[KEYS.descriptions] || bag["fieldops-descriptions"])) {
      storageSet(KEYS.descriptions, bag[KEYS.descriptions] || bag["fieldops-descriptions"]);
    }
    if (
      bag[KEYS.descriptionsByCategory] ||
      bag["fieldops-descriptions-by-category"]
    ) {
      storageSet(
        KEYS.descriptionsByCategory,
        bag[KEYS.descriptionsByCategory] || bag["fieldops-descriptions-by-category"]
      );
    }
    if (bag[KEYS.rackBin] || bag["fieldops-rack-bin"]) {
      storageSet(KEYS.rackBin, bag[KEYS.rackBin] || bag["fieldops-rack-bin"]);
    }
    if (bag[KEYS.assetDocs] || bag["fieldops-asset-docs"]) {
      storageSet(KEYS.assetDocs, bag[KEYS.assetDocs] || bag["fieldops-asset-docs"]);
    }
    if (docs) storageSet(KEYS.docs, docs);
    if (ncrs) storageSet(KEYS.ncrs, ncrs);
    if (theme) storageSet(KEYS.theme, typeof theme === "string" ? theme.replace(/^"|"$/g, "") : theme);
    if (homeOrder) storageSet(KEYS.homeOrder, homeOrder);
    if (seq != null) storageSet(KEYS.dtSeq, parseInt(seq, 10) || 1);

    storageSet(KEYS.migrated, true);
    console.info("[AtraOps] Recovered data imported/normalized");
  }

  function migrateNormalizeExisting() {
    var assets = storageGet(KEYS.assets, null) || storageGet(KEYS.assetsLegacy, []);
    if (assets && assets.length) {
      storageSet(KEYS.assets, assets.map(normalizeAsset));
    }
    var lists = storageGet(KEYS.equipmentLists, []);
    if (lists && lists.length) {
      storageSet(KEYS.equipmentLists, lists.map(normalizeEquipmentList));
    }
    var dts = storageGet(KEYS.equipmentDts, []);
    if (dts && dts.length) {
      storageSet(KEYS.equipmentDts, dts.map(normalizeDt).filter(Boolean));
    }
    enforceOneElPerSerial();
    reconcileSerialBillingStatus();
  }

  /**
   * Billing truth: a serial is on rent only while it appears on an open DT that has
   * not been received. That rent belongs to one EL (the DT's EL, or the open EL that
   * currently holds the serial after well-transfer). Closed/old ELs never show On Rent.
   */
  var _billingReconcileLock = false;

  function getSerialOpenRentContext(serial) {
    var sn = String(serial || "").trim();
    if (!sn) return null;
    var key = sn.toUpperCase();
    var rawDts = storageGet(KEYS.equipmentDts, []) || [];
    var openHits = [];
    rawDts.forEach(function (raw) {
      var dt = normalizeDt(raw);
      if (!dt) return;
      var has = false;
      (dt.lines || []).forEach(function (ln) {
        if (String(ln.serial || "").toUpperCase() === key) has = true;
      });
      if (!has) return;
      if (dtIsSerialReceived(dt, sn)) return;
      /* Fully received DTs are not open rent */
      if (String(dt.receiveStatus || "").toLowerCase() === "received") return;
      var score = Date.parse(dt.shipDate || dt.completedAt || dt.createdAt || 0) || 0;
      openHits.push({
        dt: dt,
        dtId: dt.dtNo || dt.id,
        elId: dt.createdOnElId || dt.elId || dt.orderId || "",
        onRentAt: dt.shipDate || dt.createdAt || "",
        score: score,
      });
    });
    if (!openHits.length) return null;
    openHits.sort(function (a, b) {
      return b.score - a.score;
    });
    var hit = openHits[0];

    /* Prefer the open EL that currently lists this serial (well-transfer may move it) */
    var lists = storageGet(KEYS.equipmentLists, []) || [];
    var openHolders = [];
    lists.forEach(function (el) {
      if (!el || String(el.status || "").toLowerCase() === "closed") return;
      var holds = false;
      (el.lines || []).forEach(function (ln) {
        (ln.serials || []).forEach(function (s) {
          var ssn = typeof s === "string" ? s : s && s.serial;
          if (String(ssn || "").toUpperCase() === key) holds = true;
        });
      });
      if (!holds) return;
      var score = 0;
      if (String(el.id) === String(hit.elId) || String(el.elNo) === String(hit.elId)) score += 100;
      if (el.transferType === "well-transfer") score += 50;
      if (el.createdAt) {
        var t = Date.parse(el.createdAt);
        if (!isNaN(t)) score += Math.min(t / 1e12, 20);
      }
      openHolders.push({ el: el, score: score });
    });
    openHolders.sort(function (a, b) {
      return b.score - a.score;
    });
    var rentEl = openHolders.length ? openHolders[0].el : null;
    var rentElId = rentEl
      ? rentEl.id || rentEl.elNo
      : hit.elId;
    return {
      dt: hit.dt,
      dtId: hit.dtId,
      elId: rentElId,
      el: rentEl,
      onRentAt: hit.onRentAt,
    };
  }

  /** True only when this EL is the current billing EL for an open (unreceived) DT. */
  function isSerialOnRentForEl(serial, el) {
    if (!el || !serial) return false;
    if (String(el.status || "").toLowerCase() === "closed") return false;
    var ctx = getSerialOpenRentContext(serial);
    if (!ctx) return false;
    return (
      String(ctx.elId) === String(el.id) ||
      String(ctx.elId) === String(el.elNo) ||
      (ctx.el &&
        (String(ctx.el.id) === String(el.id) || String(ctx.el.elNo) === String(el.elNo)))
    );
  }

  /**
   * Heal EL serial flags + inventory to match open DTs.
   * - Closed ELs: never onRent
   * - Open ELs: onRent only if this EL is the billing EL for an open DT
   * - Serial on rent elsewhere: remove from other open ELs (cannot live on two open lists)
   * - Inventory Out with no open DT: set In (available to rent again)
   */
  function reconcileSerialBillingStatus() {
    if (_billingReconcileLock) return;
    _billingReconcileLock = true;
    try {
      var lists = (storageGet(KEYS.equipmentLists, []) || []).map(normalizeEquipmentList);
      if (!lists.length) return;
      var changed = false;
      var rentBySerial = {}; /* KEY -> context */

      /* First pass: compute rent context for every serial that appears on any EL or open DT */
      var allKeys = {};
      lists.forEach(function (el) {
        (el.lines || []).forEach(function (ln) {
          (ln.serials || []).forEach(function (s) {
            var sn = typeof s === "string" ? s : s && s.serial;
            if (sn) allKeys[String(sn).toUpperCase()] = String(sn);
          });
        });
      });
      (storageGet(KEYS.equipmentDts, []) || []).forEach(function (raw) {
        var dt = normalizeDt(raw);
        if (!dt) return;
        (dt.lines || []).forEach(function (ln) {
          if (ln.serial) allKeys[String(ln.serial).toUpperCase()] = String(ln.serial);
        });
      });
      Object.keys(allKeys).forEach(function (k) {
        var ctx = getSerialOpenRentContext(allKeys[k]);
        if (ctx) rentBySerial[k] = ctx;
      });

      lists.forEach(function (el) {
        var isClosed = String(el.status || "").toLowerCase() === "closed";
        var linesBefore = (el.lines || []).length;
        el.lines = (el.lines || [])
          .map(function (ln) {
            var nextSerials = [];
            (ln.serials || []).forEach(function (s) {
              var sn = typeof s === "string" ? s : s && s.serial;
              if (!sn) return;
              var key = String(sn).toUpperCase();
              var ctx = rentBySerial[key];
              var obj =
                s && typeof s === "object"
                  ? s
                  : { serial: sn, location: "", onRent: false, onRentAt: "", lastDtId: "" };

              if (isClosed) {
                /* Old / closed EL: keep history, never report live on-rent status */
                if (obj.onRent || obj.onRentAt || obj.lastDtId) changed = true;
                obj.onRent = false;
                obj.onRentAt = "";
                /* keep lastDtId as historical breadcrumb only if already set */
                nextSerials.push(obj);
                return;
              }

              if (ctx) {
                var mine =
                  String(ctx.elId) === String(el.id) ||
                  String(ctx.elId) === String(el.elNo);
                if (mine) {
                  if (!obj.onRent || obj.lastDtId !== String(ctx.dtId)) changed = true;
                  obj.onRent = true;
                  obj.onRentAt = obj.onRentAt || ctx.onRentAt || "";
                  obj.lastDtId = String(ctx.dtId);
                  nextSerials.push(obj);
                } else {
                  /* On rent to another EL — cannot remain on this open EL */
                  changed = true;
                  /* drop serial from this open EL */
                }
              } else {
                if (obj.onRent) changed = true;
                obj.onRent = false;
                obj.onRentAt = "";
                nextSerials.push(obj);
              }
            });
            ln.serials = nextSerials;
            if (String(ln.uom || "").toUpperCase() !== "FT") {
              ln.qty = nextSerials.length || ln.qty;
            }
            /* line-level onRentAt only if any serial still on rent here */
            var anyOn = nextSerials.some(function (x) {
              return x.onRent;
            });
            if (!anyOn) {
              if (ln.onRentAt) changed = true;
              ln.onRentAt = "";
            }
            return ln;
          })
          .filter(function (ln) {
            return (ln.serials || []).length > 0;
          });
        if ((el.lines || []).length !== linesBefore) changed = true;
        (el.lines || []).forEach(function (ln, i) {
          ln.itemNo = String(i + 1);
        });
      });

      if (changed) {
        storageSet(KEYS.equipmentLists, lists);
      }

      /* Inventory: Out only while an open DT still holds the serial */
      var assets = (storageGet(KEYS.assets, null) || storageGet(KEYS.assetsLegacy, []) || []).map(
        normalizeAsset
      );
      var assetsChanged = false;
      assets.forEach(function (a) {
        if (!a || !a.serial) return;
        var key = String(a.serial).toUpperCase();
        var ctx = rentBySerial[key];
        if (ctx) {
          if (String(a.status || "").toLowerCase() !== "out") {
            a.status = "Out";
            a.lastDeliveryTicket = String(ctx.dtId);
            assetsChanged = true;
          }
        } else if (String(a.status || "").toLowerCase() === "out") {
          /* Fully received (or never open DT) — available to rent again */
          a.status = "In";
          assetsChanged = true;
        }
      });
      if (assetsChanged) storageSet(KEYS.assets, assets);

      /* Also clear stale onRent on SAMPLE-only paths is handled via catalog at runtime */
    } finally {
      _billingReconcileLock = false;
    }
  }

  /**
   * Enforce: a serial lives on only one open EL.
   * Prefer well-transfer / child EL over its source; keep lines there.
   * Align completed DTs to the EL that currently holds each serial.
   */
  function enforceOneElPerSerial() {
    var lists = (storageGet(KEYS.equipmentLists, []) || []).map(normalizeEquipmentList);
    if (!lists.length) return;

    var serialOwners = {}; /* key -> [{ el, score }] */
    lists.forEach(function (el) {
      if (String(el.status || "").toLowerCase() === "closed") return;
      (el.lines || []).forEach(function (ln) {
        (ln.serials || []).forEach(function (s) {
          var sn = typeof s === "string" ? s : s && s.serial;
          var key = String(sn || "").trim().toUpperCase();
          if (!key) return;
          if (!serialOwners[key]) serialOwners[key] = [];
          var score = 0;
          if (el.transferType === "well-transfer") score += 100;
          if (el.sourceElId) score += 50;
          if (typeof s === "object" && s && s.onRent) score += 20;
          if (el.createdAt) {
            var t = Date.parse(el.createdAt);
            if (!isNaN(t)) score += Math.floor(t / 1e12);
          }
          serialOwners[key].push({ el: el, score: score });
        });
      });
    });

    var changed = false;
    Object.keys(serialOwners).forEach(function (key) {
      var owners = serialOwners[key];
      if (owners.length < 2) return;
      owners.sort(function (a, b) {
        return b.score - a.score;
      });
      var keepId = owners[0].el.id;
      owners.slice(1).forEach(function (o) {
        var el = o.el;
        var before = (el.lines || []).length;
        el.lines = (el.lines || [])
          .map(function (ln) {
            ln.serials = (ln.serials || []).filter(function (s) {
              var sn = typeof s === "string" ? s : s && s.serial;
              return String(sn || "").toUpperCase() !== key;
            });
            if (String(ln.uom || "").toUpperCase() !== "FT") {
              ln.qty = (ln.serials || []).length || ln.qty;
            }
            return ln;
          })
          .filter(function (ln) {
            return (ln.serials || []).length > 0;
          });
        if ((el.lines || []).length !== before || true) {
          el.updatedAt = new Date().toISOString();
          changed = true;
        }
        /* drop empty refs — renumber */
        (el.lines || []).forEach(function (ln, i) {
          ln.itemNo = String(i + 1);
        });
      });
      /* ensure keep EL still has the serial (if not, leave as-is) */
      void keepId;
    });

    if (changed) {
      storageSet(KEYS.equipmentLists, lists);
    }

    /*
     * Do NOT reassign DT.elId to the EL that currently holds the serial.
     * A DT stays tied to the EL it was created on only (see getDtsForEl / dtLedger).
     */
  }

  function seedEquipmentIfNeeded() {
    var lists = storageGet(KEYS.equipmentLists, null);
    var dts = storageGet(KEYS.equipmentDts, null);
    var seq = storageGet(KEYS.dtSeq, null);

    if (lists && lists.length) {
      /* normalize in place for recovered shapes */
      storageSet(KEYS.equipmentLists, lists.map(normalizeEquipmentList));
      if (dts && dts.length) storageSet(KEYS.equipmentDts, dts.map(normalizeDt).filter(Boolean));
      if (seq == null) storageSet(KEYS.dtSeq, 1);
      enforceOneElPerSerial();
      reconcileSerialBillingStatus();
      return;
    }

    /*
     * Demo story (one-EL rule):
     * RO-2026-0841 original EL — closed after well transfer (no live serials).
     * RO-2026-0905 well-transfer EL — holds 123456 On Rent with DT 1 (current billing).
     */
    var el1 = emptyEquipmentList();
    el1.id = "00001";
    el1.elNo = "00001";
    el1.orderNo = "00001";
    el1.status = "Closed";
    el1.company = "Chevron";
    el1.customer = "Chevron";
    el1.well = "A-4 ST1";
    el1.rig = "Helmerich 312";
    el1.jobNo = "51000";
    el1.salesPerson = "J. Ramirez";
    el1.location = "Broussard";
    el1.store = "Broussard";
    el1.createdBy = "demo.user";
    el1.createdAt = "2026-03-12";
    el1.shipDate = "2026-03-15";
    el1.poNumber = "PO-88421";
    el1.afe = "AFE-22091";
    el1.contact = "Field Ops Desk";
    el1.phone = "337-555-0142";
    el1.shipTo = "Chevron — Well A-4 ST1, GOM";
    el1.lines = [];
    el1.notes = "Well transfer out → RO-2026-0905. Equipment moved for continued billing.";

    var el2 = emptyEquipmentList();
    el2.id = "00002";
    el2.elNo = "00002";
    el2.orderNo = "00002";
    el2.status = "Open";
    el2.company = "Chevron";
    el2.customer = "Chevron";
    el2.well = "A-4 ST1 Comp";
    el2.rig = "Helmerich 312";
    el2.jobNo = "51000";
    el2.salesPerson = "J. Ramirez";
    el2.location = "Broussard";
    el2.store = "Broussard";
    el2.createdBy = "demo.user";
    el2.createdAt = "2026-04-02";
    el2.transferType = "well-transfer";
    el2.needsHeaderUpdate = false;
    el2.headerSaved = true;
    el2.sourceElId = "00001";
    el2.transferFromOrderNo = "00001";
    el2.notes = "Well transfer from EL 00001 — current open EL for 123456.";
    el2.shipDate = "2026-03-15";
    el2.poNumber = "PO-88421";
    el2.afe = "AFE-22091";
    el2.contact = "Field Ops Desk";
    el2.phone = "337-555-0142";
    el2.shipTo = "Chevron — Well A-4 ST1 Comp, GOM";
    /* DT 1 was created on this EL */
    el2.dtLedger = [
      {
        dtId: "1",
        completedAt: "",
        shippedAt: "2026-03-15",
        withPricing: true,
        lineIds: ["ln-demo-wt-1"],
        status: "Open",
        receiveStatus: "open",
      },
    ];
    el2.rrLedger = [];
    el2.lines = [
      {
        id: "ln-demo-wt-1",
        itemNo: "1",
        description: "5\" 19.50# S-135 NC50 R2 Drill Pipe",
        uom: "JT",
        qty: 1,
        type: "Rental",
        lastDtId: "1",
        lastDtType: "Delivery Ticket",
        onRentAt: "2026-03-15",
        serials: [
          {
            serial: "123456",
            location: "Broussard",
            onRent: true,
            onRentAt: "2026-03-15",
            lastDtId: "1",
          },
        ],
        selectedForDt: false,
      },
    ];

    var el3 = emptyEquipmentList();
    el3.id = "00003";
    el3.elNo = "00003";
    el3.orderNo = "00003";
    el3.status = "Closed";
    el3.company = "Shell";
    el3.customer = "Shell";
    el3.well = "Mars A-12";
    el3.rig = "Transocean 722";
    el3.jobNo = "51001";
    el3.salesPerson = "M. Okonkwo";
    el3.location = "Houma";
    el3.store = "Houma";
    el3.createdBy = "demo.user";
    el3.createdAt = "2026-02-01";
    el3.shipDate = "2026-02-10";
    el3.returnDate = "2026-02-28";
    el3.lines = [
      {
        id: "ln-demo-3",
        itemNo: "1",
        description: "5\" HWDP NC50",
        uom: "JT",
        qty: 1,
        type: "Rental",
        serials: [
          {
            serial: "HW-4401",
            location: "Houma",
            onRent: false,
            onRentAt: "",
            lastDtId: "",
          },
        ],
        selectedForDt: false,
      },
    ];

    var dt1 = {
      id: "1",
      dtNo: "1",
      elId: "00002",
      orderId: "00002",
      createdOnElId: "00002",
      orderNo: "00002",
      elNo: "00002",
      customer: "Chevron",
      company: "Chevron",
      well: "A-4 ST1 Comp",
      jobNo: "51000",
      shipDate: "2026-03-15",
      type: "Delivery Ticket",
      status: "Completed",
      completed: true,
      completedAt: "2026-03-15",
      shipTo: "Chevron — Well A-4 ST1 Comp, GOM",
      contact: "Field Ops Desk",
      phone: "337-555-0142",
      withPricing: true,
      lines: [
        {
          itemNo: "1",
          serial: "123456",
          description: "5\" 19.50# S-135 NC50 R2 Drill Pipe",
          uom: "JT",
          qty: 1,
          unitPrice: 125,
          amount: 125,
        },
      ],
      notes: "Demo completed delivery ticket — billing continues on well-transfer EL 00002",
    };

    storageSet(KEYS.equipmentLists, [el1, el2, el3]);
    storageSet(KEYS.equipmentDts, [dt1]);
    storageSet(KEYS.dtSeq, 1);
    storageSet(KEYS.elSeq, 3);
    storageSet(KEYS.jobSeq, 51001);

    /* ensure serial 123456 is Out */
    var rec = findCardexRecord("123456");
    if (rec) {
      rec.status = "Out";
      rec.lastDeliveryTicket = "1";
      rec.lastDtDate = "2026-03-15";
      upsertAsset(rec);
    }

    /* Working job: identical header to EL 00002, with EL 00002 (and 00001) attached */
    try {
      storageSet(KEYS.jobs, null);
      seedJobsIfNeeded();
    } catch (eSeedJob) {}
  }

  function loadEquipmentLists() {
    seedEquipmentIfNeeded();
    return (storageGet(KEYS.equipmentLists, []) || []).map(normalizeEquipmentList);
  }

  function saveEquipmentLists(list) {
    storageSet(KEYS.equipmentLists, (list || []).map(normalizeEquipmentList));
  }

  function getEquipmentList(id) {
    var list = loadEquipmentLists();
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === id || list[i].elNo === id || list[i].orderNo === id) return list[i];
    }
    return null;
  }

  function saveEquipmentList(el) {
    var list = loadEquipmentLists();
    var norm = normalizeEquipmentList(el);
    var found = false;
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === norm.id) {
        list[i] = norm;
        found = true;
        break;
      }
    }
    if (!found) list.push(norm);
    saveEquipmentLists(list);
  }

  function loadDts() {
    seedEquipmentIfNeeded();
    migrateReceivingReportsClean();
    return (storageGet(KEYS.equipmentDts, []) || []).map(normalizeDt).filter(Boolean);
  }

  function saveDts(list) {
    storageSet(KEYS.equipmentDts, (list || []).map(normalizeDt).filter(Boolean));
  }

  function getDt(id) {
    var list = loadDts();
    var key = formatDtNo(id);
    for (var i = 0; i < list.length; i++) {
      var d = list[i];
      if (
        d.id === id ||
        d.dtNo === id ||
        formatDtNo(d.id) === key ||
        formatDtNo(d.dtNo) === key
      ) {
        return d;
      }
    }
    return null;
  }

  function nextDtNo() {
    var seq = parseInt(storageGet(KEYS.dtSeq, 0), 10) || 0;
    var raw = storageGet(KEYS.equipmentDts, []) || [];
    raw.forEach(function (d) {
      if (!d) return;
      var n = parseInt(formatDtNo(d.dtNo || d.id), 10);
      if (!isNaN(n) && n > seq) seq = n;
    });
    seq += 1;
    storageSet(KEYS.dtSeq, seq);
    return String(seq);
  }

  function serialIsCurrentlyOut(serial) {
    var rec = findCardexRecord(serial);
    if (rec && String(rec.status || "") === "Out") return true;
    var key = String(serial || "").trim().toUpperCase();
    if (!key) return false;
    var out = false;
    loadDts().forEach(function (d) {
      var on = false;
      (d.lines || []).forEach(function (ln) {
        if (String(ln.serial || "").toUpperCase() === key) on = true;
      });
      if (!on) return;
      if (!dtIsSerialReceived(d, serial) && !dtIsFullyReceived(d)) out = true;
    });
    return out;
  }

  function assertSerialsNotOutForNewDt(serials) {
    var blocked = [];
    (serials || []).forEach(function (sn) {
      var s = String(sn || "").trim();
      if (s && serialIsCurrentlyOut(s) && blocked.indexOf(s) === -1) blocked.push(s);
    });
    if (!blocked.length) return;
    if (blocked.length === 1) {
      throw new Error(
        "Serial number " + blocked[0] + " is currently Out and cannot be added to a new DT."
      );
    }
    throw new Error(
      "These serial numbers are currently Out and cannot be added to a new DT: " +
        blocked.join(", ") +
        "."
    );
  }

  function repairInvalidVendorDtsWhileSerialOut() {
    var dts = loadDts();
    var removeIds = {};
    dts.forEach(function (d) {
      if ((d.destType || "") !== "vendor") return;
      var steal = false;
      (d.lines || []).forEach(function (ln) {
        var sn = String(ln.serial || "").trim();
        if (!sn) return;
        dts.forEach(function (other) {
          if (String(other.id) === String(d.id)) return;
          if (formatDtNo(other.dtNo || other.id) === formatDtNo(d.dtNo || d.id)) return;
          (other.lines || []).forEach(function (ol) {
            if (String(ol.serial || "").toUpperCase() === sn.toUpperCase()) steal = true;
          });
        });
      });
      if (steal) removeIds[String(d.id || d.dtNo)] = d;
    });
    var removed = [];
    Object.keys(removeIds).forEach(function (k) {
      removed.push(removeIds[k]);
    });
    if (!removed.length) return 0;
    var removeKeys = {};
    removed.forEach(function (d) {
      removeKeys[String(d.id)] = true;
      removeKeys[String(d.dtNo)] = true;
      removeKeys[formatDtNo(d.dtNo || d.id)] = true;
    });
    var kept = dts.filter(function (d) {
      return !removeKeys[String(d.id)] && !removeKeys[String(d.dtNo)] && !removeKeys[formatDtNo(d.dtNo || d.id)];
    });
    saveDts(kept);
    var rrs = loadReceivingReports().filter(function (r) {
      var id = String(r.dtId || r.dtNo || "");
      return !removeKeys[id] && !removeKeys[formatDtNo(id)];
    });
    saveReceivingReports(rrs);
    var histAll = storageGet(KEYS.cardexHistory, {}) || {};
    removed.forEach(function (d) {
      var no = formatDtNo(d.dtNo || d.id);
      var token = "DT-" + no;
      (d.lines || []).forEach(function (ln) {
        var key = String(ln.serial || "").toUpperCase();
        if (!histAll[key]) return;
        histAll[key] = histAll[key].filter(function (h) {
          var det = String((h && h.detail) || "");
          return det.indexOf(token) === -1 && det.indexOf("DT-" + (d.dtNo || "")) === -1;
        });
      });
    });
    storageSet(KEYS.cardexHistory, histAll);
    return removed.length;
  }

  function createVendorDt(opts) {
    opts = opts || {};
    var vendor = opts.vendor || (opts.vendorId ? getVendor(opts.vendorId) : null);
    if (!vendor && opts.vendorId) {
      loadVendors().forEach(function (v) {
        if (String(v.id) === String(opts.vendorId)) vendor = v;
      });
    }
    if (!vendor || !vendor.name) throw new Error("Select a vendor");
    var dueDate = String(opts.dueDate || "").slice(0, 10);
    if (!dueDate) throw new Error("Agreed-upon due date is required");
    var serials = (opts.serials || []).map(function (s) {
      return String(s || "").trim();
    }).filter(Boolean);
    if (!serials.length) throw new Error("Add at least one serial number");
    assertSerialsNotOutForNewDt(serials);
    var dtNo = nextDtNo();
    var stamp = nowISO();
    var shipDay = stamp.slice(0, 10);
    var lines = [];
    serials.forEach(function (sn, i) {
      var rec = findCardexRecord(sn);
      if (!rec) throw new Error("Serial " + sn + " not found in inventory");
      lines.push({
        itemNo: String(i + 1),
        serial: rec.serial,
        description: rec.description || "",
        uom: rec.uom || "EA",
        qty: 1,
        unitPrice: "",
        amount: "",
      });
    });
    var dt = {
      id: dtNo,
      dtNo: dtNo,
      destType: "vendor",
      vendorId: vendor.id,
      vendorName: vendor.name,
      customer: vendor.name,
      company: vendor.name,
      dueDate: dueDate,
      shipDate: shipDay,
      createdAt: stamp,
      type: "Vendor DT",
      status: "Open",
      completed: false,
      receiveStatus: "open",
      receivedSerials: {},
      partialReceiveCount: 0,
      rrIds: [],
      store: opts.store || vendor.location || "",
      location: opts.store || vendor.location || "",
      contact: opts.contact || "",
      notes: opts.notes || "",
      elId: "",
      orderNo: "",
      elNo: "",
      well: "",
      jobNo: "",
      shipTo: vendor.name,
      lines: lines,
    };
    dt = normalizeDt(dt);
    var list = loadDts();
    list.push(dt);
    saveDts(list);
    lines.forEach(function (ln) {
      setAssetStatus(ln.serial, "Out", {
        note: "DT-" + dtNo + " · Vendor " + vendor.name,
        lastDeliveryTicket: dtNo,
      });
    });
    refreshSupplierScoreForVendorName(vendor.name);
    return dt;
  }

  /** Build set of DT ids recorded on this EL when Create DT was used. */
  function elDtLedgerIdSet(el) {
    var set = {};
    if (!el) return set;
    (el.dtLedger || []).forEach(function (entry) {
      if (!entry) return;
      if (entry.dtId != null && entry.dtId !== "") {
        set[String(entry.dtId)] = true;
        set[formatDtNo(entry.dtId)] = true;
      }
      if (entry.dtNo != null && entry.dtNo !== "") {
        set[String(entry.dtNo)] = true;
        set[formatDtNo(entry.dtNo)] = true;
      }
    });
    return set;
  }

  function elRrLedgerIdSet(el) {
    var set = {};
    if (!el) return set;
    (el.rrLedger || []).forEach(function (entry) {
      if (!entry) return;
      if (entry.rrId != null && entry.rrId !== "") set[String(entry.rrId)] = true;
      if (entry.rrLabel != null && entry.rrLabel !== "") set[String(entry.rrLabel)] = true;
    });
    return set;
  }

  /**
   * DT shows on an EL if it was created from that EL.
   * Primary: EL.dtLedger. Also createdOnElId, then legacy orderId/elId (recovered data).
   */
  function dtBelongsToEl(d, el) {
    if (!d || !el) return false;
    var ledger = elDtLedgerIdSet(el);
    var no = formatDtNo(d.dtNo || d.id);
    if (
      ledger[String(d.id || "")] ||
      ledger[String(d.dtNo || "")] ||
      ledger[no]
    ) {
      return true;
    }
    if (d.createdOnElId != null && d.createdOnElId !== "") {
      if (
        String(d.createdOnElId) === String(el.id) ||
        String(d.createdOnElId) === String(el.elNo)
      ) {
        return true;
      }
    }
    /* Recovered / legacy DTs: orderId or elId points at the EL */
    var elKeys = [el.id, el.elNo, el.orderNo].filter(Boolean).map(String);
    var dtKeys = [d.elId, d.orderId, d.orderNo, d.elNo].filter(Boolean).map(String);
    for (var i = 0; i < dtKeys.length; i++) {
      for (var j = 0; j < elKeys.length; j++) {
        if (dtKeys[i] === elKeys[j]) return true;
      }
    }
    return false;
  }

  function getDtsForEl(elOrId) {
    var el = elOrId && typeof elOrId === "object" ? elOrId : getEquipmentList(elOrId);
    if (!el) return [];
    return loadDts().filter(function (d) {
      return dtBelongsToEl(d, el);
    });
  }

  /**
   * DTs for a line on THIS EL only (must be on this EL's DT list first).
   */
  function getDtsForLine(el, ln) {
    var serialKeys = {};
    (ln.serials || []).forEach(function (s) {
      var sn = typeof s === "string" ? s : s && s.serial;
      if (sn) serialKeys[String(sn).toUpperCase()] = true;
    });
    var hits = [];
    var seen = {};
    function pushDt(d) {
      if (!d || !dtBelongsToEl(d, el)) return;
      var no = d.dtNo || d.id;
      if (!no || seen[no]) return;
      seen[no] = true;
      hits.push(d);
    }
    getDtsForEl(el).forEach(function (d) {
      var match = false;
      if (ln && ln.id && (d.lineIds || []).indexOf(ln.id) >= 0) match = true;
      (d.lines || []).forEach(function (dl) {
        if (serialKeys[String(dl.serial || "").toUpperCase()]) match = true;
      });
      if (match) pushDt(d);
    });
    hits.sort(function (a, b) {
      return String(a.dtNo || a.id).localeCompare(String(b.dtNo || b.id));
    });
    return hits;
  }

  /** All DTs that include this serial anywhere. */
  function getDtsForSerial(serial) {
    var key = String(serial || "").trim().toUpperCase();
    if (!key) return [];
    var hits = [];
    var seen = {};
    loadDts().forEach(function (d) {
      var match = false;
      (d.lines || []).forEach(function (dl) {
        if (String(dl.serial || "").toUpperCase() === key) match = true;
      });
      if (!match) return;
      var no = d.dtNo || d.id;
      if (!no || seen[no]) return;
      seen[no] = true;
      hits.push(d);
    });
    hits.sort(function (a, b) {
      return String(a.dtNo || a.id).localeCompare(String(b.dtNo || b.id));
    });
    return hits;
  }

  /** Most recent DT for a serial (by ship/completed date, then DT number). */
  function getMostRecentDtForSerial(serial) {
    var list = getDtsForSerial(serial).slice();
    if (!list.length) return null;
    list.sort(function (a, b) {
      var da = a.shipDate || a.completedAt || a.createdAt || "";
      var db = b.shipDate || b.completedAt || b.createdAt || "";
      if (String(db) !== String(da)) return String(db).localeCompare(String(da));
      var na = parseInt(formatDtNo(a.dtNo || a.id), 10) || 0;
      var nb = parseInt(formatDtNo(b.dtNo || b.id), 10) || 0;
      return nb - na;
    });
    return list[0];
  }

  /**
   * Utilization reference:
   * 123456 stays on a customer DT with no RR (currently utilized).
   * ELV-12 gets a closed DT → RR cycle so returned time is measurable.
   */
  function ensureUtilReferenceRentHistory() {
    if (storageGet(KEYS.utilRentRef, false)) return;
    var rrs = loadReceivingReports();
    var dts = loadDts();
    var dtsChanged = false;
    var rrsChanged = false;

    function dtHasSerial(dt, serial) {
      var key = String(serial).toUpperCase();
      var hit = false;
      dtAllSerials(dt).forEach(function (sn) {
        if (String(sn).toUpperCase() === key) hit = true;
      });
      return hit;
    }

    /* 123456: currently out — strip receivedSerials if there is no actual RR */
    dts.forEach(function (dt) {
      if (!dtHasSerial(dt, "123456")) return;
      var recMap = dt.receivedSerials || {};
      var rec = recMap["123456"] || recMap["123456".toUpperCase()];
      if (!rec) {
        if (String(dt.receiveStatus || "").toLowerCase() === "received") {
          dt.receiveStatus = "open";
          dtsChanged = true;
        }
        return;
      }
      var rrExists = getRrsForDt(dt.dtNo || dt.id).some(function (r) {
        return utilRrHasSerial(r, "123456");
      });
      if (rrExists) return;
      delete recMap["123456"];
      delete recMap["123456".toUpperCase()];
      dt.receivedSerials = recMap;
      if (String(dt.receiveStatus || "").toLowerCase() === "received") dt.receiveStatus = "open";
      dtsChanged = true;
    });

    var rec123 = findCardexRecord("123456");
    if (rec123) {
      var hasOpenDt = dts.some(function (dt) {
        return dtHasSerial(dt, "123456") && !utilRrDateForSerialOnDt(dt, "123456").at;
      });
      if (hasOpenDt && String(rec123.status || "") !== "Out") {
        rec123.status = "Out";
        upsertAsset(rec123);
      }
    }

    /* ELV-12: returned rental so utilization has a closed DT → RR window */
    var hasElvDt = dts.some(function (dt) {
      return dtHasSerial(dt, "ELV-12");
    });
    if (!hasElvDt && findCardexRecord("ELV-12")) {
      var dtNo = nextDtNo();
      var rrNo = nextRrNo();
      var rrLabel = String(rrNo);
      var ship = "2026-05-01";
      var ret = "2026-07-15T16:00:00.000Z";
      var elv = findCardexRecord("ELV-12");
      var dtElv = {
        id: dtNo,
        dtNo: dtNo,
        elId: "",
        orderId: "",
        orderNo: "",
        elNo: "",
        customer: "Shell",
        company: "Shell",
        well: "Mars A-12",
        jobNo: "",
        shipDate: ship,
        type: "Delivery Ticket",
        status: "Completed",
        completed: true,
        completedAt: ship,
        shipTo: "Shell — Mars A-12",
        destType: "customer",
        receiveStatus: "received",
        receivedSerials: {
          "ELV-12": { at: ret, rrLabel: rrLabel },
        },
        rrIds: [],
        lines: [
          {
            itemNo: "1",
            serial: "ELV-12",
            description: (elv && elv.description) || "Elevator",
            uom: (elv && elv.uom) || "EA",
            qty: 1,
          },
        ],
        notes: "Closed rental used for Daily Utilization (DT ship → RR return).",
        createdAt: ship + "T08:00:00.000Z",
      };
      var rrElv = {
        id: uid("RR"),
        rrNo: rrNo,
        rrLabel: rrLabel,
        partialIndex: 1,
        isPartial: false,
        isFinal: true,
        elId: "",
        dtId: dtNo,
        dtNo: dtNo,
        customer: "Shell",
        company: "Shell",
        serials: ["ELV-12"],
        lines: [
          {
            serial: "ELV-12",
            description: (elv && elv.description) || "Elevator",
            itemNo: "1",
            uom: (elv && elv.uom) || "EA",
            qty: 1,
          },
        ],
        createdAt: ret,
        notes: "Return receiving ticket for ELV-12 — utilization end date.",
      };
      dtElv.rrIds = [rrElv.id];
      dts.push(normalizeDt(dtElv));
      rrs.push(rrElv);
      dtsChanged = true;
      rrsChanged = true;
      elv.status = "In";
      elv.lastDeliveryTicket = dtNo;
      elv.lastDtDate = ship;
      elv.lastReceivingReport = rrLabel;
      elv.lastReturnDate = "2026-07-15";
      upsertAsset(elv);
      appendCardexHistory(
        "ELV-12",
        "Issued / Out",
        "DT " + dtNo + " · on rent " + ship,
        ship + "T08:00:00.000Z"
      );
      appendCardexHistory(
        "ELV-12",
        "Returned / In",
        "RR " + rrLabel + " · DT " + dtNo,
        ret
      );
    }

    if (dtsChanged) saveDts(dts);
    if (rrsChanged) saveReceivingReports(rrs);
    storageSet(KEYS.utilRentRef, true);
  }

  function formatDateTime(iso) {
    if (!iso) return "—";
    var s = String(iso);
    try {
      var d = new Date(s);
      if (!isNaN(d.getTime())) {
        return d.toLocaleString(undefined, {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      }
    } catch (e) {}
    return formatDate(s) || s;
  }

  /** Customer · Rig only — never Well */
  function formatCustomerRig(customer, rig) {
    var parts = [];
    if (customer) parts.push(String(customer).trim());
    if (rig) parts.push(String(rig).trim());
    return parts.filter(Boolean).join(" · ") || "—";
  }

  function resolveCustomer(dt, el) {
    return (
      (dt && (dt.customer || dt.company)) ||
      (el && (el.customer || el.company)) ||
      ""
    );
  }

  /** Rig only (EL or DT). Do not fall back to Well. */
  function resolveRig(dt, el) {
    return (el && el.rig) || (dt && dt.rig) || "";
  }

  function resolveStore(el, asset, dt) {
    return (
      (el && (el.location || el.store)) ||
      (asset && (asset.store || asset.location)) ||
      (dt && dt.store) ||
      ""
    );
  }

  function formatQtyUom(qty, uom) {
    if (qty === "" || qty == null) return "";
    var q = String(qty);
    var u = String(uom || "").trim();
    return u ? q + " " + u : q;
  }

  /** Snapshot of EL header fields shared onto DT / RR */
  function snapshotElHeader(el) {
    if (!el || typeof el !== "object") return {};
    return {
      orderNo: el.elNo || el.orderNo || "", /* legacy alias for EL No */
      elNo: el.elNo || el.id || "",
      company: el.company || el.customer || "",
      customer: el.customer || el.company || "",
      phone: el.phone || "",
      well: el.well || "",
      rig: el.rig || "",
      jobNo: el.jobNo || "",
      afe: el.afe || "",
      location: el.location || el.store || "",
      store: el.store || el.location || "",
      shipDate: "", /* EL no longer carries ship/return — DTs own ship date */
      returnDate: "",
      createdAt: el.createdAt || "",
      poNumber: el.poNumber || "",
      contact: el.contact || "",
      salesPerson: el.salesmanField || el.salesPerson || "",
      salesmanField: el.salesmanField || el.salesPerson || "",
      shipTo: el.shipTo || "",
      billTo: el.billTo || "",
      notes: el.notes || "",
      email: el.email || "",
      preparedBy: el.preparedBy || el.createdBy || "",
    };
  }

  /**
   * Header for DT/RR: prefer live EL (same info as EL page), then ticket.header, then ticket fields.
   */
  function resolveTicketHeader(ticket, el) {
    var live = el ? snapshotElHeader(el) : {};
    var snap = ticket && ticket.header && typeof ticket.header === "object" ? ticket.header : {};
    function pick() {
      var keys = Array.prototype.slice.call(arguments);
      var i;
      for (i = 0; i < keys.length; i++) {
        var k = keys[i];
        if (live[k]) return live[k];
      }
      for (i = 0; i < keys.length; i++) {
        k = keys[i];
        if (snap[k]) return snap[k];
      }
      if (ticket) {
        for (i = 0; i < keys.length; i++) {
          k = keys[i];
          if (ticket[k]) return ticket[k];
        }
        if (ticket.job && typeof ticket.job === "object") {
          for (i = 0; i < keys.length; i++) {
            k = keys[i];
            if (ticket.job[k]) return ticket.job[k];
          }
        }
      }
      return "";
    }
    return {
      orderNo: pick("orderNo"),
      elNo: pick("elNo"),
      company: pick("company", "customer"),
      customer: pick("customer", "company"),
      phone: pick("phone"),
      well: pick("well"),
      rig: pick("rig"),
      jobNo: pick("jobNo"),
      afe: pick("afe"),
      location: pick("location", "store"),
      store: pick("store", "location"),
      shipDate: pick("shipDate"),
      returnDate: pick("returnDate"),
      createdAt: pick("createdAt"),
      poNumber: pick("poNumber"),
      contact: pick("contact", "preparedBy"),
      salesPerson: pick("salesmanField", "salesPerson"),
      shipTo: pick("shipTo"),
      billTo: pick("billTo"),
      notes: pick("notes"),
      email: pick("email"),
    };
  }

  function renderHeaderKvGrid(hdr, extraPairs) {
    function cell(label, val) {
      return (
        "<div><span class=\"kv-label\">" +
        escapeHtml(label) +
        '</span><div class="kv-value">' +
        escapeHtml(val != null && val !== "" ? val : "—") +
        "</div></div>"
      );
    }
    var html =
      '<div class="dt-meta-grid ticket-el-header">' +
      cell("EL No", hdr.elNo || hdr.orderNo) +
      cell("Job No", hdr.jobNo) +
      cell("Created", formatDateTime(hdr.createdAt) || "—") +
      cell("Company", hdr.company || hdr.customer) +
      cell("Phone", hdr.phone) +
      cell("Well", hdr.well) +
      cell("Rig", hdr.rig) +
      cell("AFE", hdr.afe) +
      cell("Store", hdr.location || hdr.store) +
      cell("PO", hdr.poNumber) +
      cell("Customer contact", hdr.contact) +
      cell("Sales", hdr.salesPerson) +
      cell("Ship to", hdr.shipTo) +
      cell("Bill to", hdr.billTo);
    (extraPairs || []).forEach(function (p) {
      html += cell(p[0], p[1]);
    });
    if (hdr.notes) html += cell("Notes", hdr.notes);
    html += "</div>";
    return html;
  }

  function printHeaderMetaHtml(hdr) {
    function m(label, val) {
      return (
        "<div><span>" +
        escapeHtml(label) +
        "</span><strong>" +
        escapeHtml(val != null && val !== "" ? val : "—") +
        "</strong></div>"
      );
    }
    return (
      '<div class="meta">' +
      m("EL No", hdr.elNo || hdr.orderNo) +
      m("Job No", hdr.jobNo) +
      m("Created", formatDateTime(hdr.createdAt) || "—") +
      m("Company", hdr.company || hdr.customer) +
      m("Phone", hdr.phone) +
      m("Well", hdr.well) +
      m("Rig", hdr.rig) +
      m("AFE", hdr.afe) +
      m("Store", hdr.location || hdr.store) +
      m("PO", hdr.poNumber) +
      m("Customer contact", hdr.contact) +
      m("Sales", hdr.salesPerson) +
      m("Ship to", hdr.shipTo) +
      m("Bill to", hdr.billTo) +
      (hdr.notes ? m("Notes", hdr.notes) : "") +
      "</div>"
    );
  }

  /**
   * Open print dialog (Save as PDF) via off-screen iframe — works on file://.
   * footerHtml (optional) is placed after main content and pinned to the page bottom.
   */
  function printHtmlDocument(title, bodyInnerHtml, footerHtml) {
    var footer = footerHtml || "";
    var html =
      "<!DOCTYPE html><html><head><meta charset=\"utf-8\"><title>" +
      escapeHtml(title) +
      "</title><style>" +
      "html,body{margin:0;padding:0;background:#fff;color:#111}" +
      "body{font-family:Segoe UI,Arial,sans-serif;font-size:12px}" +
      ".print-page{box-sizing:border-box;padding:18px 20px;min-height:100vh;display:flex;flex-direction:column}" +
      ".print-body{flex:1 1 auto}" +
      "h1{font-size:18px;margin:0 0 4px} .sub{color:#555;margin:0 0 16px}" +
      "table{width:100%;border-collapse:collapse;margin-top:12px}" +
      "th,td{border:1px solid #ccc;padding:6px 8px;text-align:left;vertical-align:top}" +
      "th{background:#f3f3f3}" +
      ".meta{display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px 16px;margin-bottom:12px}" +
      ".meta span{display:block;color:#666;font-size:10px;text-transform:uppercase;letter-spacing:.03em}" +
      ".meta strong{font-size:12px;font-weight:600}" +
      ".total{text-align:right;margin-top:10px;font-weight:700;font-size:13px}" +
      /* Signature block pinned to bottom of the printed page */
      ".sig-block{margin-top:auto;padding-top:28px;page-break-inside:avoid;break-inside:avoid}" +
      ".sig-table{width:100%;border-collapse:collapse;table-layout:fixed}" +
      ".sig-table td{width:50%;border:none !important;padding:0 18px 0 0 !important;vertical-align:bottom;background:transparent}" +
      ".sig-table td:last-child{padding:0 0 0 18px !important}" +
      ".sig-line{border-bottom:1.5px solid #111;height:44px;margin:0 0 8px 0}" +
      ".sig-label{font-size:12px;font-weight:700;color:#111}" +
      ".sig-meta{font-size:10px;color:#444;margin-top:3px}" +
      "@media print{" +
      "  body{margin:0}" +
      "  .print-page{min-height:100vh;padding:10mm 12mm}" +
      "  .sig-block{margin-top:auto !important}" +
      "}" +
      "</style></head><body>" +
      '<div class="print-page"><div class="print-body">' +
      bodyInnerHtml +
      "</div>" +
      footer +
      "</div></body></html>";
    try {
      var prev = document.getElementById("atraops-print-frame");
      if (prev && prev.parentNode) prev.parentNode.removeChild(prev);
      var iframe = document.createElement("iframe");
      iframe.id = "atraops-print-frame";
      iframe.setAttribute("aria-hidden", "true");
      iframe.setAttribute("title", "Print");
      /* Off-screen but real size so layout/print includes footer signatures (0x0 iframes clip) */
      iframe.style.cssText =
        "position:fixed;left:-10000px;top:0;width:8.5in;height:11in;border:0;opacity:0;pointer-events:none;z-index:-1";
      document.body.appendChild(iframe);
      var idoc = iframe.contentDocument || (iframe.contentWindow && iframe.contentWindow.document);
      if (!idoc) throw new Error("No print frame document");
      idoc.open();
      idoc.write(html);
      idoc.close();
      var win = iframe.contentWindow;
      function doPrint() {
        try {
          if (win) {
            win.focus();
            win.print();
          }
        } catch (e2) {
          toast("Print failed — try another browser", "error");
        }
      }
      /* Wait for layout so signature footer is included in the print job */
      setTimeout(doPrint, 350);
      toast("Print dialog opened — choose Save as PDF if needed");
    } catch (e) {
      toast("Could not open print: " + (e && e.message ? e.message : e), "error");
    }
  }

  /**
   * Asset history from DTs (Out) and RRs (In) for a serial.
   * Columns: Ticket, Date, Ship From, Ship To, Out, In
   * Customer/Rig only — never Customer/Well.
   */
  function buildSerialTicketHistory(serial) {
    var key = String(serial || "").trim().toUpperCase();
    if (!key) return [];
    var asset = findCardexRecord(serial);
    var rows = [];

    getDtsForSerial(serial).forEach(function (dt) {
      var line = null;
      (dt.lines || []).forEach(function (ln) {
        if (String(ln.serial || "").toUpperCase() === key) line = ln;
      });
      var el = getEquipmentList(dt.elId);
      var qty = line && line.qty != null ? line.qty : 1;
      var uom = (line && line.uom) || (asset && asset.uom) || "";
      var isVendorDt = (dt.destType || "") === "vendor";
      var shipTo = isVendorDt
        ? dt.vendorName || dt.customer || dt.company || "Vendor"
        : formatCustomerRig(resolveCustomer(dt, el), resolveRig(dt, el));
      var shipFrom = isVendorDt
        ? dt.store || dt.location || resolveStore(el, asset, dt) || "—"
        : resolveStore(el, asset, dt) || "—";
      var when = dt.shipDate || dt.completedAt || dt.createdAt || "";
      rows.push({
        kind: "DT",
        ticket: "DT-" + formatDtNo(dt.dtNo || dt.id),
        ticketNav: "equipment-dt",
        ticketParam: dt.id || dt.dtNo,
        date: when,
        shipTo: shipTo,
        shipFrom: shipFrom,
        out: formatQtyUom(qty, uom),
        in: "",
        sortKey: when || "",
        sortNo: parseInt(formatDtNo(dt.dtNo || dt.id), 10) || 0,
      });
    });

    loadReceivingReports().forEach(function (rr) {
      var line = null;
      var has = false;
      (rr.serials || []).forEach(function (s) {
        if (String(s).toUpperCase() === key) has = true;
      });
      (rr.lines || []).forEach(function (ln) {
        if (String(ln.serial || "").toUpperCase() === key) {
          has = true;
          line = ln;
        }
      });
      if (!has) return;
      var el = getEquipmentList(rr.elId);
      var dt = getDt(rr.dtId || rr.dtNo);
      var qty = line && line.qty != null ? line.qty : 1;
      var uom = (line && line.uom) || (asset && asset.uom) || "";
      var isVendorDt = dt && (dt.destType || "") === "vendor";
      var shipTo = isVendorDt
        ? (dt.store || dt.location || resolveStore(el, asset, dt) || "—")
        : resolveStore(el, asset, dt) || "—";
      var shipFrom = isVendorDt
        ? dt.vendorName || dt.customer || dt.company || rr.customer || "Vendor"
        : formatCustomerRig(
            rr.customer || resolveCustomer(dt, el),
            (el && el.rig) || (dt && dt.rig) || ""
          );
      var when = rr.createdAt || "";
      var rrNo = rr.rrLabel != null ? String(rr.rrLabel) : String(rr.rrNo || "");
      rows.push({
        kind: "RR",
        ticket: "RR-" + rrNo,
        ticketNav: "tickets-rr",
        ticketParam: rr.id,
        date: when,
        shipTo: shipTo,
        shipFrom: shipFrom,
        out: "",
        in: formatQtyUom(qty, uom),
        sortKey: when || "",
        sortNo: parseInt(rr.rrNo, 10) || 0,
      });
    });

    rows.sort(function (a, b) {
      if (String(b.sortKey) !== String(a.sortKey)) {
        return String(b.sortKey).localeCompare(String(a.sortKey));
      }
      return (b.sortNo || 0) - (a.sortNo || 0);
    });
    return rows;
  }

  function seedDocsNcrIfNeeded() {
    if (!storageGet(KEYS.docs, null)) {
      storageSet(KEYS.docs, [
        { id: "doc-1", title: "DP Inspection Procedure Rev C", module: "procedures", rev: "C", date: "2025-11-02", status: "Active" },
        { id: "doc-2", title: "NC50 Connection Spec Sheet", module: "tech", rev: "2.1", date: "2026-01-15", status: "Active" },
        { id: "doc-3", title: "Material Cert — Heat 88421", module: "certs", rev: "—", date: "2026-02-20", status: "Active" },
        { id: "doc-4", title: "Packing List Template", module: "shipping", rev: "A", date: "2025-08-10", status: "Active" },
      ]);
    }
    if (!storageGet(KEYS.ncrs, null)) {
      storageSet(KEYS.ncrs, [
        normalizeNcr({
          id: "NCR-1001",
          title: "Thread damage on pin end",
          serial: "789012",
          status: "Open",
          date: "2026-03-01",
          assignedDept: "QA",
          assignedTo: "QA Desk",
          likelihood: 3,
          severity: 3,
          issueDescription: "Visible thread damage on pin end after return from rental.",
          immediateAction: "Quarantined serial; tagged Out of Service pending inspection.",
        }),
        normalizeNcr({
          id: "NCR-1002",
          title: "Missing hardband segment",
          serial: "DP-3344",
          status: "Closed",
          date: "2026-01-18",
          assignedDept: "Yard",
          assignedTo: "Yard Lead",
          likelihood: 2,
          severity: 4,
          issueDescription: "Hardband segment missing on box end.",
          immediateAction: "Held for rework; customer notified via sales.",
        }),
        normalizeNcr({
          id: "NCR-1003",
          title: "OD wear beyond tolerance",
          serial: "HW-4401",
          status: "In Review",
          date: "2026-04-05",
          assignedDept: "Inspection",
          assignedTo: "Inspection Lead",
          likelihood: 3,
          severity: 2,
          issueDescription: "OD wear measured beyond acceptance criteria.",
          immediateAction: "Pending disposition — dimensional report attached when available.",
        }),
      ]);
    } else {
      /* Upgrade legacy demo rows to full NCR shape */
      try {
        var rawN = storageGet(KEYS.ncrs, []) || [];
        storageSet(KEYS.ncrs, rawN.map(normalizeNcr).filter(Boolean));
      } catch (eN) {}
    }
  }

  /* ========================================================================
   * Theme
   * ======================================================================== */
  function applyTheme(theme) {
    var t = theme === "light" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", t);
    storageSet(KEYS.theme, t);
    var btn = $("#btn-theme");
    if (btn) {
      btn.title = t === "dark" ? "Switch to light mode" : "Switch to dark mode";
    }
  }

  function toggleTheme() {
    var cur = document.documentElement.getAttribute("data-theme") || "dark";
    applyTheme(cur === "dark" ? "light" : "dark");
  }

  /* ========================================================================
   * Breadcrumbs & navigation
   * ======================================================================== */
  function setBreadcrumbs(crumbs) {
    var el = $("#breadcrumb");
    if (!el) return;
    if (!crumbs || !crumbs.length) {
      el.innerHTML = '<span class="crumb-current">Home</span>';
      return;
    }
    var html = "";
    crumbs.forEach(function (c, i) {
      var last = i === crumbs.length - 1;
      if (i > 0) html += '<span class="crumb-sep" aria-hidden="true">/</span>';
      if (!last && c.nav) {
        html +=
          '<button type="button" class="crumb-link" data-nav="' +
          escapeHtml(c.nav) +
          '">' +
          escapeHtml(c.label) +
          "</button>";
      } else {
        html += '<span class="crumb-current">' + escapeHtml(c.label) + "</span>";
      }
    });
    el.innerHTML = html;
    $$(".crumb-link", el).forEach(function (btn) {
      btn.addEventListener("click", function () {
        navigate(btn.getAttribute("data-nav"));
      });
    });
  }

  var LIST_PAGE_SIZE = 20;

  function paginateList(items, page) {
    var list = items || [];
    var total = list.length;
    var pages = Math.max(1, Math.ceil(total / LIST_PAGE_SIZE) || 1);
    var p = parseInt(page, 10) || 1;
    if (p < 1) p = 1;
    if (p > pages) p = pages;
    var start = (p - 1) * LIST_PAGE_SIZE;
    return {
      items: list.slice(start, start + LIST_PAGE_SIZE),
      page: p,
      pages: pages,
      total: total,
      hasPrev: p > 1,
      hasNext: p < pages && total > 0,
    };
  }

  function renderListPager(info) {
    if (!info || (!info.hasPrev && !info.hasNext)) return "";
    var parts = [];
    if (info.hasPrev) {
      parts.push(
        '<a href="#" class="pager-link" data-list-page="' +
          (info.page - 1) +
          '">previous page</a>'
      );
    }
    if (info.hasNext) {
      parts.push(
        '<a href="#" class="pager-link" data-list-page="' +
          (info.page + 1) +
          '">next page</a>'
      );
    }
    return '<nav class="list-pager">' + parts.join('<span class="pager-sep"> · </span>') + "</nav>";
  }

  function bindListPager(root, onPage) {
    if (!root || !onPage) return;
    $$("[data-list-page]", root).forEach(function (link) {
      link.addEventListener("click", function (e) {
        e.preventDefault();
        onPage(parseInt(link.getAttribute("data-list-page"), 10) || 1);
      });
    });
  }

  function ticketIsOpen(d) {
    if (!d) return false;
    if (d.completed) return false;
    var st = String(d.status || "Open");
    return st !== "Completed" && st !== "Closed";
  }

  function navigate(route, params) {
    if (!route) route = "home";
    var parts = String(route).split("?");
    var name = parts[0];
    var prev = state.route;
    var p = params ? deepClone(params) : {};
    if (parts[1]) {
      parts[1].split("&").forEach(function (pair) {
        var kv = pair.split("=");
        if (kv[0]) p[decodeURIComponent(kv[0])] = decodeURIComponent(kv[1] || "");
      });
    }
    if (name === "jobs" && prev !== "jobs") {
      state.jobFilter = { status: "Open" };
      state.jobPage = 1;
    }
    if (name === "equipment" && prev !== "equipment") {
      state.elFilter = { status: "Open" };
      state.elPage = 1;
    }
    if ((name === "tickets" || name === "tickets-delivery") && prev !== "tickets" && prev !== "tickets-delivery") {
      state.ticketsFilter = { status: "Open" };
      state.ticketsPage = 1;
      state.ticketsMode = "delivery";
    }
    if (name === "vendors" && prev !== "vendors") {
      state.vendorFilter = {};
      state.vendorPage = 1;
    }
    if (name === "supplier-score" && prev !== "supplier-score") {
      state.scoreFilter = {};
      state.scorePage = 1;
    }
    if (name === "queue" && prev !== "queue") {
      state.queuePage = 1;
    }
    if (name === "tickets-receiving-search" && prev !== "tickets-receiving-search") {
      state.ticketsFilter = { status: "open" };
      state.ticketsPage = 1;
      state.ticketsMode = "receiving";
    }
    state.route = name;
    state.params = p;
    render();
    window.scrollTo(0, 0);
  }

  /* ========================================================================
   * Routes map
   * ======================================================================== */
  var routes = {
    home: viewHome,
    jobs: viewJobsList,
    "jobs-new": viewJobNew,
    "jobs-detail": viewJobDetail,
    cardex: viewCardex,
    "cardex-results": viewCardexResults,
    "cardex-details": viewCardexDetails,
    "cardex-history": viewCardexHistory,
    "cardex-docs": viewCardexDocs,
    "cardex-util": viewCardexUtil,
    tickets: viewTickets,
    "tickets-delivery": viewTicketsDelivery,
    "tickets-vendor-dt": viewTicketsVendorDtNew,
    "tickets-receiving": viewTicketsReceiving,
    "tickets-receiving-serial": viewTicketsReceivingSerial,
    "tickets-receiving-search": viewTicketsReceivingSearch,
    "tickets-rr-search": viewTicketsRrSearch,
    "tickets-recv-review": viewTicketsRecvReview,
    "tickets-results": viewTicketsResults,
    "tickets-receive": viewTicketsReceive,
    "tickets-rr": viewReceivingReport,
    equipment: viewEquipmentSearch,
    "equipment-new": viewEquipmentNew,
    "equipment-order": viewEquipmentOrder,
    "equipment-dt": viewEquipmentDt,
    vendors: viewVendorsList,
    "vendors-new": viewVendorNew,
    "vendors-detail": viewVendorDetail,
    "supplier-score": viewSupplierScoreList,
    "supplier-score-detail": viewSupplierScoreDetail,
    documents: viewDocuments,
    "documents-lib": viewDocLibrary,
    ncr: viewNcr,
    "ncr-new": viewNcrNew,
    "ncr-detail": viewNcrDetail,
    queue: viewQueue,
    admin: viewAdmin,
    "admin-serials": viewAdminSerials,
    "admin-serial-detail": viewAdminSerialDetail,
    "admin-serial-doc": viewAdminSerialDoc,
  };

  function render() {
    var main = $("#main");
    if (!main) return;
    main.classList.toggle("queue-wide", state.route === "queue");
    main.classList.toggle("util-wide", state.route === "cardex-util");
    var fn = routes[state.route] || viewHome;
    try {
      fn(main);
    } catch (err) {
      console.error(err);
      main.innerHTML =
        '<div class="panel panel-body"><h2>Render error</h2><pre class="mono">' +
        escapeHtml(String(err && err.stack ? err.stack : err)) +
        "</pre></div>";
    }
    updateClock();
  }

  /* ========================================================================
   * THE QUEUE — routing board (layout first; operational links next)
   * ======================================================================== */
  var QUEUE_PAGE_SIZE = 25;
  var QUEUE_PROCESSING_GROUPS = [
    "AD HOC",
    "OUTGOING",
    "RECEIVE FROM JOB",
    "RECEIVE FROM PO",
    "RECEIVE FROM STORE",
    "RECEIVE FROM VENDOR",
    "RECEIVE FROM ANY",
  ];
  var QUEUE_STATUSES = ["ACTIVE", "INACTIVE", "INPROCESS"];
  var QUEUE_WI_STATUSES = ["APPROVED", "PENDING", "REJECTED", "NOT APPLICABLE"];

  function defaultQueueFilter() {
    return {
      master: "",
      second: "",
      processingGroup: "",
      ageDays: 0,
      store: "",
      status: "",
      serial: "",
      wo: "",
      job: "",
      processingDoc: "",
      customer: "",
      rig: "",
      docRef: "",
      wiStatus: "",
      workArea: "",
      routingCategory: "",
      description: "",
      department: "",
      workInstructions: "",
      hideUnreleased: true,
      viewAll: false,
      sort: "created-asc",
      showSummary: false,
    };
  }

  function queueBaseItem(partial) {
    return Object.assign(
      {
        qty: 1,
        remaining: 1,
        store: "LAFAYETTE",
        storeNo: "10",
        status: "ACTIVE",
        jobNo: "2844",
        customer: "SCHLUMBERGER TECHNOLOGY C",
        rig: "OCEAN BLACKRHINO",
        elNo: "30388110",
        dtNo: "10570989",
        rrNo: "32486810",
        wo: "",
        processingDoc: "",
        needDate: "2026-08-19",
        createdAt: "2026-07-07T13:17:00",
        wiStatus: "APPROVED",
        wiDate: "2026-07-07T13:17:00",
        wiNote: "NOT APPLICABLE",
        department: "Superior Inspection Services",
        workArea: "Inspection Shop - Incoming (Step 1)",
        routingCategory: "Return From Job",
        processingGroup: "RECEIVE FROM JOB",
        workInstructions: "DSI CAT3-S",
        released: true,
        ageDays: 55,
      },
      partial || {}
    );
  }

  function loadQueueItems() {
    return [
      queueBaseItem({
        id: "Q-49378",
        master: "PONY COLLARS: NON-MAG",
        second: "PONY COLLAR NON-MAG: 06-3/4\"",
        description: "PONY COLLAR, NON-MAG: 6-3/4\" OD X 2-13/16\" ID X 10' W/ 4-1/2\" IF CONNS.",
        itemCode: "89106750010200",
        serial: "49378",
        processingModule: "DCOLLAR V2",
      }),
      queueBaseItem({
        id: "Q-101084",
        master: "BIT SUBS: STEEL",
        second: "BIT SUBS STEEL",
        description: "BIT SUB, STEEL: 4-1/2\" REG BOX X 4-1/2\" IF BOX",
        itemCode: "80001000329000",
        serial: "101084",
        processingModule: "SUB",
      }),
      queueBaseItem({
        id: "Q-106346",
        master: "CROSSOVER SUBS: STEEL",
        second: "CROSSOVER SUB, STEEL",
        description: "CROSSOVER SUB, STEEL: 5-1/2\" FH BOX X 4-1/2\" IF PIN",
        itemCode: "77005500601400",
        serial: "106346",
        processingModule: "SUB",
      }),
      queueBaseItem({
        id: "Q-106457",
        master: "CROSSOVER SUBS: STEEL",
        second: "CROSSOVER SUB, STEEL",
        description: "CROSSOVER SUB, STEEL: 5-1/2\" FH BOX X 4-1/2\" IF PIN",
        itemCode: "77005500601400",
        serial: "106457",
        processingModule: "SUB",
      }),
      queueBaseItem({
        id: "Q-88101",
        master: "DRILL COLLARS: NON-MAG SLICK",
        second: "DRILL COLLAR NON-MAG: 06-3/4\"",
        description: "DRILL COLLAR, NON-MAG SLICK: 6-3/4\" OD X 2-13/16\" ID X 31'",
        itemCode: "41006750008800",
        serial: "88101",
        processingModule: "DCOLLAR V2",
      }),
      queueBaseItem({
        id: "Q-22011",
        master: "DRILLING JAR PUP JOINTS",
        second: "DRILLING JAR PUP JOINTS: LOWER",
        description: "DRILLING JAR PUP JOINT, LOWER: 6-1/2\" OD X 2-1/4\" ID",
        itemCode: "55220110001100",
        serial: "22011",
        processingModule: "JAR",
      }),
      queueBaseItem({
        id: "Q-22012",
        master: "DRILLING JAR PUP JOINTS",
        second: "DRILLING JAR PUP JOINTS: LOWER",
        description: "DRILLING JAR PUP JOINT, LOWER: 6-1/2\" OD X 2-1/4\" ID",
        itemCode: "55220110001100",
        serial: "22012",
        processingModule: "JAR",
      }),
      queueBaseItem({
        id: "Q-22021",
        master: "DRILLING JAR PUP JOINTS",
        second: "DRILLING JAR PUP JOINTS: UPPER",
        description: "DRILLING JAR PUP JOINT, UPPER: 6-1/2\" OD X 2-1/4\" ID",
        itemCode: "55220110002100",
        serial: "22021",
        processingModule: "JAR",
      }),
      queueBaseItem({
        id: "Q-22022",
        master: "DRILLING JAR PUP JOINTS",
        second: "DRILLING JAR PUP JOINTS: UPPER",
        description: "DRILLING JAR PUP JOINT, UPPER: 6-1/2\" OD X 2-1/4\" ID",
        itemCode: "55220110002100",
        serial: "22022",
        processingModule: "JAR",
      }),
      queueBaseItem({
        id: "Q-77440",
        master: "DRILLING JARS",
        second: "DRILLING JARS: HYDRAULIC",
        description: "DRILLING JAR, HYDRAULIC: 6-1/2\" OD X 2-1/4\" ID",
        itemCode: "55077440000100",
        serial: "77440",
        processingModule: "JAR",
      }),
      queueBaseItem({
        id: "Q-50110",
        master: "PONY COLLARS: STEEL",
        second: "PONY COLLAR STEEL: 06-3/4\"",
        description: "PONY COLLAR, STEEL: 6-3/4\" OD X 2-13/16\" ID X 10' W/ 4-1/2\" IF CONNS.",
        itemCode: "89106750020100",
        serial: "50110",
        processingModule: "DCOLLAR V2",
      }),
      queueBaseItem({
        id: "Q-33001",
        master: "STABILIZERS INTEGRAL: STEEL",
        second: "AUTOTRAK STABILIZER IBNSTEEL: 06-13/16\" - 07-7/8\" HS SPIRAL 3 BLADE",
        description: "AUTOTRAK STABILIZER, STEEL: 06-13/16\" - 07-7/8\" HS SPIRAL 3 BLADE",
        itemCode: "62033001000100",
        serial: "33001",
        processingModule: "STAB",
      }),
      queueBaseItem({
        id: "Q-33002",
        master: "STABILIZERS INTEGRAL: STEEL",
        second: "AUTOTRAK STABILIZER IBNSTEEL: 06-13/16\" - 07-7/8\" HS SPIRAL 3 BLADE",
        description: "AUTOTRAK STABILIZER, STEEL: 06-13/16\" - 07-7/8\" HS SPIRAL 3 BLADE",
        itemCode: "62033001000100",
        serial: "33002",
        processingModule: "STAB",
      }),
      queueBaseItem({
        id: "Q-33003",
        master: "STABILIZERS INTEGRAL: STEEL",
        second: "AUTOTRAK STABILIZER IBNSTEEL: 06-13/16\" - 07-7/8\" HS SPIRAL 3 BLADE",
        description: "AUTOTRAK STABILIZER, STEEL: 06-13/16\" - 07-7/8\" HS SPIRAL 3 BLADE",
        itemCode: "62033001000100",
        serial: "33003",
        processingModule: "STAB",
      }),
      queueBaseItem({
        id: "Q-33110",
        master: "STABILIZERS INTEGRAL: STEEL",
        second: "INTEGRAL BLADE STABILIZER STEEL: 08-1/2\"",
        description: "INTEGRAL BLADE STABILIZER, STEEL: 8-1/2\" OD X 2-13/16\" ID",
        itemCode: "62033110000800",
        serial: "33110",
        processingModule: "STAB",
      }),
      queueBaseItem({
        id: "Q-33111",
        master: "STABILIZERS INTEGRAL: STEEL",
        second: "INTEGRAL BLADE STABILIZER STEEL: 08-1/2\"",
        description: "INTEGRAL BLADE STABILIZER, STEEL: 8-1/2\" OD X 2-13/16\" ID",
        itemCode: "62033110000800",
        serial: "33111",
        processingModule: "STAB",
      }),
      queueBaseItem({
        id: "Q-33112",
        master: "STABILIZERS INTEGRAL: STEEL",
        second: "INTEGRAL BLADE STABILIZER STEEL: 08-1/2\"",
        description: "INTEGRAL BLADE STABILIZER, STEEL: 8-1/2\" OD X 2-13/16\" ID",
        itemCode: "62033110000800",
        serial: "33112",
        processingModule: "STAB",
      }),
      queueBaseItem({
        id: "Q-33201",
        master: "STABILIZERS INTEGRAL: STEEL",
        second: "NEAR BIT STABILIZER STEEL: 12-1/4\"",
        description: "NEAR BIT STABILIZER, STEEL: 12-1/4\" OD SPIRAL",
        itemCode: "62033201001200",
        serial: "33201",
        processingModule: "STAB",
        processingGroup: "RECEIVE FROM VENDOR",
        store: "BROUSSARD",
        storeNo: "12",
      }),
      queueBaseItem({
        id: "Q-33202",
        master: "STABILIZERS INTEGRAL: STEEL",
        second: "NEAR BIT STABILIZER STEEL: 12-1/4\"",
        description: "NEAR BIT STABILIZER, STEEL: 12-1/4\" OD SPIRAL",
        itemCode: "62033201001200",
        serial: "33202",
        processingModule: "STAB",
        processingGroup: "RECEIVE FROM STORE",
      }),
      queueBaseItem({
        id: "Q-33203",
        master: "STABILIZERS INTEGRAL: STEEL",
        second: "STRING STABILIZER STEEL: 08-3/8\"",
        description: "STRING STABILIZER, STEEL: 8-3/8\" OD X 2-13/16\" ID",
        itemCode: "62033203000800",
        serial: "33203",
        processingModule: "STAB",
      }),
      queueBaseItem({
        id: "Q-44001",
        master: "SUBS: NON-MAG",
        second: "DOUBLE PIN SUBS NON-MAG",
        description: "DOUBLE PIN SUB, NON-MAG: 4-1/2\" IF PIN X 4-1/2\" IF PIN",
        itemCode: "77044001000100",
        serial: "44001",
        processingModule: "SUB",
      }),
      queueBaseItem({
        id: "Q-44002",
        master: "SUBS: NON-MAG",
        second: "DOUBLE PIN SUBS NON-MAG",
        description: "DOUBLE PIN SUB, NON-MAG: 4-1/2\" IF PIN X 4-1/2\" IF PIN",
        itemCode: "77044001000100",
        serial: "44002",
        processingModule: "SUB",
      }),
      queueBaseItem({
        id: "Q-44110",
        master: "DRILL COLLAR LIFT SUBS: STEEL",
        second: "DRILL COLLAR LIFT SUBS STEEL",
        description: "DRILL COLLAR LIFT SUB, STEEL: 6-3/4\" X 4-1/2\" IF",
        itemCode: "77044110000100",
        serial: "44110",
        processingModule: "SUB",
        processingGroup: "OUTGOING",
        status: "INPROCESS",
        workArea: "Inspection Shop - Outgoing (Step 4)",
        routingCategory: "Outgoing to Job",
      }),
      queueBaseItem({
        id: "Q-101200",
        master: "BIT SUBS: STEEL",
        second: "BIT SUBS STEEL",
        description: "BIT SUB, STEEL: 6-5/8\" REG BOX X 4-1/2\" IF BOX",
        itemCode: "80001000329110",
        serial: "101200",
        processingModule: "SUB",
        processingGroup: "AD HOC",
        status: "INACTIVE",
        released: false,
        wiStatus: "PENDING",
        wiNote: "AWAITING WI",
      }),
      queueBaseItem({
        id: "Q-55001",
        master: "STABILIZERS INTEGRAL: STEEL",
        second: "AUTOTRAK STABILIZER IBNSTEEL: 06-13/16\" - 07-7/8\" HS SPIRAL 3 BLADE",
        description: "AUTOTRAK STABILIZER, STEEL: 06-13/16\" - 07-7/8\" HS SPIRAL 3 BLADE",
        itemCode: "62033001000100",
        serial: "55001",
        processingModule: "STAB",
        jobNo: "2910",
        elNo: "30389002",
        dtNo: "10572001",
        customer: "CHEVRON",
        rig: "BLACK RHINO",
        needDate: "2026-08-22",
        createdAt: "2026-07-12T09:04:00",
        ageDays: 50,
      }),
      queueBaseItem({
        id: "Q-55002",
        master: "PONY COLLARS: NON-MAG",
        second: "PONY COLLAR NON-MAG: 06-3/4\"",
        description: "PONY COLLAR, NON-MAG: 6-3/4\" OD X 2-13/16\" ID X 15' W/ 4-1/2\" IF CONNS.",
        itemCode: "89106750010215",
        serial: "55002",
        processingModule: "DCOLLAR V2",
        processingGroup: "RECEIVE FROM PO",
        released: false,
        status: "INPROCESS",
      }),
      queueBaseItem({
        id: "Q-66010",
        master: "DRILLING JAR PUP JOINTS",
        second: "DRILLING JAR PUP JOINTS: LOWER",
        description: "DRILLING JAR PUP JOINT, LOWER: 8\" OD X 3\" ID",
        itemCode: "55220110001800",
        serial: "66010",
        processingModule: "JAR",
        store: "HOUMA",
        storeNo: "08",
        processingGroup: "RECEIVE FROM ANY",
        jobNo: "3102",
        customer: "SHELL",
        rig: "DEEPWATER NAUTILUS",
      }),
      queueBaseItem({
        id: "Q-77001",
        master: "SUBS: NON-MAG",
        second: "DOUBLE PIN SUBS NON-MAG",
        description: "DOUBLE PIN SUB, NON-MAG: 6-5/8\" FH PIN X 6-5/8\" FH PIN",
        itemCode: "77044001000600",
        serial: "77001",
        processingModule: "SUB",
        wo: "WO-4412",
        processingDoc: "PD-8821",
      }),
    ];
  }

  function formatQueueShortDate(iso) {
    if (!iso) return "—";
    var p = String(iso).split("T")[0].split("-");
    if (p.length !== 3) return escapeHtml(String(iso));
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var mi = parseInt(p[1], 10) - 1;
    var mon = months[mi] || p[1];
    return mon + "/" + p[2] + "/" + p[0];
  }

  function formatQueueDateTime(iso) {
    if (!iso) return "—";
    var d = new Date(iso);
    if (isNaN(d.getTime())) return formatQueueShortDate(iso);
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var dd = String(d.getDate()).padStart(2, "0");
    var h = d.getHours();
    var ampm = h >= 12 ? "PM" : "AM";
    var h12 = h % 12;
    if (!h12) h12 = 12;
    var mm = String(d.getMinutes()).padStart(2, "0");
    return months[d.getMonth()] + "/" + dd + "/" + d.getFullYear() + " " + String(h12).padStart(2, "0") + ":" + mm + " " + ampm;
  }

  function queueContains(hay, needle) {
    if (!needle) return true;
    return String(hay || "").toLowerCase().indexOf(String(needle).toLowerCase()) !== -1;
  }

  function filterQueueItems(all, f) {
    f = f || defaultQueueFilter();
    return (all || []).filter(function (item) {
      if (f.hideUnreleased && !item.released) return false;
      if (f.master && item.master !== f.master) return false;
      if (f.second && item.second !== f.second) return false;
      if (f.processingGroup && item.processingGroup !== f.processingGroup) return false;
      var age = Number(f.ageDays) || 0;
      if (age && Number(item.ageDays || 0) < age) return false;
      if (f.store && item.store !== f.store) return false;
      if (f.status && item.status !== f.status) return false;
      if (f.serial && !queueContains(item.serial, f.serial)) return false;
      if (f.wo && !queueContains(item.wo, f.wo)) return false;
      if (f.job && !queueContains(item.jobNo, f.job)) return false;
      if (f.processingDoc && !queueContains(item.processingDoc, f.processingDoc)) return false;
      if (f.customer && !queueContains(item.customer, f.customer)) return false;
      if (f.rig && !queueContains(item.rig, f.rig)) return false;
      if (f.docRef) {
        var docs = [item.elNo, item.dtNo, item.rrNo, item.wo, item.processingDoc, item.jobNo].join(" ");
        if (!queueContains(docs, f.docRef)) return false;
      }
      if (f.wiStatus && item.wiStatus !== f.wiStatus) return false;
      if (f.workArea && !queueContains(item.workArea, f.workArea)) return false;
      if (f.routingCategory && !queueContains(item.routingCategory, f.routingCategory)) return false;
      if (f.description && !queueContains(item.description + " " + item.second, f.description)) return false;
      if (f.department && !queueContains(item.department, f.department)) return false;
      if (f.workInstructions && !queueContains(item.workInstructions, f.workInstructions)) return false;
      return true;
    });
  }

  function sortQueueItems(list, sort) {
    var dir = sort === "created-desc" || sort === "need-desc" ? -1 : 1;
    var key = sort && sort.indexOf("need") === 0 ? "needDate" : "createdAt";
    return (list || []).slice().sort(function (a, b) {
      var av = String(a[key] || "");
      var bv = String(b[key] || "");
      if (av === bv) return String(a.serial || "").localeCompare(String(b.serial || ""));
      return av < bv ? -1 * dir : dir;
    });
  }

  function queueCountBy(list, key) {
    var map = {};
    (list || []).forEach(function (item) {
      var k = item[key] || "";
      if (!k) return;
      if (!map[k]) map[k] = 0;
      map[k] += Number(item.qty) || 1;
    });
    return Object.keys(map)
      .sort()
      .map(function (k) {
        return { name: k, qty: map[k] };
      });
  }

  function queueSelectHtml(id, values, selected, allLabel) {
    var html =
      '<select id="' +
      id +
      '" class="queue-select">' +
      '<option value="">' +
      escapeHtml(allLabel) +
      "</option>";
    (values || []).forEach(function (v) {
      html +=
        '<option value="' +
        escapeHtml(v) +
        '"' +
        (selected === v ? " selected" : "") +
        ">" +
        escapeHtml(v) +
        "</option>";
    });
    html += "</select>";
    return html;
  }

  function queueListboxHtml(kind, rows, selected) {
    if (!rows.length) {
      return '<div class="queue-listbox"><div class="queue-listbox-empty">None</div></div>';
    }
    return (
      '<div class="queue-listbox" data-list="' +
      kind +
      '">' +
      rows
        .map(function (row) {
          var sel = selected === row.name ? " selected" : "";
          return (
            '<button type="button" class="queue-list-item' +
            sel +
            '" data-kind="' +
            kind +
            '" data-value="' +
            escapeHtml(row.name) +
            '">' +
            (row.qty != null
              ? '<span class="queue-list-qty">' + escapeHtml(String(row.qty)) + "</span>"
              : "") +
            '<span class="queue-list-name">' +
            escapeHtml(row.name) +
            "</span></button>"
          );
        })
        .join("") +
      "</div>"
    );
  }

  function queueLink(label, extraClass) {
    return (
      '<span class="queue-link' +
      (extraClass ? " " + extraClass : "") +
      '" title="Links will be wired next">' +
      escapeHtml(label) +
      "</span>"
    );
  }

  function queueOpenTag() {
    return '<span class="queue-open">open</span>';
  }

  function renderQueueItem(item) {
    var statusClass = "queue-status-" + String(item.status || "ACTIVE").toLowerCase();
    return (
      '<article class="queue-item">' +
      '<div class="queue-cell queue-cell-need">' +
      '<div class="queue-need-label">Router Need Date</div>' +
      '<div class="queue-need-date">' +
      escapeHtml(formatQueueShortDate(item.needDate)) +
      "</div>" +
      '<div class="queue-store-no">Store ' +
      escapeHtml(item.storeNo || "—") +
      "</div>" +
      '<button type="button" class="queue-icon-btn" title="Message (coming next)" aria-label="Message">' +
      '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true"><path d="M4 6h16v12H4V6zm0 0l8 7 8-7" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>' +
      "</button></div>" +
      '<div class="queue-cell queue-cell-status">' +
      '<div class="queue-status ' +
      statusClass +
      '">' +
      escapeHtml(item.status || "ACTIVE") +
      ' <span class="queue-status-i" title="Status">i</span></div>' +
      '<div class="queue-created"><span>Created:</span> ' +
      escapeHtml(formatQueueDateTime(item.createdAt)) +
      "</div></div>" +
      '<div class="queue-cell queue-cell-flag">' +
      '<button type="button" class="queue-flag" title="Flag (coming next)" aria-label="Flag">⚑</button></div>' +
      '<div class="queue-cell queue-cell-sn">' +
      '<div class="queue-serial">' +
      queueLink(item.serial) +
      "</div>" +
      '<div class="queue-qty-line">Quantity: <strong>' +
      escapeHtml(String(item.qty || 1)) +
      "</strong></div>" +
      '<div class="queue-qty-line">Remaining: <strong>' +
      escapeHtml(String(item.remaining || 1)) +
      "</strong></div></div>" +
      '<div class="queue-cell queue-cell-body">' +
      '<div class="queue-desc">' +
      escapeHtml(item.description || item.second || "—") +
      (item.itemCode ? ' <span class="queue-item-code">(' + escapeHtml(item.itemCode) + ")</span>" : "") +
      "</div>" +
      '<div class="queue-body-grid">' +
      '<div class="queue-refs">' +
      '<div class="queue-ref-col">' +
      '<div><span class="queue-k">JOB:</span> ' +
      queueLink(item.jobNo || "none") +
      (item.jobNo ? " " + queueOpenTag() : "") +
      "</div>" +
      '<div><span class="queue-k">CST:</span> ' +
      escapeHtml(item.customer || "—") +
      "</div>" +
      '<div><span class="queue-k">RIG:</span> ' +
      escapeHtml(item.rig || "—") +
      "</div></div>" +
      '<div class="queue-ref-col">' +
      '<div><span class="queue-k">EL:</span> ' +
      queueLink(item.elNo || "none") +
      (item.elNo ? " " + queueOpenTag() : "") +
      "</div>" +
      '<div><span class="queue-k">DT:</span> ' +
      queueLink(item.dtNo || "none") +
      (item.dtNo ? " " + queueOpenTag() : "") +
      "</div>" +
      '<div><span class="queue-k">RR:</span> ' +
      queueLink(item.rrNo || "none") +
      (item.rrNo ? " " + queueOpenTag() : "") +
      "</div>" +
      '<div><span class="queue-k">WO:</span> ' +
      escapeHtml(item.wo || "none") +
      "</div></div></div>" +
      '<div class="queue-wi">' +
      '<div class="queue-wi-title">Approved WI</div>' +
      '<div>' +
      escapeHtml(formatQueueDateTime(item.wiDate)) +
      "</div>" +
      '<div class="queue-wi-note">' +
      escapeHtml(item.wiNote || "NOT APPLICABLE") +
      "</div></div>" +
      '<div class="queue-work">' +
      '<div><span class="queue-k">Department:</span> ' +
      escapeHtml(item.department || "—") +
      ' <span class="queue-pencil" title="Edit later">✎</span></div>' +
      '<div><span class="queue-k">Work Area:</span> ' +
      escapeHtml(item.workArea || "—") +
      "</div>" +
      '<div><span class="queue-k">Category:</span> ' +
      escapeHtml(item.routingCategory || "—") +
      "</div>" +
      '<div><span class="queue-k">Processing Module:</span> ' +
      escapeHtml(item.processingModule || "—") +
      "</div>" +
      '<div><span class="queue-k">Processing Group:</span> ' +
      escapeHtml(item.processingGroup || "—") +
      "</div>" +
      '<div><span class="queue-k">Work Instructions:</span> <span class="queue-wi-text">' +
      escapeHtml(item.workInstructions || "—") +
      "</span></div></div>" +
      "</div></div></article>"
    );
  }

  function readQueueToolbar(main, extra) {
    var f = Object.assign(defaultQueueFilter(), state.queueFilter || {}, extra || {});
    function v(id) {
      var el = $("#" + id, main);
      return el ? String(el.value || "").trim() : f[id.replace(/^q-/, "")] || "";
    }
    f.ageDays = parseInt(v("q-age"), 10) || 0;
    f.store = $("#q-store", main) ? $("#q-store", main).value : f.store;
    f.status = $("#q-status", main) ? $("#q-status", main).value : f.status;
    f.serial = v("q-sn");
    f.wo = v("q-wo");
    f.job = v("q-job");
    f.processingDoc = v("q-pdoc");
    f.customer = v("q-cst");
    f.rig = v("q-rig");
    f.docRef = v("q-docs");
    f.wiStatus = $("#q-wi", main) ? $("#q-wi", main).value : f.wiStatus;
    f.workArea = v("q-wa");
    f.routingCategory = v("q-cat");
    f.description = v("q-desc");
    f.department = v("q-dept");
    f.workInstructions = v("q-wi-text");
    return f;
  }

  function viewQueue(main) {
    setBreadcrumbs([
      { label: "Home", nav: "home" },
      { label: "The Queue" },
    ]);
    if (!state.queueFilter) state.queueFilter = defaultQueueFilter();
    var f = Object.assign(defaultQueueFilter(), state.queueFilter);
    var all = loadQueueItems();

    var countSource = filterQueueItems(
      all,
      Object.assign({}, f, { master: "", second: "" })
    );
    var masters = queueCountBy(countSource, "master");
    var secondSource = f.master
      ? countSource.filter(function (x) {
          return x.master === f.master;
        })
      : countSource;
    var seconds = queueCountBy(secondSource, "second");
    var groups = QUEUE_PROCESSING_GROUPS.map(function (g) {
      var qty = countSource.reduce(function (n, x) {
        return n + (x.processingGroup === g ? Number(x.qty) || 1 : 0);
      }, 0);
      return { name: g, qty: qty };
    });

    var rows = sortQueueItems(filterQueueItems(all, f), f.sort);
    var totalQty = rows.reduce(function (n, x) {
      return n + (Number(x.qty) || 1);
    }, 0);
    var pageSize = f.viewAll ? Math.max(rows.length, 1) : QUEUE_PAGE_SIZE;
    var pages = Math.max(1, Math.ceil(rows.length / pageSize) || 1);
    var page = parseInt(state.queuePage, 10) || 1;
    if (page < 1) page = 1;
    if (page > pages) page = pages;
    state.queuePage = page;
    var start = (page - 1) * pageSize;
    var pageRows = rows.slice(start, start + pageSize);
    var shownStart = rows.length ? start + 1 : 0;
    var shownEnd = start + pageRows.length;

    var stores = [];
    all.forEach(function (x) {
      if (x.store && stores.indexOf(x.store) === -1) stores.push(x.store);
    });
    stores.sort();

    var summaryHtml = "";
    if (f.showSummary) {
      summaryHtml =
        '<div class="queue-summary"><div class="queue-summary-title">Queue summary</div>' +
        '<table class="queue-summary-table"><thead><tr><th>Master</th><th>Qty</th></tr></thead><tbody>' +
        (masters.length
          ? masters
              .map(function (m) {
                return (
                  "<tr><td>" +
                  escapeHtml(m.name) +
                  '</td><td class="num-cell">' +
                  m.qty +
                  "</td></tr>"
                );
              })
              .join("")
          : '<tr><td colspan="2">No items</td></tr>') +
        "</tbody></table></div>";
    }

    var createdSort = f.sort === "created-desc" ? "▼" : "▲";

    main.innerHTML =
      '<div class="queue-board">' +
      '<div class="queue-banner">The Queue</div>' +
      '<div class="queue-filters">' +
      '<div class="queue-filter-col">' +
      '<label class="queue-filter-label">Master:</label>' +
      queueSelectHtml(
        "q-master",
        masters.map(function (m) {
          return m.name;
        }),
        f.master,
        "All Masters"
      ) +
      queueListboxHtml("master", masters, f.master) +
      "</div>" +
      '<div class="queue-filter-col">' +
      '<label class="queue-filter-label">Second:</label>' +
      queueSelectHtml(
        "q-second",
        seconds.map(function (s) {
          return s.name;
        }),
        f.second,
        "All Seconds"
      ) +
      queueListboxHtml("second", seconds, f.second) +
      "</div>" +
      '<div class="queue-filter-col">' +
      '<label class="queue-filter-label">Processing Group:</label>' +
      queueSelectHtml("q-group", QUEUE_PROCESSING_GROUPS, f.processingGroup, "All Groups") +
      queueListboxHtml("group", groups, f.processingGroup) +
      "</div>" +
      '<div class="queue-filter-col queue-filter-age">' +
      '<label class="queue-filter-label" for="q-age">Age in Day(s)</label>' +
      '<input type="number" id="q-age" class="queue-age" min="0" value="' +
      escapeHtml(String(f.ageDays || 0)) +
      '" />' +
      "</div></div>" +
      '<div class="queue-meta">' +
      '<div><strong>' +
      totalQty +
      '</strong> = Total Qty. <button type="button" class="queue-text-btn" id="q-summary">Show Summary</button></div>' +
      '<div class="queue-meta-right">Search Results — ' +
      rows.length +
      " Found | " +
      shownStart +
      " – " +
      shownEnd +
      " Shown" +
      (page < pages && !f.viewAll
        ? ' | <button type="button" class="queue-text-btn" data-queue-page="' +
          (page + 1) +
          '">View Next ' +
          QUEUE_PAGE_SIZE +
          "</button>"
        : "") +
      (page > 1 && !f.viewAll
        ? ' | <button type="button" class="queue-text-btn" data-queue-page="' +
          (page - 1) +
          '">View Previous ' +
          QUEUE_PAGE_SIZE +
          "</button>"
        : "") +
      ' | <button type="button" class="queue-text-btn' +
      (f.viewAll ? " is-on" : "") +
      '" id="q-viewall">' +
      (f.viewAll ? "View Paged" : "View All") +
      "</button>" +
      ' | <button type="button" class="queue-icon-btn" id="q-refresh" title="Refresh">↻</button>' +
      ' | <button type="button" class="queue-text-btn' +
      (f.hideUnreleased ? " is-on" : "") +
      '" id="q-hide">' +
      (f.hideUnreleased ? "Hide Unreleased" : "Show Unreleased") +
      "</button></div></div>" +
      summaryHtml +
      '<div class="queue-toolbar">' +
      '<div class="queue-tool queue-tool-need">' +
      '<label>Store:</label>' +
      queueSelectHtml("q-store", stores, f.store, "All Stores") +
      "</div>" +
      '<div class="queue-tool queue-tool-status">' +
      "<label>Status:</label>" +
      '<div class="queue-status-search">' +
      queueSelectHtml("q-status", QUEUE_STATUSES, f.status, "ACTIVE/INACTIVE/INPROCESS") +
      '<button type="button" class="queue-search-q" id="q-search" title="Search">Q</button></div></div>' +
      '<div class="queue-tool queue-tool-flag"><span class="queue-col-icon" title="Add">S+</span></div>' +
      '<div class="queue-tool queue-tool-sn"><label>S/N:</label>' +
      '<input type="text" id="q-sn" class="queue-input" value="' +
      escapeHtml(f.serial || "") +
      '" /></div>' +
      '<div class="queue-tool queue-tool-body">' +
      '<div class="queue-tool-refs">' +
      '<label>Work Order: <input type="text" id="q-wo" class="queue-input" value="' +
      escapeHtml(f.wo || "") +
      '" /></label>' +
      '<label>Job: <input type="text" id="q-job" class="queue-input" value="' +
      escapeHtml(f.job || "") +
      '" /></label>' +
      '<label>Rig: <input type="text" id="q-rig" class="queue-input" value="' +
      escapeHtml(f.rig || "") +
      '" /></label>' +
      '<label>Processing Doc: <input type="text" id="q-pdoc" class="queue-input" value="' +
      escapeHtml(f.processingDoc || "") +
      '" /></label>' +
      '<label>Customer: <input type="text" id="q-cst" class="queue-input" value="' +
      escapeHtml(f.customer || "") +
      '" /></label>' +
      '<label>EL, DT, MT, PO, RR: <input type="text" id="q-docs" class="queue-input" value="' +
      escapeHtml(f.docRef || "") +
      '" /></label></div>' +
      '<div class="queue-tool-wi"><label>WI Status/QA:</label>' +
      queueSelectHtml("q-wi", QUEUE_WI_STATUSES, f.wiStatus, "All") +
      "</div>" +
      '<div class="queue-tool-work">' +
      '<label>Work Area: <input type="text" id="q-wa" class="queue-input" value="' +
      escapeHtml(f.workArea || "") +
      '" /></label>' +
      '<label>Description: <input type="text" id="q-desc" class="queue-input" value="' +
      escapeHtml(f.description || "") +
      '" /></label>' +
      '<label>Work Instructions: <input type="text" id="q-wi-text" class="queue-input" value="' +
      escapeHtml(f.workInstructions || "") +
      '" /></label>' +
      '<label>Routing Category: <input type="text" id="q-cat" class="queue-input" value="' +
      escapeHtml(f.routingCategory || "") +
      '" /></label>' +
      '<label>Department: <input type="text" id="q-dept" class="queue-input" value="' +
      escapeHtml(f.department || "") +
      '" /></label></div></div></div>' +
      '<div class="queue-colheads">' +
      '<button type="button" class="queue-colhead" id="q-sort-need">Need Date <span class="queue-pencil">✎</span></button>' +
      '<button type="button" class="queue-colhead" id="q-sort-created">Date Created ' +
      createdSort +
      "</button>" +
      '<div class="queue-colhead queue-colhead-flag"></div>' +
      '<div class="queue-colhead">S/N</div>' +
      '<div class="queue-colhead queue-colhead-body"></div></div>' +
      '<div class="queue-list">' +
      (pageRows.length
        ? pageRows.map(renderQueueItem).join("")
        : '<div class="queue-empty">No items in The Queue match the current filters.</div>') +
      "</div></div>";

    function apply(extra, resetPage) {
      state.queueFilter = readQueueToolbar(main, extra || {});
      if (resetPage) state.queuePage = 1;
      viewQueue(main);
    }

    var masterSel = $("#q-master", main);
    if (masterSel) {
      masterSel.addEventListener("change", function () {
        apply({ master: masterSel.value, second: "" }, true);
      });
    }
    var secondSel = $("#q-second", main);
    if (secondSel) {
      secondSel.addEventListener("change", function () {
        apply({ second: secondSel.value }, true);
      });
    }
    var groupSel = $("#q-group", main);
    if (groupSel) {
      groupSel.addEventListener("change", function () {
        apply({ processingGroup: groupSel.value }, true);
      });
    }
    $$(".queue-list-item", main).forEach(function (btn) {
      btn.addEventListener("click", function () {
        var kind = btn.getAttribute("data-kind");
        var value = btn.getAttribute("data-value") || "";
        var cur = f[kind === "group" ? "processingGroup" : kind] || "";
        var next = cur === value ? "" : value;
        if (kind === "master") apply({ master: next, second: "" }, true);
        else if (kind === "second") apply({ second: next }, true);
        else if (kind === "group") apply({ processingGroup: next }, true);
      });
    });
    var age = $("#q-age", main);
    if (age) {
      age.addEventListener("change", function () {
        apply({ ageDays: parseInt(age.value, 10) || 0 }, true);
      });
    }
    var searchBtn = $("#q-search", main);
    if (searchBtn) {
      searchBtn.addEventListener("click", function () {
        apply({}, true);
      });
    }
    $$(".queue-input", main).forEach(function (inp) {
      inp.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
          e.preventDefault();
          apply({}, true);
        }
      });
    });
    ["q-store", "q-status", "q-wi"].forEach(function (id) {
      var el = $("#" + id, main);
      if (el) {
        el.addEventListener("change", function () {
          apply({}, true);
        });
      }
    });
    var hideBtn = $("#q-hide", main);
    if (hideBtn) {
      hideBtn.addEventListener("click", function () {
        apply({ hideUnreleased: !f.hideUnreleased }, true);
      });
    }
    var viewAllBtn = $("#q-viewall", main);
    if (viewAllBtn) {
      viewAllBtn.addEventListener("click", function () {
        apply({ viewAll: !f.viewAll }, true);
      });
    }
    var sumBtn = $("#q-summary", main);
    if (sumBtn) {
      sumBtn.addEventListener("click", function () {
        apply({ showSummary: !f.showSummary }, false);
      });
    }
    var refreshBtn = $("#q-refresh", main);
    if (refreshBtn) {
      refreshBtn.addEventListener("click", function () {
        apply({}, false);
      });
    }
    $$("[data-queue-page]", main).forEach(function (btn) {
      btn.addEventListener("click", function () {
        state.queueFilter = readQueueToolbar(main);
        state.queuePage = parseInt(btn.getAttribute("data-queue-page"), 10) || 1;
        viewQueue(main);
        window.scrollTo(0, 0);
      });
    });
    var sortCreated = $("#q-sort-created", main);
    if (sortCreated) {
      sortCreated.addEventListener("click", function () {
        apply({ sort: f.sort === "created-asc" ? "created-desc" : "created-asc" }, true);
      });
    }
    var sortNeed = $("#q-sort-need", main);
    if (sortNeed) {
      sortNeed.addEventListener("click", function () {
        apply({ sort: f.sort === "need-asc" ? "need-desc" : "need-asc" }, true);
      });
    }
    $$("[data-nav]", main).forEach(function (b) {
      b.addEventListener("click", function () {
        navigate(b.getAttribute("data-nav"));
      });
    });
  }

  /* ========================================================================
   * HOME
   * ======================================================================== */
  function getHomeOrder() {
    var order = storageGet(KEYS.homeOrder, null);
    var ids = HOME_MODULES.map(function (m) {
      return m.id;
    });
    if (!order || !order.length) return ids;
    var cleaned = order.filter(function (id) {
      return ids.indexOf(id) !== -1;
    });
    ids.forEach(function (id) {
      if (cleaned.indexOf(id) === -1) cleaned.push(id);
    });
    return cleaned;
  }

  function saveHomeOrder(ids) {
    storageSet(KEYS.homeOrder, ids);
  }

  function viewHome(main) {
    setBreadcrumbs([{ label: "Home" }]);
    var order = getHomeOrder();
    var byId = {};
    HOME_MODULES.forEach(function (m) {
      byId[m.id] = m;
    });

    var cards = order
      .map(function (id) {
        var m = byId[id];
        if (!m) return "";
        return (
          '<button type="button" class="module-card" draggable="true" data-module-id="' +
          escapeHtml(m.id) +
          '" data-route="' +
          escapeHtml(m.route) +
          '" title="Click to open · Drag to rearrange">' +
          '<span class="module-drag-hint" aria-hidden="true" title="Drag to rearrange">⠿</span>' +
          '<span class="module-icon" aria-hidden="true">' +
          escapeHtml(m.icon) +
          "</span>" +
          "<h3>" +
          escapeHtml(m.title) +
          "</h3>" +
          "<p>" +
          escapeHtml(m.desc) +
          "</p>" +
          "</button>"
        );
      })
      .join("");

    main.innerHTML =
      '<div class="home-page-header mb-2">' +
      '<div><h1 class="page-title home-title">Modules</h1>' +
      '<p class="page-subtitle home-drag-subtitle">Drag cards to rearrange · order is saved on this computer</p></div>' +
      "</div>" +
      '<div class="modules-grid" id="modules-grid">' +
      cards +
      "</div>";

    bindHomeDrag(main);
  }

  function bindHomeDrag(main) {
    var grid = $("#modules-grid", main);
    if (!grid) return;
    var dragId = null;
    var didDrag = false;

    $$(".module-card", grid).forEach(function (card) {
      card.setAttribute("draggable", "true");

      card.addEventListener("dragstart", function (e) {
        dragId = card.getAttribute("data-module-id");
        didDrag = false;
        card.classList.add("dragging");
        e.dataTransfer.effectAllowed = "move";
        try {
          e.dataTransfer.setData("text/plain", dragId);
          e.dataTransfer.setData("text/module-id", dragId);
        } catch (err) {}
        /* slight delay so browser paints drag image before opacity change */
        setTimeout(function () {
          if (card.classList.contains("dragging")) didDrag = true;
        }, 40);
      });

      card.addEventListener("dragend", function () {
        card.classList.remove("dragging");
        $$(".module-card", grid).forEach(function (c) {
          c.classList.remove("drag-over");
        });
        /* suppress the click that fires after a successful drag */
        setTimeout(function () {
          dragId = null;
          didDrag = false;
        }, 50);
      });

      card.addEventListener("dragover", function (e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        $$(".module-card", grid).forEach(function (c) {
          c.classList.remove("drag-over");
        });
        card.classList.add("drag-over");
      });

      card.addEventListener("dragleave", function (e) {
        /* only clear if leaving the card itself, not a child */
        if (!card.contains(e.relatedTarget)) {
          card.classList.remove("drag-over");
        }
      });

      card.addEventListener("drop", function (e) {
        e.preventDefault();
        e.stopPropagation();
        card.classList.remove("drag-over");
        var from = dragId;
        try {
          from = from || e.dataTransfer.getData("text/module-id") || e.dataTransfer.getData("text/plain");
        } catch (err2) {}
        var to = card.getAttribute("data-module-id");
        if (!from || !to || from === to) return;
        didDrag = true;
        var order = getHomeOrder();
        var fi = order.indexOf(from);
        var ti = order.indexOf(to);
        if (fi < 0 || ti < 0) return;
        order.splice(fi, 1);
        order.splice(ti, 0, from);
        saveHomeOrder(order);
        toast("Module order saved");
        viewHome(main);
      });

      card.addEventListener("click", function (e) {
        if (didDrag || card.classList.contains("dragging")) {
          e.preventDefault();
          e.stopPropagation();
          return;
        }
        var route = card.getAttribute("data-route");
        if (route) navigate(route);
      });
    });
  }

  /* ========================================================================
   * INVENTORY (Cardex)
   * ======================================================================== */
  function viewCardex(main) {
    setBreadcrumbs([
      { label: "Home", nav: "home" },
      { label: "Inventory" },
    ]);
    var masters = loadMasters();
    var saved = state.cardexSerials || [];
    while (saved.length < 20) saved.push("");
    if (saved.length > 20) saved = saved.slice(0, 20);
    state.cardexSerials = saved;

    var ALL_STORES = "__ALL__";
    var locOpts =
      '<option value="">Select location / store</option>' +
      '<option value="' +
      ALL_STORES +
      '">All stores</option>' +
      masters.locations
        .map(function (l) {
          return '<option value="' + escapeHtml(l) + '">' + escapeHtml(l) + "</option>";
        })
        .join("");

    /* 20 serial slots — 2 columns like original cardex (S/N 1–20) */
    var slots = "";
    for (var i = 0; i < 20; i++) {
      slots +=
        '<label class="sn-slot">' +
        '<span class="sn-label">S/N ' +
        (i + 1) +
        "</span>" +
        '<input type="text" class="form-control sn-input" data-sn-idx="' +
        i +
        '" value="' +
        escapeHtml(saved[i] || "") +
        '" autocomplete="off" spellcheck="false" />' +
        "</label>";
    }

    main.innerHTML =
      '<div class="cardex-home">' +
      '<div class="cardex-home-head">' +
      '<div class="cardex-home-titles">' +
      '<p class="cardex-kicker">CARDEX</p>' +
      '<h1 class="page-title">Inventory</h1>' +
      renderCardexSubnav("cardex") +
      "</div>" +
      "</div>" +
      '<div class="cardex-split">' +
      /* LEFT — Serial Number Lookup */
      '<section class="cardex-panel cardex-panel-serial">' +
      '<header class="cardex-panel-head">' +
      "<h2>Serial Number Lookup</h2>" +
      '<div class="cardex-panel-actions">' +
      '<button type="button" class="btn btn-secondary btn-sm" id="cardex-verify">Verify</button>' +
      '<button type="button" class="btn btn-ghost btn-sm" id="cardex-clear">Clear Entries</button>' +
      "</div></header>" +
      '<p class="cardex-hint">Enter serials in the cells, then press <strong>Enter</strong> to open results. <strong>Verify</strong> does the same.</p>' +
      '<div class="sn-grid" id="cardex-sn-grid">' +
      slots +
      "</div>" +
      "</section>" +
      /* RIGHT — Drill Down: Location → Master category → Description */
      '<section class="cardex-panel cardex-panel-drill">' +
      '<header class="cardex-panel-head"><h2>Drill Down Menu</h2></header>' +
      '<div class="cardex-drill-filters cardex-drill-cascade">' +
      '<label class="field"><span>Location</span><select id="cardex-loc" class="form-control">' +
      locOpts +
      "</select></label>" +
      '<label class="field"><span>Master category</span>' +
      '<select id="cardex-master-cat" class="form-control" disabled>' +
      '<option value="">Select location first</option>' +
      "</select></label>" +
      '<label class="field"><span>Description</span>' +
      '<select id="cardex-desc" class="form-control" disabled>' +
      '<option value="">Select master category first</option>' +
      "</select></label>" +
      "</div>" +
      '<div class="cardex-drill-actions">' +
      '<button type="button" class="btn btn-primary" id="cardex-view-results">View Results</button>' +
      "</div>" +
      '<p class="cardex-hint cardex-hint-muted">Choose a store or <strong>All stores</strong>, then master category. Description options come from Master Lists for that category (plus any assets already at that location or anywhere when All stores is selected).</p>' +
      "</section>" +
      "</div></div>";

    function readSlots() {
      var list = [];
      $$(".sn-input", main).forEach(function (inp) {
        var v = (inp.value || "").trim();
        var idx = parseInt(inp.getAttribute("data-sn-idx"), 10);
        list[idx] = v;
      });
      state.cardexSerials = list;
      return list.filter(function (s) {
        return !!s;
      });
    }

    function runVerify() {
      var serials = readSlots();
      if (!serials.length) {
        toast("Enter at least one serial number", "error");
        var first = $(".sn-input", main);
        if (first) first.focus();
        return;
      }
      /* de-dupe preserving order */
      var seen = {};
      var unique = [];
      serials.forEach(function (s) {
        var k = s.toUpperCase();
        if (seen[k]) return;
        seen[k] = true;
        unique.push(s);
      });
      var results = unique.map(function (s) {
        return { query: s, record: findCardexRecord(s) };
      });
      state.cardexResults = { mode: "serial", results: results };
      navigate("cardex-results");
    }

    /* Enter = primary path to results (Verify is secondary) */
    $$(".sn-input", main).forEach(function (inp) {
      inp.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
          e.preventDefault();
          runVerify();
        }
      });
    });

    $("#cardex-verify", main).addEventListener("click", runVerify);
    $("#cardex-clear", main).addEventListener("click", function () {
      $$(".sn-input", main).forEach(function (inp) {
        inp.value = "";
      });
      state.cardexSerials = [];
      var first = $(".sn-input", main);
      if (first) first.focus();
      toast("Entries cleared");
    });

    var locSel = $("#cardex-loc", main);
    var masterCat = $("#cardex-master-cat", main);
    var descSel = $("#cardex-desc", main);

    function isAllStores(loc) {
      return loc === ALL_STORES;
    }

    function assetsAtStore(loc) {
      if (!loc || isAllStores(loc)) return getCardexCatalog();
      return getCardexCatalog().filter(function (a) {
        var aLoc = a.store || a.location || "";
        return aLoc === loc || a.location === loc;
      });
    }

    function refreshMasterCategories() {
      var loc = locSel.value;
      masterCat.innerHTML = "";
      descSel.innerHTML = '<option value="">Select master category first</option>';
      descSel.disabled = true;
      descSel.value = "";

      if (!loc) {
        masterCat.disabled = true;
        masterCat.innerHTML = '<option value="">Select location first</option>';
        return;
      }

      /* Full master category list (also unlocked for All stores) */
      var seen = {};
      var cats = [];
      (masters.categories || []).forEach(function (c) {
        var name = String(c || "").trim();
        if (!name || seen[name]) return;
        seen[name] = true;
        cats.push(name);
      });
      assetsAtStore(loc).forEach(function (a) {
        var c = (a.category || "").trim();
        if (!c || seen[c]) return;
        seen[c] = true;
        cats.push(c);
      });
      cats.sort(function (a, b) {
        return a.localeCompare(b);
      });

      masterCat.disabled = false;
      masterCat.innerHTML =
        '<option value="">Select master category</option>' +
        cats
          .map(function (c) {
            return '<option value="' + escapeHtml(c) + '">' + escapeHtml(c) + "</option>";
          })
          .join("");
    }

    function refreshDescriptions() {
      var loc = locSel.value;
      var cat = masterCat.value;
      descSel.innerHTML = "";
      if (!loc || !cat) {
        descSel.disabled = true;
        descSel.innerHTML = '<option value="">Select master category first</option>';
        return;
      }

      /* Master list descriptions for this category first, then any matching assets (store or all) */
      var seen = {};
      var descs = [];
      getDescriptionsForCategory(cat).forEach(function (d) {
        var name = String(d || "").trim();
        if (!name || seen[name]) return;
        seen[name] = true;
        descs.push(name);
      });
      assetsAtStore(loc).forEach(function (a) {
        if (a.category !== cat) return;
        var d = (a.description || "").trim();
        if (!d || seen[d]) return;
        seen[d] = true;
        descs.push(d);
      });
      descs.sort(function (a, b) {
        return a.localeCompare(b);
      });

      descSel.disabled = false;
      if (!descs.length) {
        descSel.innerHTML =
          '<option value="">No descriptions for this category — add under Master Lists</option>';
        return;
      }
      descSel.innerHTML =
        '<option value="">All descriptions for category</option>' +
        descs
          .map(function (d) {
            return '<option value="' + escapeHtml(d) + '">' + escapeHtml(d) + "</option>";
          })
          .join("");
    }

    locSel.addEventListener("change", function () {
      refreshMasterCategories();
    });
    masterCat.addEventListener("change", function () {
      refreshDescriptions();
    });

    $("#cardex-view-results", main).addEventListener("click", function () {
      readSlots();
      var loc = locSel.value;
      var cat = masterCat.value;
      var desc = descSel.value;
      if (!loc) {
        toast("Select a location or All stores first", "error");
        locSel.focus();
        return;
      }
      var allStores = isAllStores(loc);
      var filtered = getCardexCatalog().filter(function (a) {
        if (!allStores) {
          var aLoc = a.store || a.location || "";
          if (aLoc !== loc && a.location !== loc) return false;
        }
        if (cat && a.category !== cat) return false;
        if (desc && a.description !== desc) return false;
        return true;
      });
      if (!filtered.length) {
        toast("No assets match this drill-down", "info");
        return;
      }
      state.cardexResults = {
        mode: "serial",
        title: allStores
          ? "All stores" + (cat ? " · " + cat : "")
          : loc + (cat ? " · " + cat : ""),
        results: filtered.map(function (a) {
          return { query: a.serial, record: a };
        }),
      };
      navigate("cardex-results");
    });

    $$("[data-nav]", main).forEach(function (b) {
      b.addEventListener("click", function () {
        navigate(b.getAttribute("data-nav"));
      });
    });

    var firstEmpty = null;
    $$(".sn-input", main).forEach(function (inp) {
      if (!firstEmpty && !(inp.value || "").trim()) firstEmpty = inp;
    });
    if (firstEmpty) firstEmpty.focus();
    else {
      var f = $(".sn-input", main);
      if (f) f.focus();
    }
  }

  function renderCardexSubnav(active) {
    function link(route, label, key) {
      return (
        '<button type="button" class="cardex-subnav-link' +
        (active === key ? " is-active" : "") +
        '" data-nav="' +
        route +
        '">' +
        label +
        "</button>"
      );
    }
    return (
      '<nav class="cardex-subnav" aria-label="Inventory links">' +
      link("home", "Home", "home") +
      '<span class="cardex-subnav-sep">|</span>' +
      link("cardex", "Cardex", "cardex") +
      '<span class="cardex-subnav-sep">|</span>' +
      link("cardex-util", "Daily Utilization", "util") +
      "</nav>"
    );
  }

  /* ========================================================================
   * Daily Utilization — factual counts from Serial Number master + DT history
   * ======================================================================== */
  function defaultUtilFilter() {
    return {
      store: "",
      master: "",
      second: "",
      minor: "",
      period: "current",
      start: "",
      end: "",
      showNewOnly: false,
      submitted: true,
    };
  }

  function utilIsoDay(v) {
    if (!v) return "";
    var s = String(v);
    if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
    var d = new Date(s);
    if (isNaN(d.getTime())) return "";
    var m = String(d.getMonth() + 1).padStart(2, "0");
    var day = String(d.getDate()).padStart(2, "0");
    return d.getFullYear() + "-" + m + "-" + day;
  }

  function utilDayNum(iso) {
    var p = String(iso || "").slice(0, 10).split("-");
    if (p.length !== 3) return NaN;
    return Date.UTC(parseInt(p[0], 10), parseInt(p[1], 10) - 1, parseInt(p[2], 10)) / 86400000;
  }

  function utilOverlapDays(a1, a2, b1, b2) {
    if (!a1 || !a2 || !b1 || !b2) return 0;
    var s = a1 > b1 ? a1 : b1;
    var e = a2 < b2 ? a2 : b2;
    if (s > e) return 0;
    var n = utilDayNum(e) - utilDayNum(s);
    if (isNaN(n)) return 0;
    return n + 1;
  }

  function utilShiftDay(iso, days) {
    var n = utilDayNum(iso);
    if (isNaN(n)) return iso;
    var d = new Date((n + days) * 86400000);
    var m = String(d.getUTCMonth() + 1).padStart(2, "0");
    var day = String(d.getUTCDate()).padStart(2, "0");
    return d.getUTCFullYear() + "-" + m + "-" + day;
  }

  function utilDtOnRentStart(dt) {
    if (!dt) return "";
    return dt.shipDate || dt.onRentDate || dt.createdAt || "";
  }

  function utilRrHasSerial(r, serial) {
    if (!r || !serial) return false;
    var key = String(serial).trim().toUpperCase();
    var hit = false;
    (r.serials || []).forEach(function (s) {
      var sn = typeof s === "string" ? s : s && (s.serial || s.serialNumber);
      if (String(sn || "").toUpperCase() === key) hit = true;
    });
    (r.lines || []).forEach(function (ln) {
      if (!ln) return;
      if (String(ln.serial || ln.serialNumber || "").toUpperCase() === key) hit = true;
    });
    return hit;
  }

  /** Return date is the receiving ticket only — never DT completedAt (that is issue, not return). */
  function utilRrDateForSerialOnDt(dt, serial) {
    if (!dt || !serial) return { at: "", rrLabel: "" };
    var key = String(serial).trim().toUpperCase();
    var rec =
      (dt.receivedSerials && (dt.receivedSerials[key] || dt.receivedSerials[serial])) || null;
    var at = rec && rec.at ? rec.at : "";
    var rrLabel = rec && rec.rrLabel ? String(rec.rrLabel) : "";
    getRrsForDt(dt.dtNo || dt.id).forEach(function (r) {
      if (!utilRrHasSerial(r, serial)) return;
      var when = r.createdAt || r.returnDate || "";
      if (!when) return;
      if (!at || utilIsoDay(when) < utilIsoDay(at)) {
        at = when;
        rrLabel = String(r.rrLabel || r.rrNo || rrLabel);
      } else if (!rrLabel) {
        rrLabel = String(r.rrLabel || r.rrNo || "");
      }
    });
    return { at: at, rrLabel: rrLabel };
  }

  function buildUtilOutIndex() {
    var bySerial = {};
    function add(sn, start, end, kind, extra) {
      var k = String(sn || "").trim().toUpperCase();
      if (!k) return;
      var s = utilIsoDay(start);
      if (!s) return;
      var open = !end;
      var e = utilIsoDay(end) || todayISO();
      if (e < s) e = s;
      extra = extra || {};
      if (!bySerial[k]) bySerial[k] = [];
      bySerial[k].push({
        start: s,
        end: e,
        open: open,
        kind: kind || "rent",
        dtNo: extra.dtNo || "",
        rrLabel: extra.rrLabel || "",
        days: utilOverlapDays(s, e, s, e),
      });
    }
    loadDts().forEach(function (dt) {
      if (!dt) return;
      var start = utilDtOnRentStart(dt);
      var kind = (dt.destType || "") === "vendor" ? "vendor" : "rent";
      var dtNo = formatDtNo(dt.dtNo || dt.id);
      dtAllSerials(dt).forEach(function (sn) {
        var rr = utilRrDateForSerialOnDt(dt, sn);
        add(sn, start, rr.at, kind, { dtNo: dtNo, rrLabel: rr.rrLabel });
      });
    });
    return bySerial;
  }

  function utilIntervals(index, serial) {
    if (!index) return [];
    return index[String(serial || "").trim().toUpperCase()] || [];
  }

  function utilWasOutInRange(serial, index, start, end, kind) {
    var hits = utilIntervals(index, serial);
    var a = start || "0000-01-01";
    var b = end || todayISO();
    for (var i = 0; i < hits.length; i++) {
      if (kind && hits[i].kind !== kind) continue;
      if (utilOverlapDays(hits[i].start, hits[i].end, a, b) > 0) return true;
    }
    return false;
  }

  function utilIsCurrentlyOnRent(serial, index) {
    return utilIntervals(index, serial).some(function (iv) {
      return iv.kind === "rent" && iv.open;
    });
  }

  function utilIsCurrentlyAtVendor(serial, index) {
    return utilIntervals(index, serial).some(function (iv) {
      return iv.kind === "vendor" && iv.open;
    });
  }

  function utilAvgOutCount(serials, index, windowStart, windowEnd) {
    if (!serials || !serials.length) return 0;
    var span = utilOverlapDays(windowStart, windowEnd, windowStart, windowEnd);
    if (!span) return 0;
    var total = 0;
    serials.forEach(function (sn) {
      utilIntervals(index, sn).forEach(function (iv) {
        if (iv.kind && iv.kind !== "rent") return;
        total += utilOverlapDays(iv.start, iv.end, windowStart, windowEnd);
      });
    });
    return total / span;
  }

  function utilIsNewAsset(asset) {
    var blob = String(asset.condition || "") + " " + String(asset.lastInspectionStatus || "");
    if (/\bnew\b/i.test(blob)) return true;
    if (asset.dateInService) return false;
    var purchased = utilIsoDay(asset.datePurchased);
    if (!purchased) return false;
    var cutoff = utilShiftDay(todayISO(), -90);
    return purchased >= cutoff;
  }

  function utilClassifyAsset(asset, index, f) {
    var sn = asset.serial;
    var vendorNow = utilIsCurrentlyAtVendor(sn, index);
    var onRent = false;
    if (!f || f.period !== "range") {
      onRent = utilIsCurrentlyOnRent(sn, index);
      if (!onRent && !vendorNow && serialIsCurrentlyOut(sn)) onRent = true;
    } else {
      onRent = utilWasOutInRange(sn, index, f.start, f.end, "rent");
    }
    if (onRent) return "working";
    if (vendorNow) return "inspection";
    if (asset.retirementDate) return "nr";
    var blob = [
      asset.condition,
      asset.lastInspectionStatus,
      asset.notes,
    ]
      .join(" ")
      .toLowerCase();
    if (/\b(inspect|repair|in shop|machine shop)\b/.test(blob)) return "inspection";
    if (/\b(n\/r|not ready|non-?ready|condemned|scrap|unserviceable|damaged)\b/.test(blob)) return "nr";
    if (/\bhold\b/.test(blob)) return "hold";
    if (/\bexcess\b/.test(blob)) return "excess";
    if (utilIsNewAsset(asset)) return "new";
    return "available";
  }

  function utilEmptyCounts() {
    return {
      total: 0,
      working: 0,
      available: 0,
      inspection: 0,
      nr: 0,
      neu: 0,
      hold: 0,
      excess: 0,
      serials: [],
      notes: [],
      windows: [],
    };
  }

  function utilFormatWindow(w) {
    if (!w) return "";
    var dtBit = (w.dtNo ? "DT " + formatDtNo(w.dtNo) + " " : "") + formatDate(w.start);
    if (w.open) return dtBit + " → still out";
    var rrBit = (w.rrLabel ? "RR " + w.rrLabel + " " : "") + formatDate(w.end);
    return dtBit + " → " + rrBit;
  }

  function utilAddAsset(counts, asset, bucket, windows) {
    counts.total += 1;
    if (bucket === "working") counts.working += 1;
    else if (bucket === "available") counts.available += 1;
    else if (bucket === "inspection") counts.inspection += 1;
    else if (bucket === "nr") counts.nr += 1;
    else if (bucket === "new") counts.neu += 1;
    else if (bucket === "hold") counts.hold += 1;
    else if (bucket === "excess") counts.excess += 1;
    else counts.available += 1;
    if (asset && asset.serial) counts.serials.push(asset.serial);
    var note = String((asset && asset.notes) || "").trim();
    if (note && counts.notes.indexOf(note) === -1) counts.notes.push(note);
    (windows || []).forEach(function (w) {
      if (w && w.kind === "rent") counts.windows.push(w);
    });
  }

  function utilPct(working, total) {
    if (!total) return "0.00%";
    return ((working / total) * 100).toFixed(2) + "%";
  }

  function utilFmtAvg(n) {
    return (Number(n) || 0).toFixed(2);
  }

  function utilOptionList(values, selected, allLabel) {
    var html = '<option value="">' + escapeHtml(allLabel) + "</option>";
    (values || []).forEach(function (v) {
      html +=
        '<option value="' +
        escapeHtml(v) +
        '"' +
        (selected === v ? " selected" : "") +
        ">" +
        escapeHtml(v) +
        "</option>";
    });
    return html;
  }

  function utilUniqueFromAssets(assets, getter) {
    var seen = {};
    var out = [];
    (assets || []).forEach(function (a) {
      var v = String(getter(a) || "").trim();
      if (!v || seen[v]) return;
      seen[v] = true;
      out.push(v);
    });
    out.sort(function (a, b) {
      return a.localeCompare(b, undefined, { sensitivity: "base" });
    });
    return out;
  }

  function utilComment(counts) {
    if (counts && counts.windows && counts.windows.length) {
      var seen = {};
      var parts = [];
      counts.windows.forEach(function (w) {
        var txt = utilFormatWindow(w);
        if (!txt || seen[txt]) return;
        seen[txt] = true;
        parts.push(txt);
      });
      if (parts.length > 3) {
        return parts.slice(0, 3).join("; ") + " … +" + (parts.length - 3);
      }
      if (parts.length) return parts.join("; ");
    }
    if (!counts || !counts.notes || !counts.notes.length) return "";
    if (counts.notes.length === 1) return counts.notes[0];
    return counts.notes.length + " notes";
  }

  function utilMergeCounts(into, from) {
    if (!from) return into;
    into.total += from.total || 0;
    into.working += from.working || 0;
    into.available += from.available || 0;
    into.inspection += from.inspection || 0;
    into.nr += from.nr || 0;
    into.neu += from.neu || 0;
    into.hold += from.hold || 0;
    into.excess += from.excess || 0;
    into.serials = (into.serials || []).concat(from.serials || []);
    into.windows = (into.windows || []).concat(from.windows || []);
    (from.notes || []).forEach(function (n) {
      if (n && into.notes.indexOf(n) === -1) into.notes.push(n);
    });
    return into;
  }

  function viewCardexUtil(main) {
    setBreadcrumbs([
      { label: "Home", nav: "home" },
      { label: "Inventory", nav: "cardex" },
      { label: "Daily Utilization" },
    ]);
    if (!state.utilFilter) state.utilFilter = defaultUtilFilter();
    var f = Object.assign(defaultUtilFilter(), state.utilFilter);
    var catalog = getCardexCatalog();
    var index = buildUtilOutIndex();
    var yearStart = utilShiftDay(todayISO(), -364);
    var yearEnd = todayISO();
    var mastersData = loadMasters();
    var masterCats = uniqStrings(mastersData.categories || []);
    var catSet = {};
    masterCats.forEach(function (c) {
      catSet[c] = true;
    });
    var descByCat = {};
    masterCats.forEach(function (c) {
      descByCat[c] = getDescriptionsForCategory(c);
    });
    function descAllowed(cat, desc) {
      var list = descByCat[cat] || [];
      var d = String(desc || "").trim();
      if (!d) return false;
      if (list.indexOf(d) !== -1) return true;
      var dl = d.toLowerCase();
      return list.some(function (x) {
        return String(x).toLowerCase() === dl;
      });
    }
    function onMasterList(a) {
      var cat = String(a.category || "").trim();
      var desc = String(a.description || "").trim();
      if (!cat || !desc || !catSet[cat]) return false;
      return descAllowed(cat, desc);
    }

    function inStore(a) {
      if (!f.store) return true;
      var loc = a.store || a.location || "";
      return loc === f.store;
    }
    var listed = catalog.filter(onMasterList);
    var storePool = listed.filter(inStore);
    var stores = uniqStrings(
      (mastersData.locations || []).concat(
        utilUniqueFromAssets(listed, function (a) {
          return a.store || a.location || "";
        })
      )
    );
    var masters = masterCats.slice();
    var seconds = f.master
      ? (descByCat[f.master] || []).slice()
      : uniqStrings(
          masterCats.reduce(function (acc, c) {
            return acc.concat(descByCat[c] || []);
          }, [])
        );
    var minorPool = storePool.filter(function (a) {
      if (f.master && a.category !== f.master) return false;
      if (f.second && a.description !== f.second) return false;
      return true;
    });
    var minors = utilUniqueFromAssets(minorPool, function (a) {
      return a.itemNo || "";
    });

    var filtered = listed.filter(function (a) {
      if (!inStore(a)) return false;
      if (f.master && a.category !== f.master) return false;
      if (f.second && a.description !== f.second) return false;
      if (f.minor && String(a.itemNo || "") !== f.minor) return false;
      return true;
    });

    var classified = filtered.map(function (a) {
      var bucket = utilClassifyAsset(a, index, f);
      return { asset: a, bucket: bucket };
    });
    if (f.showNewOnly) {
      classified = classified.filter(function (row) {
        return row.bucket === "new" || utilIsNewAsset(row.asset);
      });
    }

    var groups = [];
    var groupMap = {};
    classified.forEach(function (row) {
      var a = row.asset;
      var master = a.category || "(No master category)";
      var second = a.description || "(No description)";
      var minor = String(a.itemNo || "").trim() || "—";
      var loc = a.store || a.location || "—";
      var key = master + "\0" + second + "\0" + minor + "\0" + loc;
      if (!groupMap[key]) {
        groupMap[key] = {
          master: master,
          second: second,
          minor: minor,
          location: loc,
          counts: utilEmptyCounts(),
        };
        groups.push(groupMap[key]);
      }
      utilAddAsset(
        groupMap[key].counts,
        a,
        row.bucket,
        utilIntervals(index, a.serial)
      );
    });
    groups.sort(function (a, b) {
      return (
        a.master.localeCompare(b.master, undefined, { sensitivity: "base" }) ||
        a.second.localeCompare(b.second, undefined, { sensitivity: "base" }) ||
        a.minor.localeCompare(b.minor, undefined, { sensitivity: "base" }) ||
        a.location.localeCompare(b.location, undefined, { sensitivity: "base" })
      );
    });

    function countsRowHtml(labelMinor, location, description, counts, rowClass, serials) {
      var avg = utilAvgOutCount(counts.serials, index, yearStart, yearEnd);
      var serialAttr = (serials || counts.serials || []).join(",");
      return (
        '<tr class="' +
        rowClass +
        '" data-util-serials="' +
        escapeHtml(serialAttr) +
        '">' +
        '<td class="mono">' +
        escapeHtml(labelMinor) +
        "</td>" +
        "<td>" +
        escapeHtml(location || "") +
        "</td>" +
        '<td class="wrap-cell">' +
        escapeHtml(description) +
        "</td>" +
        '<td class="num-cell">' +
        counts.total +
        "</td>" +
        '<td class="num-cell util-working">' +
        counts.working +
        "</td>" +
        '<td class="num-cell">' +
        counts.available +
        "</td>" +
        '<td class="num-cell">' +
        utilPct(counts.working, counts.total) +
        "</td>" +
        '<td class="num-cell">' +
        counts.inspection +
        "</td>" +
        '<td class="num-cell">' +
        counts.nr +
        "</td>" +
        '<td class="num-cell">' +
        counts.neu +
        "</td>" +
        '<td class="num-cell">' +
        counts.hold +
        "</td>" +
        '<td class="num-cell">' +
        counts.excess +
        "</td>" +
        '<td class="num-cell">' +
        utilFmtAvg(avg) +
        "</td></tr>"
      );
    }

    var body = groups
      .map(function (g) {
        return countsRowHtml(g.minor, g.location, g.second, g.counts, "util-detail");
      })
      .join("");

    var periodHint =
      f.period === "range" && f.start && f.end
        ? "On rent anytime " + formatDate(f.start) + " – " + formatDate(f.end) + " (DT ship → RR return)"
        : "Currently on rent = customer DT with no receiving report yet";

    main.innerHTML =
      '<div class="util-page">' +
      '<div class="util-head">' +
      "<div>" +
      '<p class="cardex-kicker">CARDEX</p>' +
      '<h1 class="page-title">Daily Utilization Report</h1>' +
      renderCardexSubnav("util") +
      '<p class="page-subtitle">Serials on the Master category and Description lists only — ' +
      escapeHtml(periodHint) +
      ". 1-yr avg out is the average number of these serials on rent per day over the last 365 days.</p>" +
      "</div></div>" +
      '<form class="util-filters" id="util-form">' +
      '<label class="util-field"><span>Store</span><select id="util-store" class="form-control">' +
      utilOptionList(stores, f.store, "ALL") +
      "</select></label>" +
      '<label class="util-field"><span>Master</span><select id="util-master" class="form-control">' +
      utilOptionList(masters, f.master, "ALL") +
      "</select></label>" +
      '<label class="util-field util-field-wide"><span>Second</span><select id="util-second" class="form-control">' +
      utilOptionList(seconds, f.second, "ALL") +
      "</select></label>" +
      '<label class="util-field"><span>Minor</span><select id="util-minor" class="form-control">' +
      utilOptionList(minors, f.minor, "ALL") +
      "</select></label>" +
      '<label class="util-field"><span>Period</span><select id="util-period" class="form-control">' +
      '<option value="current"' +
      (f.period !== "range" ? " selected" : "") +
      ">Currently</option>" +
      '<option value="range"' +
      (f.period === "range" ? " selected" : "") +
      ">Date range</option></select></label>" +
      '<label class="util-field util-range"' +
      (f.period === "range" ? "" : " hidden") +
      '><span>From</span><input type="date" id="util-start" class="form-control" value="' +
      escapeHtml(f.start || "") +
      '" /></label>' +
      '<label class="util-field util-range"' +
      (f.period === "range" ? "" : " hidden") +
      '><span>To</span><input type="date" id="util-end" class="form-control" value="' +
      escapeHtml(f.end || "") +
      '" /></label>' +
      '<div class="util-field util-submit-wrap"><span>&nbsp;</span>' +
      '<button type="submit" class="btn btn-primary" id="util-submit">Submit</button></div>' +
      "</form>" +
      '<div class="util-checks">' +
      '<label class="util-check"><input type="checkbox" id="util-new-only"' +
      (f.showNewOnly ? " checked" : "") +
      " /> Show only new assets</label>" +
      "</div>" +
      '<div class="table-wrap util-table-wrap"><table class="table util-table"><thead><tr>' +
      "<th>Minor</th><th>Location</th><th>Description</th>" +
      "<th>Total assets</th><th>Assets working</th><th>Available</th><th>% Working</th>" +
      "<th>Inspection / repair</th><th>N/R</th><th>New</th><th>Hold</th><th>Excess</th>" +
      "<th>1 yr avg out</th>" +
      "</tr></thead><tbody>" +
      (body ||
        '<tr><td colspan="13" class="table-empty">No serials match the Master category / Description lists for these filters.</td></tr>') +
      "</tbody></table></div>" +
      '<p class="util-legend">Working = on a customer delivery ticket that has not been returned on a receiving report. Days on rent run from the DT ship date to the RR date (or today if still out). Vendor DTs count as inspection / repair, not utilization. Click a row to open those serials in Cardex.</p>' +
      "</div>";

    function readFilter(extra) {
      var next = Object.assign(defaultUtilFilter(), f, extra || {});
      next.store = $("#util-store", main) ? $("#util-store", main).value : next.store;
      next.master = $("#util-master", main) ? $("#util-master", main).value : next.master;
      next.second = $("#util-second", main) ? $("#util-second", main).value : next.second;
      next.minor = $("#util-minor", main) ? $("#util-minor", main).value : next.minor;
      next.period = $("#util-period", main) ? $("#util-period", main).value : next.period;
      next.start = $("#util-start", main) ? $("#util-start", main).value : next.start;
      next.end = $("#util-end", main) ? $("#util-end", main).value : next.end;
      next.showNewOnly = $("#util-new-only", main) ? $("#util-new-only", main).checked : next.showNewOnly;
      return next;
    }

    function apply(extra, resetChildren) {
      var next = readFilter(extra);
      if (resetChildren === "master") {
        next.second = "";
        next.minor = "";
      } else if (resetChildren === "second") {
        next.minor = "";
      }
      if (next.period === "range") {
        if (!next.start || !next.end) {
          toast("Choose a From and To date for the range", "error");
          return;
        }
        if (next.start > next.end) {
          toast("From date must be on or before To date", "error");
          return;
        }
      }
      state.utilFilter = next;
      viewCardexUtil(main);
    }

    var form = $("#util-form", main);
    if (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        apply({}, false);
      });
    }
    var storeSel = $("#util-store", main);
    if (storeSel) {
      storeSel.addEventListener("change", function () {
        apply({}, false);
      });
    }
    var masterSel = $("#util-master", main);
    if (masterSel) {
      masterSel.addEventListener("change", function () {
        apply({}, "master");
      });
    }
    var secondSel = $("#util-second", main);
    if (secondSel) {
      secondSel.addEventListener("change", function () {
        apply({}, "second");
      });
    }
    var periodSel = $("#util-period", main);
    if (periodSel) {
      periodSel.addEventListener("change", function () {
        var range = periodSel.value === "range";
        $$(".util-range", main).forEach(function (el) {
          if (range) el.removeAttribute("hidden");
          else el.setAttribute("hidden", "");
        });
        if (range) {
          if (!$("#util-start", main).value) $("#util-start", main).value = todayISO();
          if (!$("#util-end", main).value) $("#util-end", main).value = todayISO();
        }
      });
    }
    ["util-new-only"].forEach(function (id) {
      var el = $("#" + id, main);
      if (el) {
        el.addEventListener("change", function () {
          apply({}, false);
        });
      }
    });
    $$("[data-nav]", main).forEach(function (b) {
      b.addEventListener("click", function () {
        navigate(b.getAttribute("data-nav"));
      });
    });
    $$("[data-util-serials]", main).forEach(function (row) {
      row.addEventListener("click", function () {
        var raw = row.getAttribute("data-util-serials") || "";
        var serials = raw.split(",").map(function (s) {
          return s.trim();
        }).filter(Boolean);
        if (!serials.length) return;
        var seen = {};
        var results = [];
        serials.forEach(function (s) {
          var k = s.toUpperCase();
          if (seen[k]) return;
          seen[k] = true;
          results.push({ query: s, record: findCardexRecord(s) });
        });
        state.cardexResults = {
          mode: "serial",
          title: "Daily Utilization serials",
          results: results,
        };
        navigate("cardex-results");
      });
    });
  }

  function renderCardexSerialChips(main) {
    /* legacy helper — chips UI replaced by 20-slot grid on cardex home */
    var host = $("#cardex-serial-chips", main);
    if (!host) return;
    host.innerHTML = (state.cardexSerials || [])
      .filter(function (s) {
        return !!s;
      })
      .map(function (s, i) {
        return (
          '<span class="chip">' +
          escapeHtml(s) +
          ' <button type="button" data-idx="' +
          i +
          '" aria-label="Remove">&times;</button></span>'
        );
      })
      .join("");
  }

  function viewCardexResults(main) {
    setBreadcrumbs([
      { label: "Home", nav: "home" },
      { label: "Inventory", nav: "cardex" },
      { label: "Results" },
    ]);

    if (state.cardexResults && state.cardexResults.mode === "serial") {
      renderSerialResults(main);
      return;
    }

    var filter = state.cardexFilter || {};
    var catalog = getCardexCatalog().filter(function (a) {
      if (filter.location && a.location !== filter.location) return false;
      if (filter.category && a.category !== filter.category) return false;
      if (filter.description && a.description !== filter.description) return false;
      return true;
    });

    if (filter.step === "desc" && !filter.description) {
      var descMap = {};
      catalog.forEach(function (a) {
        var d = a.description || "(No description)";
        descMap[d] = (descMap[d] || 0) + 1;
      });
      var descs = Object.keys(descMap).sort();
      main.innerHTML =
        '<div class="page-header"><div><h1 class="page-title">Descriptions</h1>' +
        '<p class="page-subtitle">' +
        escapeHtml([filter.location || "All locations", filter.category || "All categories"].join(" · ")) +
        "</p></div>" +
        '<button type="button" class="btn btn-ghost" data-nav="cardex">Back</button></div>' +
        '<div class="panel"><ul class="drill-list">' +
        (descs.length
          ? descs
              .map(function (d) {
                return (
                  '<li><button type="button" class="drill-item" data-desc="' +
                  escapeHtml(d) +
                  '"><span>' +
                  escapeHtml(d) +
                  '</span><span class="count">' +
                  descMap[d] +
                  "</span></button></li>"
                );
              })
              .join("")
          : '<li class="empty-state">No assets match this filter.</li>') +
        "</ul></div>";
      $$("[data-nav]", main).forEach(function (b) {
        b.addEventListener("click", function () {
          navigate(b.getAttribute("data-nav"));
        });
      });
      $$("[data-desc]", main).forEach(function (b) {
        b.addEventListener("click", function () {
          state.cardexFilter.description = b.getAttribute("data-desc");
          state.cardexFilter.step = "assets";
          viewCardexResults(main);
        });
      });
      return;
    }

    /* asset list */
    main.innerHTML =
      '<div class="page-header"><div><h1 class="page-title">Assets</h1>' +
      '<p class="page-subtitle">' +
      escapeHtml(filter.description || filter.category || "Filtered assets") +
      " · " +
      catalog.length +
      " record(s)</p></div>" +
      '<div class="btn-group">' +
      (filter.description
        ? '<button type="button" class="btn btn-ghost" id="cardex-back-desc">Back to descriptions</button>'
        : "") +
      '<button type="button" class="btn btn-ghost" data-nav="cardex">Back to inventory</button>' +
      "</div></div>" +
      '<div class="table-wrap"><table class="table"><thead><tr>' +
      "<th>Serial</th><th>Item</th><th>Description</th><th>Location</th><th>Category</th><th>Status</th><th>UOM</th>" +
      "</tr></thead><tbody>" +
      (catalog.length
        ? catalog
            .map(function (a) {
              return (
                "<tr>" +
                '<td class="mono"><button type="button" class="table-link" data-serial="' +
                escapeHtml(a.serial) +
                '">' +
                escapeHtml(a.serial) +
                "</button></td>" +
                "<td>" +
                escapeHtml(a.itemNo) +
                "</td>" +
                '<td class="wrap-cell">' +
                escapeHtml(a.description) +
                "</td>" +
                "<td>" +
                escapeHtml(a.location) +
                "</td>" +
                "<td>" +
                escapeHtml(a.category) +
                "</td>" +
                '<td><span class="badge badge-' +
                (a.status === "In" ? "in" : "out") +
                '">' +
                escapeHtml(a.status) +
                "</span></td>" +
                "<td>" +
                escapeHtml(a.uom) +
                "</td></tr>"
              );
            })
            .join("")
        : '<tr><td colspan="7" class="table-empty">No assets found.</td></tr>') +
      "</tbody></table></div>";

    $$("[data-nav]", main).forEach(function (b) {
      b.addEventListener("click", function () {
        navigate(b.getAttribute("data-nav"));
      });
    });
    var back = $("#cardex-back-desc", main);
    if (back) {
      back.addEventListener("click", function () {
        delete state.cardexFilter.description;
        state.cardexFilter.step = "desc";
        viewCardexResults(main);
      });
    }
    $$("[data-serial]", main).forEach(function (b) {
      b.addEventListener("click", function () {
        navigate("cardex-details", { serial: b.getAttribute("data-serial") });
      });
    });
  }

  function renderSerialResults(main) {
    var results = state.cardexResults.results || [];
    /* Default title is "Results"; keep special titles (e.g. Active subrentals) if set */
    var title =
      state.cardexResults && state.cardexResults.title && state.cardexResults.title !== "Serial search results"
        ? state.cardexResults.title
        : "Results";
    var colCount = 11;
    main.innerHTML =
      '<div class="page-header"><div><h1 class="page-title">' +
      escapeHtml(title) +
      "</h1>" +
      '<p class="page-subtitle">' +
      results.length +
      " result(s)</p></div>" +
      '<button type="button" class="btn btn-ghost" data-nav="cardex">Back to inventory</button></div>' +
      '<div class="table-wrap table-wrap-wide"><table class="table table-results"><thead><tr>' +
      "<th>S/N</th>" +
      "<th>Description</th>" +
      "<th>Material Spec</th>" +
      "<th>Last DT</th>" +
      "<th>Status</th>" +
      "<th>Store</th>" +
      "<th>Own</th>" +
      "<th>On hand</th>" +
      "<th>Rack/Bin</th>" +
      "<th>EL</th>" +
      "<th></th>" +
      "</tr></thead><tbody>" +
      results
        .map(function (r) {
          if (!r.record) {
            return (
              "<tr>" +
              '<td class="mono">' +
              escapeHtml(r.query) +
              "</td>" +
              '<td colspan="' +
              (colCount - 1) +
              '" class="text-danger">Not found</td></tr>'
            );
          }
          var a = r.record;
          var store = a.store || a.location || "";
          var own = countOwnedByDescription(a.description);
          var onHand = countOnHandAtStore(a.description, store);
          var lastDt = getMostRecentDtForSerial(a.serial);
          var dtHtml = lastDt
            ? '<button type="button" class="table-link mono" data-dt="' +
              escapeHtml(lastDt.id || lastDt.dtNo) +
              '" title="Ship ' +
              escapeHtml(formatDate(lastDt.shipDate) || "—") +
              '">' +
              escapeHtml(formatDtNo(lastDt.dtNo || lastDt.id)) +
              (lastDt.shipDate
                ? ' <span class="text-muted">' + escapeHtml(formatDate(lastDt.shipDate)) + "</span>"
                : "") +
              "</button>"
            : "—";
          var elHits = findSerialElCommitments(a.serial);
          var elHtml = elHits.length
            ? elHits
                .map(function (hit, i) {
                  return (
                    (i ? ", " : "") +
                    '<button type="button" class="table-link el-committed" data-el="' +
                    escapeHtml(hit.id) +
                    '" title="Open equipment list">' +
                    escapeHtml(hit.label) +
                    "</button>"
                  );
                })
                .join("")
            : "—";
          var matSpec = a.materialSpec || a.materialGrade || "";
          var rack = a.rackBin || "";
          return (
            "<tr>" +
            '<td class="mono"><button type="button" class="table-link" data-serial="' +
            escapeHtml(a.serial) +
            '">' +
            escapeHtml(a.serial) +
            "</button></td>" +
            '<td class="wrap-cell">' +
            escapeHtml(a.description) +
            "</td>" +
            "<td>" +
            escapeHtml(matSpec || "—") +
            "</td>" +
            '<td class="mono">' +
            dtHtml +
            "</td>" +
            '<td><span class="badge badge-' +
            (a.status === "In" ? "in" : "out") +
            '">' +
            escapeHtml(a.status) +
            "</span></td>" +
            "<td>" +
            escapeHtml(store) +
            "</td>" +
            '<td class="num-cell" title="Total owned of this description">' +
            own +
            "</td>" +
            '<td class="num-cell" title="On hand at this store (status In)">' +
            onHand +
            "</td>" +
            "<td>" +
            escapeHtml(rack || "—") +
            "</td>" +
            '<td class="mono" title="' +
            (elHits.length ? "Committed to equipment list — click to open" : "Not on an open EL") +
            '">' +
            elHtml +
            "</td>" +
            '<td class="table-actions">' +
            '<button type="button" class="btn btn-sm btn-primary" data-serial="' +
            escapeHtml(a.serial) +
            '">Details</button> ' +
            '<button type="button" class="btn btn-sm btn-secondary" data-hist="' +
            escapeHtml(a.serial) +
            '">History</button></td></tr>'
          );
        })
        .join("") +
      "</tbody></table></div>";

    $$("[data-nav]", main).forEach(function (b) {
      b.addEventListener("click", function () {
        navigate(b.getAttribute("data-nav"));
      });
    });
    $$("[data-serial]", main).forEach(function (b) {
      b.addEventListener("click", function () {
        navigate("cardex-details", { serial: b.getAttribute("data-serial") });
      });
    });
    $$("[data-hist]", main).forEach(function (b) {
      b.addEventListener("click", function () {
        navigate("cardex-history", { serial: b.getAttribute("data-hist") });
      });
    });
    $$("[data-el]", main).forEach(function (b) {
      b.addEventListener("click", function () {
        navigate("equipment-order", { id: b.getAttribute("data-el") });
      });
    });
    $$("[data-dt]", main).forEach(function (b) {
      b.addEventListener("click", function () {
        navigate("equipment-dt", { id: b.getAttribute("data-dt") });
      });
    });
  }

  function viewCardexDetails(main) {
    var serial = state.params.serial || "";
    var isNew = state.params.new === "1" || serial === "__new__";
    var a = isNew ? emptyAssetRecord() : findCardexRecord(serial);
    setBreadcrumbs([
      { label: "Home", nav: "home" },
      { label: "Inventory", nav: "cardex" },
      { label: isNew ? "New asset" : serial || "Details" },
    ]);

    if (!a && !isNew) {
      main.innerHTML =
        '<div class="empty-state"><h3>Asset not found</h3><p>Serial ' +
        escapeHtml(serial) +
        " is not in the cardex catalog.</p>" +
        '<button type="button" class="btn btn-primary" data-nav="cardex">Back to inventory</button></div>';
      $$("[data-nav]", main).forEach(function (b) {
        b.addEventListener("click", function () {
          navigate(b.getAttribute("data-nav"));
        });
      });
      return;
    }

    a = normalizeAsset(a || emptyAssetRecord());
    /* Inventory Details = same layout as Admin Add/Edit Serial, always read-only */
    var editing = isNew || state.params.edit === "1";

    /* Toolbar only at top (History / Inventory / Results). Serial details stay in the card below. */
    main.innerHTML =
      '<div class="page-header page-header-compact inv-details-toolbar"><div>' +
      (editing
        ? '<h1 class="page-title mono">' +
          escapeHtml(isNew ? "New inventory asset" : a.serial) +
          '</h1><p class="page-subtitle">Fill out asset fields, then Save.</p>'
        : "") +
      "</div>" +
      '<div class="btn-group">' +
      (!isNew
        ? '<button type="button" class="btn btn-secondary" data-nav="cardex-history?serial=' +
          encodeURIComponent(a.serial) +
          '">History</button>'
        : "") +
      '<button type="button" class="btn btn-ghost" data-nav="cardex">← Inventory</button>' +
      (state.cardexResults
        ? '<button type="button" class="btn btn-ghost" data-nav="cardex-results">← Results</button>'
        : "") +
      "</div></div>" +
      (editing
        ? '<div class="panel mb-2"><div class="panel-header"><h2 class="panel-title">Asset data</h2></div>' +
          '<div class="panel-body" id="inv-asset-body">' +
          renderAssetFormHtml(a, "inv", {
            serialReadonly: !isNew && !!a.serial,
            fields: SERIAL_ADMIN_FIELDS,
            autoFields: SERIAL_ADMIN_AUTO_FIELDS,
            hideDefaultHint: true,
          }) +
          '<div class="btn-group mt-2">' +
          '<button type="button" class="btn btn-primary" id="inv-save">Save asset</button>' +
          (!isNew
            ? '<button type="button" class="btn btn-ghost" id="inv-cancel-edit">Cancel</button>'
            : "") +
          "</div></div></div>"
        : '<div class="inv-ro-page" id="inv-asset-body">' +
          renderAssetFormHtml(a, "inv", {
            inventoryReadonly: true,
            fields: SERIAL_ADMIN_FIELDS,
            autoFields: SERIAL_ADMIN_AUTO_FIELDS,
            hideDefaultHint: true,
          }) +
          "</div>");

    $$("[data-nav]", main).forEach(function (b) {
      b.addEventListener("click", function () {
        navigate(b.getAttribute("data-nav"));
      });
    });
    if (!editing) {
      bindInventoryReadonlyLinks(main);
      $$("[data-inv-doc-module]", main).forEach(function (b) {
        b.addEventListener("click", function () {
          if (b.disabled) return;
          openAssetModuleDocument(a, b.getAttribute("data-inv-doc-module"));
        });
      });
    }

    var cancelBtn = $("#inv-cancel-edit", main);
    if (cancelBtn) {
      cancelBtn.addEventListener("click", function () {
        navigate("cardex-details", { serial: a.serial });
      });
    }
    if (editing) bindCategoryDescriptionFields("inv", main);
    var saveBtn = $("#inv-save", main);
    if (saveBtn) {
      saveBtn.addEventListener("click", function () {
        var out = readAssetForm("inv", a, main, SERIAL_ADMIN_FIELDS);
        if (!out.serial) {
          toast("Serial number is required", "error");
          return;
        }
        if (!out.category) {
          toast("Master category is required", "error");
          return;
        }
        if (isNew && findCardexRecord(out.serial)) {
          toast("Serial already exists", "error");
          return;
        }
        ensureDescriptionInCategory(out.category, out.description);
        upsertAsset(out);
        toast("Saved " + out.serial);
        navigate("cardex-details", { serial: out.serial });
      });
    }
  }

  function viewCardexHistory(main) {
    var serial = state.params.serial || "";
    var a = findCardexRecord(serial);
    var rows = buildSerialTicketHistory(serial);
    var sortDir = state.histDateSort === "asc" ? "asc" : "desc";
    rows = rows.slice().sort(function (aRow, bRow) {
      var ka = String(aRow.sortKey || "");
      var kb = String(bRow.sortKey || "");
      var cmp = ka.localeCompare(kb);
      if (cmp !== 0) return sortDir === "asc" ? cmp : -cmp;
      var na = aRow.sortNo || 0;
      var nb = bRow.sortNo || 0;
      return sortDir === "asc" ? na - nb : nb - na;
    });
    setBreadcrumbs([
      { label: "Home", nav: "home" },
      { label: "Inventory", nav: "cardex" },
      { label: serial, nav: "cardex-details?serial=" + encodeURIComponent(serial) },
      { label: "History" },
    ]);

    main.innerHTML =
      '<div class="page-header"><div><h1 class="page-title">History — ' +
      escapeHtml(serial) +
      "</h1>" +
      '<p class="page-subtitle">' +
      escapeHtml(a ? a.description || "" : "") +
      (a && a.uom ? " · UOM " + escapeHtml(a.uom) : "") +
      "</p></div>" +
      '<div class="btn-group">' +
      '<button type="button" class="btn btn-ghost" data-nav="cardex-details?serial=' +
      encodeURIComponent(serial) +
      '">Back to details</button>' +
      '<button type="button" class="btn btn-ghost" data-nav="cardex">Inventory</button>' +
      "</div></div>" +
      '<div class="table-wrap table-wrap-wide"><table class="table table-results"><thead><tr>' +
      "<th>Ticket</th>" +
      '<th class="hist-date-th">Date' +
      '<select id="hist-date-sort" class="hist-date-sort" aria-label="Sort dates">' +
      '<option value="desc"' +
      (sortDir === "desc" ? " selected" : "") +
      ">Descending</option>" +
      '<option value="asc"' +
      (sortDir === "asc" ? " selected" : "") +
      ">Ascending</option>" +
      "</select></th>" +
      "<th>Ship From</th>" +
      "<th>Ship To</th>" +
      '<th class="hist-qty">Out</th>' +
      '<th class="hist-qty">In</th>' +
      "</tr></thead><tbody>" +
      (rows.length
        ? rows
            .map(function (h) {
              return (
                "<tr>" +
                '<td class="mono">' +
                (h.ticketParam
                  ? '<button type="button" class="table-link mono" data-hist-nav="' +
                    escapeHtml(h.ticketNav) +
                    '" data-hist-id="' +
                    escapeHtml(h.ticketParam) +
                    '">' +
                    escapeHtml(h.ticket) +
                    "</button>"
                  : escapeHtml(h.ticket)) +
                "</td>" +
                "<td>" +
                escapeHtml(formatDateTime(h.date)) +
                "</td>" +
                '<td class="wrap-cell">' +
                escapeHtml(h.shipFrom || "—") +
                "</td>" +
                '<td class="wrap-cell">' +
                escapeHtml(h.shipTo || "—") +
                "</td>" +
                '<td class="hist-qty">' +
                escapeHtml(h.out || "") +
                "</td>" +
                '<td class="hist-qty">' +
                escapeHtml(h.in || "") +
                "</td>" +
                "</tr>"
              );
            })
            .join("")
        : '<tr><td colspan="6" class="table-empty">No DT or RR history for this serial yet.</td></tr>') +
      "</tbody></table></div>" +
      '<p class="form-hint mt-2">Ticket = DT or RR with number. Ship From / Ship To use <strong>Customer and Rig</strong> (or store) — never Well. <strong>Out</strong> = DT qty/UOM; <strong>In</strong> = RR qty/UOM.</p>';

    $$("[data-nav]", main).forEach(function (b) {
      b.addEventListener("click", function () {
        navigate(b.getAttribute("data-nav"));
      });
    });
    $$("[data-hist-nav]", main).forEach(function (b) {
      b.addEventListener("click", function () {
        var route = b.getAttribute("data-hist-nav");
        var id = b.getAttribute("data-hist-id");
        navigate(route, id ? { id: id } : {});
      });
    });
    var sortSel = $("#hist-date-sort", main);
    if (sortSel) {
      sortSel.addEventListener("change", function () {
        state.histDateSort = sortSel.value === "asc" ? "asc" : "desc";
        viewCardexHistory(main);
      });
    }
  }

  function viewCardexDocs(main) {
    var serial = state.params.serial || "";
    setBreadcrumbs([
      { label: "Home", nav: "home" },
      { label: "Inventory", nav: "cardex" },
      { label: serial, nav: "cardex-details?serial=" + encodeURIComponent(serial) },
      { label: "Documents" },
    ]);

    main.innerHTML =
      '<div class="page-header"><div><h1 class="page-title">Documents — ' +
      escapeHtml(serial) +
      '</h1><p class="page-subtitle">View-only document modules linked to this asset.</p></div>' +
      '<button type="button" class="btn btn-ghost" data-nav="cardex-details?serial=' +
      encodeURIComponent(serial) +
      '">Back</button></div>' +
      '<div class="doc-modules">' +
      DOC_MODULES.map(function (m) {
        return (
          '<div class="doc-module-card"><h4>' +
          escapeHtml(m.name) +
          "</h4><p>" +
          escapeHtml(m.desc) +
          '</p><p class="form-hint mt-1">View only · demo</p></div>'
        );
      }).join("") +
      "</div>";

    $$("[data-nav]", main).forEach(function (b) {
      b.addEventListener("click", function () {
        navigate(b.getAttribute("data-nav"));
      });
    });
  }

  /* ========================================================================
   * TICKETS — hub, Delivery Tickets, Receiving Tickets / Reports
   * ======================================================================== */
  function viewTickets(main) {
    state.ticketsMode = "delivery";
    renderTicketsSearchForm(main, "delivery");
  }

  function renderTicketsSearchForm(main, mode) {
    var isRecv = mode === "receiving";
    var f = state.ticketsFilter || {};
    if (!isRecv && !f.status) f.status = "Open";
    if (isRecv && !f.status) f.status = "open";
    var title = isRecv ? "Search DTs to receive" : "Tickets";
    var sub = isRecv
      ? "Search open or closed DTs. Receive all tools or selected tools — DT stays open until everything is received."
      : "Open delivery tickets load automatically. Search by EL / order, customer / vendor, DT number, or ship date.";

    if (isRecv) {
      setBreadcrumbs([
        { label: "Home", nav: "home" },
        { label: "Tickets", nav: "tickets" },
        { label: "Receiving", nav: "tickets-receiving" },
        { label: "DT search" },
      ]);
    } else {
      setBreadcrumbs([
        { label: "Home", nav: "home" },
        { label: "Tickets" },
      ]);
    }

    var statusField = isRecv
      ? '<label class="field"><span>DT status</span>' +
        '<select id="tk-status" class="form-control">' +
        '<option value="open"' +
        ((f.status || "open") === "open" ? " selected" : "") +
        ">Awaiting / partial receive only</option>" +
        '<option value="closed"' +
        (f.status === "closed" ? " selected" : "") +
        ">Fully received only</option>" +
        '<option value="all"' +
        (f.status === "all" ? " selected" : "") +
        ">All delivery tickets</option>" +
        "</select></label>"
      : '<label class="field"><span>Status</span>' +
        '<select id="tk-status" class="form-control">' +
        '<option value="Open"' +
        ((f.status || "Open") === "Open" ? " selected" : "") +
        ">Open</option>" +
        '<option value="Completed"' +
        (f.status === "Completed" ? " selected" : "") +
        ">Completed</option>" +
        '<option value="all"' +
        (f.status === "all" ? " selected" : "") +
        ">All</option>" +
        "</select></label>";

    main.innerHTML =
      '<div class="page-header"><div><h1 class="page-title">' +
      title +
      "</h1>" +
      '<p class="page-subtitle">' +
      sub +
      "</p></div>" +
      '<div class="btn-group">' +
      (isRecv
        ? '<button type="button" class="btn btn-ghost" data-nav="tickets-receiving">← Back</button>'
        : '<button type="button" class="btn btn-primary" data-nav="tickets-vendor-dt">DT to Vendor</button>' +
          '<button type="button" class="btn btn-ghost" data-nav="tickets-receiving">Receiving</button>') +
      "</div></div>" +
      '<div class="panel search-panel"><div class="panel-body">' +
      '<div class="form-grid-3">' +
      '<label class="field"><span>EL / Order No</span>' +
      '<input type="text" id="tk-order" class="form-control" value="' +
      escapeHtml(f.orderNo || "") +
      '" placeholder="RO-2026-0841 or EL-…" /></label>' +
      '<label class="field"><span>Customer / Vendor</span>' +
      '<select id="tk-customer" class="form-control">' +
      getCustomerVendorSelectHtml(f.customer || "") +
      "</select></label>" +
      '<label class="field"><span>DT No</span>' +
      '<input type="text" id="tk-dtno" class="form-control" value="' +
      escapeHtml(f.dtNo || "") +
      '" placeholder="DT number" /></label>' +
      '<label class="field"><span>Ship date from</span>' +
      '<input type="date" id="tk-from" class="form-control" value="' +
      escapeHtml(f.from || "") +
      '" /></label>' +
      '<label class="field"><span>Ship date to</span>' +
      '<input type="date" id="tk-to" class="form-control" value="' +
      escapeHtml(f.to || "") +
      '" /></label>' +
      statusField +
      "</div>" +
      '<div class="search-actions">' +
      '<button type="button" class="btn btn-primary" id="tk-search">Search</button>' +
      "</div></div></div>" +
      '<div id="tk-results-host"></div>';

    $$("[data-nav]", main).forEach(function (b) {
      b.addEventListener("click", function () {
        navigate(b.getAttribute("data-nav"));
      });
    });

    function runSearch(resetPage) {
      var orderNo = ($("#tk-order", main).value || "").trim().toLowerCase();
      var customer = ($("#tk-customer", main).value || "").trim().toLowerCase();
      var dtNo = ($("#tk-dtno", main).value || "").trim().toLowerCase();
      var from = $("#tk-from", main).value;
      var to = $("#tk-to", main).value;
      var statusEl = $("#tk-status", main);
      var status = statusEl ? statusEl.value : isRecv ? "open" : "Open";
      if (resetPage !== false) state.ticketsPage = 1;
      state.ticketsFilter = {
        orderNo: orderNo,
        customer: customer,
        dtNo: dtNo,
        from: from,
        to: to,
        status: status,
      };
      state.ticketsMode = mode;
      migrateReceivingReportsClean();
      /* Delivery tickets only — never load receiving-report records into this list */
      var dts = loadDts();
      var filtered = dts.filter(function (d) {
        if (!d) return false;
        refreshDtReceiveStatus(d);
        if (orderNo) {
          var hay = ((d.orderNo || "") + " " + (d.elNo || "") + " " + (d.elId || "")).toLowerCase();
          if (hay.indexOf(orderNo) === -1) return false;
        }
        if (
          customer &&
          String(d.customer || d.company || d.vendorName || "").toLowerCase().indexOf(customer) === -1
        ) {
          return false;
        }
        if (dtNo) {
          var dn = String(formatDtNo(d.dtNo || d.id) || "").toLowerCase();
          if (dn.indexOf(dtNo) === -1 && String(d.id || "").toLowerCase().indexOf(dtNo) === -1) {
            return false;
          }
        }
        if (from && (d.shipDate || "") < from) return false;
        if (to && (d.shipDate || "") > to) return false;
        if (!isRecv) {
          var stDel = String(status || "Open");
          if (stDel === "Open" && !ticketIsOpen(d)) return false;
          if (stDel === "Completed" && ticketIsOpen(d)) return false;
        }
        if (isRecv) {
          var full = dtIsFullyReceived(d);
          var st = status || "open";
          if (st === "open" && full) return false;
          if (st === "closed" && !full) return false;
        }
        return true;
      });
      state.ticketsResults = filtered;
      renderTicketsResultList($("#tk-results-host", main), filtered, mode);
    }

    $("#tk-search", main).addEventListener("click", function () {
      runSearch(true);
    });

    runSearch(false);
  }

  function renderTicketsResultList(host, results, mode) {
    if (!host) return;
    var isRecv = mode === "receiving";
    var list = (results || []).filter(function (d) {
      if (!d || typeof d !== "object") return false;
      if (d.rrLabel != null && d.rrNo != null && !d.dtNo && !d.lines) return false;
      return true;
    });
    var pageInfo = paginateList(list, state.ticketsPage);
    state.ticketsPage = pageInfo.page;
    var pager = renderListPager(pageInfo);
    var slice = pageInfo.items;
    var colCount = isRecv ? 8 : 7;

    host.innerHTML =
      '<div class="results-bar"><span>' +
      pageInfo.total +
      (isRecv ? " result(s)" : " delivery ticket(s)") +
      "</span></div>" +
      pager +
      '<div class="table-wrap"><table class="table"><thead><tr>' +
      "<th>DT No</th><th>Ship Date</th><th>Receive status</th><th>EL Order No</th><th>Customer / Vendor</th><th>Well</th><th>Job No</th>" +
      (isRecv ? "<th></th>" : "") +
      "</tr></thead><tbody>" +
      (slice.length
        ? slice
            .map(function (d) {
              var st = isRecv ? dtReceiveStatusLabel(d) : d.status || "Open";
              var badge =
                st === "Fully received" || st === "Completed" || st === "Received"
                  ? "badge-in"
                  : "badge-out";
              return (
                '<tr class="row-clickable" data-dt-row="' +
                escapeHtml(d.id || d.dtNo) +
                '">' +
                '<td class="mono">' +
                escapeHtml(formatDtNo(d.dtNo || d.id)) +
                "</td>" +
                "<td>" +
                escapeHtml(formatDate(d.shipDate)) +
                "</td>" +
                '<td><span class="badge ' +
                badge +
                '">' +
                escapeHtml(st) +
                "</span></td>" +
                '<td class="mono"><button type="button" class="table-link" data-el="' +
                escapeHtml(d.elId) +
                '">' +
                escapeHtml(d.orderNo || d.elNo || "—") +
                "</button></td>" +
                '<td class="wrap-cell">' +
                escapeHtml(d.customer || d.company || "—") +
                "</td>" +
                '<td class="wrap-cell">' +
                escapeHtml(d.well || "—") +
                "</td>" +
                "<td>" +
                escapeHtml(d.jobNo || "—") +
                "</td>" +
                (isRecv
                  ? '<td><button type="button" class="btn btn-sm btn-primary" data-recv="' +
                    escapeHtml(d.id || d.dtNo) +
                    '">' +
                    (dtIsFullyReceived(d) ? "Open DT" : "Receive tools") +
                    "</button></td>"
                  : "") +
                "</tr>"
              );
            })
            .join("")
        : '<tr><td colspan="' +
          colCount +
          '" class="table-empty">' +
          (isRecv ? "No tickets match your filters." : "No delivery tickets match your filters.") +
          "</td></tr>") +
      "</tbody></table></div>" +
      pager;

    bindListPager(host, function (p) {
      state.ticketsPage = p;
      renderTicketsResultList(host, list, mode);
      if (host.scrollIntoView) host.scrollIntoView({ block: "start" });
    });
    $$("[data-dt-row]", host).forEach(function (row) {
      row.addEventListener("click", function (e) {
        if (e.target.closest && (e.target.closest("[data-el]") || e.target.closest("[data-recv]"))) {
          return;
        }
        var id = row.getAttribute("data-dt-row");
        if (isRecv) navigate("tickets-receive", { id: id });
        else navigate("equipment-dt", { id: id });
      });
    });
    $$("[data-recv]", host).forEach(function (b) {
      b.addEventListener("click", function (e) {
        e.stopPropagation();
        navigate("tickets-receive", { id: b.getAttribute("data-recv") });
      });
    });
    $$("[data-el]", host).forEach(function (b) {
      b.addEventListener("click", function (e) {
        e.stopPropagation();
        navigate("equipment-order", { id: b.getAttribute("data-el") });
      });
    });
  }

  function viewTicketsDelivery(main) {
    state.ticketsMode = "delivery";
    renderTicketsSearchForm(main, "delivery");
  }

  function viewTicketsVendorDtNew(main) {
    setBreadcrumbs([
      { label: "Home", nav: "home" },
      { label: "Tickets", nav: "tickets" },
      { label: "DT to Vendor" },
    ]);
    var preId = state.params.vendorId || "";
    var vendors = loadVendors();
    var locOpts =
      '<option value="">Select store…</option>' +
      (loadMasters().locations || [])
        .map(function (l) {
          return '<option value="' + escapeHtml(l) + '">' + escapeHtml(l) + "</option>";
        })
        .join("");
    var vOpts =
      '<option value="">Select vendor…</option>' +
      vendors
        .map(function (v) {
          return (
            '<option value="' +
            escapeHtml(v.id) +
            '"' +
            (v.id === preId ? " selected" : "") +
            ">" +
            escapeHtml(v.name) +
            "</option>"
          );
        })
        .join("");

    main.innerHTML =
      '<div class="page-header"><div><h1 class="page-title">Create DT to Vendor</h1>' +
      '<p class="page-subtitle">Ship serials to a supplier. Agreed due date drives On-Time Delivery. History logs Out on ship and In on receive.</p></div>' +
      '<button type="button" class="btn btn-ghost" data-nav="tickets">← Tickets</button></div>' +
      '<div class="panel mb-2"><div class="panel-header"><h2 class="panel-title">Vendor &amp; due date</h2></div>' +
      '<div class="panel-body"><div class="form-grid-3">' +
      '<label class="field"><span>Vendor *</span><select id="vdt-vendor" class="form-control">' +
      vOpts +
      "</select></label>" +
      '<label class="field"><span>Agreed-upon due date *</span>' +
      '<input type="date" id="vdt-due" class="form-control" /></label>' +
      '<label class="field"><span>Ship from (store)</span><select id="vdt-store" class="form-control">' +
      locOpts +
      "</select></label>" +
      '<label class="field"><span>Contact</span><input type="text" id="vdt-contact" class="form-control" /></label>' +
      '<label class="field form-span-2"><span>Notes</span><input type="text" id="vdt-notes" class="form-control" /></label>' +
      "</div></div></div>" +
      '<div class="panel mb-2"><div class="panel-header flex-between"><h2 class="panel-title mb-0">Serial numbers</h2>' +
      '<button type="button" class="btn btn-secondary btn-sm" id="vdt-add-sn">Add serial</button></div>' +
      '<div class="panel-body"><div class="table-wrap"><table class="table"><thead><tr>' +
      "<th>Serial</th><th>Description</th><th>Status</th><th></th></tr></thead>" +
      '<tbody id="vdt-sn-body"></tbody></table></div>' +
      '<p class="form-hint mt-1">Enter a serial and tab/blur to pull description from inventory. Serials go <strong>Out</strong> when this DT is created.</p>' +
      "</div></div>" +
      '<button type="button" class="btn btn-primary" id="vdt-save">Create DT</button>';

    function addSnRow(sn) {
      var body = $("#vdt-sn-body", main);
      if (!body) return;
      var rec = sn ? findCardexRecord(sn) : null;
      var tr = document.createElement("tr");
      tr.innerHTML =
        '<td><input type="text" class="form-control vdt-sn" value="' +
        escapeHtml(sn || "") +
        '" placeholder="Serial" /></td>' +
        '<td><input type="text" class="form-control vdt-desc" value="' +
        escapeHtml(rec ? rec.description || "" : "") +
        '" readonly /></td>' +
        "<td>" +
        (rec
          ? '<span class="badge badge-' +
            (rec.status === "Out" ? "out" : "in") +
            '">' +
            escapeHtml(rec.status || "In") +
            "</span>"
          : "—") +
        "</td>" +
        '<td><button type="button" class="table-link vdt-sn-del">Remove</button></td>';
      body.appendChild(tr);
      var snInp = tr.querySelector(".vdt-sn");
      var descInp = tr.querySelector(".vdt-desc");
      bindSerialAutoDescription(snInp, descInp);
      snInp.addEventListener("blur", function () {
        var r = findCardexRecord(snInp.value);
        var st = tr.querySelector("td:nth-child(3)");
        if (st) {
          st.innerHTML = r
            ? '<span class="badge badge-' +
              (r.status === "Out" ? "out" : "in") +
              '">' +
              escapeHtml(r.status || "In") +
              "</span>"
            : "—";
        }
        var sn = String(snInp.value || "").trim();
        if (sn && serialIsCurrentlyOut(sn)) {
          toast(
            "Serial number " + sn + " is currently Out and cannot be added to a new DT.",
            "error"
          );
        }
      });
      tr.querySelector(".vdt-sn-del").addEventListener("click", function () {
        tr.parentNode.removeChild(tr);
      });
    }

    $$("[data-nav]", main).forEach(function (b) {
      b.addEventListener("click", function () {
        navigate(b.getAttribute("data-nav"));
      });
    });
    addSnRow("");
    $("#vdt-add-sn", main).addEventListener("click", function () {
      addSnRow("");
    });
    $("#vdt-save", main).addEventListener("click", function () {
      var vendorId = ($("#vdt-vendor", main) && $("#vdt-vendor", main).value) || "";
      var due = ($("#vdt-due", main) && $("#vdt-due", main).value) || "";
      var serials = [];
      $$(".vdt-sn", main).forEach(function (inp) {
        var s = String(inp.value || "").trim();
        if (s) serials.push(s);
      });
      try {
        var dt = createVendorDt({
          vendorId: vendorId,
          dueDate: due,
          store: ($("#vdt-store", main) && $("#vdt-store", main).value) || "",
          contact: ($("#vdt-contact", main) && $("#vdt-contact", main).value) || "",
          notes: ($("#vdt-notes", main) && $("#vdt-notes", main).value) || "",
          serials: serials,
        });
        toast("DT-" + dt.dtNo + " created · serials Out to " + (dt.vendorName || "vendor"));
        navigate("equipment-dt", { id: dt.id || dt.dtNo });
      } catch (e) {
        toast(e && e.message ? e.message : String(e), "error");
      }
    });
  }

  /** Receiving hub — two modules: receive by serial, search past RRs */
  function viewTicketsReceiving(main) {
    state.ticketsMode = "receiving";
    migrateReceivingReportsClean();
    setBreadcrumbs([
      { label: "Home", nav: "home" },
      { label: "Tickets", nav: "tickets" },
      { label: "Receiving" },
    ]);

    main.innerHTML =
      '<div class="page-header"><div><h1 class="page-title">Receiving</h1>' +
      '<p class="page-subtitle">Receive tools in by serial, or look up historical receiving reports</p></div>' +
      '<button type="button" class="btn btn-ghost" data-nav="tickets">← Tickets</button></div>' +
      '<div class="admin-grid tickets-hub-grid">' +
      '<button type="button" class="admin-card admin-card-featured tickets-hub-card" data-nav="tickets-receiving-serial">' +
      "<h3>Receive by Serial Number</h3>" +
      "<p>Enter up to 20 serials (cardex-style). Next screen groups by DT and line item for receive in.</p>" +
      '<span class="doc-module-open-cta">Receive by serial →</span></button>' +
      '<button type="button" class="admin-card admin-card-featured tickets-hub-card" data-nav="tickets-rr-search">' +
      "<h3>Search Receiving Report</h3>" +
      "<p>Look up old RRs by date, customer, serial number, DT, EL / order, or RR number.</p>" +
      '<span class="doc-module-open-cta">Search RRs →</span></button>' +
      "</div>" +
      '<p class="form-hint mt-2">Optional: <button type="button" class="table-link" data-nav="tickets-receiving-search">Search open DTs by EL / customer</button> if you need to receive from a delivery ticket list instead of serial entry.</p>';

    $$("[data-nav]", main).forEach(function (b) {
      b.addEventListener("click", function () {
        navigate(b.getAttribute("data-nav"));
      });
    });
  }

  function viewTicketsReceivingSerial(main) {
    state.ticketsMode = "receiving";
    migrateReceivingReportsClean();
    setBreadcrumbs([
      { label: "Home", nav: "home" },
      { label: "Tickets", nav: "tickets" },
      { label: "Receiving", nav: "tickets-receiving" },
      { label: "By serial" },
    ]);

    var saved = state.recvSerials || [];
    while (saved.length < 20) saved.push("");
    if (saved.length > 20) saved = saved.slice(0, 20);
    state.recvSerials = saved;

    var slots = "";
    for (var i = 0; i < 20; i++) {
      slots +=
        '<label class="sn-slot">' +
        '<span class="sn-label">S/N ' +
        (i + 1) +
        "</span>" +
        '<input type="text" class="form-control sn-input recv-sn-input" data-sn-idx="' +
        i +
        '" value="' +
        escapeHtml(saved[i] || "") +
        '" autocomplete="off" spellcheck="false" />' +
        "</label>";
    }

    main.innerHTML =
      '<div class="cardex-home recv-home">' +
      '<div class="cardex-home-head">' +
      '<div class="cardex-home-titles">' +
      '<p class="cardex-kicker">RECEIVING</p>' +
      '<h1 class="page-title">Receive by Serial Number</h1>' +
      '<nav class="cardex-subnav" aria-label="Receiving links">' +
      '<button type="button" class="cardex-subnav-link" data-nav="tickets-receiving">Receiving hub</button>' +
      '<span class="cardex-subnav-sep">|</span>' +
      '<button type="button" class="cardex-subnav-link" data-nav="tickets-rr-search">Search Receiving Report</button>' +
      "</nav></div></div>" +
      '<div class="cardex-split recv-split-single">' +
      '<section class="cardex-panel cardex-panel-serial">' +
      '<header class="cardex-panel-head">' +
      "<h2>Serial Number Lookup</h2>" +
      '<div class="cardex-panel-actions">' +
      '<button type="button" class="btn btn-primary btn-sm" id="recv-sn-go">Continue</button>' +
      '<button type="button" class="btn btn-secondary btn-sm" id="recv-sn-verify">Verify</button>' +
      '<button type="button" class="btn btn-ghost btn-sm" id="recv-sn-clear">Clear Entries</button>' +
      "</div></header>" +
      '<p class="cardex-hint">Enter up to <strong>20</strong> serials (same layout as Inventory cardex). Press <strong>Enter</strong> or <strong>Continue</strong> to build the receiving list. Serials on the <strong>same DT</strong> are grouped into one line item when they share the same description.</p>' +
      '<div class="sn-grid" id="recv-sn-grid">' +
      slots +
      "</div>" +
      "</section>" +
      '<section class="cardex-panel cardex-panel-drill">' +
      '<header class="cardex-panel-head"><h2>How it works</h2></header>' +
      '<ul class="recv-help-list">' +
      "<li>Look up each serial on open delivery tickets (tools still Out).</li>" +
      "<li>Next screen shows receiving lines <strong>grouped by DT</strong>.</li>" +
      "<li>Multiple serials from the same DT and description appear as one line item.</li>" +
      "<li>Select lines or receive all, then create the RR (receive in).</li>" +
      "</ul>" +
      '<p class="cardex-hint cardex-hint-muted">Looking for an old RR? Use <strong>Search Receiving Report</strong>.</p>' +
      "</section>" +
      "</div></div>";

    function readSlots() {
      var list = [];
      $$(".recv-sn-input", main).forEach(function (inp) {
        var v = (inp.value || "").trim();
        var idx = parseInt(inp.getAttribute("data-sn-idx"), 10);
        list[idx] = v;
      });
      state.recvSerials = list;
      return list.filter(function (s) {
        return !!s;
      });
    }

    function runLookup() {
      var serials = readSlots();
      if (!serials.length) {
        toast("Enter at least one serial number", "error");
        return;
      }
      var review = buildReceiveReviewFromSerials(serials);
      state.recvReview = review;
      if (!(review.groups || []).length && !(review.errors || []).length) {
        toast("No matching open DTs for those serials", "error");
        return;
      }
      navigate("tickets-recv-review");
    }

    $$("[data-nav]", main).forEach(function (b) {
      b.addEventListener("click", function () {
        navigate(b.getAttribute("data-nav"));
      });
    });
    $("#recv-sn-go", main).addEventListener("click", runLookup);
    $("#recv-sn-verify", main).addEventListener("click", runLookup);
    $("#recv-sn-clear", main).addEventListener("click", function () {
      state.recvSerials = [];
      viewTicketsReceivingSerial(main);
    });
    $$(".recv-sn-input", main).forEach(function (inp) {
      inp.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
          e.preventDefault();
          runLookup();
        }
      });
    });
    var first = $(".recv-sn-input", main);
    if (first) setTimeout(function () {
      first.focus();
    }, 50);
  }

  function viewTicketsReceivingSearch(main) {
    state.ticketsMode = "receiving";
    migrateReceivingReportsClean();
    renderTicketsSearchForm(main, "receiving");
  }

  /** Search historical receiving reports (RR) by date, customer, serial, DT, EL, RR# */
  function viewTicketsRrSearch(main) {
    migrateReceivingReportsClean();
    setBreadcrumbs([
      { label: "Home", nav: "home" },
      { label: "Tickets", nav: "tickets" },
      { label: "Receiving", nav: "tickets-receiving" },
      { label: "Search RR" },
    ]);

    var f = state.rrSearchFilter || {};
    var results = state.rrSearchResults;

    var rows = "";
    if (results && results.length) {
      rows = results
        .map(function (r) {
          var serials = (r.serials || [])
            .map(function (s) {
              return s;
            })
            .join(", ");
          if (!serials && r.lines) {
            serials = (r.lines || [])
              .map(function (ln) {
                return ln.serial;
              })
              .filter(Boolean)
              .join(", ");
          }
          return (
            '<tr class="row-click" data-rr-row="' +
            escapeHtml(r.id) +
            '">' +
            '<td class="mono">RR ' +
            escapeHtml(r.rrLabel != null ? String(r.rrLabel) : r.rrNo) +
            "</td>" +
            "<td>" +
            escapeHtml(formatDateTime(r.createdAt)) +
            "</td>" +
            '<td class="mono">DT-' +
            escapeHtml(r.dtNo || "—") +
            "</td>" +
            '<td class="mono">' +
            escapeHtml(r.elNo || r.orderNo || "—") +
            "</td>" +
            '<td class="wrap-cell">' +
            escapeHtml(r.customer || r.company || "—") +
            "</td>" +
            "<td>" +
            escapeHtml(r.well || "—") +
            "</td>" +
            '<td class="mono wrap-cell">' +
            escapeHtml(serials || "—") +
            "</td>" +
            "<td>" +
            (r.isPartial ? "Partial" : r.isFinal ? "Final" : "—") +
            "</td></tr>"
          );
        })
        .join("");
    }

    main.innerHTML =
      '<div class="page-header"><div><h1 class="page-title">Search Receiving Report</h1>' +
      '<p class="page-subtitle">Look up past RRs by date, customer, serial, DT, EL / order, or RR number</p></div>' +
      '<div class="btn-group">' +
      '<button type="button" class="btn btn-ghost" data-nav="tickets-receiving">← Receiving</button>' +
      '<button type="button" class="btn btn-ghost" data-nav="tickets-receiving-serial">Receive by serial</button>' +
      "</div></div>" +
      '<div class="panel search-panel"><div class="panel-body">' +
      '<div class="form-grid-3">' +
      '<label class="field"><span>Date from</span>' +
      '<input type="date" id="rr-from" class="form-control" value="' +
      escapeHtml(f.from || "") +
      '" /></label>' +
      '<label class="field"><span>Date to</span>' +
      '<input type="date" id="rr-to" class="form-control" value="' +
      escapeHtml(f.to || "") +
      '" /></label>' +
      '<label class="field"><span>Customer</span>' +
      '<input type="text" id="rr-customer" class="form-control" value="' +
      escapeHtml(f.customer || "") +
      '" placeholder="Company / customer" /></label>' +
      '<label class="field"><span>Serial number</span>' +
      '<input type="text" id="rr-serial" class="form-control" value="' +
      escapeHtml(f.serial || "") +
      '" placeholder="Exact or partial serial" /></label>' +
      '<label class="field"><span>DT No</span>' +
      '<input type="text" id="rr-dt" class="form-control" value="' +
      escapeHtml(f.dtNo || "") +
      '" placeholder="DT number" /></label>' +
      '<label class="field"><span>RR No</span>' +
      '<input type="text" id="rr-no" class="form-control" value="' +
      escapeHtml(f.rrNo || "") +
      '" placeholder="RR label or number" /></label>' +
      '<label class="field"><span>EL / Order No</span>' +
      '<input type="text" id="rr-el" class="form-control" value="' +
      escapeHtml(f.elNo || "") +
      '" placeholder="EL or order" /></label>' +
      '<label class="field"><span>Well</span>' +
      '<input type="text" id="rr-well" class="form-control" value="' +
      escapeHtml(f.well || "") +
      '" /></label>' +
      '<label class="field"><span>Job No</span>' +
      '<input type="text" id="rr-job" class="form-control" value="' +
      escapeHtml(f.jobNo || "") +
      '" /></label>' +
      "</div>" +
      '<div class="search-actions">' +
      '<button type="button" class="btn btn-primary" id="rr-search">Search</button>' +
      '<button type="button" class="btn btn-ghost" id="rr-clear">Clear</button>' +
      '<button type="button" class="btn btn-secondary" id="rr-all">Show all RRs</button>' +
      "</div></div></div>" +
      (results
        ? '<div class="results-bar"><span>' +
          results.length +
          " receiving report(s)</span></div>" +
          '<div class="table-wrap"><table class="table"><thead><tr>' +
          "<th>RR</th><th>Date</th><th>DT</th><th>EL</th><th>Customer</th><th>Well</th><th>Serials</th><th>Type</th>" +
          "</tr></thead><tbody>" +
          (rows ||
            '<tr><td colspan="8" class="table-empty">No receiving reports match.</td></tr>') +
          "</tbody></table></div>"
        : '<p class="form-hint">Enter criteria and search, or show all RRs.</p>');

    $$("[data-nav]", main).forEach(function (b) {
      b.addEventListener("click", function () {
        navigate(b.getAttribute("data-nav"));
      });
    });

    function runRrSearch(showAll) {
      var from = ($("#rr-from", main).value || "").trim();
      var to = ($("#rr-to", main).value || "").trim();
      var customer = ($("#rr-customer", main).value || "").trim().toLowerCase();
      var serial = ($("#rr-serial", main).value || "").trim().toLowerCase();
      var dtNo = ($("#rr-dt", main).value || "").trim().toLowerCase();
      var rrNo = ($("#rr-no", main).value || "").trim().toLowerCase();
      var elNo = ($("#rr-el", main).value || "").trim().toLowerCase();
      var well = ($("#rr-well", main).value || "").trim().toLowerCase();
      var jobNo = ($("#rr-job", main).value || "").trim().toLowerCase();
      state.rrSearchFilter = {
        from: from,
        to: to,
        customer: customer,
        serial: serial,
        dtNo: dtNo,
        rrNo: rrNo,
        elNo: elNo,
        well: well,
        jobNo: jobNo,
      };

      var list = loadReceivingReports() || [];
      var filtered = list.filter(function (r) {
        if (!r) return false;
        if (!showAll) {
          var day = r.createdAt ? String(r.createdAt).slice(0, 10) : "";
          if (from && day && day < from) return false;
          if (to && day && day > to) return false;
          if (customer) {
            var co = String(r.customer || r.company || "").toLowerCase();
            if (co.indexOf(customer) === -1) return false;
          }
          if (serial) {
            var snList = (r.serials || []).map(function (s) {
              return String(s).toLowerCase();
            });
            (r.lines || []).forEach(function (ln) {
              if (ln.serial) snList.push(String(ln.serial).toLowerCase());
            });
            var hit = snList.some(function (s) {
              return s.indexOf(serial) !== -1;
            });
            if (!hit) return false;
          }
          if (dtNo) {
            var dn = String(r.dtNo || r.dtId || "").toLowerCase();
            if (dn.indexOf(dtNo) === -1) return false;
          }
          if (rrNo) {
            var rn = String(r.rrLabel != null ? r.rrLabel : r.rrNo || r.id || "").toLowerCase();
            if (rn.indexOf(rrNo) === -1) return false;
          }
          if (elNo) {
            var en = String((r.elNo || "") + " " + (r.orderNo || "") + " " + (r.elId || "")).toLowerCase();
            if (en.indexOf(elNo) === -1) return false;
          }
          if (well && String(r.well || "").toLowerCase().indexOf(well) === -1) return false;
          if (jobNo && String(r.jobNo || "").toLowerCase().indexOf(jobNo) === -1) return false;
        }
        return true;
      });
      filtered.sort(function (a, b) {
        return String(b.createdAt || "").localeCompare(String(a.createdAt || ""));
      });
      state.rrSearchResults = filtered;
      viewTicketsRrSearch(main);
    }

    var searchBtn = $("#rr-search", main);
    if (searchBtn) searchBtn.addEventListener("click", function () {
      runRrSearch(false);
    });
    var allBtn = $("#rr-all", main);
    if (allBtn) allBtn.addEventListener("click", function () {
      runRrSearch(true);
    });
    var clearBtn = $("#rr-clear", main);
    if (clearBtn) {
      clearBtn.addEventListener("click", function () {
        state.rrSearchFilter = {};
        state.rrSearchResults = null;
        viewTicketsRrSearch(main);
      });
    }
    $$("tr[data-rr-row]", main).forEach(function (row) {
      row.addEventListener("click", function () {
        navigate("tickets-rr", { id: row.getAttribute("data-rr-row") });
      });
    });
  }

  /**
   * Find an open DT where this serial is still outstanding (not received).
   * Prefers most recent ship / create date.
   */
  function findOpenDtForSerialReceive(serial) {
    var sn = String(serial || "").trim();
    if (!sn) return null;
    var key = sn.toUpperCase();
    var open = [];
    loadDts().forEach(function (d) {
      if (!d) return;
      refreshDtReceiveStatus(d);
      var onDt = false;
      (d.lines || []).forEach(function (ln) {
        if (String(ln.serial || "").toUpperCase() === key) onDt = true;
      });
      if (!onDt) return;
      if (dtIsSerialReceived(d, sn)) return;
      open.push(d);
    });
    if (!open.length) return null;
    open.sort(function (a, b) {
      var da = a.shipDate || a.createdAt || "";
      var db = b.shipDate || b.createdAt || "";
      if (String(db) !== String(da)) return String(db).localeCompare(String(da));
      return (parseInt(formatDtNo(b.dtNo || b.id), 10) || 0) - (parseInt(formatDtNo(a.dtNo || a.id), 10) || 0);
    });
    return open[0];
  }

  /**
   * Build review model from serial list:
   * groups[] by DT, each with lines[] grouped by description/item (same DT).
   */
  function buildReceiveReviewFromSerials(serialList) {
    var errors = [];
    var seenSn = {};
    /* dtKey -> { dt, items: { lineKey -> { description, uom, itemNo, serials: [] } } } */
    var byDt = {};

    (serialList || []).forEach(function (raw) {
      var sn = String(raw || "").trim();
      if (!sn) return;
      var uk = sn.toUpperCase();
      if (seenSn[uk]) {
        errors.push({ serial: sn, message: "Duplicate entry — already listed" });
        return;
      }
      seenSn[uk] = true;

      var dt = findOpenDtForSerialReceive(sn);
      if (!dt) {
        errors.push({ serial: sn, message: "No open DT" });
        return;
      }

      var dln = null;
      (dt.lines || []).forEach(function (ln) {
        if (String(ln.serial || "").toUpperCase() === uk) dln = ln;
      });
      var desc = resolveSerialDescription(sn, (dln && dln.description) || "");
      var uom = (dln && dln.uom) || "EA";
      var itemNo = (dln && dln.itemNo) || "";
      var lineKey = String(itemNo) + "||" + String(desc).toUpperCase() + "||" + String(uom).toUpperCase();
      var dtKey = String(dt.id || dt.dtNo);

      if (!byDt[dtKey]) {
        byDt[dtKey] = { dt: dt, items: {} };
      }
      if (!byDt[dtKey].items[lineKey]) {
        byDt[dtKey].items[lineKey] = {
          itemNo: itemNo,
          description: desc,
          uom: uom,
          serials: [],
        };
      }
      byDt[dtKey].items[lineKey].serials.push(sn);
    });

    var groups = Object.keys(byDt).map(function (k) {
      var g = byDt[k];
      var lines = Object.keys(g.items).map(function (lk) {
        var it = g.items[lk];
        return {
          itemNo: it.itemNo,
          description: it.description,
          uom: it.uom,
          serials: it.serials.slice(),
          qty: it.serials.length,
        };
      });
      lines.sort(function (a, b) {
        return String(a.itemNo || a.description).localeCompare(String(b.itemNo || b.description));
      });
      return {
        dtId: g.dt.id || g.dt.dtNo,
        dtNo: formatDtNo(g.dt.dtNo || g.dt.id),
        dt: g.dt,
        customer: g.dt.customer || g.dt.company || "",
        elNo: g.dt.elNo || g.dt.orderNo || g.dt.elId || "",
        jobNo: g.dt.jobNo || "",
        well: g.dt.well || "",
        shipDate: g.dt.shipDate || "",
        lines: lines,
        serialCount: lines.reduce(function (n, ln) {
          return n + (ln.serials ? ln.serials.length : 0);
        }, 0),
      };
    });

    groups.sort(function (a, b) {
      return (parseInt(a.dtNo, 10) || 0) - (parseInt(b.dtNo, 10) || 0);
    });

    return {
      groups: groups,
      errors: errors,
      queriedAt: nowISO(),
    };
  }

  function viewTicketsRecvReview(main) {
    var review = state.recvReview;
    setBreadcrumbs([
      { label: "Home", nav: "home" },
      { label: "Tickets", nav: "tickets" },
      { label: "Receiving", nav: "tickets-receiving" },
      { label: "By serial", nav: "tickets-receiving-serial" },
      { label: "Review" },
    ]);

    if (!review) {
      main.innerHTML =
        '<div class="empty-state"><h3>No serials to review</h3>' +
        '<button type="button" class="btn btn-primary" data-nav="tickets-receiving-serial">Enter serials</button></div>';
      $$("[data-nav]", main).forEach(function (b) {
        b.addEventListener("click", function () {
          navigate(b.getAttribute("data-nav"));
        });
      });
      return;
    }

    var groups = review.groups || [];
    var errors = review.errors || [];
    var totalSerials = groups.reduce(function (n, g) {
      return n + (g.serialCount || 0);
    }, 0);

    var errBlock = "";
    if (errors.length) {
      errBlock =
        '<div class="alert alert-warn mb-2"><strong>Could not queue ' +
        errors.length +
        " serial(s):</strong><ul class=\"mb-0\" style=\"margin:0.35rem 0 0 1.1rem\">" +
        errors
          .map(function (e) {
            return (
              "<li><span class=\"mono\">" +
              escapeHtml(e.serial) +
              "</span> — " +
              escapeHtml(e.message) +
              "</li>"
            );
          })
          .join("") +
        "</ul></div>";
    }

    var body = groups
      .map(function (g, gi) {
        var lineRows = (g.lines || [])
          .map(function (ln, li) {
            var lineId = "g" + gi + "-l" + li;
            return (
              "<tr>" +
              "<td>" +
              '<input type="checkbox" class="recv-line-check" data-line-id="' +
              lineId +
              '" data-dt="' +
              escapeHtml(g.dtId) +
              '" data-serials="' +
              escapeHtml((ln.serials || []).join("|")) +
              '" checked />' +
              "</td>" +
              "<td>" +
              escapeHtml(ln.itemNo || String(li + 1)) +
              "</td>" +
              '<td class="wrap-cell">' +
              escapeHtml(ln.description || "—") +
              "</td>" +
              "<td>" +
              escapeHtml(ln.uom || "EA") +
              "</td>" +
              '<td class="num-cell">' +
              (ln.qty || (ln.serials || []).length) +
              "</td>" +
              '<td class="mono wrap-cell">' +
              escapeHtml((ln.serials || []).join(", ")) +
              "</td>" +
              "</tr>"
            );
          })
          .join("");

        return (
          '<div class="panel mb-2 recv-dt-group" data-recv-dt="' +
          escapeHtml(g.dtId) +
          '">' +
          '<div class="panel-header panel-header-compact">' +
          '<h2 class="panel-title mono">DT-' +
          escapeHtml(g.dtNo) +
          "</h2>" +
          '<span class="text-muted" style="font-size:0.85rem">' +
          escapeHtml(g.customer || "—") +
          " · EL " +
          escapeHtml(g.elNo || "—") +
          " · Job " +
          escapeHtml(g.jobNo || "—") +
          " · Ship " +
          escapeHtml(formatDate(g.shipDate)) +
          " · " +
          g.serialCount +
          " serial(s)</span>" +
          '<button type="button" class="btn btn-ghost btn-sm" data-open-dt="' +
          escapeHtml(g.dtId) +
          '">Open DT</button>' +
          "</div>" +
          '<div class="table-wrap"><table class="table"><thead><tr>' +
          "<th></th><th>Item</th><th>Description</th><th>UOM</th><th>Qty</th><th>Serials (same DT)</th>" +
          "</tr></thead><tbody>" +
          (lineRows ||
            '<tr><td colspan="6" class="table-empty">No lines</td></tr>') +
          "</tbody></table></div>" +
          '<div class="panel-body" style="padding-top:0.5rem">' +
          '<div class="btn-group">' +
          '<button type="button" class="btn btn-primary btn-sm recv-dt-all" data-dt="' +
          escapeHtml(g.dtId) +
          '">Receive all on this DT</button>' +
          '<button type="button" class="btn btn-secondary btn-sm recv-dt-selected" data-dt="' +
          escapeHtml(g.dtId) +
          '">Receive selected lines</button>' +
          "</div></div></div>"
        );
      })
      .join("");

    main.innerHTML =
      '<div class="page-header"><div><h1 class="page-title">Receiving review</h1>' +
      '<p class="page-subtitle">' +
      totalSerials +
      " serial(s) ready across " +
      groups.length +
      " DT(s)" +
      (errors.length ? " · " + errors.length + " skipped" : "") +
      "</p></div>" +
      '<div class="btn-group">' +
      '<button type="button" class="btn btn-primary" id="recv-review-all">Receive all listed serials</button>' +
      '<button type="button" class="btn btn-ghost" data-nav="tickets-receiving-serial">← Edit serials</button>' +
      '<button type="button" class="btn btn-ghost" data-nav="tickets-receiving">Receiving hub</button>' +
      "</div></div>" +
      errBlock +
      (groups.length
        ? body
        : '<div class="empty-state"><p>No outstanding serials to receive from your list.</p></div>') +
      (groups.length
        ? '<p class="form-hint">Each receive creates an RR for that DT. Serials on the same DT that share a description are one line item.</p>'
        : "");

    $$("[data-nav]", main).forEach(function (b) {
      b.addEventListener("click", function () {
        navigate(b.getAttribute("data-nav"));
      });
    });
    $$("[data-open-dt]", main).forEach(function (b) {
      b.addEventListener("click", function () {
        navigate("equipment-dt", { id: b.getAttribute("data-open-dt") });
      });
    });

    function serialsForDtSelected(dtId) {
      var out = [];
      $$('.recv-line-check[data-dt="' + dtId + '"]:checked', main).forEach(function (c) {
        var raw = c.getAttribute("data-serials") || "";
        raw.split("|").forEach(function (s) {
          if (s) out.push(s);
        });
      });
      return out;
    }

    function serialsForDtAll(dtId) {
      var out = [];
      $$('.recv-line-check[data-dt="' + dtId + '"]', main).forEach(function (c) {
        var raw = c.getAttribute("data-serials") || "";
        raw.split("|").forEach(function (s) {
          if (s) out.push(s);
        });
      });
      return out;
    }

    function receiveDtSerials(dtId, serials) {
      if (!serials || !serials.length) {
        toast("No serials selected for this DT", "error");
        return false;
      }
      var dt = getDt(dtId);
      if (!dt) {
        toast("DT not found", "error");
        return false;
      }
      try {
        var result = processDtReceive(dt, serials);
        toast(
          "RR " +
            result.rr.rrLabel +
            " · DT-" +
            formatDtNo(dt.dtNo || dt.id) +
            " · " +
            serials.length +
            " serial(s) In" +
            (result.dt.receiveStatus === "received" ? " · DT closed" : "")
        );
        return true;
      } catch (err) {
        toast(err && err.message ? err.message : String(err), "error");
        return false;
      }
    }

    function refreshReviewAfterReceive() {
      /* rebuild from original slot list so remaining outstanding still show */
      var slots = (state.recvSerials || []).filter(function (s) {
        return !!String(s || "").trim();
      });
      if (!slots.length) {
        state.recvReview = null;
        navigate("tickets-receiving-serial");
        return;
      }
      state.recvReview = buildReceiveReviewFromSerials(slots);
      if (!(state.recvReview.groups || []).length) {
        toast("All listed serials received (or no longer open)", "success");
      }
      viewTicketsRecvReview(main);
    }

    $$(".recv-dt-all", main).forEach(function (b) {
      b.addEventListener("click", function () {
        var dtId = b.getAttribute("data-dt");
        if (receiveDtSerials(dtId, serialsForDtAll(dtId))) refreshReviewAfterReceive();
      });
    });
    $$(".recv-dt-selected", main).forEach(function (b) {
      b.addEventListener("click", function () {
        var dtId = b.getAttribute("data-dt");
        if (receiveDtSerials(dtId, serialsForDtSelected(dtId))) refreshReviewAfterReceive();
      });
    });

    var allBtn = $("#recv-review-all", main);
    if (allBtn) {
      allBtn.addEventListener("click", function () {
        if (!groups.length) return;
        if (!confirm("Receive all " + totalSerials + " listed serial(s) across " + groups.length + " DT(s)?"))
          return;
        var ok = 0;
        groups.forEach(function (g) {
          var sns = [];
          (g.lines || []).forEach(function (ln) {
            (ln.serials || []).forEach(function (s) {
              sns.push(s);
            });
          });
          if (sns.length && receiveDtSerials(g.dtId, sns)) ok += 1;
        });
        if (ok) refreshReviewAfterReceive();
      });
    }
  }

  function dtReceiveStatusLabel(d) {
    refreshDtReceiveStatus(d);
    if (dtIsFullyReceived(d)) return "Fully received";
    if (d.receiveStatus === "partial" || Object.keys(d.receivedSerials || {}).length) {
      return "Partial receive";
    }
    return "Awaiting receive";
  }

  function viewTicketsResults(main) {
    var mode = state.ticketsMode === "receiving" ? "receiving" : "delivery";
    var isRecv = mode === "receiving";
    var backNav = isRecv ? "tickets-receiving-search" : "tickets";
    var results = state.ticketsResults || [];
    setBreadcrumbs([
      { label: "Home", nav: "home" },
      { label: "Tickets", nav: "tickets" },
      { label: isRecv ? "Receiving" : "Delivery", nav: backNav },
      { label: "Results" },
    ]);

    main.innerHTML =
      '<div class="page-header"><div><h1 class="page-title">' +
      (isRecv ? "DTs available to receive" : "Delivery ticket results") +
      "</h1>" +
      '<p class="page-subtitle">Select a row to open the ticket</p></div>' +
      '<div class="btn-group">' +
      '<button type="button" class="btn btn-ghost" data-nav="' +
      backNav +
      '">New search</button>' +
      '<button type="button" class="btn btn-ghost" data-nav="tickets">Tickets</button>' +
      "</div></div>" +
      '<div id="tk-results-host"></div>';

    $$("[data-nav]", main).forEach(function (b) {
      b.addEventListener("click", function () {
        navigate(b.getAttribute("data-nav"));
      });
    });
    renderTicketsResultList($("#tk-results-host", main), results, mode);
  }

  function viewTicketsReceive(main) {
    var id = state.params.id;
    var dt = getDt(id);
    setBreadcrumbs([
      { label: "Home", nav: "home" },
      { label: "Tickets", nav: "tickets" },
      { label: "Receiving", nav: "tickets-receiving" },
      { label: (dt && formatDtNo(dt.dtNo || dt.id)) || "Receive" },
    ]);

    if (!dt) {
      main.innerHTML =
        '<div class="empty-state"><h3>Delivery ticket not found</h3>' +
        '<button type="button" class="btn btn-primary" data-nav="tickets-receiving">Back</button></div>';
      $$("[data-nav]", main).forEach(function (b) {
        b.addEventListener("click", function () {
          navigate(b.getAttribute("data-nav"));
        });
      });
      return;
    }

    refreshDtReceiveStatus(dt);
    var outstanding = dtOutstandingSerials(dt);
    var fully = dtIsFullyReceived(dt);
    var rrs = getRrsForDt(dt.id || dt.dtNo);
    var stLabel = dtReceiveStatusLabel(dt);

    var lineRows = (dt.lines || [])
      .map(function (ln, idx) {
        var sn = ln.serial || "";
        var rec = dtIsSerialReceived(dt, sn);
        return (
          "<tr>" +
          "<td>" +
          (rec
            ? ""
            : '<input type="checkbox" class="recv-check" data-serial="' +
              escapeHtml(sn) +
              '" ' +
              (fully ? "disabled" : "checked") +
              " />") +
          "</td>" +
          '<td class="mono">' +
          escapeHtml(sn || "—") +
          "</td>" +
          '<td class="wrap-cell">' +
          escapeHtml(ln.description || "—") +
          "</td>" +
          "<td>" +
          escapeHtml(ln.uom || "—") +
          "</td>" +
          "<td>" +
          escapeHtml(String(ln.qty != null ? ln.qty : 1)) +
          "</td>" +
          '<td><span class="badge badge-' +
          (rec ? "in" : "out") +
          '">' +
          (rec ? "Received" : "Out") +
          "</span></td>" +
          "</tr>"
        );
      })
      .join("");

    var rrBlock =
      rrs.length
        ? '<div><span class="kv-label">Receiving reports (this DT)</span><div class="kv-value">' +
          rrs
            .map(function (r) {
              return (
                '<button type="button" class="table-link mono" data-rr="' +
                escapeHtml(r.id) +
                '">RR ' +
                escapeHtml(r.rrLabel) +
                "</button>" +
                (r.isPartial && !r.isFinal ? ' <span class="text-muted">(partial)</span>' : "") +
                (r.isFinal ? ' <span class="text-muted">(final)</span>' : "") +
                "<br/>"
              );
            })
            .join("") +
          "</div></div>"
        : "";

    main.innerHTML =
      '<div class="page-header"><div><h1 class="page-title mono">Receive · DT ' +
      escapeHtml(formatDtNo(dt.dtNo || dt.id)) +
      "</h1>" +
      '<p class="page-subtitle">EL ' +
      escapeHtml(dt.orderNo || dt.elNo || "—") +
      " · Job " +
      escapeHtml(dt.jobNo || "—") +
      ' · <span class="badge badge-' +
      (fully ? "in" : "out") +
      '">' +
      escapeHtml(stLabel) +
      "</span></p></div>" +
      '<div class="btn-group">' +
      '<button type="button" class="btn btn-ghost" data-nav="equipment-dt" data-dt="' +
      escapeHtml(dt.id || dt.dtNo) +
      '">Open DT</button>' +
      '<button type="button" class="btn btn-ghost" data-nav="tickets-receiving">← Receiving</button>' +
      "</div></div>" +
      '<div class="panel mb-2"><div class="panel-body"><div class="dt-meta-grid">' +
      "<div><span class=\"kv-label\">Customer</span><div class=\"kv-value\">" +
      escapeHtml(dt.customer || dt.company || "—") +
      "</div></div>" +
      "<div><span class=\"kv-label\">Well</span><div class=\"kv-value\">" +
      escapeHtml(dt.well || "—") +
      "</div></div>" +
      "<div><span class=\"kv-label\">Outstanding</span><div class=\"kv-value\">" +
      outstanding.length +
      " serial(s)</div></div>" +
      rrBlock +
      "</div>" +
      (fully
        ? '<p class="form-hint mb-0">All tools on this DT are received. DT is closed.</p>'
        : '<p class="form-hint mb-0">Receive <strong>all</strong> outstanding tools or only the <strong>selected</strong> ones. DT stays open until everything is in. RR# posts to the EL only after you receive.</p>') +
      "</div></div>" +
      '<div class="table-wrap mb-2"><table class="table"><thead><tr>' +
      "<th></th><th>Serial</th><th>Description</th><th>UOM</th><th>Qty</th><th>Receive status</th>" +
      "</tr></thead><tbody>" +
      (lineRows || '<tr><td colspan="6" class="table-empty">No lines</td></tr>') +
      "</tbody></table></div>" +
      (fully
        ? ""
        : '<div class="btn-group">' +
          '<button type="button" class="btn btn-primary" id="recv-all">Receive all tools in</button>' +
          '<button type="button" class="btn btn-secondary" id="recv-selected">Receive selected tools</button>' +
          '<button type="button" class="btn btn-ghost" id="recv-select-all">Select all outstanding</button>' +
          '<button type="button" class="btn btn-ghost" id="recv-select-none">Clear selection</button>' +
          "</div>");

    $$("[data-nav]", main).forEach(function (b) {
      b.addEventListener("click", function () {
        var route = b.getAttribute("data-nav");
        var dtId = b.getAttribute("data-dt");
        if (dtId) navigate(route, { id: dtId });
        else navigate(route);
      });
    });
    $$("[data-rr]", main).forEach(function (b) {
      b.addEventListener("click", function () {
        navigate("tickets-rr", { id: b.getAttribute("data-rr") });
      });
    });

    function selectedSerials() {
      return $$(".recv-check:checked", main).map(function (c) {
        return c.getAttribute("data-serial");
      });
    }

    function doReceive(serials) {
      try {
        var result = processDtReceive(dt, serials);
        toast(
          "RR " +
            result.rr.rrLabel +
            " created · " +
            serials.length +
            " serial(s) In" +
            (result.dt.receiveStatus === "received" ? " · DT closed" : " · DT still open")
        );
        navigate("tickets-receive", { id: dt.id || dt.dtNo });
      } catch (err) {
        toast(err && err.message ? err.message : String(err), "error");
      }
    }

    var btnAll = $("#recv-all", main);
    if (btnAll) {
      btnAll.addEventListener("click", function () {
        if (!outstanding.length) {
          toast("Nothing left to receive", "error");
          return;
        }
        if (!confirm("Receive ALL " + outstanding.length + " outstanding serial(s) on DT " + formatDtNo(dt.dtNo || dt.id) + "?")) {
          return;
        }
        doReceive(outstanding);
      });
    }
    var btnSel = $("#recv-selected", main);
    if (btnSel) {
      btnSel.addEventListener("click", function () {
        var sel = selectedSerials();
        if (!sel.length) {
          toast("Select at least one serial", "error");
          return;
        }
        if (!confirm("Receive " + sel.length + " selected serial(s)?")) return;
        doReceive(sel);
      });
    }
    var selAll = $("#recv-select-all", main);
    if (selAll) {
      selAll.addEventListener("click", function () {
        $$(".recv-check", main).forEach(function (c) {
          if (!c.disabled) c.checked = true;
        });
      });
    }
    var selNone = $("#recv-select-none", main);
    if (selNone) {
      selNone.addEventListener("click", function () {
        $$(".recv-check", main).forEach(function (c) {
          c.checked = false;
        });
      });
    }
  }

  function viewReceivingReport(main) {
    var id = state.params.id;
    var rr = getReceivingReport(id);
    setBreadcrumbs([
      { label: "Home", nav: "home" },
      { label: "Tickets", nav: "tickets" },
      { label: "Receiving", nav: "tickets-receiving" },
      { label: "Search RR", nav: "tickets-rr-search" },
      { label: rr ? "RR " + rr.rrLabel : "RR" },
    ]);
    if (!rr) {
      main.innerHTML =
        '<div class="empty-state"><h3>Receiving report not found</h3>' +
        '<button type="button" class="btn btn-primary" data-nav="tickets-rr-search">Back to search</button></div>';
      $$("[data-nav]", main).forEach(function (b) {
        b.addEventListener("click", function () {
          navigate(b.getAttribute("data-nav"));
        });
      });
      return;
    }
    var el = getEquipmentList(rr.elId);
    var hdr = resolveTicketHeader(rr, el);
    var rows = (rr.lines || [])
      .map(function (ln) {
        return (
          "<tr><td class=\"mono\">" +
          escapeHtml(ln.serial) +
          "</td><td class=\"wrap-cell\">" +
          escapeHtml(ln.description || "—") +
          "</td><td>" +
          escapeHtml(ln.uom || "—") +
          "</td><td>" +
          escapeHtml(String(ln.qty != null ? ln.qty : 1)) +
          "</td></tr>"
        );
      })
      .join("");

    main.innerHTML =
      '<div class="page-header"><div><h1 class="page-title mono">RR-' +
      escapeHtml(rr.rrLabel) +
      "</h1>" +
      '<p class="page-subtitle">Receiving Report · same header as EL ' +
      escapeHtml(hdr.orderNo || hdr.elNo || "—") +
      (rr.isPartial ? " · partial" + (rr.isFinal ? ", final" : "") : "") +
      "</p></div>" +
      '<div class="btn-group">' +
      '<button type="button" class="btn btn-primary" id="rr-print-pdf">Print PDF</button>' +
      (rr.dtId
        ? '<button type="button" class="btn btn-ghost" data-nav="tickets-receive" data-id="' +
          escapeHtml(rr.dtId) +
          '">DT receive</button>'
        : "") +
      (rr.elId
        ? '<button type="button" class="btn btn-ghost" data-nav="equipment-order" data-el="' +
          escapeHtml(rr.elId) +
          '">Open EL</button>'
        : "") +
      '<button type="button" class="btn btn-ghost" data-nav="tickets-rr-search">← RR search</button>' +
      '<button type="button" class="btn btn-ghost" data-nav="tickets-receiving">Receiving hub</button>' +
      "</div></div>" +
      '<div class="panel mb-2"><div class="panel-header"><h2 class="panel-title mb-0">Header</h2>' +
      '<span class="text-muted" style="font-size:0.75rem">From equipment list</span></div>' +
      '<div class="panel-body">' +
      renderHeaderKvGrid(hdr, [
        ["RR #", rr.rrLabel],
        ["DT No", rr.dtNo || "—"],
        ["Created", formatDateTime(rr.createdAt)],
      ]) +
      "</div></div>" +
      '<div class="table-wrap"><table class="table"><thead><tr>' +
      "<th>Serial</th><th>Description</th><th>UOM</th><th>Qty</th>" +
      "</tr></thead><tbody>" +
      (rows || '<tr><td colspan="4" class="table-empty">No lines</td></tr>') +
      "</tbody></table></div>";

    $$("[data-nav]", main).forEach(function (b) {
      b.addEventListener("click", function () {
        var route = b.getAttribute("data-nav");
        var elAttr = b.getAttribute("data-el");
        var idAttr = b.getAttribute("data-id");
        if (elAttr) navigate(route, { id: elAttr });
        else if (idAttr) navigate(route, { id: idAttr });
        else navigate(route);
      });
    });
    var printBtn = $("#rr-print-pdf", main);
    if (printBtn) {
      printBtn.addEventListener("click", function () {
        printReceivingReport(rr);
      });
    }
  }

  /* ========================================================================
   * JOBS — list / create / detail (ELs, DTs, RRs, active rentals)
   * ======================================================================== */
  function viewJobsList(main) {
    setBreadcrumbs([
      { label: "Home", nav: "home" },
      { label: "Jobs" },
    ]);
    var f = state.jobFilter || { status: "Open" };
    var jobs = loadJobs().filter(function (j) {
      if (f.status && String(j.status || "") !== f.status) return false;
      if (f.company) {
        var co = String(j.company || j.customer || "").toLowerCase();
        if (co.indexOf(String(f.company).toLowerCase()) === -1) return false;
      }
      if (f.jobNo) {
        if (String(j.jobNo || "").toLowerCase().indexOf(String(f.jobNo).toLowerCase()) === -1) return false;
      }
      if (f.well) {
        if (String(j.well || "").toLowerCase().indexOf(String(f.well).toLowerCase()) === -1) return false;
      }
      return true;
    });

    var pageInfo = paginateList(jobs, state.jobPage);
    state.jobPage = pageInfo.page;
    var pager = renderListPager(pageInfo);
    var rows = pageInfo.items
      .map(function (j) {
        var els = getElsForJob(j);
        var rentals = getActiveRentalsForJob(j);
        return (
          '<tr class="row-click" data-job="' +
          escapeHtml(j.id || j.jobNo) +
          '" tabindex="0" role="link">' +
          '<td class="mono">' +
          escapeHtml(j.jobNo || "—") +
          "</td>" +
          "<td>" +
          escapeHtml(j.company || j.customer || "—") +
          "</td>" +
          "<td>" +
          escapeHtml(j.well || "—") +
          "</td>" +
          "<td>" +
          escapeHtml(j.rig || "—") +
          "</td>" +
          "<td>" +
          escapeHtml(j.location || j.store || "—") +
          "</td>" +
          '<td class="num-cell">' +
          els.length +
          "</td>" +
          '<td class="num-cell">' +
          rentals.length +
          "</td>" +
          '<td><span class="badge ' +
          (j.status === "Open" ? "badge-open" : "badge-closed") +
          '">' +
          escapeHtml(j.status || "Open") +
          "</span></td>" +
          "</tr>"
        );
      })
      .join("");

    main.innerHTML =
      '<div class="page-header"><div><h1 class="page-title">Jobs</h1>' +
      '<p class="page-subtitle">A job owns equipment lists. DTs, RRs, and active rentals roll up from those ELs.</p></div>' +
      '<button type="button" class="btn btn-primary" data-nav="jobs-new">Create Job</button></div>' +
      '<div class="panel search-panel"><div class="panel-body">' +
      '<div class="form-grid-3">' +
      '<label class="field"><span>Status</span><select id="job-f-status">' +
      '<option value=""' +
      (!f.status ? " selected" : "") +
      ">All</option>" +
      '<option value="Open"' +
      (f.status === "Open" ? " selected" : "") +
      ">Open</option>" +
      '<option value="Closed"' +
      (f.status === "Closed" ? " selected" : "") +
      ">Closed</option></select></label>" +
      '<label class="field"><span>Job No</span><input type="text" id="job-f-no" class="form-control" value="' +
      escapeHtml(f.jobNo || "") +
      '" placeholder="51000" /></label>' +
      '<label class="field"><span>Company</span><input type="text" id="job-f-co" class="form-control" value="' +
      escapeHtml(f.company || "") +
      '" /></label>' +
      '<label class="field"><span>Well</span><input type="text" id="job-f-well" class="form-control" value="' +
      escapeHtml(f.well || "") +
      '" /></label>' +
      "</div>" +
      '<div class="search-actions">' +
      '<button type="button" class="btn btn-primary" id="job-search">Search</button>' +
      "</div></div></div>" +
      '<div class="results-bar"><span>' +
      pageInfo.total +
      " job(s)</span></div>" +
      pager +
      '<div class="table-wrap"><table class="table"><thead><tr>' +
      "<th>Job No</th><th>Company</th><th>Well</th><th>Rig</th><th>Store</th><th>ELs</th><th>Active rentals</th><th>Status</th>" +
      "</tr></thead><tbody>" +
      (rows ||
        '<tr><td colspan="8" class="table-empty">No jobs yet. Create a job or open EL 00002 (Job 51000 is seeded from that EL header).</td></tr>') +
      "</tbody></table></div>" +
      pager;

    $$("[data-nav]", main).forEach(function (b) {
      b.addEventListener("click", function () {
        navigate(b.getAttribute("data-nav"));
      });
    });
    function runSearch() {
      state.jobPage = 1;
      state.jobFilter = {
        status: ($("#job-f-status", main) && $("#job-f-status", main).value) || "",
        jobNo: ($("#job-f-no", main) && $("#job-f-no", main).value.trim()) || "",
        company: ($("#job-f-co", main) && $("#job-f-co", main).value.trim()) || "",
        well: ($("#job-f-well", main) && $("#job-f-well", main).value.trim()) || "",
      };
      viewJobsList(main);
    }
    var searchBtn = $("#job-search", main);
    if (searchBtn) searchBtn.addEventListener("click", runSearch);
    bindListPager(main, function (p) {
      state.jobPage = p;
      viewJobsList(main);
      window.scrollTo(0, 0);
    });
    $$("tr[data-job]", main).forEach(function (row) {
      function open() {
        navigate("jobs-detail", { id: row.getAttribute("data-job") });
      }
      row.addEventListener("click", open);
      row.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          open();
        }
      });
    });
  }

  function viewJobNew(main) {
    setBreadcrumbs([
      { label: "Home", nav: "home" },
      { label: "Jobs", nav: "jobs" },
      { label: "Create Job" },
    ]);
    var job = state.jobDraft && state.params.isNew === "1" ? state.jobDraft : emptyJob();
    if (!job.jobNo) job.jobNo = nextJobNo();
    if (!job.id) job.id = "JOB-" + job.jobNo;
    if (!job.createdAt) job.createdAt = nowISO();
    state.jobDraft = job;

    var masters = loadMasters();
    var locOpts = (masters.locations || [])
      .map(function (l) {
        return (
          '<option value="' +
          escapeHtml(l) +
          '"' +
          ((job.location || job.store) === l ? " selected" : "") +
          ">" +
          escapeHtml(l) +
          "</option>"
        );
      })
      .join("");

    function f(label, key, val, ro) {
      return (
        '<label class="field"><span>' +
        escapeHtml(label) +
        '</span><input type="text" id="jf-' +
        key +
        '" class="form-control' +
        (ro ? " input-readonly" : "") +
        '" value="' +
        escapeHtml(val || "") +
        '"' +
        (ro ? " readonly" : "") +
        " /></label>"
      );
    }

    main.innerHTML =
      '<div class="page-header"><div><h1 class="page-title">Create Job</h1>' +
      '<p class="page-subtitle">Header matches Equipment List fields. Job No is auto-assigned.</p></div>' +
      '<div class="btn-group">' +
      '<button type="button" class="btn btn-primary" id="job-create-save">Save Job</button>' +
      '<button type="button" class="btn btn-ghost" data-nav="jobs">Cancel</button>' +
      "</div></div>" +
      '<div class="panel el-header-panel"><div class="panel-header"><h2 class="panel-title">Job header</h2>' +
      '<span class="text-muted" style="font-size:0.75rem">Same fields as EL header (without EL No)</span></div>' +
      '<div class="panel-body stack"><div class="form-grid-4 form-grid-compact">' +
      f("Job No", "jobNo", job.jobNo, true) +
      f("Created", "createdAtDisplay", formatDateTime(job.createdAt || nowISO()), true) +
      f("Company", "company", job.company) +
      f("Phone", "phone", job.phone) +
      f("Well", "well", job.well) +
      f("Rig", "rig", job.rig) +
      f("AFE", "afe", job.afe) +
      '<label class="field required"><span>Location / Store</span><select id="jf-location" class="form-control"><option value="">Select…</option>' +
      locOpts +
      "</select></label>" +
      f("PO Number", "poNumber", job.poNumber) +
      f("Customer contact", "contact", job.contact) +
      f("Sales", "salesmanField", job.salesmanField || job.salesPerson) +
      f("Bill to", "billTo", job.billTo) +
      "</div>" +
      '<label class="field field-notes-compact"><span>Notes</span><input type="text" id="jf-notes" class="form-control" value="' +
      escapeHtml(job.notes || "") +
      '" /></label>' +
      "</div></div>";

    $$("[data-nav]", main).forEach(function (b) {
      b.addEventListener("click", function () {
        navigate(b.getAttribute("data-nav"));
      });
    });

    function g(id) {
      var n = $("#jf-" + id, main);
      return n ? String(n.value || "").trim() : "";
    }

    var saveBtn = $("#job-create-save", main);
    if (saveBtn) {
      saveBtn.addEventListener("click", function () {
        var loc = g("location");
        if (!loc) {
          toast("Location / Store is required", "error");
          var locEl = $("#jf-location", main);
          if (locEl) locEl.focus();
          return;
        }
        job.jobNo = job.jobNo || nextJobNo();
        job.id = "JOB-" + job.jobNo;
        job.company = g("company");
        job.customer = job.company;
        job.phone = g("phone");
        job.well = g("well");
        job.rig = g("rig");
        job.afe = g("afe");
        job.location = loc;
        job.store = loc;
        job.poNumber = g("poNumber");
        job.contact = g("contact");
        job.salesmanField = g("salesmanField");
        job.salesPerson = job.salesmanField;
        /* Ship to lives on ELs only — not on the job */
        job.shipTo = "";
        job.billTo = g("billTo");
        job.notes = g("notes");
        job.status = "Open";
        if (!job.createdAt) job.createdAt = nowISO();
        if (!job.elIds) job.elIds = [];
        saveJob(job);
        state.jobDraft = null;
        toast("Job " + job.jobNo + " created");
        navigate("jobs-detail", { id: job.id });
      });
    }
  }

  function renderJobHeaderReadonly(host, job) {
    if (!host || !job) return;
    function cell(label, val) {
      return (
        '<div class="el-ro-cell"><span class="kv-label">' +
        escapeHtml(label) +
        '</span><div class="kv-value">' +
        escapeHtml(val || "—") +
        "</div></div>"
      );
    }
    host.innerHTML =
      '<div class="panel el-header-panel el-header-compact el-header-readonly">' +
      '<div class="panel-header panel-header-compact">' +
      '<h2 class="panel-title">Job header</h2>' +
      '<span class="text-muted" style="font-size:0.75rem">Job-level fields · Ship to is on each EL</span>' +
      "</div>" +
      '<div class="panel-body el-header-summary el-header-summary-inline">' +
      cell("Job No", job.jobNo) +
      cell("Created", formatDateTime(job.createdAt)) +
      cell("Company", job.company || job.customer) +
      cell("Phone", job.phone) +
      cell("Well", job.well) +
      cell("Rig", job.rig) +
      cell("AFE", job.afe) +
      cell("Store", job.location || job.store) +
      cell("PO", job.poNumber) +
      cell("Customer contact", job.contact) +
      cell("Sales", job.salesmanField || job.salesPerson) +
      cell("Bill to", job.billTo) +
      (job.notes ? cell("Notes", job.notes) : "") +
      "</div></div>";
  }

  function viewJobDetail(main) {
    var id = state.params.id;
    var job = getJob(id);
    if (!job) {
      setBreadcrumbs([
        { label: "Home", nav: "home" },
        { label: "Jobs", nav: "jobs" },
        { label: "Not found" },
      ]);
      main.innerHTML =
        '<div class="empty-state"><h3>Job not found</h3>' +
        '<button type="button" class="btn btn-primary" data-nav="jobs">Back to Jobs</button></div>';
      $$("[data-nav]", main).forEach(function (b) {
        b.addEventListener("click", function () {
          navigate(b.getAttribute("data-nav"));
        });
      });
      return;
    }

    setBreadcrumbs([
      { label: "Home", nav: "home" },
      { label: "Jobs", nav: "jobs" },
      { label: "Job " + (job.jobNo || job.id) },
    ]);

    var tab = state.jobTab || state.params.tab || "els";
    state.jobTab = tab;
    var els = getElsForJob(job);
    var dts = getDtsForJob(job);
    var rrs = getRrsForJob(job);
    var rentals = getActiveRentalsForJob(job);
    var billDraft = getBillingDraftForJob(job.id || job.jobNo);
    var billLineN = billDraft && billDraft.lineCount ? billDraft.lineCount : 0;

    function tabBtn(key, label, count) {
      return (
        '<button type="button" class="tab' +
        (tab === key ? " active" : "") +
        '" data-job-tab="' +
        key +
        '">' +
        escapeHtml(label) +
        (count != null ? ' <span class="text-muted">(' + count + ")</span>" : "") +
        "</button>"
      );
    }

    var panel = "";
    if (tab === "billing") {
      panel = renderJobBillingPanel(job);
    } else if (tab === "els") {
      var elRows = els
        .map(function (el) {
          var shipTo = el.shipTo || (el.header && el.header.shipTo) || "";
          return (
            '<tr class="row-click" data-el="' +
            escapeHtml(el.id || el.elNo) +
            '">' +
            '<td class="mono">' +
            escapeHtml(displayElLabel(el)) +
            "</td>" +
            "<td>" +
            escapeHtml(el.company || el.customer || "—") +
            "</td>" +
            '<td class="wrap-cell" title="' +
            escapeHtml(shipTo || "") +
            '">' +
            escapeHtml(shipTo || "—") +
            "</td>" +
            "<td>" +
            escapeHtml(el.well || "—") +
            "</td>" +
            "<td>" +
            escapeHtml(el.rig || "—") +
            "</td>" +
            "<td>" +
            escapeHtml(el.location || el.store || "—") +
            "</td>" +
            '<td><span class="badge ' +
            (el.status === "Open" ? "badge-open" : "badge-closed") +
            '">' +
            escapeHtml(el.status || "—") +
            "</span></td>" +
            "<td>" +
            escapeHtml(el.transferType === "well-transfer" ? "Well transfer" : "—") +
            "</td>" +
            "</tr>"
          );
        })
        .join("");
      panel =
        '<div class="table-wrap"><table class="table"><thead><tr>' +
        "<th>EL No</th><th>Company</th><th>Ship to</th><th>Well</th><th>Rig</th><th>Store</th><th>Status</th><th>Type</th>" +
        "</tr></thead><tbody>" +
        (elRows ||
          '<tr><td colspan="8" class="table-empty">No equipment lists on this job yet. Use Create EL.</td></tr>') +
        "</tbody></table></div>";
    } else if (tab === "dts") {
      var dtRows = dts
        .map(function (d) {
          refreshDtReceiveStatus(d);
          return (
            '<tr class="row-click" data-dt="' +
            escapeHtml(d.id || d.dtNo) +
            '">' +
            '<td class="mono">DT-' +
            escapeHtml(formatDtNo(d.dtNo || d.id)) +
            "</td>" +
            '<td class="mono">' +
            escapeHtml(d.elNo || d.orderNo || "—") +
            "</td>" +
            "<td>" +
            escapeHtml(d.customer || d.company || "—") +
            "</td>" +
            "<td>" +
            escapeHtml(formatDate(d.shipDate || d.createdAt)) +
            "</td>" +
            "<td>" +
            escapeHtml(dtReceiveStatusLabel(d)) +
            "</td>" +
            '<td class="num-cell">' +
            (d.lines ? d.lines.length : 0) +
            "</td>" +
            "</tr>"
          );
        })
        .join("");
      panel =
        '<div class="table-wrap"><table class="table"><thead><tr>' +
        "<th>DT</th><th>EL</th><th>Company</th><th>Ship date</th><th>Receive status</th><th>Lines</th>" +
        "</tr></thead><tbody>" +
        (dtRows ||
          '<tr><td colspan="6" class="table-empty">No delivery tickets for ELs on this job.</td></tr>') +
        "</tbody></table></div>";
    } else if (tab === "rrs") {
      var rrRows = rrs
        .map(function (r) {
          return (
            '<tr class="row-click" data-rr="' +
            escapeHtml(r.id) +
            '">' +
            '<td class="mono">RR ' +
            escapeHtml(r.rrLabel != null ? r.rrLabel : r.rrNo) +
            "</td>" +
            '<td class="mono">DT-' +
            escapeHtml(r.dtNo || "—") +
            "</td>" +
            '<td class="mono">' +
            escapeHtml(r.elNo || r.orderNo || "—") +
            "</td>" +
            "<td>" +
            escapeHtml(formatDateTime(r.createdAt)) +
            "</td>" +
            "<td>" +
            (r.isPartial ? "Partial" : r.isFinal ? "Final" : "—") +
            "</td>" +
            '<td class="num-cell">' +
            (r.lines ? r.lines.length : r.serials ? r.serials.length : 0) +
            "</td>" +
            "</tr>"
          );
        })
        .join("");
      panel =
        '<div class="table-wrap"><table class="table"><thead><tr>' +
        "<th>RR</th><th>DT</th><th>EL</th><th>Created</th><th>Type</th><th>Lines</th>" +
        "</tr></thead><tbody>" +
        (rrRows ||
          '<tr><td colspan="6" class="table-empty">No receiving reports for ELs on this job.</td></tr>') +
        "</tbody></table></div>";
    } else {
      /* active rentals */
      var rentRows = rentals
        .map(function (r) {
          return (
            "<tr>" +
            '<td class="mono"><button type="button" class="table-link" data-serial="' +
            escapeHtml(r.serial) +
            '">' +
            escapeHtml(r.serial) +
            "</button></td>" +
            '<td class="wrap-cell">' +
            escapeHtml(r.description || "—") +
            "</td>" +
            '<td class="mono"><button type="button" class="table-link" data-el="' +
            escapeHtml(r.elId) +
            '">' +
            escapeHtml(r.elNo) +
            "</button></td>" +
            '<td class="mono">' +
            escapeHtml(r.lastDtId ? "DT-" + formatDtNo(r.lastDtId) : "—") +
            "</td>" +
            "<td>" +
            escapeHtml(formatDate(r.onRentAt)) +
            "</td>" +
            "<td>" +
            escapeHtml(r.location || "—") +
            "</td>" +
            '<td><span class="badge badge-out">Out</span></td>' +
            "</tr>"
          );
        })
        .join("");
      panel =
        '<div class="table-wrap"><table class="table"><thead><tr>' +
        "<th>Serial</th><th>Description</th><th>EL</th><th>Last DT</th><th>On rent since</th><th>Location</th><th>Status</th>" +
        "</tr></thead><tbody>" +
        (rentRows ||
          '<tr><td colspan="7" class="table-empty">No assets currently out on this job.</td></tr>') +
        "</tbody></table></div>";
    }

    main.innerHTML =
      '<div class="page-header page-header-compact"><div><h1 class="page-title mono">Job ' +
      escapeHtml(job.jobNo || job.id) +
      ' <span class="badge ' +
      (job.status === "Open" ? "badge-open" : "badge-closed") +
      '">' +
      escapeHtml(job.status || "Open") +
      "</span></h1>" +
      '<p class="page-subtitle">' +
      escapeHtml(job.company || "—") +
      " · " +
      escapeHtml(job.well || "—") +
      " · " +
      els.length +
      " EL(s) · " +
      rentals.length +
      " active rental(s)</p></div>" +
      '<div class="btn-group">' +
      '<button type="button" class="btn btn-primary btn-sm" id="job-create-el">Create EL</button>' +
      '<button type="button" class="btn btn-ghost btn-sm" data-nav="jobs">All Jobs</button>' +
      "</div></div>" +
      '<div id="job-header-host"></div>' +
      '<div class="tabs" role="tablist">' +
      tabBtn("els", "Equipment Lists", els.length) +
      tabBtn("dts", "Delivery Tickets", dts.length) +
      tabBtn("rrs", "Receiving Reports", rrs.length) +
      tabBtn("rentals", "Active Rentals", rentals.length) +
      tabBtn("billing", "Billing", billLineN) +
      "</div>" +
      '<div class="job-tab-panel">' +
      panel +
      "</div>";

    renderJobHeaderReadonly($("#job-header-host", main), job);

    $$("[data-nav]", main).forEach(function (b) {
      b.addEventListener("click", function () {
        navigate(b.getAttribute("data-nav"));
      });
    });
    $$("[data-job-tab]", main).forEach(function (b) {
      b.addEventListener("click", function () {
        state.jobTab = b.getAttribute("data-job-tab");
        viewJobDetail(main);
      });
    });
    if (tab === "billing") {
      bindJobBillingPanel(main, job);
    }
    var createEl = $("#job-create-el", main);
    if (createEl) {
      createEl.addEventListener("click", function () {
        navigate("equipment-new", { jobId: job.id, jobNo: job.jobNo });
      });
    }
    $$("[data-el]", main).forEach(function (b) {
      b.addEventListener("click", function (e) {
        e.stopPropagation();
        navigate("equipment-order", { id: b.getAttribute("data-el") });
      });
    });
    $$("tr[data-el]", main).forEach(function (row) {
      row.addEventListener("click", function (e) {
        if (e.target && e.target.closest && e.target.closest("button, a, [data-dt], [data-serial], [data-job-link]"))
          return;
        navigate("equipment-order", { id: row.getAttribute("data-el") });
      });
    });
    /* Buttons and rows (billing tab uses button.table-link[data-dt]) */
    $$("[data-dt]", main).forEach(function (el) {
      el.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        var dtId = el.getAttribute("data-dt");
        if (dtId) navigate("equipment-dt", { id: dtId });
      });
    });
    $$("tr[data-rr]", main).forEach(function (row) {
      row.addEventListener("click", function () {
        navigate("tickets-rr", { id: row.getAttribute("data-rr") });
      });
    });
    $$("[data-serial]", main).forEach(function (b) {
      b.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        navigate("cardex-details", { serial: b.getAttribute("data-serial") });
      });
    });
  }

  /* ========================================================================
   * EQUIPMENT LIST — search
   * ======================================================================== */
  function viewEquipmentSearch(main) {
    setBreadcrumbs([
      { label: "Home", nav: "home" },
      { label: "Equipment List" },
    ]);
    var f = state.elFilter || { status: "Open" };
    var masters = loadMasters();
    var locOpts = masters.locations
      .map(function (l) {
        return (
          '<option value="' +
          escapeHtml(l) +
          '"' +
          (f.location === l ? " selected" : "") +
          ">" +
          escapeHtml(l) +
          "</option>"
        );
      })
      .join("");

    main.innerHTML =
      '<div class="page-header"><div><h1 class="page-title">Equipment List</h1>' +
      '<p class="page-subtitle">Search equipment lists. Open an EL or create a new one.</p></div>' +
      '<button type="button" class="btn btn-primary" data-nav="equipment-new">New EL</button></div>' +
      '<div class="panel search-panel"><div class="panel-body">' +
      '<div class="form-grid-3">' +
      '<label class="field"><span>Status</span><select id="el-status">' +
      '<option value=""' +
      (!f.status ? " selected" : "") +
      ">All</option>" +
      '<option value="Open"' +
      (f.status === "Open" ? " selected" : "") +
      ">Open</option>" +
      '<option value="Closed"' +
      (f.status === "Closed" ? " selected" : "") +
      ">Closed</option></select></label>" +
      '<label class="field"><span>Company</span><input type="text" id="el-company" class="form-control" value="' +
      escapeHtml(f.company || "") +
      '" /></label>' +
      '<label class="field"><span>Rig</span><input type="text" id="el-rig" class="form-control" value="' +
      escapeHtml(f.rig || "") +
      '" /></label>' +
      '<label class="field"><span>Created by</span><input type="text" id="el-created" class="form-control" value="' +
      escapeHtml(f.createdBy || "") +
      '" /></label>' +
      '<label class="field"><span>Job No</span><input type="text" id="el-job" class="form-control" value="' +
      escapeHtml(f.jobNo || "") +
      '" /></label>' +
      '<label class="field"><span>Sales person</span><input type="text" id="el-sales" class="form-control" value="' +
      escapeHtml(f.salesPerson || "") +
      '" /></label>' +
      '<label class="field"><span>Location</span><select id="el-loc"><option value="">All</option>' +
      locOpts +
      "</select></label>" +
      '<label class="field"><span>EL No</span><input type="text" id="el-order" class="form-control" value="' +
      escapeHtml(f.orderNo || f.elNo || "") +
      '" placeholder="00001" /></label>' +
      "</div>" +
      '<div class="search-actions">' +
      '<button type="button" class="btn btn-primary" id="el-search">Search</button>' +
      "</div></div></div>" +
      '<div id="el-results-host"></div>';

    function doSearch(resetPage) {
      if (resetPage !== false) state.elPage = 1;
      state.elFilter = {
        status: $("#el-status", main).value,
        company: ($("#el-company", main).value || "").trim(),
        rig: ($("#el-rig", main).value || "").trim(),
        createdBy: ($("#el-created", main).value || "").trim(),
        jobNo: ($("#el-job", main).value || "").trim(),
        salesPerson: ($("#el-sales", main).value || "").trim(),
        location: $("#el-loc", main).value,
        orderNo: ($("#el-order", main).value || "").trim(),
      };
      var f2 = state.elFilter;
      var list = loadEquipmentLists().filter(function (el) {
        if (f2.status && el.status !== f2.status) return false;
        if (f2.company && String(el.company || el.customer || "").toLowerCase().indexOf(f2.company.toLowerCase()) === -1)
          return false;
        if (f2.rig && String(el.rig || "").toLowerCase().indexOf(f2.rig.toLowerCase()) === -1) return false;
        if (f2.createdBy && String(el.createdBy || "").toLowerCase().indexOf(f2.createdBy.toLowerCase()) === -1)
          return false;
        if (f2.jobNo && String(el.jobNo || "").toLowerCase().indexOf(f2.jobNo.toLowerCase()) === -1) return false;
        if (f2.salesPerson && String(el.salesPerson || "").toLowerCase().indexOf(f2.salesPerson.toLowerCase()) === -1)
          return false;
        if (f2.location && el.location !== f2.location && el.store !== f2.location) return false;
        if (f2.orderNo) {
          var hay = ((el.elNo || "") + " " + (el.id || "") + " " + (el.orderNo || "")).toLowerCase();
          if (hay.indexOf(f2.orderNo.toLowerCase()) === -1) return false;
        }
        return true;
      });
      state.elResults = list;
      renderElResults($("#el-results-host", main), list);
    }

    $("#el-search", main).addEventListener("click", function () {
      doSearch(true);
    });
    $$("[data-nav]", main).forEach(function (b) {
      b.addEventListener("click", function () {
        navigate(b.getAttribute("data-nav"));
      });
    });

    /* auto-run with current filter */
    doSearch(false);
  }

  function renderElResults(host, list) {
    if (!host) return;
    var pageInfo = paginateList(list, state.elPage);
    state.elPage = pageInfo.page;
    var pager = renderListPager(pageInfo);
    var slice = pageInfo.items;
    host.innerHTML =
      '<div class="results-bar"><span>' +
      pageInfo.total +
      " EL(s)</span></div>" +
      pager +
      '<div class="table-wrap"><table class="table"><thead><tr>' +
      "<th>EL No</th><th>Status</th><th>Company</th><th>Well</th><th>Rig</th><th>Job No</th><th>Sales</th><th>Location</th><th>Created</th>" +
      "</tr></thead><tbody>" +
      (slice.length
        ? slice
            .map(function (el) {
              var wt =
                el.transferType === "well-transfer"
                  ? '<div><span class="badge badge-wt">WT</span></div>'
                  : "";
              return (
                '<tr class="row-clickable" data-el="' +
                escapeHtml(el.id) +
                '" title="Open EL">' +
                '<td class="mono wrap-cell">' +
                escapeHtml(displayElLabel(el)) +
                "</td>" +
                '<td><span class="badge ' +
                (el.status === "Open" ? "badge-open" : "badge-closed") +
                '">' +
                escapeHtml(el.status) +
                "</span></td>" +
                '<td class="wrap-cell">' +
                escapeHtml(el.company || el.customer || "—") +
                "</td>" +
                '<td class="wrap-cell">' +
                escapeHtml(el.well || "—") +
                "</td>" +
                '<td class="wrap-cell">' +
                escapeHtml(el.rig || "—") +
                "</td>" +
                '<td class="wrap-cell">' +
                (el.jobNo ? jobNoLinkHtml(el.jobNo) : "—") +
                wt +
                "</td>" +
                '<td class="wrap-cell">' +
                escapeHtml(el.salesPerson || "—") +
                "</td>" +
                '<td class="wrap-cell">' +
                escapeHtml(el.location || el.store || "—") +
                "</td>" +
                "<td>" +
                escapeHtml(formatDate(el.createdAt)) +
                "</td></tr>"
              );
            })
            .join("")
        : '<tr><td colspan="9" class="table-empty">No equipment lists match.</td></tr>') +
      "</tbody></table></div>" +
      pager;

    bindListPager(host, function (p) {
      state.elPage = p;
      renderElResults(host, list);
      if (host.scrollIntoView) host.scrollIntoView({ block: "start" });
    });
    $$("tr[data-el]", host).forEach(function (row) {
      row.addEventListener("click", function (e) {
        if (e.target && e.target.closest && e.target.closest("[data-job-link]")) return;
        navigate("equipment-order", { id: row.getAttribute("data-el") });
      });
      row.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          navigate("equipment-order", { id: row.getAttribute("data-el") });
        }
      });
      row.setAttribute("tabindex", "0");
      row.setAttribute("role", "link");
    });
    bindJobLinks(host);
  }

  /* ========================================================================
   * EQUIPMENT — new / order
   * ======================================================================== */
  function viewEquipmentNew(main) {
    var el = emptyEquipmentList();
    el.elNo = nextElNo();
    el.id = el.elNo;
    el.orderNo = el.elNo; /* legacy sync for older DT/RR fields */
    el.createdAt = nowISO();
    /* Creating from a Job: reuse that job number + identical header fields */
    var fromJobId = state.params.jobId || state.params.jobNo || "";
    if (fromJobId) {
      var job = getJob(fromJobId);
      if (job) {
        applyJobHeaderToEl(el, job);
        el.jobNo = job.jobNo;
        el.jobId = job.id;
      } else {
        el.jobNo = state.params.jobNo || nextJobNo();
      }
    } else {
      el.jobNo = nextJobNo();
    }
    state.elDraft = el;
    state.elTab = "header";
    navigate("equipment-order", { id: el.id, isNew: "1" });
  }

  function viewEquipmentOrder(main) {
    var id = state.params.id;
    var isNew = state.params.isNew === "1";
    var el = null;

    if (state.elDraft && state.elDraft.id === id) {
      el = state.elDraft;
    } else {
      el = getEquipmentList(id);
      if (!el && isNew) {
        el = emptyEquipmentList();
        el.id = id;
        el.elNo = id;
      }
      state.elDraft = el ? deepClone(el) : null;
    }

    if (!el) {
      setBreadcrumbs([
        { label: "Home", nav: "home" },
        { label: "Equipment List", nav: "equipment" },
        { label: "Not found" },
      ]);
      main.innerHTML =
        '<div class="empty-state"><h3>Order not found</h3>' +
        '<button type="button" class="btn btn-primary" data-nav="equipment">Back</button></div>';
      $$("[data-nav]", main).forEach(function (b) {
        b.addEventListener("click", function () {
          navigate(b.getAttribute("data-nav"));
        });
      });
      return;
    }

    setBreadcrumbs([
      { label: "Home", nav: "home" },
      { label: "Equipment List", nav: "equipment" },
      { label: displayElLabel(el) },
    ]);

    var closed = el.status === "Closed";
    var masters = loadMasters();
    /* Header is only editable when creating New EL (or first save on well-transfer). Existing ELs are locked. */
    var canEditHeader = isNew || !!el.needsHeaderUpdate;

    var banner = "";
    if (el.needsHeaderUpdate) {
      banner =
        '<div class="alert alert-warn"><strong>Header update required.</strong> Complete and save the header for this well-transfer EL once. After that it is locked.</div>';
    }
    if (closed) {
      banner +=
        '<div class="alert alert-info"><strong>Closed.</strong> This equipment list is closed. Line and DT changes are disabled.</div>';
    }

    /* Single page: header (read-only or new) + order/serials */
    main.innerHTML =
      '<div class="page-header page-header-compact"><div><h1 class="page-title mono">EL ' +
      escapeHtml(displayElLabel(el)) +
      ' <span class="badge ' +
      (el.status === "Open" ? "badge-open" : "badge-closed") +
      '">' +
      escapeHtml(el.status) +
      "</span>" +
      (el.transferType === "well-transfer" ? ' <span class="badge badge-wt">Well Transfer</span>' : "") +
      '</h1><p class="page-subtitle">' +
      "Job " +
      (el.jobNo ? jobNoLinkHtml(el.jobNo) : "—") +
      " · " +
      escapeHtml(el.company || "—") +
      (!canEditHeader ? " · Header locked" : "") +
      "</p></div>" +
      '<div class="btn-group">' +
      '<button type="button" class="btn btn-primary btn-sm" id="el-print-pdf">Print PDF</button>' +
      (!closed && !isNew
        ? '<button type="button" class="btn btn-warn btn-sm" id="el-close">Close EL</button>' +
          '<button type="button" class="btn btn-secondary btn-sm" id="el-well-xfer">Well Transfer</button>'
        : "") +
      '<button type="button" class="btn btn-ghost btn-sm" data-nav="equipment">Back to search</button>' +
      "</div></div>" +
      banner +
      '<div class="el-single-page">' +
      '<div id="el-header-host"></div>' +
      '<div id="el-lines-host"></div>' +
      "</div>";

    $$("[data-nav]", main).forEach(function (b) {
      b.addEventListener("click", function () {
        navigate(b.getAttribute("data-nav"));
      });
    });
    bindJobLinks(main);
    var elPrint = $("#el-print-pdf", main);
    if (elPrint) {
      elPrint.addEventListener("click", function () {
        printEquipmentList(el);
      });
    }

    var closeBtn = $("#el-close", main);
    if (closeBtn) {
      closeBtn.addEventListener("click", function () {
        if (!confirm("Close this equipment list? Status will be set to Closed.")) return;
        el.status = "Closed";
        state.elDraft = el;
        saveEquipmentList(el);
        toast("Equipment list closed");
        viewEquipmentOrder(main);
      });
    }

    var wtBtn = $("#el-well-xfer", main);
    if (wtBtn) {
      wtBtn.addEventListener("click", function () {
        if (
          !confirm(
            "Well transfer moves equipment to a new EL so billing can continue.\n\n" +
              "Serials leave this EL and live only on the new well-transfer EL " +
              "(only way to have equipment on a new open list while still billing).\n\nContinue?"
          )
        ) {
          return;
        }
        if (!(el.lines || []).length) {
          toast("No lines to transfer", "error");
          return;
        }
        var neo = deepClone(el);
        neo.elNo = nextElNo();
        neo.id = neo.elNo;
        neo.orderNo = neo.elNo;
        /* keep job number for billing continuity; assign only if missing */
        if (!neo.jobNo) neo.jobNo = nextJobNo();
        neo.status = "Open";
        neo.transferType = "well-transfer";
        neo.needsHeaderUpdate = true;
        neo.headerSaved = false;
        neo.sourceElId = el.id;
        neo.transferFromOrderNo = displayElLabel(el);
        neo.createdAt = nowISO();
        /* New EL has no DTs/RRs yet — do not inherit source ledger */
        neo.dtLedger = [];
        neo.rrLedger = [];
        neo.notes =
          (neo.notes ? neo.notes + "\n" : "") +
          "Well transfer from EL " +
          displayElLabel(el) +
          " — equipment moved for continued billing.";
        neo.lines = (el.lines || []).map(function (ln) {
          ln = deepClone(ln);
          ln.id = uid("ln");
          ln.selectedForDt = false;
          ln.lastDtId = "";
          /* keep onRent so billing continuity is visible; clear lastDt for this EL's DT list */
          (ln.serials || []).forEach(function (s) {
            if (s && typeof s === "object") s.lastDtId = "";
          });
          return ln;
        });

        /* One-EL rule: remove lines from source so serials do not live on two open ELs */
        el.lines = [];
        el.notes =
          (el.notes ? el.notes + "\n" : "") +
          "Well transfer out → EL " +
          displayElLabel(neo) +
          " on " +
          todayISO() +
          ". Equipment moved off this list.";
        el.updatedAt = new Date().toISOString();
        saveEquipmentList(el);
        saveEquipmentList(neo);

        toast("Well-transfer EL created: " + neo.orderNo + " — equipment moved off source EL");
        state.elDraft = neo;
        /* Open as editable once for header, then locks after save */
        navigate("equipment-order", { id: neo.id, isNew: "1" });
      });
    }

    if (canEditHeader) {
      renderElHeaderForm($("#el-header-host", main), el, masters, closed, true, function () {
        /* after first save, leave create mode so header locks */
        state.params.isNew = "";
        el.needsHeaderUpdate = false;
        state.elDraft = el;
        navigate("equipment-order", { id: el.id });
      });
    } else {
      renderElHeaderReadonly($("#el-header-host", main), el);
    }
    renderElLines($("#el-lines-host", main), el, closed);
  }

  function renderElHeaderReadonly(host, el) {
    if (!host) return;
    function cell(label, val, isHtml) {
      return (
        '<div class="el-ro-cell"><span class="kv-label">' +
        escapeHtml(label) +
        '</span><div class="kv-value">' +
        (isHtml ? val : escapeHtml(val || "—")) +
        "</div></div>"
      );
    }
    host.innerHTML =
      '<div class="panel el-header-panel el-header-compact el-header-readonly">' +
      '<div class="panel-header panel-header-compact">' +
      '<h2 class="panel-title">Header</h2>' +
      '<span class="text-muted" style="font-size:0.75rem">Not editable — use New EL to create another</span>' +
      "</div>" +
      '<div class="panel-body el-header-summary el-header-summary-inline">' +
      cell("EL No", displayElLabel(el)) +
      cell("Job No", el.jobNo ? jobNoLinkHtml(el.jobNo) : "—", !!el.jobNo) +
      cell("Created", formatDateTime(el.createdAt)) +
      cell("Company", el.company || el.customer) +
      cell("Phone", el.phone) +
      cell("Well", el.well) +
      cell("Rig", el.rig) +
      cell("AFE", el.afe) +
      cell("Store", el.location || el.store) +
      cell("PO", el.poNumber) +
      cell("Customer contact", el.contact) +
      cell("Sales", el.salesmanField || el.salesPerson) +
      cell("Ship to", el.shipTo) +
      cell("Bill to", el.billTo) +
      (el.notes ? cell("Notes", el.notes) : "") +
      "</div></div>";
    bindJobLinks(host);
  }

  function renderElHeaderForm(host, el, masters, closed, compact, onSaved) {
    if (!host) return;
    var dis = closed ? " disabled" : "";
    var locVal = el.location || el.store || "";
    var locOpts = masters.locations
      .map(function (l) {
        return (
          '<option value="' +
          escapeHtml(l) +
          '"' +
          (locVal === l ? " selected" : "") +
          ">" +
          escapeHtml(l) +
          "</option>"
        );
      })
      .join("");
    /* allow recovered free-text store if not in masters */
    if (locVal && masters.locations.indexOf(locVal) === -1) {
      locOpts =
        '<option value="' +
        escapeHtml(locVal) +
        '" selected>' +
        escapeHtml(locVal) +
        "</option>" +
        locOpts;
    }

    function f(label, key, val, type, ro) {
      type = type || "text";
      var extra = dis || (ro ? " readonly" : "");
      return (
        '<label class="field"><span>' +
        escapeHtml(label) +
        '</span><input type="' +
        type +
        '" id="hf-' +
        key +
        '" class="form-control' +
        (ro ? " input-readonly" : "") +
        '" value="' +
        escapeHtml(val || "") +
        '"' +
        extra +
        " /></label>"
      );
    }

    /* Editable only for New EL (or first save after well-transfer) */
    host.innerHTML =
      '<div class="panel el-header-panel el-header-compact"><div class="panel-header panel-header-compact">' +
      '<h2 class="panel-title">Header</h2>' +
      (el.transferType === "well-transfer"
        ? '<span class="badge badge-wt">Well Transfer' +
          (el.transferFromOrderNo || el.sourceElId
            ? " from EL " + escapeHtml(el.transferFromOrderNo || el.sourceElId)
            : "") +
          "</span>"
        : '<span class="text-muted" style="font-size:0.75rem">EL No &amp; Job No auto-assigned · save locks header</span>') +
      (!closed
        ? '<button type="button" class="btn btn-primary btn-sm" id="hf-save">Save EL</button>'
        : "") +
      '</div><div class="panel-body stack">' +
      '<div class="form-grid-4 form-grid-compact">' +
      f("EL No", "elNo", displayElLabel(el), "text", true) +
      f("Job No", "jobNo", el.jobNo, "text", true) +
      f("Created", "createdAtDisplay", formatDateTime(el.createdAt || nowISO()), "text", true) +
      f("Company", "company", el.company || el.customer) +
      f("Phone", "phone", el.phone) +
      f("Well", "well", el.well) +
      f("Rig", "rig", el.rig) +
      f("AFE", "afe", el.afe) +
      '<label class="field required"><span>Location / Store</span><select id="hf-location" class="form-control"' +
      dis +
      '><option value="">Select…</option>' +
      locOpts +
      "</select></label>" +
      f("PO Number", "poNumber", el.poNumber) +
      f("Customer contact", "contact", el.contact) +
      f("Sales", "salesmanField", el.salesmanField || el.salesPerson) +
      f("Ship to", "shipTo", el.shipTo) +
      f("Bill to", "billTo", el.billTo) +
      "</div>" +
      '<label class="field field-notes-compact"><span>Notes</span><input type="text" id="hf-notes" class="form-control" value="' +
      escapeHtml(el.notes || "") +
      '"' +
      dis +
      " /></label>" +
      "</div></div>";

    function g(id) {
      var n = $("#hf-" + id, host);
      return n ? String(n.value || "").trim() : "";
    }

    function applyHeaderSave() {
      var loc = g("location");
      if (!loc) {
        toast("Location / Store is required", "error");
        var locEl = $("#hf-location", host);
        if (locEl) locEl.focus();
        return;
      }
      /* EL No + Job No are auto-assigned — do not take free-text order number */
      if (!el.elNo) el.elNo = nextElNo();
      var elNum = parseElNoNum(el.elNo);
      if (!isNaN(elNum)) el.elNo = formatElNo(elNum);
      if (!el.id) el.id = el.elNo;
      el.orderNo = el.elNo;
      if (!el.jobNo) el.jobNo = nextJobNo();
      el.company = g("company");
      el.customer = el.company;
      el.well = g("well");
      el.rig = g("rig");
      el.salesPerson = g("salesmanField") || el.salesPerson;
      el.salesmanField = g("salesmanField");
      el.poNumber = g("poNumber");
      el.afe = g("afe");
      el.contact = g("contact");
      el.phone = g("phone");
      el.location = loc;
      el.store = loc;
      el.shipTo = g("shipTo");
      el.billTo = g("billTo");
      el.notes = g("notes");
      if (!el.createdAt) el.createdAt = nowISO();
      el.header = el.header || {};
      el.header.elNo = el.elNo;
      el.header.orderNo = el.elNo;
      el.header.company = el.company;
      el.header.well = el.well;
      el.header.rig = el.rig;
      el.header.jobNo = el.jobNo;
      el.header.store = el.store;
      el.header.phone = el.phone;
      el.header.shipTo = el.shipTo;
      el.header.billingAddress = el.billTo;
      el.header.afe = el.afe;
      el.header.salesmanField = el.salesmanField;
      el.header.contact = el.contact;
      el.header.createdAt = el.createdAt;
      el.headerSaved = true;
      el.needsHeaderUpdate = false;
      el.updatedAt = nowISO();
      state.elDraft = el;
      saveEquipmentList(el);
      try {
        ensureJobForEl(el);
      } catch (eJob) {}
      toast("EL " + displayElLabel(el) + " saved — header is now locked");
      if (typeof onSaved === "function") onSaved(el);
    }

    var saveBtn = $("#hf-save", host);
    if (saveBtn) saveBtn.addEventListener("click", applyHeaderSave);
  }

  function renderElLines(host, el, closed) {
    var lines = el.lines || [];
    var dts = getDtsForEl(el);

    var linesHtml = lines.length
      ? lines
          .map(function (ln, idx) {
            return renderLineItem(ln, idx, el, closed);
          })
          .join("")
      : '<div class="empty-state"><p>No line items yet. Add serials from inventory.</p></div>';

    var rrs = getRrsForEl(el);
    var dtListItems = dts.length
      ? dts
          .map(function (d) {
            refreshDtReceiveStatus(d);
            var st = dtReceiveStatusLabel(d);
            return (
              '<button type="button" class="dt-mini-row" data-dt="' +
              escapeHtml(d.id || d.dtNo) +
              '" title="' +
              escapeHtml(st) +
              '">' +
              '<span class="mono dt-mini-no">' +
              escapeHtml(formatDtNo(d.dtNo || d.id)) +
              "</span>" +
              '<span class="dt-mini-date">' +
              escapeHtml(st) +
              "</span>" +
              "</button>"
            );
          })
          .join("")
      : '<div class="dt-mini-empty">None</div>';

    var rrListItems = rrs
      .map(function (r) {
        return (
          '<button type="button" class="dt-mini-row" data-rr="' +
          escapeHtml(r.id) +
          '" title="DT ' +
          escapeHtml(r.dtNo || "") +
          '">' +
          '<span class="mono dt-mini-no">RR ' +
          escapeHtml(r.rrLabel) +
          "</span>" +
          '<span class="dt-mini-date">' +
          escapeHtml(r.isPartial && !r.isFinal ? "partial" : r.isFinal ? "final" : "full") +
          "</span>" +
          "</button>"
        );
      })
      .join("");

    host.innerHTML =
      '<div class="el-lines-layout">' +
      '<div class="el-lines-main">' +
      (!closed
        ? '<div class="panel mb-2"><div class="panel-body">' +
          '<div class="form-grid-2">' +
          '<label class="field"><span>Add serial(s) from inventory</span>' +
          '<input type="text" id="ln-add-serial" class="form-control" placeholder="S/N or multiple: 123456, 789012, DP-3344" autocomplete="off" /></label>' +
          '<div class="field"><span>&nbsp;</span>' +
          '<button type="button" class="btn btn-primary" id="ln-add-btn">Add to EL</button></div>' +
          "</div>" +
          '<p class="form-hint">Comma-separated serials OK. A serial can only live on <strong>one open EL</strong> — use <strong>Well Transfer</strong> to move equipment and continue billing. Same description merges into one line.</p>' +
          "</div></div>" +
          '<div class="dt-create-bar">' +
          '<label class="field mb-0"><span>Create delivery ticket</span>' +
          '<select id="dt-type" class="form-control">' +
          '<option value="dt">Delivery Ticket</option>' +
          "</select></label>" +
          '<button type="button" class="btn btn-primary" id="dt-create">Create DT</button>' +
          '<span class="form-hint">Check lines to include. Serials already <strong>Out / on rent</strong> cannot go on a new DT (no double charge). Available serials go On Rent and the ticket is logged. Print with/without pricing from the DT screen.</span>' +
          "</div>"
        : "") +
      '<div class="flex-between mb-1"><h3 class="panel-title mb-0">Line items</h3>' +
      '<span class="text-muted">' +
      lines.length +
      " line(s)</span></div>" +
      '<div id="lines-host">' +
      linesHtml +
      "</div>" +
      "</div>" +
      '<aside class="dt-mini-panel el-side-panels" aria-label="Delivery and receiving tickets">' +
      '<div class="el-side-stack">' +
      '<div class="dt-mini-block">' +
      '<div class="dt-mini-title">DT</div>' +
      '<div class="dt-mini-list">' +
      dtListItems +
      "</div></div>" +
      '<div class="dt-mini-block">' +
      '<div class="dt-mini-title">RR</div>' +
      '<div class="dt-mini-list">' +
      (rrs.length ? rrListItems : '<div class="dt-mini-empty">None</div>') +
      "</div></div>" +
      "</div></aside>" +
      "</div>";

    bindLineEvents(host, el, closed);
    $$("[data-rr]", host).forEach(function (b) {
      b.addEventListener("click", function () {
        navigate("tickets-rr", { id: b.getAttribute("data-rr") });
      });
    });
  }

  function renderLineItem(ln, idx, el, closed) {
    var headerLoc = el.location || el.store || "";
    var availableCount = 0;
    var serialChips = (ln.serials || [])
      .map(function (s) {
        var asset = findCardexRecord(s.serial);
        var assetLoc = (
          s.location ||
          (asset && (asset.location || asset.store)) ||
          ""
        ).trim();
        var mismatch = headerLoc && assetLoc && assetLoc !== headerLoc;
        var block = getSerialDtBlock(s.serial, s, el);
        /* ON RENT badge only on the billing EL for an open unreceived DT — never on old/closed ELs */
        var onRentHere = !closed && isSerialOnRentForEl(s.serial, el);
        var blockedForDt = block.blocked;
        if (!blockedForDt) availableCount += 1;
        var statusFlag = "";
        if (onRentHere) {
          statusFlag = ' <span class="on-rent-badge">ON RENT</span>';
        } else if (!closed && blockedForDt && !block.onThisEl) {
          /* Listed here but billed elsewhere — should be rare after reconcile */
          statusFlag = ' <span class="on-rent-badge in-store-badge">ON RENT ELSEWHERE</span>';
        } else if (!closed && mismatch && assetLoc) {
          statusFlag =
            ' <span class="on-rent-badge in-store-badge">IN ' +
            escapeHtml(String(assetLoc).toUpperCase()) +
            "</span>";
        } else if (!closed && mismatch) {
          statusFlag = " ⚠";
        }
        /* Closed / historical ELs: serial only, no live status */
        var tip = closed
          ? "Historical EL — tool status is not shown on closed lists"
          : onRentHere
            ? "On rent on this EL" + block.via + " — receive the DT to return tool to In"
            : blockedForDt
              ? "Cannot DT —" + block.via
              : mismatch
                ? "Location mismatch: serial is IN " +
                  String(assetLoc).toUpperCase() +
                  " — EL header store is " +
                  headerLoc
                : "Available for DT";
        return (
          '<button type="button" class="chip chip-serial' +
          (mismatch && !closed ? " chip-mismatch" : "") +
          (onRentHere ? " chip-on-rent" : "") +
          '" data-serial="' +
          escapeHtml(s.serial) +
          '" title="' +
          escapeHtml(tip) +
          '">' +
          escapeHtml(s.serial) +
          statusFlag +
          "</button>"
        );
      })
      .join("");

    var qtyEditable = !closed && String(ln.uom).toUpperCase() === "FT";
    var anyMismatch = (ln.serials || []).some(function (s) {
      var asset = findCardexRecord(s.serial);
      var assetLoc = (
        s.location ||
        (asset && (asset.location || asset.store)) ||
        ""
      ).trim();
      return headerLoc && assetLoc && assetLoc !== headerLoc;
    });
    var dis = closed ? " disabled" : "";
    var noDtAvailable = availableCount === 0 && (ln.serials || []).length > 0;
    var checkDisabled = closed || noDtAvailable;
    var checkTitle = closed
      ? "Closed EL — no new DTs"
      : noDtAvailable
        ? "All serials already on rent (open DT) — receive before charging again"
        : "Include on DT (only available serials will be billed)";

    return (
      '<div class="line-item line-item-rich' +
      (noDtAvailable ? " line-item-on-rent" : "") +
      '" data-line-id="' +
      escapeHtml(ln.id) +
      '">' +
      '<div class="line-item-head">' +
      (!closed
        ? '<label class="checkbox-row" title="' +
          escapeHtml(checkTitle) +
          '"><input type="checkbox" class="ln-dt-check" data-line-id="' +
          escapeHtml(ln.id) +
          '"' +
          (ln.selectedForDt && !noDtAvailable ? " checked" : "") +
          (checkDisabled ? " disabled" : "") +
          " /></label>"
        : "<span></span>") +
      '<span class="mono text-muted">Item ' +
      escapeHtml(ln.itemNo || String(idx + 1)) +
      "</span>" +
      '<span class="line-meta">' +
      "<span>Type: <strong>" +
      escapeHtml(ln.type || "RENT") +
      "</strong></span>" +
      "<span>UOM: <strong>" +
      escapeHtml(ln.uom || "—") +
      "</strong></span>" +
      (anyMismatch ? '<span class="loc-mismatch">Location mismatch</span>' : "") +
      "</span>" +
      (!closed
        ? '<button type="button" class="btn btn-sm btn-ghost ln-remove" data-line-id="' +
          escapeHtml(ln.id) +
          '">Remove</button>'
        : "<span></span>") +
      "</div>" +
      '<div class="line-desc-wide">' +
      escapeHtml(ln.description || "—") +
      "</div>" +
      '<div class="line-serials">' +
      (serialChips || '<span class="text-muted">No serials</span>') +
      "</div>" +
      '<div class="line-pricing-grid">' +
      '<label class="field mb-0"><span>Qty</span><input type="number" class="form-control qty-input ln-qty" data-line-id="' +
      escapeHtml(ln.id) +
      '" value="' +
      escapeHtml(String(ln.qty != null ? ln.qty : 1)) +
      '" min="0" step="any"' +
      (qtyEditable ? "" : " disabled") +
      " /></label>" +
      '<label class="field mb-0"><span>Min days</span><input type="text" class="form-control ln-min-days" data-line-id="' +
      escapeHtml(ln.id) +
      '" value="' +
      escapeHtml(ln.minDays || "") +
      '"' +
      dis +
      " /></label>" +
      '<label class="field mb-0"><span>Min amt</span><input type="text" class="form-control ln-min-amt" data-line-id="' +
      escapeHtml(ln.id) +
      '" value="' +
      escapeHtml(ln.minAmt || "") +
      '"' +
      dis +
      " /></label>" +
      '<label class="field mb-0"><span>Add\'l / day</span><input type="text" class="form-control ln-add-amt" data-line-id="' +
      escapeHtml(ln.id) +
      '" value="' +
      escapeHtml(ln.addAmt || "") +
      '"' +
      dis +
      " /></label>" +
      '<label class="field mb-0"><span>On rent date</span><input type="text" class="form-control" value="' +
      escapeHtml(ln.onRentAt ? formatDate(ln.onRentAt) : "") +
      '" disabled /></label>' +
      "</div></div>"
    );
  }

  function bindLineEvents(host, el, closed) {
    $$("[data-serial]", host).forEach(function (b) {
      b.addEventListener("click", function (e) {
        e.stopPropagation();
        navigate("cardex-details", { serial: b.getAttribute("data-serial") });
      });
    });
    $$("[data-dt]", host).forEach(function (b) {
      b.addEventListener("click", function () {
        navigate("equipment-dt", { id: b.getAttribute("data-dt") });
      });
    });

    if (closed) return;

    var addBtn = $("#ln-add-btn", host);
    var addInput = $("#ln-add-serial", host);

    /** Parse "123, 456,789" (comma / semicolon / whitespace) into unique serial tokens. */
    function parseSerialTokens(raw) {
      var parts = String(raw || "")
        .split(/[,;\n\r\t]+/)
        .map(function (s) {
          return s.trim();
        })
        .filter(Boolean);
      var seen = {};
      var out = [];
      parts.forEach(function (s) {
        var k = s.toUpperCase();
        if (seen[k]) return;
        seen[k] = true;
        out.push(s);
      });
      return out;
    }

    function isSerialOnEl(serial) {
      var key = String(serial).toUpperCase();
      var found = false;
      (el.lines || []).forEach(function (ln) {
        (ln.serials || []).forEach(function (s) {
          if (String(s.serial).toUpperCase() === key) found = true;
        });
      });
      return found;
    }

    /** Add one inventory serial to the EL. Returns { ok, reason, serial, detail }. */
    function addOneSerial(serial) {
      var asset = findCardexRecord(serial);
      if (!asset) {
        return { ok: false, reason: "not_found", serial: serial };
      }
      if (isSerialOnEl(asset.serial)) {
        return { ok: false, reason: "duplicate", serial: asset.serial };
      }

      /* One open EL per serial — well transfer is the only move path */
      var otherEls = findOtherOpenElsForSerial(asset.serial, el.id);
      if (otherEls.length) {
        return {
          ok: false,
          reason: "other_el",
          serial: asset.serial,
          detail:
            otherEls[0].label +
            (otherEls[0].orderNo ? " (" + otherEls[0].orderNo + ")" : "") +
            " — use Well Transfer to continue billing",
        };
      }

      var desc = asset.description || "";
      var uom = asset.uom || "JT";
      var match = null;
      (el.lines || []).forEach(function (ln) {
        if (ln.description === desc && String(ln.uom).toUpperCase() === String(uom).toUpperCase()) {
          match = ln;
        }
      });

      var serObj = {
        serial: asset.serial,
        location: asset.location || asset.store || "",
        onRent: asset.status === "Out",
        onRentAt: "",
        /* Do not copy last DT from inventory — that DT may belong to another EL */
        lastDtId: "",
      };

      if (match) {
        if (!match.serials) match.serials = [];
        match.serials.push(serObj);
        if (String(uom).toUpperCase() !== "FT") {
          match.qty = match.serials.length;
        }
      } else {
        var ln = emptyLine();
        ln.itemNo = String((el.lines || []).length + 1);
        ln.description = desc;
        ln.uom = uom;
        ln.qty = 1;
        ln.serials = [serObj];
        if (!el.lines) el.lines = [];
        el.lines.push(ln);
      }
      return { ok: true, serial: asset.serial };
    }

    function addSerialToOrder() {
      var tokens = parseSerialTokens(addInput.value);
      if (!tokens.length) {
        toast("Enter at least one serial", "error");
        return;
      }

      var added = [];
      var notFound = [];
      var duplicates = [];
      var otherEl = [];

      tokens.forEach(function (tok) {
        var res = addOneSerial(tok);
        if (res.ok) added.push(res.serial);
        else if (res.reason === "not_found") notFound.push(res.serial);
        else if (res.reason === "duplicate") duplicates.push(res.serial);
        else if (res.reason === "other_el") {
          otherEl.push(res.serial + " → " + (res.detail || "another open EL"));
        }
      });

      if (added.length) {
        renumberLines(el);
        state.elDraft = el;
        saveEquipmentList(el);
        addInput.value = "";
      }

      var msgs = [];
      if (added.length === 1) msgs.push("Added " + added[0]);
      else if (added.length > 1) msgs.push("Added " + added.length + " serials: " + added.join(", "));
      if (notFound.length) msgs.push("Not in inventory: " + notFound.join(", "));
      if (duplicates.length) msgs.push("Already on this EL: " + duplicates.join(", "));
      if (otherEl.length) {
        msgs.push(
          "Already on another open EL (use Well Transfer to continue billing): " + otherEl.join("; ")
        );
      }

      if (!added.length) {
        toast(msgs.join(" · ") || "No serials added", "error");
        return;
      }
      toast(
        msgs.join(" · "),
        notFound.length || duplicates.length || otherEl.length ? "info" : "success"
      );
      viewEquipmentOrder($("#main"));
    }

    if (addBtn) addBtn.addEventListener("click", addSerialToOrder);
    if (addInput) {
      addInput.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
          e.preventDefault();
          addSerialToOrder();
        }
      });
    }

    $$(".ln-dt-check", host).forEach(function (cb) {
      cb.addEventListener("change", function () {
        var id = cb.getAttribute("data-line-id");
        el.lines.forEach(function (ln) {
          if (ln.id === id) ln.selectedForDt = cb.checked;
        });
        state.elDraft = el;
        saveEquipmentList(el);
      });
    });

    $$(".ln-qty", host).forEach(function (inp) {
      inp.addEventListener("change", function () {
        var id = inp.getAttribute("data-line-id");
        var v = parseFloat(inp.value);
        if (isNaN(v) || v < 0) v = 0;
        el.lines.forEach(function (ln) {
          if (ln.id === id && String(ln.uom).toUpperCase() === "FT") ln.qty = v;
        });
        state.elDraft = el;
        saveEquipmentList(el);
      });
    });

    function bindPriceField(sel, prop) {
      $$(sel, host).forEach(function (inp) {
        inp.addEventListener("change", function () {
          var id = inp.getAttribute("data-line-id");
          el.lines.forEach(function (ln) {
            if (ln.id === id) ln[prop] = String(inp.value || "").trim();
          });
          state.elDraft = el;
          saveEquipmentList(el);
        });
      });
    }
    bindPriceField(".ln-min-days", "minDays");
    bindPriceField(".ln-min-amt", "minAmt");
    bindPriceField(".ln-add-amt", "addAmt");

    $$(".ln-remove", host).forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = btn.getAttribute("data-line-id");
        var line = null;
        (el.lines || []).forEach(function (ln) {
          if (ln.id === id) line = ln;
        });
        if (!line) return;
        openRemoveSerialsChooser(el, line);
      });
    });

    var dtCreate = $("#dt-create", host);
    if (dtCreate) {
      dtCreate.addEventListener("click", function () {
        createDtFromEl(el);
      });
    }
  }

  /**
   * Choose which serials to remove from a line (or remove the whole line).
   * Keeps remaining serials on the line when only some are removed.
   */
  function openRemoveSerialsChooser(el, line) {
    var serials = (line.serials || [])
      .map(function (s) {
        return typeof s === "string" ? s : s && s.serial;
      })
      .filter(Boolean);

    if (!serials.length) {
      if (!confirm("Remove this empty line?")) return;
      el.lines = (el.lines || []).filter(function (ln) {
        return ln.id !== line.id;
      });
      renumberLines(el);
      state.elDraft = el;
      saveEquipmentList(el);
      viewEquipmentOrder($("#main"));
      return;
    }

    /* Single serial: simple confirm */
    if (serials.length === 1) {
      if (!confirm("Remove serial " + serials[0] + " from this line?")) return;
      applyRemoveSerialsFromLine(el, line, serials);
      return;
    }

    /* Multi serial: choose which to remove */
    var existing = document.getElementById("el-remove-serials-overlay");
    if (existing && existing.parentNode) existing.parentNode.removeChild(existing);

    var overlay = document.createElement("div");
    overlay.id = "el-remove-serials-overlay";
    overlay.className = "modal-overlay";
    overlay.innerHTML =
      '<div class="modal modal-wide" role="dialog" aria-labelledby="el-rm-title">' +
      '<div class="modal-header">' +
      '<h2 id="el-rm-title">Remove serials from line</h2>' +
      '<button type="button" class="modal-close" id="el-rm-close" aria-label="Close">&times;</button>' +
      "</div>" +
      '<div class="modal-body">' +
      "<p class=\"modal-hint\">" +
      escapeHtml(line.description || "Line item") +
      " — select which serial(s) to remove. Others stay on the line.</p>" +
      '<div class="el-rm-serial-list">' +
      serials
        .map(function (sn, i) {
          return (
            '<label class="checkbox-row el-rm-row">' +
            '<input type="checkbox" class="el-rm-check" value="' +
            escapeHtml(sn) +
            '" id="el-rm-sn-' +
            i +
            '" />' +
            '<span class="mono">' +
            escapeHtml(sn) +
            "</span></label>"
          );
        })
        .join("") +
      "</div>" +
      '<div class="btn-group mt-2" style="flex-wrap:wrap">' +
      '<button type="button" class="btn btn-ghost btn-sm" id="el-rm-all">Select all</button>' +
      '<button type="button" class="btn btn-ghost btn-sm" id="el-rm-none">Clear</button>' +
      "</div></div>" +
      '<div class="modal-actions">' +
      '<button type="button" class="btn btn-ghost" id="el-rm-cancel">Cancel</button>' +
      '<button type="button" class="btn btn-secondary" id="el-rm-line">Remove entire line</button>' +
      '<button type="button" class="btn btn-primary" id="el-rm-selected">Remove selected</button>' +
      "</div></div>";

    document.body.appendChild(overlay);
    overlay.hidden = false;

    function closeChooser() {
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
    }

    function selectedSerials() {
      return $$(".el-rm-check:checked", overlay).map(function (c) {
        return c.value;
      });
    }

    $("#el-rm-close", overlay).addEventListener("click", closeChooser);
    $("#el-rm-cancel", overlay).addEventListener("click", closeChooser);
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) closeChooser();
    });
    $("#el-rm-all", overlay).addEventListener("click", function () {
      $$(".el-rm-check", overlay).forEach(function (c) {
        c.checked = true;
      });
    });
    $("#el-rm-none", overlay).addEventListener("click", function () {
      $$(".el-rm-check", overlay).forEach(function (c) {
        c.checked = false;
      });
    });
    $("#el-rm-line", overlay).addEventListener("click", function () {
      if (!confirm("Remove the entire line and all " + serials.length + " serial(s)?")) return;
      closeChooser();
      applyRemoveSerialsFromLine(el, line, serials.slice());
    });
    $("#el-rm-selected", overlay).addEventListener("click", function () {
      var sel = selectedSerials();
      if (!sel.length) {
        toast("Select at least one serial to remove", "error");
        return;
      }
      closeChooser();
      applyRemoveSerialsFromLine(el, line, sel);
    });
  }

  function applyRemoveSerialsFromLine(el, line, serialsToRemove) {
    var removeSet = {};
    (serialsToRemove || []).forEach(function (sn) {
      removeSet[String(sn).toUpperCase()] = true;
    });
    var before = (line.serials || []).length;
    line.serials = (line.serials || []).filter(function (s) {
      var sn = typeof s === "string" ? s : s && s.serial;
      return !removeSet[String(sn || "").toUpperCase()];
    });
    var removed = before - line.serials.length;
    if (!removed) {
      toast("No serials removed", "info");
      return;
    }
    if (!line.serials.length) {
      el.lines = (el.lines || []).filter(function (ln) {
        return ln.id !== line.id;
      });
      toast("Removed line (no serials left)");
    } else {
      if (String(line.uom || "").toUpperCase() !== "FT") {
        line.qty = line.serials.length;
      }
      toast(
        "Removed " +
          removed +
          " serial(s); " +
          line.serials.length +
          " remain on the line"
      );
    }
    renumberLines(el);
    state.elDraft = el;
    saveEquipmentList(el);
    viewEquipmentOrder($("#main"));
  }

  function renumberLines(el) {
    (el.lines || []).forEach(function (ln, i) {
      ln.itemNo = String(i + 1);
    });
  }

  /**
   * Find other open ELs that already list this serial (one-EL rule).
   * Well transfer is the only allowed move path — not free multi-EL assignment.
   */
  function findOtherOpenElsForSerial(serial, excludeElId) {
    var key = String(serial || "").trim().toUpperCase();
    if (!key) return [];
    var hits = [];
    var seen = {};
    loadEquipmentLists().forEach(function (other) {
      if (!other) return;
      if (excludeElId && (other.id === excludeElId || other.elNo === excludeElId)) return;
      if (String(other.status || "").toLowerCase() === "closed") return;
      var onIt = false;
      (other.lines || []).forEach(function (ln) {
        (ln.serials || []).forEach(function (s) {
          var sn = typeof s === "string" ? s : s && s.serial;
          if (String(sn || "").toUpperCase() === key) onIt = true;
        });
      });
      if (!onIt) return;
      var id = other.id || other.elNo || "";
      if (!id || seen[id]) return;
      seen[id] = true;
      hits.push({
        id: id,
        elNo: other.elNo || other.id || "",
        orderNo: other.orderNo || "",
        label: other.elNo || other.orderNo || other.id || id,
      });
    });
    return hits;
  }

  /**
   * Serial cannot go on a new DT if already Out / on rent on any open DT (no double charge).
   * Billing: one open DT per tool until received — then inventory In and free for another EL.
   * Optional el: used only for clearer messages.
   * Returns { blocked, reason, via, onThisEl }
   */
  function getSerialDtBlock(serial, sObj, el) {
    var sn = String(serial || (sObj && sObj.serial) || "").trim();
    if (!sn) return { blocked: true, reason: "empty", via: "", onThisEl: false };
    var ctx = getSerialOpenRentContext(sn);
    if (ctx) {
      var onThisEl =
        el &&
        (String(ctx.elId) === String(el.id) ||
          String(ctx.elId) === String(el.elNo) ||
          isSerialOnRentForEl(sn, el));
      return {
        blocked: true,
        reason: onThisEl ? "on_rent_this_el" : "on_rent_other",
        via: onThisEl
          ? " already on rent via DT-" + formatDtNo(ctx.dtId) + " on this EL"
          : " already on rent via DT-" +
            formatDtNo(ctx.dtId) +
            " on EL " +
            (ctx.elId || "another list") +
            " — receive that DT before renting again",
        onThisEl: !!onThisEl,
        rentElId: ctx.elId,
        dtId: ctx.dtId,
      };
    }
    /* Stale line flag without open DT — do not block forever */
    return { blocked: false, reason: "", via: "", onThisEl: false };
  }

  function isSerialBlockedForDt(serial, sObj, el) {
    return getSerialDtBlock(serial, sObj, el).blocked;
  }

  function createDtFromEl(el) {
    if (el.status === "Closed") {
      toast("Cannot create DT on closed EL", "error");
      return;
    }
    if (!el.location && !el.store) {
      toast("EL needs a Location / Store on the header before creating a DT", "error");
      viewEquipmentOrder($("#main"));
      return;
    }
    var selected = (el.lines || []).filter(function (ln) {
      return ln.selectedForDt && ln.serials && ln.serials.length;
    });
    if (!selected.length) {
      toast("Select at least one line (checkbox) with serials", "error");
      return;
    }

    /* Block any serial already Out / on rent — cannot charge twice */
    var blocked = [];
    var availablePairs = []; /* { ln, s } */
    selected.forEach(function (ln) {
      (ln.serials || []).forEach(function (s) {
        var block = getSerialDtBlock(s.serial, s, el);
        if (block.blocked) {
          blocked.push(s.serial + block.via);
        } else {
          availablePairs.push({ ln: ln, s: s });
        }
      });
    });

    if (blocked.length && !availablePairs.length) {
      toast(
        "Cannot create DT — all selected serials are already Out / on rent: " + blocked.join("; "),
        "error"
      );
      return;
    }
    if (blocked.length) {
      toast(
        "Skipped already Out / on rent (cannot charge twice): " +
          blocked.join("; ") +
          ". Creating DT for available serials only.",
        "info"
      );
    }
    if (!availablePairs.length) {
      toast("No available serials to put on a DT", "error");
      return;
    }

    /* Create always logs full pricing + On Rent; print with/without pricing is chosen on the DT page */
    var dtNo = nextDtNo();
    var stamp = todayISO();
    var dtLines = [];
    var lineIds = [];
    var lineIdSeen = {};
    availablePairs.forEach(function (pair) {
      var ln = pair.ln;
      var s = pair.s;
      if (!lineIdSeen[ln.id]) {
        lineIdSeen[ln.id] = true;
        lineIds.push(ln.id);
      }
      var unitPrice = parseFloat(ln.minAmt) || parseFloat(ln.addAmt) || 0;
      var qty = String(ln.uom).toUpperCase() === "FT" ? ln.qty || 1 : 1;
      dtLines.push({
        itemNo: ln.itemNo,
        serial: s.serial,
        description: resolveSerialDescription(s.serial, ln.description),
        uom: ln.uom,
        qty: qty,
        unitPrice: unitPrice,
        amount: unitPrice * (parseFloat(qty) || 1),
        minDays: ln.minDays || "",
        minAmt: ln.minAmt || "",
        addAmt: ln.addAmt || "",
      });
    });

    var hdr = snapshotElHeader(el);
    var dt = {
      id: dtNo,
      dtNo: dtNo,
      elId: el.id,
      orderId: el.id,
      /* Permanent: never reassigned when serial moves to another EL */
      createdOnElId: el.id || el.elNo,
      orderNo: hdr.orderNo,
      elNo: hdr.elNo,
      customer: hdr.customer,
      company: hdr.company,
      well: hdr.well,
      rig: hdr.rig,
      jobNo: hdr.jobNo,
      afe: hdr.afe,
      poNumber: hdr.poNumber,
      location: hdr.location,
      store: hdr.store,
      shipDate: stamp, /* DT ship stamp = create time; not from EL header */
      returnDate: "",
      type: "Delivery Ticket",
      /* Open until all tools received in via Receiving Tickets */
      status: "Open",
      completed: false,
      completedAt: "",
      receiveStatus: "open",
      receivedSerials: {},
      partialReceiveCount: 0,
      rrIds: [],
      shipTo: hdr.shipTo,
      billTo: hdr.billTo,
      contact: hdr.contact,
      phone: hdr.phone,
      email: hdr.email,
      salesPerson: hdr.salesPerson,
      salesmanField: hdr.salesmanField,
      withPricing: true,
      lines: dtLines,
      lineIds: lineIds,
      notes: hdr.notes || "",
      header: hdr,
      job: {
        job: el.job,
        jobNo: hdr.jobNo,
        jobDescription: el.jobDescription,
        well: hdr.well,
        areaBlock: el.areaBlock,
        leaseOcsg: el.leaseOcsg,
        afe: hdr.afe,
        rig: hdr.rig,
        location: hdr.location,
        basin: el.basin,
        preparedBy: hdr.preparedBy || hdr.contact,
        salesmanField: hdr.salesmanField,
        salesmanCorporate: el.salesmanCorporate,
        currency: el.currency,
        startRent: el.startRent,
        delivDateTime: el.delivDateTime,
      },
    };

    /* Put every serial On Rent + inventory Out immediately */
    dtLines.forEach(function (dln) {
      setAssetStatus(dln.serial, "Out", {
        note: dtNo + " · " + (el.orderNo || el.elNo || ""),
        lastDeliveryTicket: dtNo,
      });
      (el.lines || []).forEach(function (ln) {
        (ln.serials || []).forEach(function (s) {
          if (String(s.serial).toUpperCase() === String(dln.serial).toUpperCase()) {
            s.onRent = true;
            s.onRentAt = stamp;
            s.lastDtId = dtNo;
          }
        });
        if (lineIds.indexOf(ln.id) >= 0) {
          ln.lastDtId = dtNo;
          ln.lastDtType = "Delivery Ticket";
          ln.onRentAt = stamp;
        }
      });
    });

    var dts = loadDts();
    dts.push(dt);
    saveDts(dts);

    (el.lines || []).forEach(function (ln) {
      ln.selectedForDt = false;
    });
    if (!el.dtLedger) el.dtLedger = [];
    el.dtLedger.push({
      dtId: dtNo,
      completedAt: "",
      shippedAt: stamp,
      withPricing: true,
      lineIds: lineIds,
      status: "Open",
      receiveStatus: "open",
    });
    state.elDraft = el;
    saveEquipmentList(el);

    try {
      reconcileSerialBillingStatus();
    } catch (eRec2) {}

    toast(dtNo + " created — serials On Rent (open until fully received)");
    navigate("equipment-dt", { id: dtNo });
  }

  /* ========================================================================
   * Delivery ticket view
   * ======================================================================== */
  function viewEquipmentDt(main) {
    var id = state.params.id;
    var dt = getDt(id);
    setBreadcrumbs([
      { label: "Home", nav: "home" },
      { label: "Tickets", nav: "tickets" },
      { label: (dt && formatDtNo(dt.dtNo || dt.id)) || "DT" },
    ]);

    if (!dt) {
      main.innerHTML =
        '<div class="empty-state"><h3>Delivery ticket not found</h3>' +
        '<button type="button" class="btn btn-primary" data-nav="tickets">Back to tickets</button></div>';
      $$("[data-nav]", main).forEach(function (b) {
        b.addEventListener("click", function () {
          navigate(b.getAttribute("data-nav"));
        });
      });
      return;
    }

    var el = getEquipmentList(dt.elId);
    refreshDtReceiveStatus(dt);
    var fullyRecv = dtIsFullyReceived(dt);
    var recvLabel = dtReceiveStatusLabel(dt);
    var dtLabel = formatDtNo(dt.dtNo || dt.id);
    var rrs = getRrsForDt(dt.id || dt.dtNo);
    var hdr = resolveTicketHeader(dt, el);

    var rows = (dt.lines || [])
      .map(function (ln) {
        var rec = dtIsSerialReceived(dt, ln.serial);
        var lineDesc = resolveSerialDescription(ln.serial, ln.description);
        return (
          "<tr>" +
          "<td>" +
          escapeHtml(ln.itemNo || "—") +
          "</td>" +
          '<td class="mono"><button type="button" class="table-link" data-serial="' +
          escapeHtml(ln.serial) +
          '">' +
          escapeHtml(ln.serial) +
          "</button></td>" +
          '<td class="wrap-cell">' +
          escapeHtml(lineDesc || "—") +
          "</td>" +
          "<td>" +
          escapeHtml(ln.uom || "—") +
          "</td>" +
          "<td>" +
          escapeHtml(String(ln.qty != null ? ln.qty : 1)) +
          "</td>" +
          "<td>" +
          escapeHtml(formatMoney(ln.unitPrice)) +
          "</td><td>" +
          escapeHtml(formatMoney(ln.amount)) +
          "</td>" +
          '<td><span class="badge badge-' +
          (rec ? "in" : "out") +
          '">' +
          (rec ? "In" : "Out") +
          "</span></td>" +
          "</tr>"
        );
      })
      .join("");

    var rrBits = rrs.length
      ? '<p class="form-hint mb-0">Receiving reports: ' +
        rrs
          .map(function (r) {
            return (
              '<button type="button" class="table-link mono" data-rr="' +
              escapeHtml(r.id) +
              '">RR ' +
              escapeHtml(r.rrLabel) +
              "</button>"
            );
          })
          .join(" · ") +
        "</p>"
      : "";

    var isVendorDt = (dt.destType || "") === "vendor";
    var extraHdr = [
      ["DT No", dtLabel],
      ["Receive status", recvLabel],
    ];
    if (isVendorDt) {
      extraHdr.push(["Vendor", dt.vendorName || dt.customer || "—"]);
      extraHdr.push(["Agreed due date", formatDate(dt.dueDate)]);
      extraHdr.push(["Ship from", dt.store || dt.location || "—"]);
    }
    if (fullyRecv) extraHdr.push(["Fully received", formatDate(dt.completedAt)]);

    main.innerHTML =
      '<div class="dt-sheet">' +
      '<div class="dt-sheet-header">' +
      "<div><h1 class=\"page-title mono\">DT-" +
      escapeHtml(dtLabel) +
      "</h1>" +
      '<p class="page-subtitle">' +
      (isVendorDt
        ? "Vendor DT · " + escapeHtml(dt.vendorName || "Vendor") + " · due " + escapeHtml(formatDate(dt.dueDate))
        : "Delivery Ticket · same header as EL " + escapeHtml(hdr.orderNo || hdr.elNo || "—")) +
      ' · <span class="badge badge-' +
      (fullyRecv ? "in" : "out") +
      '">' +
      escapeHtml(recvLabel) +
      "</span></p></div>" +
      '<div class="btn-group dt-actions-top">' +
      '<button type="button" class="btn btn-primary btn-sm" id="dt-print-pricing">Print PDF (with pricing)</button>' +
      '<button type="button" class="btn btn-secondary btn-sm" id="dt-print-nopricing">Print PDF (no pricing)</button>' +
      '<button type="button" class="btn btn-secondary btn-sm" data-nav="tickets-receive" data-dt="' +
      escapeHtml(dt.id || dt.dtNo) +
      '">' +
      (fullyRecv ? "View receiving" : "Receive tools") +
      "</button>" +
      (el
        ? '<button type="button" class="btn btn-ghost btn-sm" data-el="' +
          escapeHtml(el.id) +
          '">Open EL</button>'
        : "") +
      '<button type="button" class="btn btn-ghost btn-sm" data-nav="tickets">Tickets</button>' +
      "</div></div>" +
      '<div class="panel mb-2 dt-screen-only"><div class="panel-header"><h2 class="panel-title mb-0">Header</h2>' +
      '<span class="text-muted" style="font-size:0.75rem">' +
      (isVendorDt ? "Vendor shipment" : "From equipment list") +
      "</span></div>" +
      '<div class="panel-body">' +
      renderHeaderKvGrid(hdr, extraHdr) +
      rrBits +
      "</div></div>" +
      '<div class="table-wrap dt-screen-only"><table class="table"><thead><tr>' +
      "<th>Item</th><th>Serial</th><th>Description</th><th>UOM</th><th>Qty</th><th>Unit Price</th><th>Amount</th><th>In/Out</th>" +
      "</tr></thead><tbody>" +
      (rows || '<tr><td colspan="8" class="table-empty">No lines</td></tr>') +
      "</tbody></table></div></div>";

    $$("[data-nav]", main).forEach(function (b) {
      b.addEventListener("click", function () {
        var route = b.getAttribute("data-nav");
        var dtId = b.getAttribute("data-dt");
        if (dtId) navigate(route, { id: dtId });
        else navigate(route);
      });
    });
    $$("[data-serial]", main).forEach(function (b) {
      b.addEventListener("click", function () {
        navigate("cardex-details", { serial: b.getAttribute("data-serial") });
      });
    });
    $$("[data-el]", main).forEach(function (b) {
      b.addEventListener("click", function () {
        navigate("equipment-order", { id: b.getAttribute("data-el") });
      });
    });
    $$("[data-rr]", main).forEach(function (b) {
      b.addEventListener("click", function () {
        navigate("tickets-rr", { id: b.getAttribute("data-rr") });
      });
    });

    var printP = $("#dt-print-pricing", main);
    var printN = $("#dt-print-nopricing", main);
    if (printP) {
      printP.addEventListener("click", function () {
        printDeliveryTicket(dt, true);
      });
    }
    if (printN) {
      printN.addEventListener("click", function () {
        printDeliveryTicket(dt, false);
      });
    }
  }

  /**
   * Signature lines for DT / RR print PDFs — placed OUTSIDE .print-body so flex
   * layout pins them to the bottom of the page.
   */
  function printAuthorizationSignaturesHtml() {
    return (
      '<div class="sig-block">' +
      '<table class="sig-table" role="presentation"><tr>' +
      "<td>" +
      '<div class="sig-line"></div>' +
      '<div class="sig-label">Company Authorization</div>' +
      '<div class="sig-meta">Print name / Signature / Date</div>' +
      "</td>" +
      "<td>" +
      '<div class="sig-line"></div>' +
      '<div class="sig-label">Contractor Authorization</div>' +
      '<div class="sig-meta">Print name / Signature / Date</div>' +
      "</td>" +
      "</tr></table>" +
      "</div>"
    );
  }

  /** Print a DT to PDF (browser print dialog). showPricing toggles price columns. */
  function printDeliveryTicket(dt, showPricing) {
    if (!dt) {
      toast("No ticket to print", "error");
      return;
    }
    var el = getEquipmentList(dt.elId);
    var hdr = resolveTicketHeader(dt, el);
    var lines = dt.lines || [];
    var lineRows = lines
      .map(function (ln, i) {
        var desc = resolveSerialDescription(ln.serial, ln.description);
        return (
          "<tr>" +
          "<td>" +
          escapeHtml(ln.itemNo || String(i + 1)) +
          "</td>" +
          "<td>" +
          escapeHtml(ln.serial || "") +
          "</td>" +
          "<td>" +
          escapeHtml(desc) +
          "</td>" +
          "<td>" +
          escapeHtml(ln.uom || "") +
          "</td>" +
          "<td>" +
          escapeHtml(String(ln.qty != null ? ln.qty : 1)) +
          "</td>" +
          (showPricing
            ? "<td>" +
              escapeHtml(formatMoney(ln.unitPrice)) +
              "</td><td>" +
              escapeHtml(formatMoney(ln.amount)) +
              "</td>"
            : "") +
          "</tr>"
        );
      })
      .join("");

    var total = 0;
    if (showPricing) {
      lines.forEach(function (ln) {
        var a = parseFloat(ln.amount);
        if (!isNaN(a)) total += a;
      });
    }

    var title = "Delivery Ticket DT-" + formatDtNo(dt.dtNo || dt.id || "");
    var body =
      "<h1>" +
      escapeHtml(title) +
      "</h1>" +
      '<p class="sub">' +
      (showPricing ? "With pricing" : "Without pricing") +
      " · Print / Save as PDF</p>" +
      printHeaderMetaHtml(hdr) +
      "<table><thead><tr>" +
      "<th>Item</th><th>Serial</th><th>Description</th><th>UOM</th><th>Qty</th>" +
      (showPricing ? "<th>Unit Price</th><th>Amount</th>" : "") +
      "</tr></thead><tbody>" +
      (lineRows ||
        "<tr><td colspan=\"" +
          (showPricing ? "7" : "5") +
          "\">No lines</td></tr>") +
      "</tbody></table>" +
      (showPricing ? '<div class="total">Total: ' + escapeHtml(formatMoney(total)) + "</div>" : "");
    printHtmlDocument(title, body, printAuthorizationSignaturesHtml());
  }

  function printReceivingReport(rr) {
    if (!rr) {
      toast("No receiving report to print", "error");
      return;
    }
    var el = getEquipmentList(rr.elId);
    var hdr = resolveTicketHeader(rr, el);
    var lines = rr.lines || [];
    var lineRows = lines
      .map(function (ln) {
        var desc = resolveSerialDescription(ln.serial, ln.description);
        return (
          "<tr><td>" +
          escapeHtml(ln.serial || "") +
          "</td><td>" +
          escapeHtml(desc) +
          "</td><td>" +
          escapeHtml(ln.uom || "") +
          "</td><td>" +
          escapeHtml(String(ln.qty != null ? ln.qty : 1)) +
          "</td></tr>"
        );
      })
      .join("");
    var title = "Receiving Report RR-" + (rr.rrLabel != null ? rr.rrLabel : rr.rrNo || "");
    var body =
      "<h1>" +
      escapeHtml(title) +
      "</h1>" +
      '<p class="sub">DT-' +
      escapeHtml(rr.dtNo || "—") +
      (rr.isPartial ? " · Partial receive" : "") +
      (rr.isFinal ? " · Final" : "") +
      " · " +
      escapeHtml(formatDateTime(rr.createdAt) || "") +
      " · Print / Save as PDF</p>" +
      printHeaderMetaHtml(hdr) +
      "<table><thead><tr><th>Serial</th><th>Description</th><th>UOM</th><th>Qty</th></tr></thead><tbody>" +
      (lineRows || "<tr><td colspan=\"4\">No lines</td></tr>") +
      "</tbody></table>";
    printHtmlDocument(title, body, printAuthorizationSignaturesHtml());
  }

  function printEquipmentList(el) {
    if (!el) {
      toast("No equipment list to print", "error");
      return;
    }
    var hdr = snapshotElHeader(el);
    var lines = el.lines || [];
    var lineRows = lines
      .map(function (ln, i) {
        var serials = (ln.serials || [])
          .map(function (s) {
            return typeof s === "string" ? s : s && s.serial;
          })
          .filter(Boolean)
          .join(", ");
        return (
          "<tr><td>" +
          escapeHtml(ln.itemNo || String(i + 1)) +
          "</td><td>" +
          escapeHtml(ln.description || "") +
          "</td><td>" +
          escapeHtml(ln.uom || "") +
          "</td><td>" +
          escapeHtml(String(ln.qty != null ? ln.qty : 1)) +
          "</td><td>" +
          escapeHtml(serials || "—") +
          "</td></tr>"
        );
      })
      .join("");
    var title = "Equipment List " + (el.orderNo || el.elNo || el.id || "");
    var body =
      "<h1>" +
      escapeHtml(title) +
      "</h1>" +
      '<p class="sub">Status: ' +
      escapeHtml(el.status || "—") +
      " · Print / Save as PDF</p>" +
      printHeaderMetaHtml(hdr) +
      "<table><thead><tr><th>Item</th><th>Description</th><th>UOM</th><th>Qty</th><th>Serials</th></tr></thead><tbody>" +
      (lineRows || "<tr><td colspan=\"5\">No lines</td></tr>") +
      "</tbody></table>";
    printHtmlDocument(title, body);
  }

  function formatMoney(n) {
    var v = parseFloat(n);
    if (isNaN(v)) return "—";
    return "$" + v.toFixed(2);
  }

  function completeDeliveryTicket(dt) {
    if (dt.completed) return;
    dt.completed = true;
    dt.status = "Completed";
    dt.completedAt = todayISO();

    var el = getEquipmentList(dt.elId);
    var stamp = todayISO();

    (dt.lines || []).forEach(function (dln) {
      setAssetStatus(dln.serial, "Out", { note: dt.dtNo + " · " + (dt.orderNo || "") });
      if (el) {
        (el.lines || []).forEach(function (ln) {
          (ln.serials || []).forEach(function (s) {
            if (String(s.serial).toUpperCase() === String(dln.serial).toUpperCase()) {
              s.onRent = true;
              s.onRentAt = stamp;
              s.lastDtId = dt.dtNo || dt.id;
            }
          });
        });
      }
    });

    if (el) {
      saveEquipmentList(el);
      if (state.elDraft && state.elDraft.id === el.id) state.elDraft = deepClone(el);
    }

    var dts = loadDts();
    for (var i = 0; i < dts.length; i++) {
      if (dts[i].id === dt.id) {
        dts[i] = dt;
        break;
      }
    }
    saveDts(dts);
  }

  /* ========================================================================
   * Document Management — Quality Manual & Customer Quality Requirements
   * Folder / subfolder tree + document upload per library
   * ======================================================================== */
  var DOC_LIBRARIES = [
    {
      id: "qualityManual",
      title: "Quality Manual",
      short: "QM",
      desc: "Company quality manual, procedures, and controlled QM documents. Organize by location or category.",
      icon: "📘",
    },
    {
      id: "customerQuality",
      title: "Customer Quality Requirements",
      short: "CQR",
      desc: "Customer-specific quality requirements and specs. Organize by customer, location, or category.",
      icon: "📋",
    },
  ];

  function emptyDocLibraryTree() {
    return { folders: [], documents: [] };
  }

  function loadDocLibraryStore() {
    var raw = storageGet(KEYS.docLibrary, null);
    if (!raw || typeof raw !== "object") {
      raw = {
        qualityManual: emptyDocLibraryTree(),
        customerQuality: emptyDocLibraryTree(),
      };
      /* seed a couple of starter folders so the tree is not empty */
      raw.qualityManual.folders = [
        { id: "qm-root-loc", name: "By Location", parentId: null, createdAt: nowISO() },
        { id: "qm-root-cat", name: "By Document Category", parentId: null, createdAt: nowISO() },
      ];
      raw.customerQuality.folders = [
        { id: "cqr-root-cust", name: "By Customer", parentId: null, createdAt: nowISO() },
        { id: "cqr-root-loc", name: "By Location", parentId: null, createdAt: nowISO() },
        { id: "cqr-root-cat", name: "By Document Category", parentId: null, createdAt: nowISO() },
      ];
      storageSet(KEYS.docLibrary, raw);
    }
    if (!raw.qualityManual) raw.qualityManual = emptyDocLibraryTree();
    if (!raw.customerQuality) raw.customerQuality = emptyDocLibraryTree();
    if (!Array.isArray(raw.qualityManual.folders)) raw.qualityManual.folders = [];
    if (!Array.isArray(raw.qualityManual.documents)) raw.qualityManual.documents = [];
    if (!Array.isArray(raw.customerQuality.folders)) raw.customerQuality.folders = [];
    if (!Array.isArray(raw.customerQuality.documents)) raw.customerQuality.documents = [];
    return raw;
  }

  function saveDocLibraryStore(store) {
    storageSet(KEYS.docLibrary, store || loadDocLibraryStore());
  }

  function getDocLibMeta(libId) {
    for (var i = 0; i < DOC_LIBRARIES.length; i++) {
      if (DOC_LIBRARIES[i].id === libId) return DOC_LIBRARIES[i];
    }
    return null;
  }

  function getDocLibTree(libId) {
    var store = loadDocLibraryStore();
    return store[libId] || emptyDocLibraryTree();
  }

  function saveDocLibTree(libId, tree) {
    var store = loadDocLibraryStore();
    store[libId] = tree;
    saveDocLibraryStore(store);
  }

  function docLibGetFolder(tree, folderId) {
    if (!folderId) return null;
    for (var i = 0; i < (tree.folders || []).length; i++) {
      if (tree.folders[i].id === folderId) return tree.folders[i];
    }
    return null;
  }

  function docLibChildFolders(tree, parentId) {
    var pid = parentId || null;
    return (tree.folders || [])
      .filter(function (f) {
        return (f.parentId || null) === pid;
      })
      .sort(function (a, b) {
        return String(a.name || "").localeCompare(String(b.name || ""));
      });
  }

  function docLibDocsInFolder(tree, folderId) {
    var fid = folderId || null;
    return (tree.documents || [])
      .filter(function (d) {
        return (d.folderId || null) === fid;
      })
      .sort(function (a, b) {
        return String(a.title || "").localeCompare(String(b.title || ""));
      });
  }

  /** Breadcrumb path from root to folderId */
  function docLibFolderPath(tree, folderId) {
    var path = [];
    var cur = folderId;
    var guard = 0;
    while (cur && guard < 40) {
      var f = docLibGetFolder(tree, cur);
      if (!f) break;
      path.unshift(f);
      cur = f.parentId || null;
      guard++;
    }
    return path;
  }

  function docLibCountInSubtree(tree, folderId) {
    var folders = 0;
    var docs = 0;
    function walk(fid) {
      docLibChildFolders(tree, fid).forEach(function (ch) {
        folders += 1;
        walk(ch.id);
      });
      docs += docLibDocsInFolder(tree, fid).length;
    }
    walk(folderId || null);
    if (!folderId) {
      docs = (tree.documents || []).length;
      folders = (tree.folders || []).length;
    }
    return { folders: folders, docs: docs };
  }

  /* ========================================================================
   * VENDORS — supplier approval records (names feed ticket Customer / Vendor)
   * ======================================================================== */
  function emptyVendor() {
    return {
      id: "",
      name: "",
      location: "",
      approvedServices: "",
      dateApproved: "",
      critical: "N",
      certifications: "",
      supplierApprovalRequest: null,
      supportingDocs: [],
      createdAt: "",
      updatedAt: "",
    };
  }

  function normalizeVendor(raw) {
    var v = emptyVendor();
    if (!raw || typeof raw !== "object") return v;
    v.id = raw.id || uid("VEND");
    v.name = String(raw.name || "").trim();
    v.location = raw.location || "";
    v.approvedServices = raw.approvedServices || "";
    v.dateApproved = raw.dateApproved || "";
    v.critical = String(raw.critical || "N").toUpperCase() === "Y" ? "Y" : "N";
    v.certifications = raw.certifications || "";
    v.supplierApprovalRequest = raw.supplierApprovalRequest || null;
    v.supportingDocs = Array.isArray(raw.supportingDocs) ? raw.supportingDocs.slice() : [];
    v.createdAt = raw.createdAt || "";
    v.updatedAt = raw.updatedAt || "";
    return v;
  }

  var vendorStore = null;

  function fileMetaOnly(f) {
    if (!f || typeof f !== "object") return null;
    return {
      id: f.id || uid("vdoc"),
      name: f.name || "file",
      mimeType: f.mimeType || "",
      size: f.size || 0,
      uploadedAt: f.uploadedAt || "",
    };
  }

  function vendorRecordForStorage(v) {
    var out = normalizeVendor(v);
    if (out.supplierApprovalRequest) {
      out.supplierApprovalRequest = fileMetaOnly(out.supplierApprovalRequest);
    }
    out.supportingDocs = (out.supportingDocs || []).map(fileMetaOnly).filter(Boolean);
    return out;
  }

  function collectVendorFiles(v, files) {
    if (!v || !files) return;
    if (v.supplierApprovalRequest && v.supplierApprovalRequest.dataUrl) {
      var sarId = v.supplierApprovalRequest.id || v.id + "-sar";
      v.supplierApprovalRequest.id = sarId;
      files[sarId] = v.supplierApprovalRequest.dataUrl;
    }
    (v.supportingDocs || []).forEach(function (d) {
      if (!d) return;
      if (!d.id) d.id = uid("vdoc");
      if (d.dataUrl) files[d.id] = d.dataUrl;
    });
  }

  function hydrateVendorFiles(v, files) {
    if (!v) return v;
    files = files || {};
    if (v.supplierApprovalRequest && v.supplierApprovalRequest.id && !v.supplierApprovalRequest.dataUrl) {
      v.supplierApprovalRequest.dataUrl = files[v.supplierApprovalRequest.id] || null;
    }
    (v.supportingDocs || []).forEach(function (d) {
      if (d && d.id && !d.dataUrl) d.dataUrl = files[d.id] || null;
    });
    return v;
  }

  function recoverVendorStubs(list) {
    var names = [];
    var fromKey = storageGet(KEYS.vendors, []);
    var fromMasters = null;
    try {
      var m = storageGet(KEYS.masters, null);
      if (m && Array.isArray(m.vendors)) fromMasters = m.vendors;
    } catch (e0) {}
    if (Array.isArray(fromKey)) names = names.concat(fromKey);
    if (Array.isArray(fromMasters)) names = names.concat(fromMasters);
    var have = {};
    list.forEach(function (v) {
      if (v && v.name) have[String(v.name).toUpperCase()] = true;
    });
    uniqStrings(names).forEach(function (name) {
      if (have[String(name).toUpperCase()]) return;
      list.push(
        normalizeVendor({
          id: uid("VEND"),
          name: name,
          createdAt: nowISO(),
        })
      );
      have[String(name).toUpperCase()] = true;
    });
    return list;
  }

  function loadVendors() {
    if (Array.isArray(vendorStore)) {
      return vendorStore.map(function (v) {
        return normalizeVendor(v);
      });
    }
    var stored = storageGet(KEYS.vendorRecords, []);
    if (!Array.isArray(stored)) stored = [];
    var files = storageGet(KEYS.vendorFiles, {}) || {};
    vendorStore = stored.map(function (raw) {
      return hydrateVendorFiles(normalizeVendor(raw), files);
    });
    var before = vendorStore.length;
    recoverVendorStubs(vendorStore);
    if (vendorStore.length !== before) {
      persistVendorStore();
    }
    return vendorStore.map(function (v) {
      return normalizeVendor(v);
    });
  }

  function persistVendorStore() {
    var list = Array.isArray(vendorStore) ? vendorStore : [];
    var files = storageGet(KEYS.vendorFiles, {}) || {};
    if (!files || typeof files !== "object") files = {};
    list.forEach(function (v) {
      collectVendorFiles(v, files);
    });
    var meta = list.map(vendorRecordForStorage);
    var ok = storageSet(KEYS.vendorRecords, meta);
    if (!ok) {
      toast("Could not save vendor list — browser storage is full", "error");
      return false;
    }
    if (!storageSet(KEYS.vendorFiles, files)) {
      toast("Vendor saved, but file attachments may not persist (storage full)", "error");
    }
    try {
      syncVendorNamesToMasters();
    } catch (eSync) {}
    return true;
  }

  function getVendorNames() {
    return uniqStrings(
      loadVendors()
        .map(function (v) {
          return v.name;
        })
        .filter(Boolean)
    );
  }

  function syncVendorNamesToMasters() {
    var m = loadMasters();
    m.vendors = getVendorNames();
    saveMasters(m);
  }

  function saveVendors(list) {
    vendorStore = (list || []).map(normalizeVendor);
    persistVendorStore();
  }

  function getVendor(id) {
    if (state.vendorDraft && String(state.vendorDraft.id) === String(id)) {
      return state.vendorDraft;
    }
    var found = null;
    loadVendors().forEach(function (v) {
      if (String(v.id) === String(id)) found = v;
    });
    return found;
  }

  function saveVendor(v) {
    if (!v) return null;
    v = normalizeVendor(v);
    v.updatedAt = nowISO();
    if (!v.createdAt) v.createdAt = nowISO();
    var list = loadVendors();
    var idx = -1;
    list.forEach(function (x, i) {
      if (String(x.id) === String(v.id)) idx = i;
    });
    if (idx >= 0) list[idx] = v;
    else list.unshift(v);
    saveVendors(list);
    state.vendorDraft = v;
    return v;
  }

  function deleteVendor(id) {
    var list = loadVendors().filter(function (v) {
      return String(v.id) !== String(id);
    });
    saveVendors(list);
    if (state.vendorDraft && String(state.vendorDraft.id) === String(id)) {
      state.vendorDraft = null;
    }
  }

  function readVendorFile(file, onOk) {
    if (!file) {
      toast("Choose a file", "error");
      return;
    }
    if (file.size > 2.5 * 1024 * 1024) {
      toast("File too large for browser storage (max ~2.5 MB)", "error");
      return;
    }
    var reader = new FileReader();
    reader.onload = function () {
      onOk({
        id: uid("vdoc"),
        name: file.name,
        mimeType: file.type || "",
        size: file.size,
        dataUrl: reader.result,
        uploadedAt: nowISO(),
      });
    };
    reader.onerror = function () {
      toast("Could not read file", "error");
    };
    reader.readAsDataURL(file);
  }

  function viewVendorsList(main) {
    setBreadcrumbs([
      { label: "Home", nav: "home" },
      { label: "Vendors" },
    ]);
    var f = state.vendorFilter || {};
    var list = loadVendors();
    if (state.vendorDraft && state.vendorDraft.name) {
      var draft = normalizeVendor(state.vendorDraft);
      var hasDraft = list.some(function (x) {
        return String(x.id) === String(draft.id) ||
          (x.name && draft.name && String(x.name).toUpperCase() === String(draft.name).toUpperCase());
      });
      if (!hasDraft) list.unshift(draft);
    }
    list = list.filter(function (v) {
      if (f.critical && v.critical !== f.critical) return false;
      if (f.location && String(v.location || "").toLowerCase().indexOf(String(f.location).toLowerCase()) === -1) {
        return false;
      }
      if (f.q) {
        var hay = (v.name + " " + v.location + " " + v.approvedServices + " " + v.certifications).toLowerCase();
        if (hay.indexOf(String(f.q).toLowerCase()) === -1) return false;
      }
      return true;
    });
    list.sort(function (a, b) {
      return String(a.name || "").localeCompare(String(b.name || ""), undefined, { sensitivity: "base" });
    });

    var pageInfo = paginateList(list, state.vendorPage);
    state.vendorPage = pageInfo.page;
    var pager = renderListPager(pageInfo);
    var locOpts =
      '<option value="">All</option>' +
      (loadMasters().locations || [])
        .map(function (l) {
          return (
            '<option value="' +
            escapeHtml(l) +
            '"' +
            (f.location === l ? " selected" : "") +
            ">" +
            escapeHtml(l) +
            "</option>"
          );
        })
        .join("");

    var rows = pageInfo.items
      .map(function (v) {
        var sar = v.supplierApprovalRequest;
        return (
          '<tr class="row-clickable" data-vendor="' +
          escapeHtml(v.id) +
          '">' +
          '<td class="wrap-cell"><strong>' +
          escapeHtml(v.name || "—") +
          "</strong></td>" +
          '<td class="wrap-cell">' +
          escapeHtml(v.location || "—") +
          "</td>" +
          '<td class="wrap-cell">' +
          escapeHtml(v.approvedServices || "—") +
          "</td>" +
          "<td>" +
          escapeHtml(formatDate(v.dateApproved)) +
          "</td>" +
          '<td><span class="badge ' +
          (v.critical === "Y" ? "badge-out" : "badge-in") +
          '">' +
          escapeHtml(v.critical === "Y" ? "Y" : "N") +
          "</span></td>" +
          '<td class="wrap-cell">' +
          escapeHtml(v.certifications || "—") +
          "</td>" +
          "<td>" +
          (sar && sar.name ? escapeHtml(sar.name) : "—") +
          "</td>" +
          '<td class="num-cell">' +
          ((v.supportingDocs || []).length) +
          "</td></tr>"
        );
      })
      .join("");

    main.innerHTML =
      '<div class="page-header"><div><h1 class="page-title">Vendors</h1>' +
      '<p class="page-subtitle">Supplier approval records. Vendor <strong>names</strong> populate the Tickets Customer / Vendor list.</p></div>' +
      '<button type="button" class="btn btn-primary" data-nav="vendors-new">Add Vendor</button></div>' +
      '<div class="panel search-panel"><div class="panel-body">' +
      '<div class="form-grid-3">' +
      '<label class="field"><span>Search</span><input type="text" id="vnd-f-q" class="form-control" value="' +
      escapeHtml(f.q || "") +
      '" placeholder="Name, services, certifications…" /></label>' +
      '<label class="field"><span>Location</span><select id="vnd-f-loc" class="form-control">' +
      locOpts +
      "</select></label>" +
      '<label class="field"><span>Critical</span><select id="vnd-f-crit" class="form-control">' +
      '<option value="">All</option>' +
      '<option value="Y"' +
      (f.critical === "Y" ? " selected" : "") +
      ">Y</option>" +
      '<option value="N"' +
      (f.critical === "N" ? " selected" : "") +
      ">N</option></select></label>" +
      "</div>" +
      '<div class="search-actions">' +
      '<button type="button" class="btn btn-primary" id="vnd-search">Search</button>' +
      "</div></div></div>" +
      '<div class="results-bar"><span>' +
      pageInfo.total +
      " vendor(s)</span></div>" +
      pager +
      '<div class="table-wrap"><table class="table"><thead><tr>' +
      "<th>Name</th><th>Location</th><th>Approved services</th><th>Date approved</th><th>Critical</th><th>Certifications</th><th>SAR</th><th>Supporting docs</th>" +
      "</tr></thead><tbody>" +
      (rows ||
        '<tr><td colspan="8" class="table-empty">No vendors yet. Click Add Vendor to create a supplier record.</td></tr>') +
      "</tbody></table></div>" +
      pager;

    $$("[data-nav]", main).forEach(function (b) {
      b.addEventListener("click", function () {
        navigate(b.getAttribute("data-nav"));
      });
    });
    var searchBtn = $("#vnd-search", main);
    if (searchBtn) {
      searchBtn.addEventListener("click", function () {
        state.vendorPage = 1;
        state.vendorFilter = {
          q: ($("#vnd-f-q", main).value || "").trim(),
          location: ($("#vnd-f-loc", main) && $("#vnd-f-loc", main).value) || "",
          critical: ($("#vnd-f-crit", main) && $("#vnd-f-crit", main).value) || "",
        };
        viewVendorsList(main);
      });
    }
    bindListPager(main, function (p) {
      state.vendorPage = p;
      viewVendorsList(main);
      window.scrollTo(0, 0);
    });
    $$("[data-vendor]", main).forEach(function (row) {
      row.addEventListener("click", function () {
        navigate("vendors-detail", { id: row.getAttribute("data-vendor") });
      });
    });
  }

  function viewVendorNew(main) {
    var v = emptyVendor();
    v.id = uid("VEND");
    v.createdAt = nowISO();
    state.vendorDraft = v;
    state.vendorTab = "info";
    navigate("vendors-detail", { id: v.id, isNew: "1" });
  }

  function viewVendorDetail(main) {
    var id = state.params.id;
    var isNew = state.params.isNew === "1";
    var v = getVendor(id);
    if (!v) {
      setBreadcrumbs([
        { label: "Home", nav: "home" },
        { label: "Vendors", nav: "vendors" },
        { label: "Not found" },
      ]);
      main.innerHTML =
        '<div class="empty-state"><h3>Vendor not found</h3>' +
        '<button type="button" class="btn btn-primary" data-nav="vendors">Back to Vendors</button></div>';
      $$("[data-nav]", main).forEach(function (b) {
        b.addEventListener("click", function () {
          navigate(b.getAttribute("data-nav"));
        });
      });
      return;
    }
    state.vendorDraft = v;
    var tab = state.vendorTab || "info";
    state.vendorTab = tab;

    setBreadcrumbs([
      { label: "Home", nav: "home" },
      { label: "Vendors", nav: "vendors" },
      { label: v.name || (isNew ? "New vendor" : v.id) },
    ]);

    function tabBtn(key, label) {
      return (
        '<button type="button" class="tab' +
        (tab === key ? " active" : "") +
        '" data-vnd-tab="' +
        key +
        '">' +
        escapeHtml(label) +
        "</button>"
      );
    }

    var locs = loadMasters().locations || [];
    if (v.location && locs.indexOf(v.location) === -1) locs = [v.location].concat(locs);
    var locOpts =
      '<option value="">Select…</option>' +
      locs
        .map(function (l) {
          return (
            '<option value="' +
            escapeHtml(l) +
            '"' +
            (v.location === l ? " selected" : "") +
            ">" +
            escapeHtml(l) +
            "</option>"
          );
        })
        .join("");

    var sar = v.supplierApprovalRequest;
    var sarBlock = sar
      ? '<div class="vnd-file-chip">' +
        "<div><strong>" +
        escapeHtml(sar.name || "Supplier Approval Request") +
        "</strong>" +
        '<div class="form-hint">' +
        escapeHtml(formatFileSize(sar.size)) +
        (sar.uploadedAt ? " · " + escapeHtml(formatDateTime(sar.uploadedAt)) : "") +
        "</div></div>" +
        '<div class="btn-group">' +
        (sar.dataUrl
          ? '<button type="button" class="btn btn-ghost btn-sm" id="vnd-sar-open">Open</button>'
          : "") +
        '<button type="button" class="btn btn-ghost btn-sm" id="vnd-sar-remove">Remove</button>' +
        "</div></div>"
      : '<p class="form-hint">No Supplier Approval Request uploaded yet.</p>';

    var panel = "";
    if (tab === "info") {
      panel =
        '<div class="panel mb-2"><div class="panel-header flex-between">' +
        '<h2 class="panel-title mb-0">Vendor information</h2>' +
        '<div class="btn-group">' +
        '<button type="button" class="btn btn-primary btn-sm" id="vnd-save">Save vendor</button>' +
        (!isNew ? '<button type="button" class="btn btn-ghost btn-sm" id="vnd-delete">Delete</button>' : "") +
        "</div></div>" +
        '<div class="panel-body">' +
        '<div class="form-grid-3">' +
        '<label class="field"><span>Vendor name</span>' +
        '<input type="text" id="vnd-name" class="form-control" value="' +
        escapeHtml(v.name) +
        '" placeholder="Legal / trading name" /></label>' +
        '<label class="field"><span>Location</span>' +
        '<input type="text" id="vnd-location" class="form-control" list="vnd-loc-list" value="' +
        escapeHtml(v.location) +
        '" placeholder="Yard / city" />' +
        '<datalist id="vnd-loc-list">' +
        locOpts +
        "</datalist></label>" +
        '<label class="field"><span>Date approved</span>' +
        '<input type="date" id="vnd-date" class="form-control" value="' +
        escapeHtml(v.dateApproved) +
        '" /></label>' +
        '<label class="field"><span>Critical</span>' +
        '<select id="vnd-critical" class="form-control">' +
        '<option value="N"' +
        (v.critical !== "Y" ? " selected" : "") +
        ">N</option>" +
        '<option value="Y"' +
        (v.critical === "Y" ? " selected" : "") +
        ">Y</option></select></label>" +
        '<label class="field form-span-2"><span>Approved services</span>' +
        '<textarea id="vnd-services" class="form-control" rows="3" placeholder="Inspection, machine shop, coating…">' +
        escapeHtml(v.approvedServices) +
        "</textarea></label>" +
        '<label class="field form-span-full"><span>Certifications</span>' +
        '<textarea id="vnd-certs" class="form-control" rows="3" placeholder="ISO 9001, API Q1, ISO 17025…">' +
        escapeHtml(v.certifications) +
        "</textarea></label>" +
        "</div>" +
        '<div class="vnd-sar-box mt-2">' +
        "<h3>Supplier Approval Request</h3>" +
        "<p class=\"form-hint\">Upload the completed SAR document for this vendor.</p>" +
        sarBlock +
        '<div class="master-add mt-1">' +
        '<input type="file" id="vnd-sar-file" class="form-control" />' +
        '<button type="button" class="btn btn-secondary" id="vnd-sar-upload">' +
        (sar ? "Replace SAR" : "Upload SAR") +
        "</button>" +
        "</div></div></div></div>";
    } else {
      var docRows = (v.supportingDocs || [])
        .map(function (d, idx) {
          return (
            "<tr><td class=\"wrap-cell\">" +
            escapeHtml(d.name || "file") +
            "</td><td>" +
            escapeHtml(formatFileSize(d.size)) +
            "</td><td>" +
            escapeHtml(formatDateTime(d.uploadedAt)) +
            "</td><td>" +
            (d.dataUrl
              ? '<button type="button" class="table-link" data-vnd-doc-open="' +
                idx +
                '">Open</button> · '
              : "") +
            '<button type="button" class="table-link" data-vnd-doc-del="' +
            idx +
            '">Remove</button></td></tr>'
          );
        })
        .join("");
      panel =
        '<div class="panel"><div class="panel-header"><h2 class="panel-title">Supporting documents</h2></div>' +
        '<div class="panel-body">' +
        '<p class="form-hint mb-2">Certs, insurance, audits, and other files for this vendor. Name on the Vendor tab still drives the master list.</p>' +
        '<div class="master-add mb-2">' +
        '<input type="file" id="vnd-doc-file" class="form-control" />' +
        '<button type="button" class="btn btn-secondary" id="vnd-doc-upload">Upload document</button>' +
        "</div>" +
        '<div class="table-wrap"><table class="table"><thead><tr>' +
        "<th>Name</th><th>Size</th><th>Uploaded</th><th></th></tr></thead><tbody>" +
        (docRows || '<tr><td colspan="4" class="table-empty">No supporting documents yet.</td></tr>') +
        "</tbody></table></div></div></div>";
    }

    var latestScore = v.id ? latestScoreForVendor(v.id) : null;
    main.innerHTML =
      '<div class="page-header page-header-compact"><div><h1 class="page-title">' +
      escapeHtml(v.name || "New vendor") +
      (v.critical === "Y" ? ' <span class="badge badge-out">Critical</span>' : "") +
      (latestScore
        ? ' <span class="badge ' +
          scoreTierBadgeClass(latestScore.tierCode) +
          '">' +
          formatScore(latestScore.composite) +
          " · " +
          escapeHtml(latestScore.tierLabel) +
          "</span>"
        : "") +
      "</h1>" +
      '<p class="page-subtitle">' +
      escapeHtml(v.location || "No location") +
      (v.dateApproved ? " · Approved " + escapeHtml(formatDate(v.dateApproved)) : "") +
      "</p></div>" +
      '<div class="btn-group">' +
      (v.id && !isNew
        ? '<button type="button" class="btn btn-secondary btn-sm" data-nav="supplier-score-detail?vendorId=' +
          encodeURIComponent(v.id) +
          '">Supplier score</button>' +
          '<button type="button" class="btn btn-secondary btn-sm" data-nav="tickets-vendor-dt?vendorId=' +
          encodeURIComponent(v.id) +
          '">DT to Vendor</button>'
        : "") +
      '<button type="button" class="btn btn-ghost btn-sm" data-nav="vendors">All vendors</button>' +
      "</div></div>" +
      '<div class="tabs" role="tablist">' +
      tabBtn("info", "Vendor") +
      tabBtn("docs", "Supporting documents") +
      "</div>" +
      '<div class="ncr-tab-panel">' +
      panel +
      "</div>";

    function readInfoFromDom() {
      v.name = ($("#vnd-name", main) && $("#vnd-name", main).value.trim()) || v.name;
      v.location = ($("#vnd-location", main) && $("#vnd-location", main).value.trim()) || "";
      v.dateApproved = ($("#vnd-date", main) && $("#vnd-date", main).value) || "";
      v.critical = ($("#vnd-critical", main) && $("#vnd-critical", main).value) || "N";
      v.approvedServices = ($("#vnd-services", main) && $("#vnd-services", main).value) || "";
      v.certifications = ($("#vnd-certs", main) && $("#vnd-certs", main).value) || "";
    }

    $$("[data-nav]", main).forEach(function (b) {
      b.addEventListener("click", function () {
        navigate(b.getAttribute("data-nav"));
      });
    });
    $$("[data-vnd-tab]", main).forEach(function (b) {
      b.addEventListener("click", function () {
        if (tab === "info") readInfoFromDom();
        state.vendorDraft = v;
        state.vendorTab = b.getAttribute("data-vnd-tab");
        viewVendorDetail(main);
      });
    });

    var saveBtn = $("#vnd-save", main);
    if (saveBtn) {
      saveBtn.addEventListener("click", function () {
        readInfoFromDom();
        if (!v.name) {
          toast("Vendor name is required", "error");
          return;
        }
        var saved = saveVendor(v);
        if (!saved) return;
        toast("Vendor saved — " + saved.name + " is on the Vendors list");
        navigate("vendors");
      });
    }
    var delBtn = $("#vnd-delete", main);
    if (delBtn) {
      delBtn.addEventListener("click", function () {
        if (!confirm('Delete vendor "' + (v.name || v.id) + '"?')) return;
        deleteVendor(v.id);
        toast("Vendor deleted");
        navigate("vendors");
      });
    }
    var sarOpen = $("#vnd-sar-open", main);
    if (sarOpen) {
      sarOpen.addEventListener("click", function () {
        if (v.supplierApprovalRequest && v.supplierApprovalRequest.dataUrl) {
          window.open(v.supplierApprovalRequest.dataUrl, "_blank");
        }
      });
    }
    var sarRm = $("#vnd-sar-remove", main);
    if (sarRm) {
      sarRm.addEventListener("click", function () {
        if (tab === "info") readInfoFromDom();
        v.supplierApprovalRequest = null;
        state.vendorDraft = v;
        if (!isNew && v.name) saveVendor(v);
        viewVendorDetail(main);
      });
    }
    var sarUp = $("#vnd-sar-upload", main);
    if (sarUp) {
      sarUp.addEventListener("click", function () {
        var input = $("#vnd-sar-file", main);
        var file = input && input.files && input.files[0];
        readVendorFile(file, function (att) {
          if (tab === "info") readInfoFromDom();
          v.supplierApprovalRequest = att;
          state.vendorDraft = v;
          if (v.name) saveVendor(v);
          toast("Supplier Approval Request uploaded");
          viewVendorDetail(main);
        });
      });
    }
    var docUp = $("#vnd-doc-upload", main);
    if (docUp) {
      docUp.addEventListener("click", function () {
        var input = $("#vnd-doc-file", main);
        var file = input && input.files && input.files[0];
        readVendorFile(file, function (att) {
          if (!v.supportingDocs) v.supportingDocs = [];
          v.supportingDocs.push(att);
          state.vendorDraft = v;
          if (v.name) saveVendor(v);
          else toast("Saved on this vendor — click Save vendor on the Vendor tab to keep the name");
          toast("Supporting document uploaded");
          state.vendorTab = "docs";
          viewVendorDetail(main);
        });
      });
    }
    $$("[data-vnd-doc-open]", main).forEach(function (b) {
      b.addEventListener("click", function () {
        var idx = parseInt(b.getAttribute("data-vnd-doc-open"), 10);
        var d = v.supportingDocs && v.supportingDocs[idx];
        if (d && d.dataUrl) window.open(d.dataUrl, "_blank");
      });
    });
    $$("[data-vnd-doc-del]", main).forEach(function (b) {
      b.addEventListener("click", function () {
        var idx = parseInt(b.getAttribute("data-vnd-doc-del"), 10);
        if (v.supportingDocs && !isNaN(idx)) {
          v.supportingDocs.splice(idx, 1);
          state.vendorDraft = v;
          if (v.name) saveVendor(v);
          viewVendorDetail(main);
        }
      });
    });
  }

  function viewDocuments(main) {
    setBreadcrumbs([
      { label: "Home", nav: "home" },
      { label: "Documents" },
    ]);

    var cards = DOC_LIBRARIES.map(function (lib) {
      return (
        '<button type="button" class="doc-lib-card" data-doc-lib="' +
        escapeHtml(lib.id) +
        '">' +
        '<span class="doc-lib-icon" aria-hidden="true">' +
        escapeHtml(lib.icon) +
        "</span>" +
        "<h3>" +
        escapeHtml(lib.title) +
        "</h3>" +
        "<p>" +
        escapeHtml(lib.desc) +
        "</p>" +
        '<span class="doc-module-open-cta">Open library →</span>' +
        "</button>"
      );
    }).join("");

    main.innerHTML =
      '<div class="page-header"><div><h1 class="page-title">Document Management</h1>' +
      '<p class="page-subtitle">Two controlled libraries — create folders and subfolders (by location or category), then add documents.</p></div></div>' +
      '<div class="doc-lib-grid">' +
      cards +
      "</div>" +
      '<p class="form-hint mt-2">Tip: In each library, make top-level folders such as “By Location” or “By Document Category”, then nest sites, customers, or doc types underneath.</p>';

    $$("[data-doc-lib]", main).forEach(function (b) {
      b.addEventListener("click", function () {
        navigate("documents-lib", { lib: b.getAttribute("data-doc-lib") });
      });
    });
  }

  function viewDocLibrary(main) {
    var libId = state.params.lib || "qualityManual";
    var meta = getDocLibMeta(libId);
    if (!meta) {
      setBreadcrumbs([
        { label: "Home", nav: "home" },
        { label: "Documents", nav: "documents" },
        { label: "Not found" },
      ]);
      main.innerHTML =
        '<div class="empty-state"><h3>Library not found</h3>' +
        '<button type="button" class="btn btn-primary" data-nav="documents">Back</button></div>';
      $$("[data-nav]", main).forEach(function (b) {
        b.addEventListener("click", function () {
          navigate(b.getAttribute("data-nav"));
        });
      });
      return;
    }

    var folderId = state.params.folder || null;
    if (folderId === "" || folderId === "root") folderId = null;
    var tree = getDocLibTree(libId);
    var current = folderId ? docLibGetFolder(tree, folderId) : null;
    if (folderId && !current) {
      folderId = null;
      current = null;
    }

    var path = docLibFolderPath(tree, folderId);
    setBreadcrumbs([
      { label: "Home", nav: "home" },
      { label: "Documents", nav: "documents" },
      { label: meta.title },
    ]);

    var childFolders = docLibChildFolders(tree, folderId);
    var docs = docLibDocsInFolder(tree, folderId);

    var breadcrumbHtml =
      '<nav class="doc-folder-crumbs" aria-label="Folder path">' +
      '<button type="button" class="table-link" data-doc-go-folder="">' +
      escapeHtml(meta.short) +
      " root</button>";
    path.forEach(function (f) {
      breadcrumbHtml +=
        ' <span class="text-muted">/</span> ' +
        '<button type="button" class="table-link" data-doc-go-folder="' +
        escapeHtml(f.id) +
        '">' +
        escapeHtml(f.name) +
        "</button>";
    });
    breadcrumbHtml += "</nav>";

    var folderRows = childFolders
      .map(function (f) {
        var sub = docLibChildFolders(tree, f.id).length;
        var dcount = docLibDocsInFolder(tree, f.id).length;
        return (
          '<tr class="row-click" data-doc-open-folder="' +
          escapeHtml(f.id) +
          '">' +
          '<td class="doc-folder-name">📁 ' +
          escapeHtml(f.name) +
          "</td>" +
          '<td class="num-cell">' +
          sub +
          " sub</td>" +
          '<td class="num-cell">' +
          dcount +
          " docs</td>" +
          "<td>" +
          escapeHtml(formatDate(f.createdAt)) +
          "</td>" +
          '<td><button type="button" class="btn btn-ghost btn-sm" data-doc-rename-folder="' +
          escapeHtml(f.id) +
          '">Rename</button> ' +
          '<button type="button" class="btn btn-ghost btn-sm" data-doc-del-folder="' +
          escapeHtml(f.id) +
          '">Delete</button></td>' +
          "</tr>"
        );
      })
      .join("");

    var docRows = docs
      .map(function (d) {
        return (
          "<tr>" +
          '<td class="wrap-cell">📄 ' +
          escapeHtml(d.title || d.fileName || "Document") +
          "</td>" +
          "<td>" +
          escapeHtml(d.rev || "—") +
          "</td>" +
          "<td>" +
          escapeHtml(d.fileName || "—") +
          "</td>" +
          "<td>" +
          escapeHtml(formatDateTime(d.uploadedAt || d.date)) +
          "</td>" +
          "<td>" +
          (d.dataUrl
            ? '<button type="button" class="table-link" data-doc-open="' +
              escapeHtml(d.id) +
              '">Open</button> · '
            : "") +
          '<button type="button" class="table-link" data-doc-del="' +
          escapeHtml(d.id) +
          '">Remove</button>' +
          "</td></tr>"
        );
      })
      .join("");

    main.innerHTML =
      '<div class="page-header page-header-compact"><div><h1 class="page-title">' +
      escapeHtml(meta.icon + " " + meta.title) +
      "</h1>" +
      '<p class="page-subtitle">' +
      escapeHtml(meta.desc) +
      "</p>" +
      breadcrumbHtml +
      "</div>" +
      '<div class="btn-group">' +
      '<button type="button" class="btn btn-ghost btn-sm" data-nav="documents">All libraries</button>' +
      "</div></div>" +
      '<div class="doc-lib-toolbar panel mb-2"><div class="panel-body">' +
      '<div class="form-grid-3" style="align-items:end">' +
      '<label class="field"><span>New folder name</span>' +
      '<input type="text" id="doc-new-folder" class="form-control" placeholder="e.g. Broussard, Inspection, Customer — Chevron" /></label>' +
      '<div class="field"><span class="kv-label" style="display:block;margin-bottom:0.35rem">&nbsp;</span>' +
      '<button type="button" class="btn btn-secondary" id="doc-add-folder">Create folder here</button></div>' +
      '<p class="form-hint mb-0">Folders can nest under the current location. Use separate trees for location vs category if you want.</p>' +
      "</div></div></div>" +
      '<div class="panel mb-2"><div class="panel-header panel-header-compact">' +
      '<h2 class="panel-title">Folders' +
      (current ? " in “" + escapeHtml(current.name) + "”" : " (library root)") +
      "</h2></div>" +
      '<div class="table-wrap"><table class="table"><thead><tr>' +
      "<th>Folder</th><th>Subfolders</th><th>Docs here</th><th>Created</th><th></th>" +
      "</tr></thead><tbody>" +
      (folderRows ||
        '<tr><td colspan="5" class="table-empty">No folders here yet. Create one above (e.g. a location or document category).</td></tr>') +
      "</tbody></table></div></div>" +
      '<div class="panel mb-2"><div class="panel-header panel-header-compact">' +
      '<h2 class="panel-title">Documents in this folder</h2></div>' +
      '<div class="panel-body">' +
      '<div class="form-grid-3 mb-2">' +
      '<label class="field"><span>Document title</span>' +
      '<input type="text" id="doc-title" class="form-control" placeholder="Optional — defaults to file name" /></label>' +
      '<label class="field"><span>Revision</span>' +
      '<input type="text" id="doc-rev" class="form-control" value="A" /></label>' +
      '<label class="field"><span>File</span>' +
      '<input type="file" id="doc-file" class="form-control" /></label>' +
      "</div>" +
      '<button type="button" class="btn btn-primary btn-sm" id="doc-upload">Add document to this folder</button>' +
      '<p class="form-hint mt-1">Files are stored in this browser (localStorage). Keep uploads under ~2.5 MB each.</p>' +
      "</div>" +
      '<div class="table-wrap"><table class="table"><thead><tr>' +
      "<th>Title</th><th>Rev</th><th>File</th><th>Uploaded</th><th></th>" +
      "</tr></thead><tbody>" +
      (docRows ||
        '<tr><td colspan="5" class="table-empty">No documents in this folder.</td></tr>') +
      "</tbody></table></div></div>";

    $$("[data-nav]", main).forEach(function (b) {
      b.addEventListener("click", function () {
        navigate(b.getAttribute("data-nav"));
      });
    });

    function goFolder(fid) {
      var p = { lib: libId };
      if (fid) p.folder = fid;
      navigate("documents-lib", p);
    }

    $$("[data-doc-go-folder]", main).forEach(function (b) {
      b.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        var fid = b.getAttribute("data-doc-go-folder");
        goFolder(fid || null);
      });
    });

    $$("tr[data-doc-open-folder]", main).forEach(function (row) {
      row.addEventListener("click", function (e) {
        if (e.target && e.target.closest && e.target.closest("button")) return;
        goFolder(row.getAttribute("data-doc-open-folder"));
      });
    });

    $("#doc-add-folder", main).addEventListener("click", function () {
      var name = ($("#doc-new-folder", main).value || "").trim();
      if (!name) {
        toast("Enter a folder name", "error");
        return;
      }
      /* prevent duplicate name under same parent */
      var dup = childFolders.some(function (f) {
        return String(f.name).toLowerCase() === name.toLowerCase();
      });
      if (dup) {
        toast("A folder with that name already exists here", "error");
        return;
      }
      tree.folders.push({
        id: uid("fld"),
        name: name,
        parentId: folderId,
        createdAt: nowISO(),
      });
      saveDocLibTree(libId, tree);
      toast("Folder “" + name + "” created");
      goFolder(folderId);
    });

    $$("[data-doc-rename-folder]", main).forEach(function (b) {
      b.addEventListener("click", function (e) {
        e.stopPropagation();
        var id = b.getAttribute("data-doc-rename-folder");
        var f = docLibGetFolder(tree, id);
        if (!f) return;
        var neu = window.prompt("Rename folder", f.name);
        if (neu == null) return;
        neu = String(neu).trim();
        if (!neu) {
          toast("Name required", "error");
          return;
        }
        f.name = neu;
        saveDocLibTree(libId, tree);
        toast("Folder renamed");
        goFolder(folderId);
      });
    });

    $$("[data-doc-del-folder]", main).forEach(function (b) {
      b.addEventListener("click", function (e) {
        e.stopPropagation();
        var id = b.getAttribute("data-doc-del-folder");
        var f = docLibGetFolder(tree, id);
        if (!f) return;
        var kids = docLibChildFolders(tree, id).length;
        var dcount = docLibDocsInFolder(tree, id).length;
        if (kids || dcount) {
          toast(
            "Folder is not empty (" +
              kids +
              " subfolder(s), " +
              dcount +
              " doc(s)). Move or delete contents first.",
            "error"
          );
          return;
        }
        if (!confirm('Delete folder "' + f.name + '"?')) return;
        tree.folders = tree.folders.filter(function (x) {
          return x.id !== id;
        });
        saveDocLibTree(libId, tree);
        toast("Folder deleted");
        goFolder(folderId);
      });
    });

    $("#doc-upload", main).addEventListener("click", function () {
      var fileInput = $("#doc-file", main);
      var title = ($("#doc-title", main).value || "").trim();
      var rev = ($("#doc-rev", main).value || "A").trim() || "A";
      if (!fileInput || !fileInput.files || !fileInput.files[0]) {
        toast("Choose a file to upload", "error");
        return;
      }
      var file = fileInput.files[0];
      if (file.size > 2.5 * 1024 * 1024) {
        toast("File too large for browser storage (max ~2.5 MB)", "error");
        return;
      }
      if (!title) title = file.name;
      var reader = new FileReader();
      reader.onload = function () {
        tree.documents.push({
          id: uid("ddoc"),
          folderId: folderId,
          title: title,
          rev: rev,
          fileName: file.name,
          mimeType: file.type || "",
          size: file.size,
          dataUrl: reader.result,
          uploadedAt: nowISO(),
          date: todayISO(),
          status: "Active",
        });
        var ok = true;
        try {
          saveDocLibTree(libId, tree);
        } catch (err) {
          ok = false;
        }
        /* storageSet may fail silently on quota */
        var check = getDocLibTree(libId);
        var found = (check.documents || []).some(function (d) {
          return d.title === title && d.fileName === file.name;
        });
        if (!found) {
          toast("Could not save file — storage may be full. Try a smaller file.", "error");
          /* reload tree without the failed push */
          tree = getDocLibTree(libId);
          goFolder(folderId);
          return;
        }
        toast("Document added to folder");
        goFolder(folderId);
      };
      reader.onerror = function () {
        toast("Could not read file", "error");
      };
      reader.readAsDataURL(file);
    });

    $$("[data-doc-open]", main).forEach(function (b) {
      b.addEventListener("click", function () {
        var id = b.getAttribute("data-doc-open");
        var d = null;
        (tree.documents || []).forEach(function (x) {
          if (x.id === id) d = x;
        });
        if (d && d.dataUrl) window.open(d.dataUrl, "_blank");
        else toast("No file data to open", "error");
      });
    });

    $$("[data-doc-del]", main).forEach(function (b) {
      b.addEventListener("click", function () {
        var id = b.getAttribute("data-doc-del");
        if (!confirm("Remove this document?")) return;
        tree.documents = (tree.documents || []).filter(function (d) {
          return d.id !== id;
        });
        saveDocLibTree(libId, tree);
        toast("Document removed");
        goFolder(folderId);
      });
    });
  }

  /* ========================================================================
   * NCR (API Q2-style) — risk matrix, assignment, CAPA, docs, notify
   * ======================================================================== */
  var NCR_DEPTS = ["QA", "Inspection", "Yard", "Sales", "Engineering", "HSE", "Other"];
  var NCR_PEOPLE = {
    QA: ["QA Desk", "QA Manager", "J. Morales"],
    Inspection: ["Inspection Lead", "Inspector A", "Inspector B"],
    Yard: ["Yard Lead", "Yard Tech 1", "Yard Tech 2"],
    Sales: ["Sales Desk", "A. Patel", "S. Chen"],
    Engineering: ["Eng Lead", "Design Eng"],
    HSE: ["HSE Advisor", "HSE Manager"],
    Other: ["Unassigned"],
  };
  var NCR_STATUSES = ["Draft", "Open", "Notified", "Assigned", "In Review", "CAPA", "Closed", "Void"];
  var NCR_TYPES = [
    "Dimensional",
    "Material",
    "Process",
    "Documentation",
    "Damage",
    "Other",
  ];
  var NCR_DISPOSITIONS = [
    "Pending",
    "Quarantine",
    "Use as-is",
    "Rework",
    "Scrap",
    "Return to vendor",
  ];
  var NCR_LIKELIHOOD_LABELS = ["", "Rare", "Unlikely", "Possible", "Likely", "Almost certain"];
  var NCR_SEVERITY_LABELS = ["", "Negligible", "Minor", "Moderate", "Major", "Critical"];

  function emptyNcrAction() {
    return {
      id: uid("act"),
      action: "",
      owner: "",
      due: "",
      status: "Open",
      completedAt: "",
    };
  }

  function emptyNcr() {
    return {
      id: "",
      ncrNo: "",
      status: "Draft",
      createdAt: "",
      createdBy: "demo.user",
      updatedAt: "",
      date: todayISO(),
      title: "",
      issueDescription: "",
      nonconformanceType: "Damage",
      discoveryDate: todayISO(),
      discoveredBy: "",
      discoveryLocation: "",
      company: "",
      ncCategory: "",
      relatedDtId: "",
      relatedDtNo: "",
      daysToClose: null,
      loggedAt: "",
      contact: "",
      phone: "",
      email: "",
      jobNo: "",
      elId: "",
      elNo: "",
      dtId: "",
      dtNo: "",
      well: "",
      rig: "",
      shipTo: "",
      store: "",
      serial: "",
      description: "",
      immediateAction: "",
      immediateActionBy: "",
      immediateActionAt: "",
      dispositionHold: "Pending",
      likelihood: 0,
      severity: 0,
      riskScore: 0,
      riskLevel: "",
      residualLikelihood: 0,
      residualSeverity: 0,
      residualScore: 0,
      residualLevel: "",
      riskNotes: "",
      assignedDept: "",
      assignedTo: "",
      assignedAt: "",
      dueDate: "",
      failureMode: "",
      rootCause: "",
      rootCauseMethod: "5-Why",
      affectedQty: "1",
      specReference: "",
      acceptanceCriteria: "",
      customerImpact: false,
      correctiveActions: [],
      preventiveActions: [],
      actionItems: [],
      verificationOfEffectiveness: "",
      closedAt: "",
      closedBy: "",
      closureNotes: "",
      attachments: [],
      notifiedAt: "",
      notifiedTo: "",
      notifiedRiskScore: null,
      history: [],
      /* legacy compat */
      severityLegacy: "",
      owner: "",
    };
  }

  function ncrRiskLevelFromScore(score) {
    var s = parseInt(score, 10) || 0;
    if (s <= 0) return "";
    if (s <= 4) return "Low";
    if (s <= 9) return "Medium";
    if (s <= 16) return "High";
    return "Critical";
  }

  function ncrApplyRisk(n) {
    var L = parseInt(n.likelihood, 10) || 0;
    var S = parseInt(n.severity, 10) || 0;
    if (L < 0) L = 0;
    if (L > 5) L = 5;
    if (S < 0) S = 0;
    if (S > 5) S = 5;
    n.likelihood = L;
    n.severity = S;
    n.riskScore = L && S ? L * S : 0;
    n.riskLevel = ncrRiskLevelFromScore(n.riskScore);
    var rL = parseInt(n.residualLikelihood, 10) || 0;
    var rS = parseInt(n.residualSeverity, 10) || 0;
    n.residualLikelihood = rL;
    n.residualSeverity = rS;
    n.residualScore = rL && rS ? rL * rS : 0;
    n.residualLevel = ncrRiskLevelFromScore(n.residualScore);
    /* legacy list field */
    n.severityLegacy = n.riskLevel || n.severityLegacy || "";
    return n;
  }

  function ncrRiskBadgeClass(level) {
    var lv = String(level || "").toLowerCase();
    if (lv === "critical" || lv === "high") return "badge-danger";
    if (lv === "medium") return "badge-warn";
    if (lv === "low") return "badge-in";
    return "badge-info";
  }

  function ncrStatusBadgeClass(status) {
    var st = String(status || "");
    if (st === "Closed" || st === "Void") return "badge-closed";
    if (st === "Draft") return "badge-info";
    if (st === "Open" || st === "Notified") return "badge-warn";
    if (st === "CAPA" || st === "In Review" || st === "Assigned") return "badge-out";
    return "badge-info";
  }

  function normalizeNcrAction(a) {
    if (!a || typeof a !== "object") return emptyNcrAction();
    return {
      id: a.id || uid("act"),
      action: a.action || "",
      owner: a.owner || "",
      due: a.due || "",
      status: a.status || "Open",
      completedAt: a.completedAt || "",
    };
  }

  function normalizeNcr(raw) {
    if (!raw || typeof raw !== "object") return null;
    var n = emptyNcr();
    Object.keys(n).forEach(function (k) {
      if (raw[k] !== undefined && raw[k] !== null) n[k] = raw[k];
    });
    n.id = raw.id || raw.ncrNo || n.id;
    n.ncrNo = raw.ncrNo || raw.id || "";
    if (!n.id) n.id = n.ncrNo || uid("NCR");
    if (!n.ncrNo) n.ncrNo = n.id;
    n.status = raw.status || "Open";
    n.date = raw.date || (raw.createdAt ? String(raw.createdAt).slice(0, 10) : todayISO());
    n.title = raw.title || "";
    n.serial = raw.serial || "";
    /* legacy severity string → matrix defaults */
    if ((!raw.likelihood || !raw.severity) && raw.severity && isNaN(parseInt(raw.severity, 10))) {
      var leg = String(raw.severity).toLowerCase();
      if (leg === "critical") {
        n.likelihood = n.likelihood || 4;
        n.severity = n.severity || 5;
      } else if (leg === "major") {
        n.likelihood = n.likelihood || 3;
        n.severity = n.severity || 4;
      } else if (leg === "minor") {
        n.likelihood = n.likelihood || 2;
        n.severity = n.severity || 2;
      }
      n.severityLegacy = raw.severity;
    }
    if (raw.owner && !n.assignedTo) n.assignedTo = raw.owner;
    n.owner = n.assignedTo || raw.owner || "";
    n.correctiveActions = (raw.correctiveActions || []).map(normalizeNcrAction);
    n.preventiveActions = (raw.preventiveActions || []).map(normalizeNcrAction);
    n.actionItems = (raw.actionItems || []).map(normalizeNcrAction);
    n.attachments = Array.isArray(raw.attachments) ? raw.attachments.slice() : [];
    n.history = Array.isArray(raw.history) ? raw.history.slice() : [];
    n.customerImpact = !!raw.customerImpact;
    n.ncCategory = raw.ncCategory || raw.nonConformanceCategory || "";
    n.relatedDtId = raw.relatedDtId || "";
    n.relatedDtNo = raw.relatedDtNo || raw.dtNo || "";
    if (n.relatedDtNo && !n.dtNo) n.dtNo = n.relatedDtNo;
    n.loggedAt = raw.loggedAt || raw.createdAt || "";
    if (n.status === "Closed") {
      n.daysToClose = ncrComputeDaysToClose(n);
    } else if (raw.daysToClose != null && raw.daysToClose !== "") {
      n.daysToClose = parseInt(raw.daysToClose, 10);
      if (!isFinite(n.daysToClose)) n.daysToClose = null;
    } else {
      n.daysToClose = null;
    }
    return ncrApplyRisk(n);
  }

  function ncrComputeDaysToClose(n) {
    if (!n) return null;
    var open = String(n.date || n.loggedAt || n.createdAt || "").slice(0, 10);
    var close = String(n.closedAt || "").slice(0, 10);
    if (!open || !close) return null;
    var a = parseBillingDay(open);
    var b = parseBillingDay(close);
    if (!a || !b) return null;
    var days = Math.round((b.getTime() - a.getTime()) / 86400000);
    return days < 0 ? 0 : days;
  }

  function getNcCategories() {
    var cfg = null;
    try {
      cfg = loadPublishedScoreConfig();
    } catch (e) {}
    var list = cfg && Array.isArray(cfg.ncCategories) ? cfg.ncCategories.slice() : [];
    if (!list.length) {
      list = ["Machining", "Description", "Packaging", "Inspection", "Product Condition", "Delivery"];
    }
    var hasDel = false;
    list.forEach(function (c) {
      if (String(c).toLowerCase() === "delivery") hasDel = true;
    });
    if (!hasDel) list.push("Delivery");
    return list.filter(function (x) {
      return String(x || "").trim();
    });
  }

  function ncrIsDeliveryCategory(cat) {
    return String(cat || "").trim().toLowerCase() === "delivery";
  }

  function dtsForVendorName(name) {
    var key = String(name || "").trim().toLowerCase();
    if (!key) return [];
    return loadDts()
      .filter(function (d) {
        var hay = String(d.vendorName || d.customer || d.company || "").trim().toLowerCase();
        if (!hay) return false;
        if (hay === key) return true;
        if ((d.destType || "") === "vendor" && (hay.indexOf(key) !== -1 || key.indexOf(hay) !== -1)) return true;
        return false;
      })
      .sort(function (a, b) {
        return String(b.shipDate || b.createdAt || "").localeCompare(String(a.shipDate || a.createdAt || ""));
      });
  }

  function ncrRelatedDtOptionsHtml(vendorName, selectedId) {
    var sel = String(selectedId || "");
    var opts = '<option value="">Select DT…</option>';
    dtsForVendorName(vendorName).forEach(function (d) {
      var id = String(d.id || d.dtNo || "");
      var no = formatDtNo(d.dtNo || d.id);
      var label = "DT-" + no;
      if (d.shipDate) label += " · ship " + formatDate(d.shipDate);
      if (d.dueDate) label += " · due " + formatDate(d.dueDate);
      var sns = [];
      (d.lines || []).forEach(function (ln) {
        if (ln.serial && sns.length < 3) sns.push(ln.serial);
      });
      if (sns.length) label += " · " + sns.join(", ");
      var match = sel && (id === sel || no === formatDtNo(sel) || String(d.dtNo) === sel);
      opts +=
        '<option value="' +
        escapeHtml(id) +
        '"' +
        (match ? " selected" : "") +
        ">" +
        escapeHtml(label) +
        "</option>";
    });
    return opts;
  }

  function ncrCategoryOptionsHtml(selected, required) {
    var sel = String(selected || "");
    var opts = '<option value="">' + (required ? "Select category…" : "All") + "</option>";
    var found = false;
    getNcCategories().forEach(function (c) {
      if (c === sel) found = true;
      opts +=
        '<option value="' +
        escapeHtml(c) +
        '"' +
        (c === sel ? " selected" : "") +
        ">" +
        escapeHtml(c) +
        "</option>";
    });
    if (sel && !found) {
      opts +=
        '<option value="' +
        escapeHtml(sel) +
        '" selected>' +
        escapeHtml(sel) +
        "</option>";
    }
    return opts;
  }

  function ncrVendorOptionsHtml(selected) {
    var sel = String(selected || "");
    var names = [];
    try {
      names = getVendorNames();
    } catch (e) {
      names = [];
    }
    var opts = '<option value="">Select vendor…</option>';
    var found = false;
    names.forEach(function (nm) {
      if (nm === sel) found = true;
      opts +=
        '<option value="' +
        escapeHtml(nm) +
        '"' +
        (nm === sel ? " selected" : "") +
        ">" +
        escapeHtml(nm) +
        "</option>";
    });
    if (sel && !found) {
      opts +=
        '<option value="' +
        escapeHtml(sel) +
        '" selected>' +
        escapeHtml(sel) +
        "</option>";
    }
    return opts;
  }

  function refreshSupplierScoreForVendorName(name) {
    var key = String(name || "").trim().toLowerCase();
    if (!key) return;
    var vendor = null;
    loadVendors().forEach(function (v) {
      if (String(v.name || "").trim().toLowerCase() === key) vendor = v;
    });
    if (!vendor) return;
    try {
      var cfg = loadPublishedScoreConfig();
      var period = resolveScoreUserPeriod(state.scoreUserPeriod);
      evaluateVendorPeriod(vendor, period, cfg, { commit: true, keepOverrides: true });
    } catch (e) {}
  }

  function loadNcrs() {
    seedDocsNcrIfNeeded();
    return (storageGet(KEYS.ncrs, []) || []).map(normalizeNcr).filter(Boolean);
  }

  function saveNcrs(list) {
    storageSet(KEYS.ncrs, (list || []).map(normalizeNcr).filter(Boolean));
  }

  function getNcr(id) {
    if (!id) return null;
    var list = loadNcrs();
    var key = String(id);
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === key || list[i].ncrNo === key) return list[i];
    }
    return null;
  }

  function saveNcr(ncr) {
    var n = normalizeNcr(ncr);
    n.updatedAt = nowISO();
    n.owner = n.assignedTo || n.owner;
    var list = loadNcrs();
    var found = false;
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === n.id || list[i].ncrNo === n.ncrNo) {
        list[i] = n;
        found = true;
        break;
      }
    }
    if (!found) list.unshift(n);
    saveNcrs(list);
    refreshSupplierScoreForVendorName(n.company);
    return n;
  }

  function nextNcrNo() {
    var max = 1000;
    loadNcrs().forEach(function (n) {
      var m = String(n.ncrNo || n.id || "").match(/(\d+)/);
      if (m) {
        var v = parseInt(m[1], 10);
        if (v > max) max = v;
      }
    });
    return "NCR-" + (max + 1);
  }

  function ncrPushHistory(ncr, event, detail) {
    if (!ncr.history) ncr.history = [];
    ncr.history.unshift({
      at: nowISO(),
      event: event || "",
      detail: detail || "",
      by: "demo.user",
    });
  }

  function ncrPeopleForDept(dept) {
    return (NCR_PEOPLE[dept] || NCR_PEOPLE.Other || []).slice();
  }

  /** 5×5 risk matrix HTML. prefix e.g. "ncr" or "ncr-res" for residual */
  function renderRiskMatrixHtml(likelihood, severity, prefix, title) {
    prefix = prefix || "ncr";
    var L = parseInt(likelihood, 10) || 0;
    var S = parseInt(severity, 10) || 0;
    var score = L && S ? L * S : 0;
    var level = ncrRiskLevelFromScore(score);
    var rows = "";
    var li, sj;
    for (li = 5; li >= 1; li--) {
      rows += "<tr><th class=\"ncr-matrix-axis\">" + li + " " + escapeHtml(NCR_LIKELIHOOD_LABELS[li]) + "</th>";
      for (sj = 1; sj <= 5; sj++) {
        var sc = li * sj;
        var lv = ncrRiskLevelFromScore(sc);
        var sel = L === li && S === sj ? " selected" : "";
        rows +=
          '<td><button type="button" class="ncr-matrix-cell risk-' +
          lv.toLowerCase() +
          sel +
          '" data-risk-prefix="' +
          escapeHtml(prefix) +
          '" data-L="' +
          li +
          '" data-S="' +
          sj +
          '" title="L' +
          li +
          " × S" +
          sj +
          " = " +
          sc +
          " (" +
          lv +
          ')">' +
          sc +
          "</button></td>";
      }
      rows += "</tr>";
    }
    var sevHeads = "<tr><th></th>";
    for (sj = 1; sj <= 5; sj++) {
      sevHeads +=
        '<th class="ncr-matrix-axis">' +
        sj +
        "<br/><span>" +
        escapeHtml(NCR_SEVERITY_LABELS[sj]) +
        "</span></th>";
    }
    sevHeads += "</tr>";

    return (
      '<div class="ncr-risk-block" data-risk-block="' +
      escapeHtml(prefix) +
      '">' +
      '<div class="ncr-risk-head">' +
      "<strong>" +
      escapeHtml(title || "Risk matrix") +
      "</strong>" +
      ' <span class="badge ' +
      ncrRiskBadgeClass(level) +
      '" id="' +
      prefix +
      '-risk-badge">' +
      (level ? escapeHtml(level) + " · " + score : "Not set") +
      "</span>" +
      '<span class="text-muted" style="font-size:0.8rem;margin-left:0.5rem">Likelihood × Severity</span>' +
      "</div>" +
      '<div class="ncr-matrix-wrap"><table class="ncr-matrix">' +
      sevHeads +
      rows +
      "</table>" +
      '<p class="form-hint">Severity → &nbsp;|&nbsp; Likelihood ↑ &nbsp;· Click a cell to set risk</p></div>' +
      '<input type="hidden" id="' +
      prefix +
      '-likelihood" value="' +
      L +
      '" />' +
      '<input type="hidden" id="' +
      prefix +
      '-severity" value="' +
      S +
      '" />' +
      "</div>"
    );
  }

  function bindRiskMatrix(root, prefix, onChange) {
    if (!root) return;
    $$('[data-risk-prefix="' + prefix + '"]', root).forEach(function (btn) {
      btn.addEventListener("click", function () {
        var L = parseInt(btn.getAttribute("data-L"), 10);
        var S = parseInt(btn.getAttribute("data-S"), 10);
        var Lel = $("#" + prefix + "-likelihood", root);
        var Sel = $("#" + prefix + "-severity", root);
        if (Lel) Lel.value = String(L);
        if (Sel) Sel.value = String(S);
        $$('[data-risk-prefix="' + prefix + '"]', root).forEach(function (c) {
          c.classList.remove("selected");
        });
        btn.classList.add("selected");
        var score = L * S;
        var level = ncrRiskLevelFromScore(score);
        var badge = $("#" + prefix + "-risk-badge", root);
        if (badge) {
          badge.className = "badge " + ncrRiskBadgeClass(level);
          badge.textContent = level + " · " + score;
        }
        if (typeof onChange === "function") onChange(L, S, score, level);
      });
    });
  }

  function ncrReadRiskFromDom(root, prefix) {
    var L = parseInt(($("#" + prefix + "-likelihood", root) || {}).value, 10) || 0;
    var S = parseInt(($("#" + prefix + "-severity", root) || {}).value, 10) || 0;
    return { likelihood: L, severity: S, riskScore: L && S ? L * S : 0, riskLevel: ncrRiskLevelFromScore(L * S) };
  }

  function renderNcrActionTable(list, kind, editable) {
    var rows = (list || [])
      .map(function (a, idx) {
        if (!editable) {
          return (
            "<tr><td>" +
            escapeHtml(a.action || "—") +
            "</td><td>" +
            escapeHtml(a.owner || "—") +
            "</td><td>" +
            escapeHtml(formatDate(a.due)) +
            "</td><td>" +
            escapeHtml(a.status || "—") +
            "</td></tr>"
          );
        }
        return (
          '<tr data-act-kind="' +
          escapeHtml(kind) +
          '" data-act-idx="' +
          idx +
          '">' +
          '<td><input type="text" class="form-control act-action" value="' +
          escapeHtml(a.action || "") +
          '" /></td>' +
          '<td><input type="text" class="form-control act-owner" value="' +
          escapeHtml(a.owner || "") +
          '" /></td>' +
          '<td><input type="date" class="form-control act-due" value="' +
          escapeHtml(a.due || "") +
          '" /></td>' +
          '<td><select class="form-control act-status">' +
          ["Open", "In Progress", "Done", "Cancelled"]
            .map(function (st) {
              return (
                '<option value="' +
                st +
                '"' +
                (a.status === st ? " selected" : "") +
                ">" +
                st +
                "</option>"
              );
            })
            .join("") +
          '</select></td>' +
          '<td><button type="button" class="btn btn-ghost btn-sm act-remove">Remove</button></td></tr>'
        );
      })
      .join("");
    return (
      '<div class="table-wrap"><table class="table"><thead><tr>' +
      "<th>Action</th><th>Owner</th><th>Due</th><th>Status</th>" +
      (editable ? "<th></th>" : "") +
      "</tr></thead><tbody id=\"ncr-acts-" +
      escapeHtml(kind) +
      '">' +
      (rows ||
        '<tr><td colspan="' +
          (editable ? "5" : "4") +
          '" class="table-empty">None yet</td></tr>') +
      "</tbody></table></div>" +
      (editable
        ? '<button type="button" class="btn btn-secondary btn-sm mt-1" data-add-act="' +
          escapeHtml(kind) +
          '">Add action</button>'
        : "")
    );
  }

  function collectNcrActionsFromDom(root, kind) {
    var out = [];
    $$('tr[data-act-kind="' + kind + '"]', root).forEach(function (tr) {
      var action = (tr.querySelector(".act-action") || {}).value || "";
      var owner = (tr.querySelector(".act-owner") || {}).value || "";
      var due = (tr.querySelector(".act-due") || {}).value || "";
      var status = (tr.querySelector(".act-status") || {}).value || "Open";
      if (!String(action).trim() && !String(owner).trim()) return;
      out.push(
        normalizeNcrAction({
          action: String(action).trim(),
          owner: String(owner).trim(),
          due: due,
          status: status,
          completedAt: status === "Done" ? todayISO() : "",
        })
      );
    });
    return out;
  }

  function viewNcr(main) {
    seedDocsNcrIfNeeded();
    setBreadcrumbs([
      { label: "Home", nav: "home" },
      { label: "NCR" },
    ]);
    var f = state.ncrFilter || { status: "" };
    var list = loadNcrs().filter(function (n) {
      if (f.status && n.status !== f.status) return false;
      if (f.dept && String(n.assignedDept || "") !== f.dept) return false;
      if (f.ncCategory && String(n.ncCategory || "") !== f.ncCategory) return false;
      if (f.risk && String(n.riskLevel || "") !== f.risk) return false;
      if (f.q) {
        var hay = (
          n.ncrNo +
          " " +
          n.title +
          " " +
          n.serial +
          " " +
          n.company +
          " " +
          n.assignedTo
        ).toLowerCase();
        if (hay.indexOf(String(f.q).toLowerCase()) === -1) return false;
      }
      return true;
    });

    var statusOpts = '<option value="">All</option>' +
      NCR_STATUSES.map(function (s) {
        return (
          '<option value="' +
          s +
          '"' +
          (f.status === s ? " selected" : "") +
          ">" +
          s +
          "</option>"
        );
      }).join("");
    var deptOpts =
      '<option value="">All</option>' +
      NCR_DEPTS.map(function (d) {
        return (
          '<option value="' +
          d +
          '"' +
          (f.dept === d ? " selected" : "") +
          ">" +
          d +
          "</option>"
        );
      }).join("");

    var rows = list
      .map(function (n) {
        return (
          '<tr class="row-click" data-ncr="' +
          escapeHtml(n.id) +
          '">' +
          '<td class="mono">' +
          escapeHtml(n.ncrNo || n.id) +
          "</td>" +
          '<td class="wrap-cell">' +
          escapeHtml(n.title || "—") +
          "</td>" +
          '<td class="mono">' +
          escapeHtml(n.serial || "—") +
          "</td>" +
          "<td>" +
          escapeHtml(n.company || "—") +
          "</td>" +
          '<td class="wrap-cell">' +
          escapeHtml(n.ncCategory || "—") +
          "</td>" +
          '<td><span class="badge ' +
          ncrRiskBadgeClass(n.riskLevel) +
          '">' +
          escapeHtml(n.riskLevel || "—") +
          (n.riskScore ? " · " + n.riskScore : "") +
          "</span></td>" +
          "<td>" +
          escapeHtml(n.assignedDept || "—") +
          "</td>" +
          "<td>" +
          escapeHtml(n.assignedTo || n.owner || "—") +
          "</td>" +
          '<td><span class="badge ' +
          ncrStatusBadgeClass(n.status) +
          '">' +
          escapeHtml(n.status) +
          "</span></td>" +
          "<td>" +
          escapeHtml(formatDate(n.date || n.createdAt)) +
          "</td></tr>"
        );
      })
      .join("");

    main.innerHTML =
      '<div class="page-header"><div><h1 class="page-title">Non-Conformance Reports</h1>' +
      '<p class="page-subtitle">API Q2-style NCR — title page, risk matrix, assignment, CAPA, documents, notify</p></div>' +
      '<button type="button" class="btn btn-primary" data-nav="ncr-new">New NCR</button></div>' +
      '<div class="panel search-panel"><div class="panel-body"><div class="form-grid-3">' +
      '<label class="field"><span>Status</span><select id="ncr-f-status">' +
      statusOpts +
      "</select></label>" +
      '<label class="field"><span>Dept</span><select id="ncr-f-dept">' +
      deptOpts +
      "</select></label>" +
      '<label class="field"><span>Risk</span><select id="ncr-f-risk">' +
      '<option value="">All</option>' +
      ["Low", "Medium", "High", "Critical"]
        .map(function (r) {
          return (
            '<option value="' +
            r +
            '"' +
            (f.risk === r ? " selected" : "") +
            ">" +
            r +
            "</option>"
          );
        })
        .join("") +
      "</select></label>" +
      '<label class="field"><span>Category</span><select id="ncr-f-cat" class="form-control">' +
      ncrCategoryOptionsHtml(f.ncCategory || "", false) +
      "</select></label>" +
      '<label class="field"><span>Search</span><input type="text" id="ncr-f-q" class="form-control" value="' +
      escapeHtml(f.q || "") +
      '" placeholder="NCR no, title, serial…" /></label>' +
      "</div>" +
      '<div class="search-actions">' +
      '<button type="button" class="btn btn-primary" id="ncr-search">Search</button>' +
      '<button type="button" class="btn btn-ghost" id="ncr-clear">Clear</button>' +
      "</div></div></div>" +
      '<div class="table-wrap"><table class="table"><thead><tr>' +
      "<th>NCR No</th><th>Title</th><th>Serial</th><th>Vendor</th><th>Category</th><th>Risk</th><th>Dept</th><th>Owner</th><th>Status</th><th>Date</th>" +
      "</tr></thead><tbody>" +
      (rows || '<tr><td colspan="10" class="table-empty">No NCRs match.</td></tr>') +
      "</tbody></table></div>";

    $$("[data-nav]", main).forEach(function (b) {
      b.addEventListener("click", function () {
        navigate(b.getAttribute("data-nav"));
      });
    });
    $("#ncr-search", main).addEventListener("click", function () {
      state.ncrFilter = {
        status: $("#ncr-f-status", main).value,
        dept: $("#ncr-f-dept", main).value,
        risk: $("#ncr-f-risk", main).value,
        ncCategory: ($("#ncr-f-cat", main) && $("#ncr-f-cat", main).value) || "",
        q: $("#ncr-f-q", main).value.trim(),
      };
      viewNcr(main);
    });
    $("#ncr-clear", main).addEventListener("click", function () {
      state.ncrFilter = { status: "" };
      viewNcr(main);
    });
    $$("tr[data-ncr]", main).forEach(function (row) {
      row.addEventListener("click", function () {
        navigate("ncr-detail", { id: row.getAttribute("data-ncr") });
      });
    });
  }

  function viewNcrNew(main) {
    setBreadcrumbs([
      { label: "Home", nav: "home" },
      { label: "NCR", nav: "ncr" },
      { label: "New NCR" },
    ]);
    var n = emptyNcr();
    n.id = nextNcrNo();
    n.ncrNo = n.id;
    n.createdAt = nowISO();
    n.date = todayISO();
    state.ncrDraft = n;
    ncrPushHistory(n, "Created", "Draft NCR opened");

    function field(label, id, val, type) {
      type = type || "text";
      return (
        '<label class="field"><span>' +
        escapeHtml(label) +
        '</span><input type="' +
        type +
        '" id="' +
        id +
        '" class="form-control" value="' +
        escapeHtml(val || "") +
        '" /></label>'
      );
    }
    function area(label, id, val) {
      return (
        '<label class="field form-span-full"><span>' +
        escapeHtml(label) +
        '</span><textarea id="' +
        id +
        '" class="form-control" rows="3">' +
        escapeHtml(val || "") +
        "</textarea></label>"
      );
    }

    var typeOpts = NCR_TYPES.map(function (t) {
      return '<option value="' + t + '">' + t + "</option>";
    }).join("");
    var dispOpts = NCR_DISPOSITIONS.map(function (t) {
      return '<option value="' + t + '">' + t + "</option>";
    }).join("");
    var deptOpts =
      '<option value="">Select dept…</option>' +
      NCR_DEPTS.map(function (d) {
        return '<option value="' + d + '">' + d + "</option>";
      }).join("");

    main.innerHTML =
      '<div class="page-header"><div><h1 class="page-title">New NCR</h1>' +
      '<p class="page-subtitle mono">' +
      escapeHtml(n.ncrNo) +
      " · Title page fields + risk matrix + assignment</p></div>" +
      '<div class="btn-group">' +
      '<button type="button" class="btn btn-primary" id="ncr-save-new">Save NCR</button>' +
      '<button type="button" class="btn btn-ghost" data-nav="ncr">Cancel</button>' +
      "</div></div>" +
      '<div class="panel mb-2"><div class="panel-header"><h2 class="panel-title">Customer &amp; asset</h2></div>' +
      '<div class="panel-body"><div class="form-grid-4 form-grid-compact">' +
      '<label class="field"><span>Vendor / Company</span><select id="nn-company" class="form-control">' +
      ncrVendorOptionsHtml("") +
      "</select></label>" +
      '<label class="field"><span>Non-Conformance Category *</span><select id="nn-ncCategory" class="form-control">' +
      ncrCategoryOptionsHtml("", true) +
      "</select></label>" +
      '<label class="field" id="nn-related-wrap" hidden><span>Related DT *</span>' +
      '<select id="nn-relatedDt" class="form-control">' +
      ncrRelatedDtOptionsHtml("", "") +
      "</select></label>" +
      field("Non-Conformance date", "nn-date", todayISO(), "date") +
      field("Contact", "nn-contact", "") +
      field("Phone", "nn-phone", "") +
      field("Email", "nn-email", "") +
      field("Job No", "nn-jobNo", "") +
      field("EL No", "nn-elNo", "") +
      field("DT No", "nn-dtNo", "") +
      field("Well", "nn-well", "") +
      field("Rig", "nn-rig", "") +
      field("Ship to", "nn-shipTo", "") +
      field("Store", "nn-store", "") +
      field("Serial", "nn-serial", "") +
      field("Description", "nn-description", "") +
      "</div></div></div>" +
      '<div class="panel mb-2" id="nn-panel-issue"><div class="panel-header"><h2 class="panel-title">NCR issue &amp; immediate action</h2></div>' +
      '<div class="panel-body"><div class="form-grid-4 form-grid-compact">' +
      field("Title", "nn-title", "") +
      '<label class="field"><span>Type</span><select id="nn-type" class="form-control">' +
      typeOpts +
      "</select></label>" +
      field("Discovery date", "nn-discoveryDate", todayISO(), "date") +
      field("Discovered by", "nn-discoveredBy", "") +
      field("Discovery location", "nn-discoveryLocation", "") +
      '<label class="field"><span>Disposition / hold</span><select id="nn-disp" class="form-control">' +
      dispOpts +
      "</select></label>" +
      area("Issue description", "nn-issue", "") +
      area("Immediate corrective action", "nn-imm", "") +
      field("Immediate action by", "nn-immBy", "") +
      "</div></div></div>" +
      '<div class="panel mb-2" id="nn-panel-risk"><div class="panel-header"><h2 class="panel-title">Risk matrix</h2></div>' +
      '<div class="panel-body">' +
      renderRiskMatrixHtml(0, 0, "nn", "Initial risk") +
      '<label class="field form-span-full mt-2"><span>Risk notes</span>' +
      '<input type="text" id="nn-riskNotes" class="form-control" /></label>' +
      "</div></div>" +
      '<div class="panel mb-2"><div class="panel-header"><h2 class="panel-title">Assign</h2></div>' +
      '<div class="panel-body"><div class="form-grid-4 form-grid-compact">' +
      '<label class="field"><span>Department</span><select id="nn-dept" class="form-control">' +
      deptOpts +
      "</select></label>" +
      '<label class="field"><span>Person</span><select id="nn-person" class="form-control">' +
      '<option value="">Select dept first…</option></select></label>' +
      field("Due date", "nn-due", "", "date") +
      "</div></div></div>";

    $$("[data-nav]", main).forEach(function (b) {
      b.addEventListener("click", function () {
        navigate(b.getAttribute("data-nav"));
      });
    });
    bindRiskMatrix(main, "nn");

    $("#nn-dept", main).addEventListener("change", function () {
      var dept = $("#nn-dept", main).value;
      var people = ncrPeopleForDept(dept);
      var sel = $("#nn-person", main);
      sel.innerHTML =
        '<option value="">Select…</option>' +
        people
          .map(function (p) {
            return '<option value="' + escapeHtml(p) + '">' + escapeHtml(p) + "</option>";
          })
          .join("");
    });

    $("#ncr-save-new", main).addEventListener("click", function () {
      function g(id) {
        var el = $("#" + id, main);
        return el ? String(el.value || "").trim() : "";
      }
      var title = g("nn-title");
      var issue = g("nn-issue");
      var imm = g("nn-imm");
      var cat = g("nn-ncCategory");
      if (!cat) {
        toast("Non-Conformance Category is required", "error");
        return;
      }
      var isDel = ncrIsDeliveryCategory(cat);
      if (isDel) {
        if (!g("nn-company")) {
          toast("Vendor is required for a Delivery NCR", "error");
          return;
        }
        if (!g("nn-relatedDt")) {
          toast("Related DT is required for a Delivery NCR", "error");
          return;
        }
      } else {
        if (!title) {
          toast("Title is required", "error");
          return;
        }
        if (!issue) {
          toast("Issue description is required", "error");
          return;
        }
        if (!imm) {
          toast("Immediate corrective action is required", "error");
          return;
        }
        var riskCheck = ncrReadRiskFromDom(main, "nn");
        if (!riskCheck.likelihood || !riskCheck.severity) {
          toast("Set risk on the matrix (Likelihood × Severity)", "error");
          return;
        }
      }
      var risk = isDel ? { likelihood: 0, severity: 0 } : ncrReadRiskFromDom(main, "nn");
      n.title = title;
      n.issueDescription = issue;
      n.immediateAction = imm;
      n.immediateActionBy = g("nn-immBy");
      n.immediateActionAt = nowISO();
      n.company = g("nn-company");
      n.ncCategory = g("nn-ncCategory");
      n.relatedDtId = g("nn-relatedDt");
      n.relatedDtNo = "";
      if (n.relatedDtId) {
        var rdt = getDt(n.relatedDtId);
        n.relatedDtNo = rdt ? formatDtNo(rdt.dtNo || rdt.id) : n.relatedDtId;
        n.dtNo = n.relatedDtNo;
      }
      if (isDel && !title) {
        title = "Delivery — DT-" + (n.relatedDtNo || n.relatedDtId);
      }
      n.title = title;
      n.date = g("nn-date") || todayISO();
      n.loggedAt = nowISO();
      n.contact = g("nn-contact");
      n.phone = g("nn-phone");
      n.email = g("nn-email");
      n.jobNo = g("nn-jobNo");
      n.elNo = g("nn-elNo");
      if (!n.relatedDtId) n.dtNo = g("nn-dtNo");
      n.well = g("nn-well");
      n.rig = g("nn-rig");
      n.shipTo = g("nn-shipTo");
      n.store = g("nn-store");
      n.serial = g("nn-serial");
      n.description = g("nn-description");
      n.nonconformanceType = g("nn-type") || "Other";
      n.discoveryDate = g("nn-discoveryDate") || todayISO();
      n.discoveredBy = g("nn-discoveredBy");
      n.discoveryLocation = g("nn-discoveryLocation");
      n.dispositionHold = g("nn-disp") || "Pending";
      n.likelihood = risk.likelihood;
      n.severity = risk.severity;
      n.riskNotes = g("nn-riskNotes");
      n.assignedDept = g("nn-dept");
      n.assignedTo = g("nn-person");
      n.dueDate = g("nn-due");
      if (n.assignedDept && n.assignedTo) {
        n.assignedAt = nowISO();
        n.status = "Assigned";
        ncrPushHistory(n, "Assigned", n.assignedDept + " · " + n.assignedTo);
      } else {
        n.status = "Open";
        ncrPushHistory(n, "Opened", "Saved from New NCR");
      }
      if (n.serial && !n.description) {
        var asset = findCardexRecord(n.serial);
        if (asset) n.description = asset.description || "";
      }
      ncrApplyRisk(n);
      saveNcr(n);
      state.ncrDraft = null;
      toast("NCR " + n.ncrNo + " saved · Risk " + n.riskLevel + " (" + n.riskScore + ")");
      navigate("ncr-detail", { id: n.id });
    });
    bindSerialAutoDescription($("#nn-serial", main), $("#nn-description", main));

    function refreshNnRelatedDts() {
      var wrap = $("#nn-related-wrap", main);
      var sel = $("#nn-relatedDt", main);
      var vendor = ($("#nn-company", main) && $("#nn-company", main).value) || "";
      var keep = sel ? sel.value : "";
      if (sel) sel.innerHTML = ncrRelatedDtOptionsHtml(vendor, keep);
      var del = ncrIsDeliveryCategory(($("#nn-ncCategory", main) && $("#nn-ncCategory", main).value) || "");
      if (wrap) wrap.hidden = !del;
      var issue = $("#nn-panel-issue", main);
      var riskP = $("#nn-panel-risk", main);
      if (issue) issue.hidden = del;
      if (riskP) riskP.hidden = del;
    }
    var catEl = $("#nn-ncCategory", main);
    if (catEl) catEl.addEventListener("change", refreshNnRelatedDts);
    var coEl = $("#nn-company", main);
    if (coEl) coEl.addEventListener("change", refreshNnRelatedDts);
    refreshNnRelatedDts();
  }

  function viewNcrDetail(main) {
    var id = state.params.id;
    var n = getNcr(id);
    if (!n) {
      setBreadcrumbs([
        { label: "Home", nav: "home" },
        { label: "NCR", nav: "ncr" },
        { label: "Not found" },
      ]);
      main.innerHTML =
        '<div class="empty-state"><h3>NCR not found</h3>' +
        '<button type="button" class="btn btn-primary" data-nav="ncr">Back</button></div>';
      $$("[data-nav]", main).forEach(function (b) {
        b.addEventListener("click", function () {
          navigate(b.getAttribute("data-nav"));
        });
      });
      return;
    }

    setBreadcrumbs([
      { label: "Home", nav: "home" },
      { label: "NCR", nav: "ncr" },
      { label: n.ncrNo || n.id },
    ]);

    var tab = state.ncrTab || "title";
    var delivery = ncrIsDeliveryCategory(n.ncCategory);
    if (delivery && (tab === "invest" || tab === "actions" || tab === "risk")) {
      tab = "title";
    }
    state.ncrTab = tab;
    var closed = n.status === "Closed" || n.status === "Void";

    function tabBtn(key, label) {
      return (
        '<button type="button" class="tab' +
        (tab === key ? " active" : "") +
        '" data-ncr-tab="' +
        key +
        '">' +
        escapeHtml(label) +
        "</button>"
      );
    }

    function gVal(id, val) {
      return (
        '<label class="field"><span>' +
        escapeHtml(id) +
        '</span><input type="text" class="form-control ncr-f" data-f="' +
        escapeHtml(id) +
        '" value="' +
        escapeHtml(val || "") +
        '"' +
        (closed ? " readonly" : "") +
        " /></label>"
      );
    }

    /* map field keys to labels for title form */
    function fin(key, label, val, type) {
      type = type || "text";
      return (
        '<label class="field"><span>' +
        escapeHtml(label) +
        '</span><input type="' +
        type +
        '" class="form-control ncr-f" data-f="' +
        escapeHtml(key) +
        '" value="' +
        escapeHtml(val || "") +
        '"' +
        (closed ? " readonly" : "") +
        " /></label>"
      );
    }
    function farea(key, label, val) {
      return (
        '<label class="field form-span-full"><span>' +
        escapeHtml(label) +
        '</span><textarea class="form-control ncr-f" data-f="' +
        escapeHtml(key) +
        '" rows="3"' +
        (closed ? " readonly" : "") +
        ">" +
        escapeHtml(val || "") +
        "</textarea></label>"
      );
    }

    var panel = "";
    if (tab === "title") {
      panel =
        '<div class="panel mb-2"><div class="panel-header panel-header-compact">' +
        '<h2 class="panel-title">Title page — customer &amp; notice</h2>' +
        '<div class="btn-group">' +
        (!closed ? '<button type="button" class="btn btn-primary btn-sm" id="ncr-save">Save</button>' : "") +
        '<button type="button" class="btn btn-secondary btn-sm" id="ncr-print">Print title page</button>' +
        (!closed
          ? '<button type="button" class="btn btn-warn btn-sm" id="ncr-notify">Send notification</button>'
          : "") +
        (delivery && !closed
          ? '<button type="button" class="btn btn-secondary btn-sm" id="ncr-close">Close NCR</button>'
          : "") +
        "</div></div>" +
        '<div class="panel-body">' +
        (n.notifiedAt
          ? '<p class="form-hint">Last notified ' +
            escapeHtml(formatDateTime(n.notifiedAt)) +
            (n.notifiedTo ? " → " + escapeHtml(n.notifiedTo) : "") +
            (n.notifiedRiskScore != null ? " · risk score " + n.notifiedRiskScore : "") +
            "</p>"
          : '<p class="form-hint">' +
            (delivery
              ? "Log, assign, and notify the vendor. Related DT is required."
              : "Notification not sent yet. Set risk + immediate action, then Send notification.") +
            "</p>") +
        '<div class="form-grid-4 form-grid-compact">' +
        '<label class="field"><span>Vendor / Company</span>' +
        '<select class="form-control ncr-f" data-f="company"' +
        (closed ? " disabled" : "") +
        ">" +
        ncrVendorOptionsHtml(n.company) +
        "</select></label>" +
        '<label class="field"><span>Non-Conformance Category *</span>' +
        '<select class="form-control ncr-f" data-f="ncCategory"' +
        (closed ? " disabled" : "") +
        ">" +
        ncrCategoryOptionsHtml(n.ncCategory, true) +
        "</select></label>" +
        (delivery
          ? '<label class="field"><span>Related DT *</span>' +
            '<select class="form-control ncr-f" data-f="relatedDtId"' +
            (closed ? " disabled" : "") +
            ">" +
            ncrRelatedDtOptionsHtml(n.company, n.relatedDtId || n.relatedDtNo || n.dtNo) +
            "</select></label>"
          : "") +
        fin("date", "Non-Conformance date", n.date, "date") +
        fin("contact", "Contact", n.contact) +
        fin("phone", "Phone", n.phone) +
        fin("email", "Email", n.email) +
        fin("jobNo", "Job No", n.jobNo) +
        fin("elNo", "EL No", n.elNo) +
        fin("dtNo", "DT No", n.dtNo) +
        fin("well", "Well", n.well) +
        fin("rig", "Rig", n.rig) +
        fin("shipTo", "Ship to", n.shipTo) +
        fin("store", "Store", n.store) +
        fin("serial", "Serial", n.serial) +
        fin("description", "Description", n.description) +
        fin("title", "NCR title", n.title) +
        (delivery
          ? ""
          : farea("issueDescription", "NCR issue", n.issueDescription) +
            farea("immediateAction", "Immediate corrective action", n.immediateAction) +
            fin("immediateActionBy", "Immediate action by", n.immediateActionBy) +
            '<label class="field"><span>Disposition / hold</span><select class="form-control ncr-f" data-f="dispositionHold"' +
            (closed ? " disabled" : "") +
            ">" +
            NCR_DISPOSITIONS.map(function (d) {
              return (
                '<option value="' +
                d +
                '"' +
                (n.dispositionHold === d ? " selected" : "") +
                ">" +
                d +
                "</option>"
              );
            }).join("") +
            "</select></label>") +
        "</div>" +
        (delivery
          ? '<p class="form-hint mt-2">Delivery NCR: log, assign, notify vendor, and link the originating DT. Root cause and CAPA are not required.</p>'
          : '<div class="mt-2">' +
            renderRiskMatrixHtml(n.likelihood, n.severity, "ncr", "Initial risk") +
            farea("riskNotes", "Risk notes", n.riskNotes) +
            "</div>") +
        "</div></div>";
    } else if (tab === "assign") {
      var people = ncrPeopleForDept(n.assignedDept);
      if (n.assignedTo && people.indexOf(n.assignedTo) < 0) people.unshift(n.assignedTo);
      panel =
        '<div class="panel"><div class="panel-header"><h2 class="panel-title">Assignment</h2>' +
        (!closed ? '<button type="button" class="btn btn-primary btn-sm" id="ncr-save">Save assignment</button>' : "") +
        (delivery && !closed
          ? '<button type="button" class="btn btn-secondary btn-sm" id="ncr-close">Close NCR</button>'
          : "") +
        '</div><div class="panel-body"><div class="form-grid-4 form-grid-compact">' +
        '<label class="field"><span>Department</span><select class="form-control ncr-f" id="ncr-dept" data-f="assignedDept"' +
        (closed ? " disabled" : "") +
        '><option value="">Select…</option>' +
        NCR_DEPTS.map(function (d) {
          return (
            '<option value="' +
            d +
            '"' +
            (n.assignedDept === d ? " selected" : "") +
            ">" +
            d +
            "</option>"
          );
        }).join("") +
        "</select></label>" +
        '<label class="field"><span>Person</span><select class="form-control ncr-f" id="ncr-person" data-f="assignedTo"' +
        (closed ? " disabled" : "") +
        '><option value="">Select…</option>' +
        people
          .map(function (p) {
            return (
              '<option value="' +
              escapeHtml(p) +
              '"' +
              (n.assignedTo === p ? " selected" : "") +
              ">" +
              escapeHtml(p) +
              "</option>"
            );
          })
          .join("") +
        "</select></label>" +
        fin("dueDate", "Due date", n.dueDate, "date") +
        '<div class="el-ro-cell"><span class="kv-label">Assigned at</span><div class="kv-value">' +
        escapeHtml(formatDateTime(n.assignedAt) || "—") +
        "</div></div>" +
        "</div></div></div>";
    } else if (tab === "invest") {
      panel =
        '<div class="panel"><div class="panel-header"><h2 class="panel-title">Investigation (what failed)</h2>' +
        (!closed ? '<button type="button" class="btn btn-primary btn-sm" id="ncr-save">Save</button>' : "") +
        '</div><div class="panel-body"><div class="form-grid-4 form-grid-compact">' +
        '<label class="field"><span>Type</span><select class="form-control ncr-f" data-f="nonconformanceType"' +
        (closed ? " disabled" : "") +
        ">" +
        NCR_TYPES.map(function (t) {
          return (
            '<option value="' +
            t +
            '"' +
            (n.nonconformanceType === t ? " selected" : "") +
            ">" +
            t +
            "</option>"
          );
        }).join("") +
        "</select></label>" +
        fin("failureMode", "Failure mode", n.failureMode) +
        fin("affectedQty", "Affected qty", n.affectedQty) +
        fin("specReference", "Spec / reference", n.specReference) +
        fin("acceptanceCriteria", "Acceptance criteria", n.acceptanceCriteria) +
        '<label class="field"><span>Root cause method</span><select class="form-control ncr-f" data-f="rootCauseMethod"' +
        (closed ? " disabled" : "") +
        ">" +
        ["5-Why", "Fishbone", "Other"]
          .map(function (m) {
            return (
              '<option value="' +
              m +
              '"' +
              (n.rootCauseMethod === m ? " selected" : "") +
              ">" +
              m +
              "</option>"
            );
          })
          .join("") +
        "</select></label>" +
        '<label class="field"><span>Customer impact</span><select class="form-control ncr-f" data-f="customerImpact"' +
        (closed ? " disabled" : "") +
        '><option value="false"' +
        (!n.customerImpact ? " selected" : "") +
        '>No</option><option value="true"' +
        (n.customerImpact ? " selected" : "") +
        ">Yes</option></select></label>" +
        farea("rootCause", "Root cause", n.rootCause) +
        farea("issueDescription", "Issue (detail)", n.issueDescription) +
        "</div></div></div>";
    } else if (tab === "actions") {
      panel =
        '<div class="panel mb-2"><div class="panel-header"><h2 class="panel-title">Corrective actions</h2></div>' +
        '<div class="panel-body">' +
        renderNcrActionTable(n.correctiveActions, "corrective", !closed) +
        "</div></div>" +
        '<div class="panel mb-2"><div class="panel-header"><h2 class="panel-title">Preventive actions</h2></div>' +
        '<div class="panel-body">' +
        renderNcrActionTable(n.preventiveActions, "preventive", !closed) +
        "</div></div>" +
        '<div class="panel mb-2"><div class="panel-header"><h2 class="panel-title">Action items</h2></div>' +
        '<div class="panel-body">' +
        renderNcrActionTable(n.actionItems, "items", !closed) +
        "</div></div>" +
        '<div class="panel"><div class="panel-header"><h2 class="panel-title">Verification of effectiveness</h2>' +
        (!closed ? '<button type="button" class="btn btn-primary btn-sm" id="ncr-save">Save actions</button>' : "") +
        (!closed
          ? '<button type="button" class="btn btn-secondary btn-sm" id="ncr-close">Close NCR</button>'
          : "") +
        '</div><div class="panel-body">' +
        farea("verificationOfEffectiveness", "Verification", n.verificationOfEffectiveness) +
        farea("closureNotes", "Closure notes", n.closureNotes) +
        (n.closedAt
          ? '<p class="form-hint">Closed ' +
            escapeHtml(formatDateTime(n.closedAt)) +
            " by " +
            escapeHtml(n.closedBy || "—") +
            (n.daysToClose != null ? " · Days to close: " + escapeHtml(n.daysToClose) : "") +
            "</p>"
          : "") +
        "</div></div>";
    } else if (tab === "risk") {
      panel =
        '<div class="panel"><div class="panel-header"><h2 class="panel-title">Risk matrix</h2>' +
        (!closed ? '<button type="button" class="btn btn-primary btn-sm" id="ncr-save">Save risk</button>' : "") +
        '</div><div class="panel-body">' +
        renderRiskMatrixHtml(n.likelihood, n.severity, "ncr", "Initial risk (at issue)") +
        '<div class="mt-2">' +
        renderRiskMatrixHtml(
          n.residualLikelihood,
          n.residualSeverity,
          "ncrres",
          "Residual risk (after CAPA)"
        ) +
        "</div>" +
        farea("riskNotes", "Risk notes", n.riskNotes) +
        "</div></div>";
    } else if (tab === "docs") {
      var docRows = (n.attachments || [])
        .map(function (a, idx) {
          return (
            "<tr><td>" +
            escapeHtml(a.name || "file") +
            "</td><td>" +
            escapeHtml(a.category || "Other") +
            "</td><td>" +
            escapeHtml(formatDateTime(a.uploadedAt)) +
            "</td><td>" +
            (a.dataUrl
              ? '<button type="button" class="table-link ncr-doc-open" data-idx="' +
                idx +
                '">Open</button>'
              : "—") +
            (!closed
              ? ' · <button type="button" class="table-link ncr-doc-del" data-idx="' +
                idx +
                '">Remove</button>'
              : "") +
            "</td></tr>"
          );
        })
        .join("");
      panel =
        '<div class="panel"><div class="panel-header"><h2 class="panel-title">Documents</h2></div>' +
        '<div class="panel-body">' +
        (!closed
          ? '<div class="form-grid-3 mb-2">' +
            '<label class="field"><span>Category</span><select id="ncr-doc-cat" class="form-control">' +
            ["Photo", "Inspection", "Customer email", "Drawing", "Other"]
              .map(function (c) {
                return '<option value="' + c + '">' + c + "</option>";
              })
              .join("") +
            '</select></label>' +
            '<label class="field form-span-2"><span>File</span><input type="file" id="ncr-doc-file" class="form-control" /></label>' +
            '</div><button type="button" class="btn btn-secondary btn-sm mb-2" id="ncr-doc-upload">Upload</button>'
          : "") +
        '<div class="table-wrap"><table class="table"><thead><tr>' +
        "<th>Name</th><th>Category</th><th>Uploaded</th><th></th></tr></thead><tbody>" +
        (docRows || '<tr><td colspan="4" class="table-empty">No documents</td></tr>') +
        "</tbody></table></div></div></div>";
    } else {
      /* history */
      var hrows = (n.history || [])
        .map(function (h) {
          return (
            "<tr><td>" +
            escapeHtml(formatDateTime(h.at)) +
            "</td><td>" +
            escapeHtml(h.event || "") +
            "</td><td class=\"wrap-cell\">" +
            escapeHtml(h.detail || "") +
            "</td><td>" +
            escapeHtml(h.by || "") +
            "</td></tr>"
          );
        })
        .join("");
      panel =
        '<div class="panel"><div class="panel-header"><h2 class="panel-title">History</h2></div>' +
        '<div class="table-wrap"><table class="table"><thead><tr>' +
        "<th>When</th><th>Event</th><th>Detail</th><th>By</th></tr></thead><tbody>" +
        (hrows || '<tr><td colspan="4" class="table-empty">No history</td></tr>') +
        "</tbody></table></div></div>";
    }

    main.innerHTML =
      '<div class="page-header page-header-compact"><div><h1 class="page-title mono">' +
      escapeHtml(n.ncrNo || n.id) +
      ' <span class="badge ' +
      ncrStatusBadgeClass(n.status) +
      '">' +
      escapeHtml(n.status) +
      '</span> <span class="badge ' +
      ncrRiskBadgeClass(n.riskLevel) +
      '">' +
      escapeHtml(n.riskLevel || "No risk") +
      (n.riskScore ? " · " + n.riskScore : "") +
      "</span></h1>" +
      '<p class="page-subtitle">' +
      escapeHtml(n.title || "—") +
      (n.serial ? " · Serial " + escapeHtml(n.serial) : "") +
      (n.company ? " · " + escapeHtml(n.company) : "") +
      "</p></div>" +
      '<div class="btn-group">' +
      '<button type="button" class="btn btn-ghost btn-sm" data-nav="ncr">All NCRs</button>' +
      "</div></div>" +
      '<div class="tabs" role="tablist">' +
      tabBtn("title", delivery ? "Header" : "Title / Notice") +
      tabBtn("assign", "Assignment") +
      (delivery
        ? ""
        : tabBtn("invest", "Investigation") +
          tabBtn("actions", "Actions / CAPA") +
          tabBtn("risk", "Risk")) +
      tabBtn("docs", "Documents") +
      tabBtn("history", "History") +
      "</div>" +
      '<div class="ncr-tab-panel">' +
      panel +
      "</div>";

    $$("[data-nav]", main).forEach(function (b) {
      b.addEventListener("click", function () {
        navigate(b.getAttribute("data-nav"));
      });
    });
    $$("[data-ncr-tab]", main).forEach(function (b) {
      b.addEventListener("click", function () {
        state.ncrTab = b.getAttribute("data-ncr-tab");
        viewNcrDetail(main);
      });
    });
    var catSel = main.querySelector('.ncr-f[data-f="ncCategory"]');
    if (catSel) {
      catSel.addEventListener("change", function () {
        applyFieldsFromDom(n);
        viewNcrDetail(main);
      });
    }
    var vendorSel = main.querySelector('.ncr-f[data-f="company"]');
    if (vendorSel) {
      vendorSel.addEventListener("change", function () {
        applyFieldsFromDom(n);
        var dtSel = main.querySelector('.ncr-f[data-f="relatedDtId"]');
        if (dtSel) dtSel.innerHTML = ncrRelatedDtOptionsHtml(n.company, n.relatedDtId);
      });
    }

    if (tab === "title" || tab === "risk") {
      bindRiskMatrix(main, "ncr");
      if (tab === "risk") bindRiskMatrix(main, "ncrres");
    }
    if (tab === "assign") {
      var deptEl = $("#ncr-dept", main);
      if (deptEl) {
        deptEl.addEventListener("change", function () {
          var dept = deptEl.value;
          var people = ncrPeopleForDept(dept);
          var sel = $("#ncr-person", main);
          if (!sel) return;
          sel.innerHTML =
            '<option value="">Select…</option>' +
            people
              .map(function (p) {
                return '<option value="' + escapeHtml(p) + '">' + escapeHtml(p) + "</option>";
              })
              .join("");
        });
      }
    }

    function applyFieldsFromDom(ncr) {
      $$(".ncr-f", main).forEach(function (inp) {
        var key = inp.getAttribute("data-f");
        if (!key) return;
        var val = inp.value;
        if (key === "customerImpact") ncr.customerImpact = val === "true";
        else ncr[key] = val;
      });
      if (tab === "title" || tab === "risk") {
        var r = ncrReadRiskFromDom(main, "ncr");
        ncr.likelihood = r.likelihood;
        ncr.severity = r.severity;
      }
      if (tab === "risk") {
        var rr = ncrReadRiskFromDom(main, "ncrres");
        ncr.residualLikelihood = rr.likelihood;
        ncr.residualSeverity = rr.severity;
      }
      if (tab === "actions") {
        ncr.correctiveActions = collectNcrActionsFromDom(main, "corrective");
        ncr.preventiveActions = collectNcrActionsFromDom(main, "preventive");
        ncr.actionItems = collectNcrActionsFromDom(main, "items");
      }
      if (tab === "assign" && ncr.assignedDept && ncr.assignedTo && !ncr.assignedAt) {
        ncr.assignedAt = nowISO();
        if (ncr.status === "Open" || ncr.status === "Draft") ncr.status = "Assigned";
        ncrPushHistory(ncr, "Assigned", ncr.assignedDept + " · " + ncr.assignedTo);
      }
      if (ncr.relatedDtId) {
        var linked = getDt(ncr.relatedDtId);
        ncr.relatedDtNo = linked ? formatDtNo(linked.dtNo || linked.id) : ncr.relatedDtId;
        ncr.dtNo = ncr.relatedDtNo;
      }
      ncrApplyRisk(ncr);
      return ncr;
    }

    var saveBtn = $("#ncr-save", main);
    if (saveBtn) {
      saveBtn.addEventListener("click", function () {
        applyFieldsFromDom(n);
        if (!String(n.ncCategory || "").trim()) {
          toast("Non-Conformance Category is required", "error");
          return;
        }
        if (ncrIsDeliveryCategory(n.ncCategory) && !(n.relatedDtId || n.relatedDtNo)) {
          toast("Related DT is required for a Delivery NCR", "error");
          return;
        }
        if (ncrIsDeliveryCategory(n.ncCategory) && !String(n.title || "").trim()) {
          n.title = "Delivery — DT-" + (n.relatedDtNo || n.relatedDtId || "");
        }
        ncrPushHistory(n, "Updated", "Tab: " + tab);
        saveNcr(n);
        toast("NCR saved");
        viewNcrDetail(main);
      });
    }
    bindSerialAutoDescription(
      main.querySelector('.ncr-f[data-f="serial"]'),
      main.querySelector('.ncr-f[data-f="description"]')
    );

    var printBtn = $("#ncr-print", main);
    if (printBtn) {
      printBtn.addEventListener("click", function () {
        if (!closed) applyFieldsFromDom(n);
        printNcrTitlePage(n);
      });
    }

    var notifyBtn = $("#ncr-notify", main);
    if (notifyBtn) {
      notifyBtn.addEventListener("click", function () {
        applyFieldsFromDom(n);
        if (ncrIsDeliveryCategory(n.ncCategory)) {
          if (!n.company || !(n.relatedDtId || n.relatedDtNo)) {
            toast("Vendor and Related DT are required before notify", "error");
            return;
          }
        } else {
          if (!n.title || !n.issueDescription || !n.immediateAction) {
            toast("Title, issue, and immediate action required before notify", "error");
            return;
          }
          if (!n.likelihood || !n.severity) {
            toast("Set risk matrix before notify", "error");
            return;
          }
        }
        var to = n.email || n.contact || n.assignedTo || "";
        var subject =
          n.ncrNo + " – " + n.title + " – Risk " + n.riskLevel + " (" + n.riskScore + ")";
        var body =
          "NCR: " +
          n.ncrNo +
          "\nStatus: " +
          n.status +
          "\nRisk: " +
          n.riskLevel +
          " (L" +
          n.likelihood +
          "×S" +
          n.severity +
          "=" +
          n.riskScore +
          ")\n\nCompany: " +
          (n.company || "") +
          "\nSerial: " +
          (n.serial || "") +
          "\nJob: " +
          (n.jobNo || "") +
          "\n\nIssue:\n" +
          (n.issueDescription || "") +
          "\n\nImmediate corrective action:\n" +
          (n.immediateAction || "") +
          "\n\nAssigned: " +
          (n.assignedDept || "") +
          " / " +
          (n.assignedTo || "") +
          "\n";
        n.notifiedAt = nowISO();
        n.notifiedTo = to || "(manual distribution)";
        n.notifiedRiskScore = n.riskScore;
        if (n.status === "Draft" || n.status === "Open" || n.status === "Assigned") {
          n.status = "Notified";
        }
        ncrPushHistory(n, "Notification", "Sent / prepared for " + n.notifiedTo);
        saveNcr(n);
        try {
          var mailto =
            "mailto:" +
            encodeURIComponent(to || "") +
            "?subject=" +
            encodeURIComponent(subject) +
            "&body=" +
            encodeURIComponent(body);
          window.open(mailto, "_blank");
        } catch (eM) {}
        try {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(subject + "\n\n" + body);
            toast("Notification logged · email draft opened · summary copied");
          } else {
            toast("Notification logged · email draft opened");
          }
        } catch (eC) {
          toast("Notification logged");
        }
        printNcrTitlePage(n);
        viewNcrDetail(main);
      });
    }

    var closeBtn = $("#ncr-close", main);
    if (closeBtn) {
      closeBtn.addEventListener("click", function () {
        applyFieldsFromDom(n);
        if (!ncrIsDeliveryCategory(n.ncCategory)) {
          if (!n.verificationOfEffectiveness) {
            toast("Enter verification of effectiveness before close", "error");
            return;
          }
          if (
            (n.riskLevel === "High" || n.riskLevel === "Critical") &&
            !n.residualScore
          ) {
            toast("Set residual risk on Risk tab before closing High/Critical NCR", "error");
            return;
          }
        } else if (!(n.relatedDtId || n.relatedDtNo)) {
          toast("Related DT is required before close", "error");
          return;
        }
        if (!confirm("Close NCR " + n.ncrNo + "?")) return;
        n.status = "Closed";
        n.closedAt = nowISO();
        n.closedBy = "demo.user";
        n.daysToClose = ncrComputeDaysToClose(n);
        ncrPushHistory(
          n,
          "Closed",
          (n.closureNotes || "Closed") +
            (n.daysToClose != null ? " · " + n.daysToClose + " day(s) to close" : "")
        );
        saveNcr(n);
        toast(
          n.daysToClose != null
            ? "NCR closed · " + n.daysToClose + " day(s) to close · supplier score refreshed"
            : "NCR closed"
        );
        viewNcrDetail(main);
      });
    }

    /* action table add/remove */
    $$("[data-add-act]", main).forEach(function (btn) {
      btn.addEventListener("click", function () {
        applyFieldsFromDom(n);
        var kind = btn.getAttribute("data-add-act");
        var key =
          kind === "corrective"
            ? "correctiveActions"
            : kind === "preventive"
              ? "preventiveActions"
              : "actionItems";
        if (!n[key]) n[key] = [];
        n[key].push(emptyNcrAction());
        saveNcr(n);
        viewNcrDetail(main);
      });
    });
    $$(".act-remove", main).forEach(function (btn) {
      btn.addEventListener("click", function () {
        var tr = btn.closest("tr");
        if (!tr) return;
        var kind = tr.getAttribute("data-act-kind");
        var idx = parseInt(tr.getAttribute("data-act-idx"), 10);
        applyFieldsFromDom(n);
        var key =
          kind === "corrective"
            ? "correctiveActions"
            : kind === "preventive"
              ? "preventiveActions"
              : "actionItems";
        if (n[key] && !isNaN(idx)) n[key].splice(idx, 1);
        saveNcr(n);
        viewNcrDetail(main);
      });
    });

    /* docs */
    var upBtn = $("#ncr-doc-upload", main);
    if (upBtn) {
      upBtn.addEventListener("click", function () {
        var fileInput = $("#ncr-doc-file", main);
        var cat = ($("#ncr-doc-cat", main) || {}).value || "Other";
        if (!fileInput || !fileInput.files || !fileInput.files[0]) {
          toast("Choose a file", "error");
          return;
        }
        var file = fileInput.files[0];
        if (file.size > 2.5 * 1024 * 1024) {
          toast("File too large for browser storage (max ~2.5 MB)", "error");
          return;
        }
        var reader = new FileReader();
        reader.onload = function () {
          if (!n.attachments) n.attachments = [];
          n.attachments.push({
            name: file.name,
            category: cat,
            mimeType: file.type || "",
            size: file.size,
            dataUrl: reader.result,
            uploadedAt: nowISO(),
          });
          ncrPushHistory(n, "Document", "Uploaded " + file.name);
          saveNcr(n);
          toast("Document uploaded");
          state.ncrTab = "docs";
          viewNcrDetail(main);
        };
        reader.onerror = function () {
          toast("Could not read file", "error");
        };
        reader.readAsDataURL(file);
      });
    }
    $$(".ncr-doc-open", main).forEach(function (b) {
      b.addEventListener("click", function () {
        var idx = parseInt(b.getAttribute("data-idx"), 10);
        var a = n.attachments && n.attachments[idx];
        if (a && a.dataUrl) window.open(a.dataUrl, "_blank");
      });
    });
    $$(".ncr-doc-del", main).forEach(function (b) {
      b.addEventListener("click", function () {
        var idx = parseInt(b.getAttribute("data-idx"), 10);
        if (n.attachments && !isNaN(idx)) {
          var name = n.attachments[idx] && n.attachments[idx].name;
          n.attachments.splice(idx, 1);
          ncrPushHistory(n, "Document", "Removed " + (name || ""));
          saveNcr(n);
          viewNcrDetail(main);
        }
      });
    });
  }

  function printNcrTitlePage(n) {
    if (!n) return;
    ncrApplyRisk(n);
    var body =
      "<h1>NCR " +
      escapeHtml(n.ncrNo || n.id) +
      "</h1>" +
      '<p class="sub">Non-Conformance Report · ' +
      escapeHtml(n.status) +
      " · Risk " +
      escapeHtml(n.riskLevel || "—") +
      (n.riskScore ? " (" + n.riskScore + ")" : "") +
      " · " +
      escapeHtml(formatDate(n.date)) +
      "</p>" +
      '<div class="meta">' +
      "<div><span>Company</span><strong>" +
      escapeHtml(n.company || "—") +
      "</strong></div>" +
      "<div><span>Contact</span><strong>" +
      escapeHtml(n.contact || "—") +
      "</strong></div>" +
      "<div><span>Phone</span><strong>" +
      escapeHtml(n.phone || "—") +
      "</strong></div>" +
      "<div><span>Email</span><strong>" +
      escapeHtml(n.email || "—") +
      "</strong></div>" +
      "<div><span>Job No</span><strong>" +
      escapeHtml(n.jobNo || "—") +
      "</strong></div>" +
      "<div><span>EL / DT</span><strong>" +
      escapeHtml((n.elNo || "—") + " / " + (n.dtNo || "—")) +
      "</strong></div>" +
      "<div><span>Well / Rig</span><strong>" +
      escapeHtml((n.well || "—") + " / " + (n.rig || "—")) +
      "</strong></div>" +
      "<div><span>Ship to</span><strong>" +
      escapeHtml(n.shipTo || "—") +
      "</strong></div>" +
      "<div><span>Serial</span><strong>" +
      escapeHtml(n.serial || "—") +
      "</strong></div>" +
      "<div><span>Description</span><strong>" +
      escapeHtml(n.description || "—") +
      "</strong></div>" +
      "<div><span>Assigned</span><strong>" +
      escapeHtml((n.assignedDept || "—") + " · " + (n.assignedTo || "—")) +
      "</strong></div>" +
      "<div><span>Disposition</span><strong>" +
      escapeHtml(n.dispositionHold || "—") +
      "</strong></div>" +
      "</div>" +
      "<h2 style=\"font-size:14px;margin:16px 0 6px\">" +
      escapeHtml(n.title || "NCR issue") +
      "</h2>" +
      "<p>" +
      escapeHtml(n.issueDescription || "") +
      "</p>" +
      "<h2 style=\"font-size:14px;margin:16px 0 6px\">Immediate corrective action</h2>" +
      "<p>" +
      escapeHtml(n.immediateAction || "") +
      (n.immediateActionBy ? " — " + escapeHtml(n.immediateActionBy) : "") +
      "</p>" +
      "<h2 style=\"font-size:14px;margin:16px 0 6px\">Risk</h2>" +
      "<p>Likelihood " +
      (n.likelihood || "—") +
      " (" +
      escapeHtml(NCR_LIKELIHOOD_LABELS[n.likelihood] || "") +
      ") × Severity " +
      (n.severity || "—") +
      " (" +
      escapeHtml(NCR_SEVERITY_LABELS[n.severity] || "") +
      ") = <strong>" +
      (n.riskScore || "—") +
      " · " +
      escapeHtml(n.riskLevel || "") +
      "</strong></p>" +
      (n.riskNotes ? "<p>" + escapeHtml(n.riskNotes) + "</p>" : "") +
      (n.notifiedAt
        ? "<p class=\"sub\">Notified " +
          escapeHtml(formatDateTime(n.notifiedAt)) +
          (n.notifiedTo ? " → " + escapeHtml(n.notifiedTo) : "") +
          "</p>"
        : "") +
      (n.attachments && n.attachments.length
        ? "<p class=\"sub\">Attachments: " + n.attachments.length + " file(s)</p>"
        : "");
    printHtmlDocument("NCR " + (n.ncrNo || n.id), body);
  }

  /* ========================================================================
   * SUPPLIER SCORE — config (Admin) vs snapshots (module)
   * ======================================================================== */
  function defaultScoreConfig() {
    function m(id, categoryId, name, extra) {
      var row = {
        id: id,
        categoryId: categoryId,
        name: name,
        description: extra.description || "",
        active: extra.active !== false,
        order: extra.order || 1,
        weight: extra.weight != null ? extra.weight : 25,
        sourceType: extra.sourceType || "manual",
        inputKind: extra.inputKind || "number",
        method: extra.method || "manualPoints",
        higherIsBetter: extra.higherIsBetter !== false,
        target: extra.target != null ? extra.target : "",
        unit: extra.unit || "",
        bands: extra.bands || [],
        linear: extra.linear || { inMin: 80, inMax: 100, outMin: 0, outMax: 100 },
        penalty: extra.penalty || { perItem: 10, cap: 40 },
      };
      return row;
    }
    return {
      id: "SCFG-DEFAULT",
      version: 1,
      status: "published",
      publishedAt: "",
      publishedBy: "",
      period: { type: "rolling12", userDefault: "12m", lockAfterDays: 0 },
      ncCategories: ["Machining", "Description", "Packaging", "Inspection", "Product Condition", "Delivery"],
      tiers: [
        { id: "preferred", min: 90, max: 100, code: "preferred", label: "Preferred / Strategic" },
        { id: "approved", min: 80, max: 89, code: "approved", label: "Approved" },
        { id: "conditional", min: 70, max: 79, code: "conditional", label: "Conditional (requires improvement plan)" },
        { id: "probation", min: 0, max: 69, code: "probation", label: "Probation / Restricted" },
      ],
      categories: [
        { id: "quality", name: "Quality", weight: 40, active: true, order: 1 },
        { id: "delivery", name: "Delivery", weight: 30, active: true, order: 2 },
        { id: "responsiveness", name: "Responsiveness & Collaboration", weight: 15, active: true, order: 3 },
        { id: "commercial", name: "Commercial & Compliance", weight: 15, active: true, order: 4 },
      ],
      metrics: [
        m("quality.ncr-count", "quality", "Number of Non-Conformances", {
          order: 1, weight: 34, sourceType: "ncr-count", inputKind: "count", method: "penaltyCount",
          higherIsBetter: false, target: 0, unit: "count",
          penalty: { perItem: 8, cap: 40 },
        }),
        m("quality.repeat-ncr", "quality", "Repeat Nonconformances", {
          order: 2, weight: 33, sourceType: "ncr-repeat-count", inputKind: "count", method: "penaltyCount",
          higherIsBetter: false, target: 0, unit: "count",
          penalty: { perItem: 10, cap: 40 },
        }),
        m("quality.scar", "quality", "SCAR / Corrective Action Timeliness & Effectiveness", {
          order: 3, weight: 33, sourceType: "ncr-avg-days-to-close", inputKind: "number", method: "inverseLinear",
          higherIsBetter: false, target: 14, unit: "days",
          linear: { inMin: 7, inMax: 45, outMin: 100, outMax: 40 },
        }),
        m("delivery.otd", "delivery", "On-Time Delivery", {
          order: 1, weight: 60, sourceType: "dt-vendor-otd", inputKind: "percent", method: "linear",
          higherIsBetter: true, target: 95, unit: "%",
          linear: { inMin: 80, inMax: 100, outMin: 0, outMax: 100 },
        }),
        m("delivery.days-past-due", "delivery", "Days Past Due", {
          order: 2, weight: 40, sourceType: "dt-vendor-days-late", inputKind: "number", method: "bands",
          higherIsBetter: false, target: 0, unit: "days",
          bands: [
            { upTo: 0, points: 100 },
            { upTo: 7, points: 75 },
            { upTo: 14, points: 55 },
            { upTo: 21, points: 35 },
            { upTo: 30, points: 15 },
            { upTo: null, points: 0 },
          ],
        }),
        m("resp.quote", "responsiveness", "Quote turnaround time", {
          order: 1, weight: 25, sourceType: "manual", inputKind: "scale5", method: "scale5",
          higherIsBetter: true, target: 4, unit: "1–5",
        }),
        m("resp.scar-quality", "responsiveness", "Issue / SCAR response quality", {
          order: 2, weight: 25, sourceType: "manual", inputKind: "scale5", method: "scale5",
          higherIsBetter: true, target: 4, unit: "1–5",
        }),
        m("resp.comm", "responsiveness", "Communication / escalation behavior", {
          order: 3, weight: 25, sourceType: "manual", inputKind: "scale5", method: "scale5",
          higherIsBetter: true, target: 4, unit: "1–5",
        }),
        m("resp.capacity", "responsiveness", "Capacity / risk notification (proactive vs reactive)", {
          order: 4, weight: 25, sourceType: "manual", inputKind: "scale5", method: "scale5",
          higherIsBetter: true, target: 4, unit: "1–5",
        }),
        m("comm.price", "commercial", "Price competitiveness / cost variance", {
          order: 1, weight: 25, sourceType: "manual", inputKind: "scale5", method: "scale5",
          higherIsBetter: true, target: 4, unit: "1–5",
        }),
        m("comm.certs", "commercial", "Certifications current (AS9100, ISO, etc.)", {
          order: 2, weight: 25, sourceType: "vendor-certs-text", inputKind: "boolean", method: "boolean",
          higherIsBetter: true, target: "Current", unit: "",
        }),
        m("comm.docs", "commercial", "Documentation completeness & traceability", {
          order: 3, weight: 25, sourceType: "manual", inputKind: "scale5", method: "scale5",
          higherIsBetter: true, target: 4, unit: "1–5",
        }),
        m("comm.audit", "commercial", "Open audit findings", {
          order: 4, weight: 25, sourceType: "ncr-open-count", inputKind: "count", method: "penaltyCount",
          higherIsBetter: false, target: 0, unit: "findings",
          penalty: { perItem: 12, cap: 48 },
        }),
      ],
    };
  }

  function cloneScoreConfig(cfg) {
    return deepClone(cfg || defaultScoreConfig());
  }

  function normalizeScoreConfig(raw) {
    var base = defaultScoreConfig();
    if (!raw || typeof raw !== "object") return base;
    var out = cloneScoreConfig(base);
    out.id = raw.id || out.id;
    out.version = parseInt(raw.version, 10) || 1;
    out.status = raw.status || "published";
    out.publishedAt = raw.publishedAt || "";
    out.publishedBy = raw.publishedBy || "";
    if (raw.period && typeof raw.period === "object") {
      out.period.type = raw.period.type || "rolling12";
      out.period.userDefault = raw.period.userDefault || "12m";
      out.period.lockAfterDays = parseInt(raw.period.lockAfterDays, 10) || 0;
    }
    if (Array.isArray(raw.ncCategories) && raw.ncCategories.length) {
      out.ncCategories = raw.ncCategories.map(function (c) {
        return String(c || "").trim();
      }).filter(Boolean);
    } else {
      out.ncCategories = ["Machining", "Description", "Packaging", "Inspection", "Product Condition", "Delivery"];
    }
    if (Array.isArray(raw.tiers) && raw.tiers.length) {
      out.tiers = raw.tiers.map(function (t, i) {
        return {
          id: t.id || "tier-" + i,
          min: Number(t.min),
          max: Number(t.max),
          code: t.code || t.id || "tier-" + i,
          label: t.label || t.code || "Tier",
        };
      });
    }
    if (Array.isArray(raw.categories) && raw.categories.length) {
      out.categories = raw.categories.map(function (c, i) {
        return {
          id: c.id || uid("scat"),
          name: c.name || "Category",
          weight: Number(c.weight) || 0,
          active: c.active !== false,
          order: c.order != null ? Number(c.order) : i + 1,
        };
      });
    }
    if (Array.isArray(raw.metrics) && raw.metrics.length) {
      out.metrics = raw.metrics.map(function (m, i) {
        return {
          id: m.id || uid("smet"),
          categoryId: m.categoryId || "",
          name: m.name || "Metric",
          description: m.description || "",
          active: m.active !== false,
          order: m.order != null ? Number(m.order) : i + 1,
          weight: Number(m.weight) || 0,
          sourceType: m.sourceType || "manual",
          inputKind: m.inputKind || "number",
          method: m.method || "manualPoints",
          higherIsBetter: m.higherIsBetter !== false,
          target: m.target != null ? m.target : "",
          unit: m.unit || "",
          bands: Array.isArray(m.bands) ? m.bands : [],
          linear: m.linear && typeof m.linear === "object" ? m.linear : { inMin: 80, inMax: 100, outMin: 0, outMax: 100 },
          penalty: m.penalty && typeof m.penalty === "object" ? m.penalty : { perItem: 10, cap: 40 },
        };
      });
    }
    return migrateQualityScoreMetrics(out);
  }

  function migrateQualityScoreMetrics(cfg) {
    if (!cfg || !Array.isArray(cfg.metrics)) return cfg;
    cfg.metrics = cfg.metrics.filter(function (m) {
      return m.id !== "quality.fpy";
    });
    var hasCount = cfg.metrics.some(function (m) {
      return m.id === "quality.ncr-count";
    });
    cfg.metrics = cfg.metrics.map(function (m) {
      if (m.id === "quality.ppm" && !hasCount) {
        m.id = "quality.ncr-count";
        m.name = "Number of Non-Conformances";
        m.sourceType = "ncr-count";
        m.inputKind = "count";
        m.method = "penaltyCount";
        m.higherIsBetter = false;
        m.unit = "count";
        m.target = 0;
        m.penalty = m.penalty && m.penalty.perItem ? m.penalty : { perItem: 8, cap: 40 };
      }
      if (m.id === "quality.scar" && (m.sourceType === "manual" || m.method === "scale5")) {
        m.sourceType = "ncr-avg-days-to-close";
        m.inputKind = "number";
        m.method = "inverseLinear";
        m.higherIsBetter = false;
        m.unit = "days";
        m.target = 14;
        m.linear = { inMin: 7, inMax: 45, outMin: 100, outMax: 40 };
      }
      if (m.id === "quality.repeat-ncr") {
        m.sourceType = "ncr-repeat-count";
        m.inputKind = "count";
        m.method = "penaltyCount";
      }
      return m;
    });
    var q = cfg.metrics.filter(function (m) {
      return m.categoryId === "quality" && m.active !== false;
    });
    if (q.length === 3) {
      var wmap = { "quality.ncr-count": 34, "quality.repeat-ncr": 33, "quality.scar": 33 };
      q.forEach(function (m) {
        if (wmap[m.id] != null) m.weight = wmap[m.id];
      });
    }
    if (!Array.isArray(cfg.ncCategories) || !cfg.ncCategories.length) {
      cfg.ncCategories = ["Machining", "Description", "Packaging", "Inspection", "Product Condition", "Delivery"];
    }
    cfg.metrics = cfg.metrics.filter(function (m) {
      return m.id !== "delivery.pastdue" && m.id !== "delivery.leadtime";
    });
    var hasOtd = false;
    var hasDpd = false;
    cfg.metrics.forEach(function (m) {
      if (m.id === "delivery.otd") {
        hasOtd = true;
        if (m.sourceType === "manual") {
          m.sourceType = "dt-vendor-otd";
          m.inputKind = "percent";
          m.method = "linear";
          m.unit = "%";
          m.linear = m.linear || { inMin: 80, inMax: 100, outMin: 0, outMax: 100 };
        }
        m.name = "On-Time Delivery";
      }
      if (m.id === "delivery.days-past-due") hasDpd = true;
    });
    if (!hasDpd) {
      cfg.metrics.push({
        id: "delivery.days-past-due",
        categoryId: "delivery",
        name: "Days Past Due",
        description: "",
        active: true,
        order: 2,
        weight: 40,
        sourceType: "dt-vendor-days-late",
        inputKind: "number",
        method: "bands",
        higherIsBetter: false,
        target: 0,
        unit: "days",
        bands: [
          { upTo: 0, points: 100 },
          { upTo: 7, points: 75 },
          { upTo: 14, points: 55 },
          { upTo: 21, points: 35 },
          { upTo: 30, points: 15 },
          { upTo: null, points: 0 },
        ],
        linear: { inMin: 80, inMax: 100, outMin: 0, outMax: 100 },
        penalty: { perItem: 10, cap: 40 },
      });
    }
    var dmets = cfg.metrics.filter(function (m) {
      return m.categoryId === "delivery" && m.active !== false;
    });
    if (dmets.length === 2) {
      dmets.forEach(function (m) {
        if (m.id === "delivery.otd") m.weight = 60;
        if (m.id === "delivery.days-past-due") m.weight = 40;
      });
    }
    return cfg;
  }

  function loadPublishedScoreConfig() {
    var stored = storageGet(KEYS.scoreConfig, null);
    if (!stored) {
      var seed = defaultScoreConfig();
      seed.publishedAt = nowISO();
      seed.publishedBy = "system";
      storageSet(KEYS.scoreConfig, seed);
      return cloneScoreConfig(seed);
    }
    return normalizeScoreConfig(stored);
  }

  function loadScoreConfigDraft() {
    var stored = storageGet(KEYS.scoreConfigDraft, null);
    if (!stored) return cloneScoreConfig(loadPublishedScoreConfig());
    return normalizeScoreConfig(stored);
  }

  function saveScoreConfigDraft(cfg) {
    storageSet(KEYS.scoreConfigDraft, normalizeScoreConfig(cfg));
  }

  function appendScoreAudit(action, summary) {
    var log = storageGet(KEYS.scoreConfigLog, []) || [];
    log.unshift({
      at: nowISO(),
      by: state.adminAuthed ? ADMIN_USER : "user",
      action: action,
      summary: summary || "",
    });
    if (log.length > 200) log = log.slice(0, 200);
    storageSet(KEYS.scoreConfigLog, log);
  }

  function publishScoreConfig(draft) {
    var pub = normalizeScoreConfig(draft);
    var current = loadPublishedScoreConfig();
    pub.version = (parseInt(current.version, 10) || 1) + 1;
    pub.status = "published";
    pub.publishedAt = nowISO();
    pub.publishedBy = ADMIN_USER;
    storageSet(KEYS.scoreConfig, pub);
    saveScoreConfigDraft(pub);
    appendScoreAudit("publish", "Published scoring config v" + pub.version);
    return pub;
  }

  function loadScoreAudit() {
    return storageGet(KEYS.scoreConfigLog, []) || [];
  }

  function loadSupplierScores() {
    var list = storageGet(KEYS.supplierScores, []);
    return Array.isArray(list) ? list : [];
  }

  function saveSupplierScores(list) {
    storageSet(KEYS.supplierScores, list || []);
  }

  function getScoreSnapshot(vendorId, periodKey) {
    var found = null;
    loadSupplierScores().forEach(function (s) {
      if (String(s.vendorId) === String(vendorId) && String(s.periodKey) === String(periodKey)) found = s;
    });
    return found;
  }

  function upsertScoreSnapshot(snap) {
    var list = loadSupplierScores();
    var idx = -1;
    list.forEach(function (s, i) {
      if (String(s.vendorId) === String(snap.vendorId) && String(s.periodKey) === String(snap.periodKey)) idx = i;
    });
    snap.updatedAt = nowISO();
    if (idx >= 0) {
      snap.comments = snap.comments != null ? snap.comments : list[idx].comments;
      snap.improvementPlan = snap.improvementPlan != null ? snap.improvementPlan : list[idx].improvementPlan;
      if (!snap.id) snap.id = list[idx].id;
      list[idx] = snap;
    } else {
      if (!snap.id) snap.id = uid("SS");
      list.unshift(snap);
    }
    saveSupplierScores(list);
    return snap;
  }

  function latestScoreForVendor(vendorId) {
    var list = loadSupplierScores().filter(function (s) {
      return String(s.vendorId) === String(vendorId);
    });
    list.sort(function (a, b) {
      return String(b.periodEnd || b.periodKey || "").localeCompare(String(a.periodEnd || a.periodKey || ""));
    });
    return list[0] || null;
  }

  function scoresForVendor(vendorId) {
    var list = loadSupplierScores().filter(function (s) {
      return String(s.vendorId) === String(vendorId);
    });
    list.sort(function (a, b) {
      return String(a.periodEnd || a.periodKey || "").localeCompare(String(b.periodEnd || b.periodKey || ""));
    });
    return list;
  }

  function pad2(n) {
    return (n < 10 ? "0" : "") + n;
  }

  function isoDay(d) {
    return d.getFullYear() + "-" + pad2(d.getMonth() + 1) + "-" + pad2(d.getDate());
  }

  function currentScorePeriod(cfg, asOf) {
    var type = (cfg && cfg.period && cfg.period.type) || "quarterly";
    var d = asOf ? new Date(asOf) : new Date();
    if (isNaN(d.getTime())) d = new Date();
    var y = d.getFullYear();
    var m = d.getMonth();
    if (type === "monthly") {
      var last = new Date(y, m + 1, 0).getDate();
      return {
        type: type,
        key: y + "-" + pad2(m + 1),
        start: y + "-" + pad2(m + 1) + "-01",
        end: y + "-" + pad2(m + 1) + "-" + pad2(last),
      };
    }
    if (type === "rolling6" || type === "rolling12") {
      var months = type === "rolling12" ? 12 : 6;
      var startD = new Date(y, m - (months - 1), 1);
      var lastR = new Date(y, m + 1, 0).getDate();
      return {
        type: type,
        key: y + "-R" + months + "-" + y + pad2(m + 1),
        start: isoDay(startD),
        end: y + "-" + pad2(m + 1) + "-" + pad2(lastR),
      };
    }
    var q = Math.floor(m / 3) + 1;
    var sm = (q - 1) * 3;
    var em = sm + 2;
    var lastQ = new Date(y, em + 1, 0).getDate();
    return {
      type: "quarterly",
      key: y + "-Q" + q,
      start: y + "-" + pad2(sm + 1) + "-01",
      end: y + "-" + pad2(em + 1) + "-" + pad2(lastQ),
    };
  }

  function resolveScoreUserPeriod(up) {
    if (!state.scoreUserPeriod || !state.scoreUserPeriod.preset) {
      var def = "12m";
      try {
        var pc = loadPublishedScoreConfig();
        if (pc.period && pc.period.userDefault) def = pc.period.userDefault;
      } catch (e0) {}
      state.scoreUserPeriod = { preset: def, start: "", end: "" };
    }
    up = up || state.scoreUserPeriod;
    var today = new Date();
    var end = isoDay(today);
    var preset = up.preset || "12m";
    if (preset === "custom") {
      var startC = up.start || end;
      var endC = up.end || end;
      if (startC > endC) {
        var tmp = startC;
        startC = endC;
        endC = tmp;
      }
      return { type: "custom", preset: "custom", key: "custom-" + startC + "_" + endC, start: startC, end: endC };
    }
    if (preset === "6m") {
      var s6 = new Date(today.getFullYear(), today.getMonth() - 6, today.getDate() + 1);
      return { type: "6m", preset: "6m", key: "6m-" + end, start: isoDay(s6), end: end };
    }
    if (preset === "quarter") {
      var q = currentScorePeriod({ period: { type: "quarterly" } });
      q.preset = "quarter";
      return q;
    }
    var s12 = new Date(today.getFullYear(), today.getMonth() - 12, today.getDate() + 1);
    return { type: "12m", preset: "12m", key: "12m-" + end, start: isoDay(s12), end: end };
  }

  function renderScorePeriodBar() {
    var up = state.scoreUserPeriod || { preset: "12m", start: "", end: "" };
    if (!up.preset) up.preset = "12m";
    var resolved = resolveScoreUserPeriod(up);
    return (
      '<div class="ss-period-bar panel mb-2"><div class="panel-body">' +
      '<div class="form-grid-3">' +
      '<label class="field"><span>Time period</span>' +
      '<select id="ss-user-preset" class="form-control">' +
      '<option value="12m"' +
      (up.preset === "12m" ? " selected" : "") +
      ">Last 12 months (annual)</option>" +
      '<option value="6m"' +
      (up.preset === "6m" ? " selected" : "") +
      ">Last 6 months</option>" +
      '<option value="quarter"' +
      (up.preset === "quarter" ? " selected" : "") +
      ">Quarterly</option>" +
      '<option value="custom"' +
      (up.preset === "custom" ? " selected" : "") +
      ">Custom date range</option>" +
      "</select></label>" +
      (up.preset === "custom"
        ? '<label class="field"><span>From</span><input type="date" id="ss-user-from" class="form-control" value="' +
          escapeHtml(up.start || resolved.start) +
          '" /></label>' +
          '<label class="field"><span>To</span><input type="date" id="ss-user-to" class="form-control" value="' +
          escapeHtml(up.end || resolved.end) +
          '" /></label>'
        : '<div class="field"><span>Window</span><div class="kv-value">' +
          escapeHtml(resolved.start) +
          " → " +
          escapeHtml(resolved.end) +
          "</div></div>") +
      (up.preset === "custom"
        ? '<div class="field"><span>&nbsp;</span><button type="button" class="btn btn-secondary" id="ss-user-apply">Apply dates</button></div>'
        : "") +
      "</div>" +
      '<p class="form-hint mb-0">Number of Non-Conformances, Repeat NCRs, and SCAR days-to-close use this window. Changing it does not overwrite other saved periods.</p>' +
      "</div></div>"
    );
  }

  function bindScorePeriodBar(main, onChange) {
    var sel = $("#ss-user-preset", main);
    if (sel) {
      sel.addEventListener("change", function () {
        state.scoreUserPeriod = state.scoreUserPeriod || { preset: "12m", start: "", end: "" };
        state.scoreUserPeriod.preset = sel.value;
        if (sel.value === "custom" && !state.scoreUserPeriod.start) {
          var r = resolveScoreUserPeriod({ preset: "12m" });
          state.scoreUserPeriod.start = r.start;
          state.scoreUserPeriod.end = r.end;
        }
        onChange();
      });
    }
    var apply = $("#ss-user-apply", main);
    if (apply) {
      apply.addEventListener("click", function () {
        var from = $("#ss-user-from", main);
        var to = $("#ss-user-to", main);
        state.scoreUserPeriod = {
          preset: "custom",
          start: from && from.value ? from.value : "",
          end: to && to.value ? to.value : "",
        };
        if (!state.scoreUserPeriod.start || !state.scoreUserPeriod.end) {
          toast("Enter both from and to dates", "error");
          return;
        }
        onChange();
      });
    }
  }

  function listRecentScorePeriods(cfg, count) {
    count = count || 8;
    var type = (cfg && cfg.period && cfg.period.type) || "quarterly";
    var out = [];
    var d = new Date();
    var i;
    for (i = 0; i < count; i++) {
      out.push(currentScorePeriod(cfg, d.toISOString()));
      if (type === "monthly") d.setMonth(d.getMonth() - 1);
      else if (type === "rolling6") d.setMonth(d.getMonth() - 1);
      else if (type === "rolling12") d.setMonth(d.getMonth() - 1);
      else d.setMonth(d.getMonth() - 3);
    }
    return out;
  }

  function clampScore(n) {
    n = Number(n);
    if (!isFinite(n)) return 0;
    if (n < 0) return 0;
    if (n > 100) return 100;
    return Math.round(n * 10) / 10;
  }

  function scoreMethodToPoints(metric, raw) {
    if (raw == null || raw === "") return null;
    var method = (metric && metric.method) || "manualPoints";
    if (method === "manualPoints") return clampScore(raw);
    if (method === "boolean") {
      var truthy = raw === true || raw === 1 || raw === "1" || raw === "Y" || raw === "yes" || raw === "true";
      if (metric.higherIsBetter === false) return truthy ? 0 : 100;
      return truthy ? 100 : 0;
    }
    if (method === "scale5") {
      var s = Number(raw);
      if (!isFinite(s)) return null;
      return clampScore(((s - 1) / 4) * 100);
    }
    if (method === "penaltyCount") {
      var n = Number(raw) || 0;
      var per = (metric.penalty && Number(metric.penalty.perItem)) || 10;
      var cap = (metric.penalty && Number(metric.penalty.cap)) || 40;
      return clampScore(100 - Math.min(n * per, cap));
    }
    if (method === "bands") {
      var val = Number(raw);
      if (!isFinite(val)) return null;
      var bands = metric.bands || [];
      var pts = 0;
      var i;
      for (i = 0; i < bands.length; i++) {
        var b = bands[i];
        pts = Number(b.points) || 0;
        if (b.upTo == null || b.upTo === "" || val <= Number(b.upTo)) break;
      }
      return clampScore(pts);
    }
    if (method === "linear" || method === "inverseLinear") {
      var v = Number(raw);
      if (!isFinite(v)) return null;
      var lin = metric.linear || {};
      var inMin = Number(lin.inMin);
      var inMax = Number(lin.inMax);
      var outMin = lin.outMin != null ? Number(lin.outMin) : 0;
      var outMax = lin.outMax != null ? Number(lin.outMax) : 100;
      if (!isFinite(inMin) || !isFinite(inMax) || inMax === inMin) return clampScore(outMin);
      var t = (v - inMin) / (inMax - inMin);
      if (t < 0) t = 0;
      if (t > 1) t = 1;
      if (method === "inverseLinear") t = 1 - t;
      return clampScore(outMin + t * (outMax - outMin));
    }
    return clampScore(raw);
  }

  function ncrDateKey(n) {
    return String((n && (n.date || n.loggedAt || n.createdAt)) || "").slice(0, 10);
  }

  function ncrMatchesVendorName(n, vendor) {
    var name = String(vendor && vendor.name || "").trim().toLowerCase();
    var co = String(n && n.company || "").trim().toLowerCase();
    if (!name || !co) return false;
    if (co === name) return true;
    return co.indexOf(name) !== -1 || name.indexOf(co) !== -1;
  }

  function ncrsForVendorPeriod(vendor, period) {
    if (!vendor) return [];
    return loadNcrs().filter(function (n) {
      if (!ncrMatchesVendorName(n, vendor)) return false;
      var dt = ncrDateKey(n);
      if (!dt) return false;
      if (period.start && dt < period.start) return false;
      if (period.end && dt > period.end) return false;
      return true;
    });
  }

  function countRepeatNcrs(rows) {
    var sorted = (rows || []).slice().sort(function (a, b) {
      return ncrDateKey(a).localeCompare(ncrDateKey(b));
    });
    var seenCat = {};
    var seenRoot = {};
    var repeats = 0;
    sorted.forEach(function (n) {
      var cat = String(n.ncCategory || "").trim().toUpperCase();
      var root = String(n.rootCause || "").trim().toUpperCase();
      var isRepeat = false;
      if (cat && seenCat[cat]) isRepeat = true;
      if (root && seenRoot[root]) isRepeat = true;
      if (isRepeat) repeats += 1;
      if (cat) seenCat[cat] = true;
      if (root) seenRoot[root] = true;
    });
    return repeats;
  }

  function vendorDtReceipts(vendor, period) {
    var out = [];
    if (!vendor) return out;
    loadDts().forEach(function (dt) {
      if ((dt.destType || "") !== "vendor") return;
      var match = false;
      if (vendor.id && dt.vendorId && String(dt.vendorId) === String(vendor.id)) match = true;
      if (!match && ncrMatchesVendorName({ company: dt.vendorName || dt.customer || dt.company }, vendor)) {
        match = true;
      }
      if (!match) return;
      var due = String(dt.dueDate || "").slice(0, 10);
      (dt.lines || []).forEach(function (ln) {
        var sn = String(ln.serial || "").trim();
        if (!sn) return;
        var rec = dt.receivedSerials && dt.receivedSerials[sn.toUpperCase()];
        if (!rec || !rec.at) return;
        var receipt = String(rec.at).slice(0, 10);
        if (period.start && receipt < period.start) return;
        if (period.end && receipt > period.end) return;
        var daysLate = 0;
        if (due && receipt) {
          var a = parseBillingDay(due);
          var b = parseBillingDay(receipt);
          if (a && b) {
            daysLate = Math.round((b.getTime() - a.getTime()) / 86400000);
            if (daysLate < 0) daysLate = 0;
          }
        }
        out.push({
          dtNo: dt.dtNo || dt.id,
          serial: sn,
          due: due,
          receipt: receipt,
          daysLate: daysLate,
          onTime: daysLate === 0,
        });
      });
    });
    return out;
  }

  function avgNcrDaysToClose(rows) {
    var days = [];
    (rows || []).forEach(function (n) {
      if (String(n.status || "") !== "Closed") return;
      var d = n.daysToClose != null ? Number(n.daysToClose) : ncrComputeDaysToClose(n);
      if (d != null && isFinite(d)) days.push(d);
    });
    if (!days.length) return null;
    var sum = 0;
    days.forEach(function (d) {
      sum += d;
    });
    return Math.round((sum / days.length) * 10) / 10;
  }

  function collectMetricRaw(metric, vendor, period, priorSnap) {
    var src = (metric && metric.sourceType) || "manual";
    if (src === "ncr-count") return ncrsForVendorPeriod(vendor, period).length;
    if (src === "ncr-repeat-count") {
      return countRepeatNcrs(ncrsForVendorPeriod(vendor, period));
    }
    if (src === "ncr-avg-days-to-close") {
      return avgNcrDaysToClose(ncrsForVendorPeriod(vendor, period));
    }
    if (src === "dt-vendor-otd") {
      var recsO = vendorDtReceipts(vendor, period);
      if (!recsO.length) return null;
      var onTime = 0;
      recsO.forEach(function (r) {
        if (r.onTime) onTime += 1;
      });
      return Math.round((onTime / recsO.length) * 1000) / 10;
    }
    if (src === "dt-vendor-days-late") {
      var recsL = vendorDtReceipts(vendor, period);
      if (!recsL.length) return null;
      var late = recsL.filter(function (r) {
        return r.daysLate > 0;
      });
      if (!late.length) return 0;
      var sumL = 0;
      late.forEach(function (r) {
        sumL += r.daysLate;
      });
      return Math.round((sumL / late.length) * 10) / 10;
    }
    if (src === "ncr-open-count") {
      return ncrsForVendorPeriod(vendor, period).filter(function (n) {
        var st = String(n.status || "");
        return st === "Open" || st === "Assigned" || st === "In Review" || st === "Draft";
      }).length;
    }
    if (src === "vendor-critical") return vendor && vendor.critical === "Y" ? 1 : 0;
    if (src === "vendor-certs-text") return String(vendor && vendor.certifications || "").trim() ? 1 : 0;
    if (priorSnap && Array.isArray(priorSnap.metricScores)) {
      var hit = null;
      priorSnap.metricScores.forEach(function (ms) {
        if (ms.metricId === metric.id && ms.rawValue != null && ms.rawValue !== "") hit = ms.rawValue;
      });
      if (hit != null) return hit;
    }
    return null;
  }

  function activeWeighted(items, weightKey) {
    var active = (items || []).filter(function (x) {
      return x.active !== false;
    });
    var sum = 0;
    active.forEach(function (x) {
      sum += Number(x[weightKey]) || 0;
    });
    return { items: active, sum: sum || 0 };
  }

  function tierForScore(cfg, composite) {
    var tiers = (cfg && cfg.tiers) || [];
    var n = Number(composite);
    var i;
    for (i = 0; i < tiers.length; i++) {
      var t = tiers[i];
      var min = Number(t.min);
      var max = Number(t.max);
      if (n >= min && n <= max) return t;
    }
    return { code: "unknown", label: "Unscored" };
  }

  function freezeConfigLite(cfg) {
    return {
      version: cfg.version,
      period: cloneScoreConfig(cfg).period,
      tiers: (cfg.tiers || []).map(function (t) {
        return { id: t.id, min: t.min, max: t.max, code: t.code, label: t.label };
      }),
      categories: (cfg.categories || []).map(function (c) {
        return { id: c.id, name: c.name, weight: c.weight, active: c.active, order: c.order };
      }),
      metrics: (cfg.metrics || []).map(function (m) {
        return {
          id: m.id, categoryId: m.categoryId, name: m.name, weight: m.weight, active: m.active,
          sourceType: m.sourceType, method: m.method, unit: m.unit,
        };
      }),
    };
  }

  function evaluateVendorPeriod(vendor, period, cfg, opts) {
    opts = opts || {};
    cfg = normalizeScoreConfig(cfg);
    period = period || currentScorePeriod(cfg);
    var prior = getScoreSnapshot(vendor.id, period.key);
    var catBag = activeWeighted(cfg.categories, "weight");
    var categoryScores = [];
    var metricScores = [];
    catBag.items
      .slice()
      .sort(function (a, b) {
        return (a.order || 0) - (b.order || 0);
      })
      .forEach(function (cat) {
        var mets = (cfg.metrics || []).filter(function (m) {
          return m.categoryId === cat.id && m.active !== false;
        });
        var mw = activeWeighted(mets, "weight");
        var catPts = 0;
        mw.items
          .slice()
          .sort(function (a, b) {
            return (a.order || 0) - (b.order || 0);
          })
          .forEach(function (met) {
            var priorMet = null;
            if (prior && prior.metricScores) {
              prior.metricScores.forEach(function (x) {
                if (x.metricId === met.id) priorMet = x;
              });
            }
            var raw;
            var overridden = false;
            if (opts.keepOverrides && priorMet && priorMet.overridden) {
              raw = priorMet.rawValue;
              overridden = true;
            } else {
              raw = collectMetricRaw(met, vendor, period, prior);
            }
            var pts = scoreMethodToPoints(met, raw);
            if (overridden && priorMet && priorMet.points != null && priorMet.overrideMode === "points") {
              pts = clampScore(priorMet.points);
            }
            var w = mw.sum ? (Number(met.weight) || 0) / mw.sum : 0;
            if (pts != null) catPts += pts * w;
            metricScores.push({
              metricId: met.id,
              categoryId: cat.id,
              name: met.name,
              sourceType: met.sourceType,
              method: met.method,
              unit: met.unit,
              rawValue: raw,
              rawLabel: raw == null || raw === "" ? "—" : String(raw),
              points: pts,
              weight: Number(met.weight) || 0,
              overridden: overridden,
              overrideBy: overridden && priorMet ? priorMet.overrideBy : "",
              overrideAt: overridden && priorMet ? priorMet.overrideAt : "",
              overrideMode: overridden && priorMet ? priorMet.overrideMode : "",
            });
          });
        var catScore = mw.items.length ? clampScore(catPts) : null;
        var cw = catBag.sum ? (Number(cat.weight) || 0) / catBag.sum : 0;
        categoryScores.push({
          categoryId: cat.id,
          name: cat.name,
          weight: Number(cat.weight) || 0,
          score: catScore,
          contrib: catScore != null ? catScore * cw : 0,
        });
      });
    var composite = 0;
    var any = false;
    categoryScores.forEach(function (c) {
      if (c.score == null) return;
      any = true;
      composite += c.contrib;
    });
    composite = any ? clampScore(composite) : null;
    var tier = composite == null ? { code: "unscored", label: "Unscored" } : tierForScore(cfg, composite);
    var snap = {
      id: prior && prior.id ? prior.id : uid("SS"),
      vendorId: vendor.id,
      vendorName: vendor.name,
      periodType: period.type,
      periodKey: period.key,
      periodStart: period.start,
      periodEnd: period.end,
      configId: cfg.id,
      configVersion: cfg.version,
      configSnapshot: freezeConfigLite(cfg),
      categoryScores: categoryScores,
      metricScores: metricScores,
      composite: composite,
      tierCode: tier.code,
      tierLabel: tier.label,
      comments: prior && prior.comments ? prior.comments : "",
      improvementPlan: prior && prior.improvementPlan ? prior.improvementPlan : "",
      status: "draft",
      calculatedAt: nowISO(),
      calculatedBy: state.adminAuthed ? ADMIN_USER : "user",
    };
    if (opts.commit !== false) upsertScoreSnapshot(snap);
    return snap;
  }

  function evaluateAllVendors(cfg, period, opts) {
    cfg = cfg || loadPublishedScoreConfig();
    period = period || resolveScoreUserPeriod(state.scoreUserPeriod);
    return loadVendors().map(function (v) {
      return evaluateVendorPeriod(v, period, cfg, opts || { commit: true, keepOverrides: true });
    });
  }

  function publishedMetricById(id, cfg) {
    cfg = cfg || loadPublishedScoreConfig();
    var hit = null;
    (cfg.metrics || []).forEach(function (m) {
      if (m.id === id) hit = m;
    });
    return hit;
  }

  function publishedCategoryById(id, cfg) {
    cfg = cfg || loadPublishedScoreConfig();
    var hit = null;
    (cfg.categories || []).forEach(function (c) {
      if (c.id === id) hit = c;
    });
    return hit;
  }

  function applyPublishedConfigToCurrentScores() {
    var cfg = loadPublishedScoreConfig();
    var period = resolveScoreUserPeriod(state.scoreUserPeriod);
    var snaps = evaluateAllVendors(cfg, period, { commit: true, keepOverrides: true });
    return { cfg: cfg, period: period, count: snaps.length };
  }

  function scoreTierBadgeClass(code) {
    if (code === "preferred") return "badge-in";
    if (code === "approved") return "badge-open";
    if (code === "conditional") return "badge-info";
    if (code === "probation") return "badge-out";
    return "badge-closed";
  }

  function formatScore(n) {
    if (n == null || n === "") return "—";
    var x = Number(n);
    if (!isFinite(x)) return "—";
    return String(Math.round(x * 10) / 10);
  }

  function sourceTypeLabel(t) {
    var map = {
      manual: "Manual",
      "ncr-count": "NCR count",
      "ncr-repeat-count": "Repeat NCRs",
      "ncr-avg-days-to-close": "Avg days to close",
      "dt-vendor-otd": "Vendor DT on-time %",
      "dt-vendor-days-late": "Vendor DT days late",
      "ncr-open-count": "Open NCRs",
      "vendor-critical": "Vendor critical flag",
      "vendor-certs-text": "Vendor certifications",
    };
    return map[t] || t || "Manual";
  }

  function methodLabel(t) {
    var map = {
      bands: "Bands / day-range deductions",
      linear: "Linear",
      inverseLinear: "Inverse linear",
      penaltyCount: "Penalty count",
      boolean: "Boolean",
      scale5: "Scale 1–5",
      manualPoints: "Manual points",
    };
    return map[t] || t || "Manual points";
  }

  function methodHelpText(method, metric) {
    var id = metric && metric.id;
    if (method === "linear") {
      return "Linear: score decreases evenly from full points at the best-case value (e.g. 100% on-time) down to 0 points at the worst-case value. Values in between are proportional. This metric’s points are then weighted into the category.";
    }
    if (method === "inverseLinear") {
      return "Inverse linear: same straight-line map, but a higher raw value scores lower (use when “more” is worse, such as days late).";
    }
    if (method === "bands") {
      if (id === "delivery.days-past-due") {
        return "Days Past Due: start at 100 points. Average days late for received vendor DTs falls into one bucket; that bucket’s deduction is subtracted. 30+ days should be the heaviest penalty. Delivery score blends this with On-Time Delivery by category weights.";
      }
      return "Bands: the raw value falls into the first matching range. That range’s points apply — there is no blending between ranges.";
    }
    if (method === "penaltyCount") {
      return "Penalty count: start at 100 points and subtract a set amount for each occurrence, up to a maximum penalty.";
    }
    if (method === "boolean") {
      return "Boolean: pass = 100 points, fail = 0 (reversed if Higher is better = No).";
    }
    if (method === "scale5") {
      return "Scale 1–5: 1 maps to 0 points and 5 maps to 100, in even steps.";
    }
    if (method === "manualPoints") {
      return "Manual points: the number entered is the score (0–100).";
    }
    return "";
  }

  function metricUsesDayDeductions(m) {
    if (!m || m.method !== "bands") return false;
    if (m.id === "delivery.days-past-due") return true;
    return String(m.unit || "").toLowerCase() === "days";
  }

  /* ========================================================================
   * Admin (hub from D:\AtraOps-Export + local tools)
   * ======================================================================== */

  /** Keys included in Admin Export/Import Backend JSON (code + data transfer). */
  function getBackendExportKeys() {
    var keys = [];
    Object.keys(KEYS).forEach(function (k) {
      if (KEYS[k]) keys.push(KEYS[k]);
    });
    /* also match export-backend.html / fieldops naming */
    [
      "fieldops-theme",
      "fieldops-master-categories",
      "fieldops-connection-types",
      "fieldops-locations",
      "fieldops-descriptions",
      "fieldops-customers",
      "fieldops-vendors",
      "fieldops-vendor-records-v1",
      "fieldops-vendor-files-v1",
      "fieldops-score-config-v1",
      "fieldops-score-config-draft-v1",
      "fieldops-score-config-log-v1",
      "fieldops-supplier-scores-v1",
      "fieldops-assets",
      "fieldops-assets-v1",
      "fieldops-asset-docs",
      "fieldops-rack-bin",
      "fieldops-masters-v1",
      "fieldops-equipment-lists-v5",
      "fieldops-equipment-dts-v2",
      "fieldops-equipment-dt-seq",
      "fieldops-jobs-v1",
      "fieldops-billing-drafts-v1",
      "fieldops-docs-v1",
      "fieldops-doc-library-v1",
      "fieldops-ncrs-v1",
      "fieldops-cardex-history-v1",
      "fieldops-home-modules-order",
    ].forEach(function (k) {
      if (keys.indexOf(k) < 0) keys.push(k);
    });
    return keys;
  }

  function buildBackendExportPackage() {
    var keyList = getBackendExportKeys();
    var data = {};
    keyList.forEach(function (k) {
      try {
        var raw = localStorage.getItem(k);
        data[k] = raw == null ? null : JSON.parse(raw);
      } catch (e) {
        data[k] = localStorage.getItem(k);
      }
    });
    return {
      app: "LOL PUS",
      version: 2,
      exportedAt: new Date().toISOString(),
      keys: keyList.slice(),
      data: data,
    };
  }

  function downloadBackendExport() {
    var pkg = buildBackendExportPackage();
    var blob = new Blob([JSON.stringify(pkg, null, 2)], { type: "application/json" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    var stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
    a.href = url;
    a.download = "LOL-PUS-backend-" + stamp + ".json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function importBackendPackage(pkg) {
    if (!pkg || typeof pkg !== "object") throw new Error("Invalid package");
    if (!pkg.data || typeof pkg.data !== "object") throw new Error("Package missing data");
    var keys = Array.isArray(pkg.keys) && pkg.keys.length ? pkg.keys : getBackendExportKeys();
    keys.forEach(function (k) {
      if (!Object.prototype.hasOwnProperty.call(pkg.data, k)) return;
      var val = pkg.data[k];
      if (val == null) {
        localStorage.removeItem(k);
      } else {
        localStorage.setItem(k, typeof val === "string" ? val : JSON.stringify(val));
      }
    });
  }

  function masterListBtn(key, label, count, highlight) {
    return (
      '<button type="button" class="btn-master-list' +
      (highlight ? " btn-master-list-locations" : "") +
      '" data-list-editor="' +
      key +
      '">' +
      "<strong>" +
      escapeHtml(label) +
      "</strong>" +
      "<span>" +
      count +
      " item(s)</span></button>"
    );
  }

  function viewAdmin(main) {
    if (!state.adminAuthed) {
      navigate("home");
      openAdminModal();
      return;
    }
    setBreadcrumbs([
      { label: "Home", nav: "home" },
      { label: "Admin" },
    ]);

    var tab = state.adminTab || "hub";
    var catalogCount = getCardexCatalog().length;
    var masters = loadMasters();
    var catN = (masters.categories || []).length;
    var locN = (masters.locations || []).length;
    var connN = (masters.connections || []).length;
    var descN = countDescriptionsByCategory(masters.descriptionsByCategory);
    var custN = (masters.customers || []).length;

    main.innerHTML =
      '<div class="admin-banner">' +
      "<div><strong>Admin backend</strong></div>" +
      '<div class="btn-group">' +
      '<button type="button" class="btn btn-ghost btn-sm" id="admin-signout">Sign out</button>' +
      '<button type="button" class="btn btn-ghost btn-sm" data-nav="home">Home</button>' +
      "</div></div>" +
      '<div class="page-header"><div><h1 class="page-title">Administration</h1>' +
      '<p class="page-subtitle">Serial registry, master lists, backend export/import, and system tools</p></div></div>' +
      '<div class="admin-grid mb-2">' +
      '<div class="admin-card admin-card-featured">' +
      "<h3>Serial Numbers</h3>" +
      "<p>Create and maintain asset serial records, locations, categories, and material data.</p>" +
      '<div class="admin-card-meta">' +
      catalogCount +
      " serial(s) in catalog</div>" +
      '<button type="button" class="btn btn-primary" data-nav="admin-serials">Manage Serial Numbers →</button>' +
      "</div>" +
      '<div class="admin-card admin-card-featured">' +
      "<h3>Export / Import Backend</h3>" +
      "<p>Download the full admin backend (assets, master lists, ELs, DTs, docs, rack/bin) as JSON for transfer. Import replaces local backend data.</p>" +
      '<div class="admin-card-meta">From D:\\AtraOps-Export admin · code folder + JSON data</div>' +
      '<div class="btn-group" style="flex-wrap:wrap">' +
      '<button type="button" class="btn btn-primary" id="btn-export-backend">Export Backend JSON →</button>' +
      '<label class="btn btn-ghost" style="cursor:pointer;margin:0">' +
      "Import Backend JSON" +
      '<input type="file" id="input-import-backend" accept="application/json,.json" hidden />' +
      "</label>" +
      "</div>" +
      "</div>" +
      '<div class="admin-card admin-card-featured"><h3>Supplier Scoring</h3>' +
      "<p>Configure categories, metric weights, scoring rules, tiers, and evaluation period. Publish before scores change.</p>" +
      '<div class="admin-card-meta">Config v' +
      (loadPublishedScoreConfig().version || 1) +
      " · " +
      escapeHtml((loadPublishedScoreConfig().period && loadPublishedScoreConfig().period.type) || "quarterly") +
      "</div>" +
      '<button type="button" class="btn btn-primary" data-admin-tab="score-config">Configure scoring →</button></div>' +
      '<div class="admin-card"><h3>Customers</h3><p>Add and maintain customer names used on ticket Customer / Vendor lists.</p>' +
      '<div class="admin-card-meta">' +
      custN +
      " customer(s)</div>" +
      '<button type="button" class="btn btn-secondary" data-list-editor="customers">Manage Customers →</button></div>' +
      '<div class="admin-card"><h3>Users &amp; Roles</h3><p>Manage admin users, roles, and access permissions.</p>' +
      '<button type="button" class="btn btn-secondary" data-admin-tab="users">Open Users &amp; Roles →</button></div>' +
      '<div class="admin-card"><h3>Doc modules (library)</h3><p>DMS-style document library entries.</p>' +
      '<button type="button" class="btn btn-secondary" data-admin-tab="docs">Open docs →</button></div>' +
      "</div>" +
      /* Master Lists box */
      '<div class="panel master-lists-panel mb-2">' +
      '<div class="panel-header flex-between"><h2 class="panel-title mb-0">Master Lists</h2>' +
      '<span class="text-muted">Shared dropdown sources</span></div>' +
      '<div class="panel-body">' +
      '<div class="master-lists-grid">' +
      masterListBtn("categories", "Master Categories", catN) +
      masterListBtn("connections", "Connection Types", connN) +
      masterListBtn("locations", "Locations", locN, true) +
      masterListBtn("descriptions", "Descriptions", descN) +
      masterListBtn("customers", "Customers", custN) +
      "</div></div></div>" +
      (tab === "hub"
        ? ""
        : '<div class="panel admin-tool-panel"><div class="panel-body" id="admin-body"></div></div>');

    $("#admin-signout", main).addEventListener("click", function () {
      state.adminAuthed = false;
      toast("Signed out");
      navigate("home");
    });
    $$("[data-nav]", main).forEach(function (b) {
      b.addEventListener("click", function () {
        navigate(b.getAttribute("data-nav"));
      });
    });
    $$("[data-admin-tab]", main).forEach(function (b) {
      b.addEventListener("click", function () {
        state.adminTab = b.getAttribute("data-admin-tab");
        state.adminMasterKey = null;
        viewAdmin(main);
      });
    });
    $$("[data-list-editor]", main).forEach(function (b) {
      b.addEventListener("click", function () {
        state.adminTab = "masters";
        state.adminMasterKey = b.getAttribute("data-list-editor");
        viewAdmin(main);
      });
    });

    var exp = $("#btn-export-backend", main);
    if (exp) {
      exp.addEventListener("click", function () {
        try {
          downloadBackendExport();
          toast("Backend JSON downloaded");
        } catch (e) {
          toast("Export failed: " + (e && e.message ? e.message : e), "error");
        }
      });
    }
    var imp = $("#input-import-backend", main);
    if (imp) {
      imp.addEventListener("change", function () {
        var file = imp.files && imp.files[0];
        if (!file) return;
        var reader = new FileReader();
        reader.onload = function () {
          try {
            var pkg = JSON.parse(String(reader.result || ""));
            if (
              !confirm(
                "Import will replace local LOL PUS backend data (assets, lists, ELs, DTs, documents). Continue?"
              )
            ) {
              imp.value = "";
              return;
            }
            importBackendPackage(pkg);
            toast("Backend import complete");
            viewAdmin(main);
          } catch (e) {
            toast("Import failed: " + (e && e.message ? e.message : e), "error");
          }
          imp.value = "";
        };
        reader.onerror = function () {
          toast("Could not read file", "error");
          imp.value = "";
        };
        reader.readAsText(file);
      });
    }

    var body = $("#admin-body", main);
    if (body) {
      if (tab === "masters") renderAdminMasters(body, state.adminMasterKey || null);
      else if (tab === "docs") renderAdminDocs(body);
      else if (tab === "users") renderAdminUsersRoles(body);
      else if (tab === "score-config") renderAdminScoreConfig(body);
    }
  }

  function requireAdminPage(main) {
    if (!state.adminAuthed) {
      navigate("home");
      openAdminModal();
      return false;
    }
    return true;
  }

  /* Full-page Serial Numbers (export-style) — does not touch EL */
  function viewAdminSerials(main) {
    if (!requireAdminPage(main)) return;
    setBreadcrumbs([
      { label: "Home", nav: "home" },
      { label: "Admin", nav: "admin" },
      { label: "Serial Numbers" },
    ]);
    var catalog = getCardexCatalog().sort(function (a, b) {
      return String(a.serial).localeCompare(String(b.serial));
    });
    main.innerHTML =
      '<div class="page-header"><div><h1 class="page-title">Serial Numbers</h1>' +
      '<p class="page-subtitle">Catalog of sample and admin-managed assets</p></div>' +
      '<div class="btn-group">' +
      '<button type="button" class="btn btn-ghost" data-nav="admin">← Admin</button>' +
      '<button type="button" class="btn btn-primary" id="btn-add-serial">+ Add Serial</button>' +
      "</div></div>" +
      '<div class="panel"><div class="panel-header flex-between"><h2 class="panel-title mb-0">Registry</h2>' +
      '<span class="text-muted">' +
      catalog.length +
      " serial(s)</span></div>" +
      '<div class="table-wrap"><table class="table table-clickable"><thead><tr>' +
      "<th>Serial</th><th>Description</th><th>Category</th><th>Status</th><th>Location</th>" +
      "</tr></thead><tbody>" +
      catalog
        .map(function (a) {
          return (
            '<tr class="registry-row" role="link" tabindex="0" data-nav="admin-serial-detail" data-serial="' +
            escapeHtml(a.serial) +
            '" title="Open ' +
            escapeHtml(a.serial) +
            '">' +
            '<td class="mono">' +
            escapeHtml(a.serial) +
            "</td>" +
            '<td class="wrap-cell">' +
            escapeHtml(a.description) +
            "</td>" +
            "<td>" +
            escapeHtml(a.category) +
            '</td><td><span class="badge badge-' +
            (a.status === "In" ? "in" : "out") +
            '">' +
            escapeHtml(a.status) +
            "</span></td><td>" +
            escapeHtml(a.location || a.store) +
            "</td></tr>"
          );
        })
        .join("") +
      "</tbody></table></div></div>";

    function openRegistrySerial(el) {
      var serial = el.getAttribute("data-serial");
      if (serial) navigate("admin-serial-detail", { serial: serial });
    }
    $$(".registry-row", main).forEach(function (row) {
      row.addEventListener("click", function () {
        openRegistrySerial(row);
      });
      row.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openRegistrySerial(row);
        }
      });
    });
    $$("[data-nav]:not(.registry-row)", main).forEach(function (b) {
      b.addEventListener("click", function () {
        var route = b.getAttribute("data-nav");
        var serial = b.getAttribute("data-serial");
        if (serial) navigate(route, { serial: serial });
        else navigate(route);
      });
    });
    var addBtn = $("#btn-add-serial", main);
    if (addBtn) {
      addBtn.addEventListener("click", function () {
        navigate("admin-serial-detail", { serial: "", mode: "new" });
      });
    }
  }

  /** Clone serial details for a new asset — serial blank; unique serial required on save */
  function buildSerialDuplicate(source, sourceSerialLabel) {
    var copy = normalizeAsset(deepClone(source || emptyAssetRecord()));
    var fromLabel = sourceSerialLabel || source.serial || "";
    copy.id = "";
    copy.serial = "";
    copy.serialNumber = "";
    copy.createdAt = "";
    copy.updatedAt = "";
    copy.docModulesMeta = null;
    /* system / auto fields stay blank on the new unit */
    copy.lastInspection = "";
    copy.lastInspectionStatus = "";
    copy.lastMaintenanceReport = "";
    copy.lastDeliveryTicket = "";
    copy.lastDtDate = "";
    copy.lastReturnDate = "";
    copy.lastRig = "";
    copy.lastReceivingReport = "";
    copy.lastCoc = "";
    copy.oldSerialConversion = "";
    copy.retirementDate = "";
    copy.notes = "";
    copy.status = "In";
    copy._duplicatedFrom = fromLabel || "";
    return copy;
  }

  function viewAdminSerialDetail(main) {
    if (!requireAdminPage(main)) return;
    var isNew = state.params.mode === "new" || !state.params.serial;
    var serial = state.params.serial || "";
    var duplicatedFrom = "";
    var asset;
    if (isNew && state.serialDuplicateDraft) {
      asset = normalizeAsset(state.serialDuplicateDraft);
      duplicatedFrom = asset._duplicatedFrom || state.params.fromSerial || "";
      state.serialDuplicateDraft = null;
    } else if (isNew) {
      asset = emptyAssetRecord();
    } else {
      asset = findCardexRecord(serial);
    }
    if (!isNew && !asset) {
      main.innerHTML =
        '<div class="empty-state"><h3>Serial not found</h3>' +
        '<button type="button" class="btn btn-primary" data-nav="admin-serials">Back</button></div>';
      $$("[data-nav]", main).forEach(function (b) {
        b.addEventListener("click", function () {
          navigate(b.getAttribute("data-nav"));
        });
      });
      return;
    }
    asset = normalizeAsset(asset || emptyAssetRecord());
    delete asset._duplicatedFrom;
    setBreadcrumbs([
      { label: "Home", nav: "home" },
      { label: "Admin", nav: "admin" },
      { label: "Serials", nav: "admin-serials" },
      { label: isNew ? (duplicatedFrom ? "Duplicate serial" : "Add Serial") : asset.serial },
    ]);

    var canDocs = !isNew && !!asset.serial;
    var canDuplicate = !isNew && !!asset.serial;
    var docLinks = ADMIN_DOC_MODULES.map(function (m) {
      if (!canDocs) {
        return (
          '<div class="inv-doc-item">' +
          '<span class="serial-doc-link serial-doc-link-empty serial-doc-link-disabled" title="Save serial first">' +
          escapeHtml(m.title) +
          "</span></div>"
        );
      }
      var bucket = getModuleDocs(asset, m.id);
      var cur = bucket.current;
      var hasDoc = !!(cur && (cur.name || cur.dataUrl || cur.rev));
      var expSt = hasDoc ? getDocExpirationStatus(cur) : null;
      return (
        '<div class="inv-doc-item' +
        (expSt ? (expSt.expired ? " inv-doc-item-expired" : expSt.na ? "" : " inv-doc-item-valid") : "") +
        '">' +
        '<button type="button" class="serial-doc-link ' +
        (hasDoc ? "serial-doc-link-has-doc" : "serial-doc-link-empty") +
        '" data-nav="admin-serial-doc" data-serial="' +
        escapeHtml(asset.serial) +
        '" data-module="' +
        escapeHtml(m.id) +
        '" title="' +
        escapeHtml(
          (hasDoc ? "Document on file" : "No document yet") +
            (expSt ? " · " + expSt.label : "")
        ) +
        '">' +
        escapeHtml(m.title) +
        "</button>" +
        (hasDoc ? renderDocExpirationHtml(cur) : "") +
        "</div>"
      );
    }).join("");

    var subtitle = duplicatedFrom
      ? "Duplicated from " +
        duplicatedFrom +
        " — enter a new unique serial number, then save"
      : "Serial record linked to master category and descriptions";

    main.innerHTML =
      '<div class="page-header"><div><h1 class="page-title">' +
      (isNew
        ? duplicatedFrom
          ? "Duplicate serial"
          : "Add Serial"
        : "Edit Serial — " + escapeHtml(asset.serial)) +
      "</h1>" +
      '<p class="page-subtitle">' +
      escapeHtml(subtitle) +
      "</p></div>" +
      '<div class="btn-group page-header-actions">' +
      '<button type="button" class="btn btn-ghost" data-nav="admin-serials">← Serial list</button>' +
      (canDuplicate
        ? '<button type="button" class="btn btn-secondary" id="btn-duplicate-serial">Duplicate</button>'
        : "") +
      "</div></div>" +
      /* Document modules at top — compact links, no "Open" */
      '<div class="panel mb-2 serial-docs-top"><div class="panel-header flex-between">' +
      '<h2 class="panel-title mb-0">Document modules</h2>' +
      '<span class="text-muted">Upload &amp; revision control</span></div>' +
      '<div class="panel-body">' +
      '<div class="serial-doc-links">' +
      docLinks +
      "</div>" +
      (!canDocs
        ? '<p class="form-hint" style="margin-top:0.5rem">Save the serial before attaching documents.</p>'
        : "") +
      "</div></div>" +
      '<div class="panel mb-2"><div class="panel-header"><h2 class="panel-title">Asset data</h2></div><div class="panel-body">' +
      (isNew
        ? '<p class="form-hint mb-2"><strong>Serial number</strong> is blank — enter a new one. Existing serials cannot be reused.</p>'
        : "") +
      renderAssetFormHtml(asset, "af", {
        serialReadonly: !isNew,
        fields: SERIAL_ADMIN_FIELDS,
        autoFields: SERIAL_ADMIN_AUTO_FIELDS,
        hideDefaultHint: true,
      }) +
      '<div class="asset-form-footer">' +
      '<div class="footer-left">' +
      (!isNew
        ? '<button type="button" class="btn btn-ghost" id="btn-delete-serial">Delete</button>'
        : "") +
      "</div>" +
      '<div class="footer-right">' +
      '<button type="button" class="btn btn-ghost" data-nav="admin-serials">Cancel</button>' +
      '<button type="button" class="btn btn-primary" id="btn-save-serial">Save Asset</button>' +
      "</div></div></div></div>";

    $$("[data-nav]", main).forEach(function (b) {
      b.addEventListener("click", function () {
        if (b.disabled) return;
        var route = b.getAttribute("data-nav");
        var sn = b.getAttribute("data-serial");
        var mod = b.getAttribute("data-module");
        var params = {};
        if (sn && sn !== "__new__") params.serial = sn;
        if (mod) params.module = mod;
        navigate(route, params);
      });
    });

    bindCategoryDescriptionFields("af", main);

    function setSerialExistsError(on, message) {
      var snEl = $("#af-serial", main);
      if (!snEl) return;
      var field = snEl.closest ? snEl.closest(".field") : snEl.parentElement;
      var msg =
        message || "Come on man, you can't do that!";
      snEl.classList.toggle("is-error", !!on);
      if (field) {
        field.classList.toggle("field-error", !!on);
        field.classList.toggle("has-serial-error", !!on);
        var alertEl = field.querySelector(".serial-field-alert");
        if (on) {
          if (!alertEl) {
            alertEl = document.createElement("span");
            alertEl.className = "serial-field-alert";
            field.appendChild(alertEl);
          }
          alertEl.textContent = msg;
        } else if (alertEl) {
          alertEl.textContent = "";
        }
      }
      if (on) snEl.setAttribute("aria-invalid", "true");
      else snEl.removeAttribute("aria-invalid");
    }

    function serialTakenByOther(serialValue) {
      var sn = String(serialValue || "").trim();
      if (!sn) return false;
      var existing = findCardexRecord(sn);
      if (!existing) return false;
      if (isNew) return true;
      return String(existing.id || "") !== String(asset.id || "");
    }

    function checkSerialUnique(opts) {
      opts = opts || {};
      var snEl = $("#af-serial", main);
      if (!snEl) return true;
      var sn = String(snEl.value || "").trim();
      if (!sn) {
        setSerialExistsError(false);
        return true;
      }
      if (serialTakenByOther(sn)) {
        setSerialExistsError(true);
        if (opts.toast) {
          toast("Come on man, you can't do that!", "error");
        }
        if (opts.focus) snEl.focus();
        return false;
      }
      setSerialExistsError(false);
      return true;
    }

    var snInput = $("#af-serial", main);
    if (snInput && (isNew || !snInput.readOnly)) {
      snInput.addEventListener("input", function () {
        checkSerialUnique({ toast: false });
      });
      snInput.addEventListener("blur", function () {
        checkSerialUnique({ toast: true });
      });
    }

    if (isNew) {
      var snFocus = $("#af-serial", main);
      if (snFocus) {
        setTimeout(function () {
          snFocus.focus();
        }, 50);
      }
    }

    var dupBtn = $("#btn-duplicate-serial", main);
    if (dupBtn) {
      dupBtn.addEventListener("click", function () {
        /* Prefer current form values so unsaved edits are included */
        var source = readAssetForm("af", asset, main, SERIAL_ADMIN_FIELDS);
        if (!source.serial && asset.serial) source.serial = asset.serial;
        if (!source.serial) {
          toast("Save or open a serial before duplicating", "error");
          return;
        }
        var draft = buildSerialDuplicate(source, source.serial);
        state.serialDuplicateDraft = draft;
        toast("Duplicated details — enter a new serial number");
        navigate("admin-serial-detail", {
          mode: "new",
          serial: "",
          fromSerial: source.serial,
        });
      });
    }

    $("#btn-save-serial", main).addEventListener("click", function () {
      var out = readAssetForm("af", asset, main, SERIAL_ADMIN_FIELDS);
      if (!out.serial) {
        toast("Serial number is required", "error");
        setSerialExistsError(true, "Serial number is required");
        var snEl = $("#af-serial", main);
        if (snEl) snEl.focus();
        return;
      }
      if (!checkSerialUnique({ toast: true, focus: true })) {
        return;
      }
      if (!out.category) {
        toast("Master category is required", "error");
        return;
      }
      if (!out.id) out.id = uid("adm");
      ensureDescriptionInCategory(out.category, out.description);
      upsertAsset(out);
      toast("Asset saved" + (isNew ? " — " + out.serial : ""));
      navigate("admin-serial-detail", { serial: out.serial });
    });

    var del = $("#btn-delete-serial", main);
    if (del) {
      del.addEventListener("click", function () {
        if (!confirm("Delete serial " + asset.serial + " from the catalog?")) return;
        var list = loadAssets().filter(function (a) {
          return String(a.serial).toUpperCase() !== String(asset.serial).toUpperCase();
        });
        saveAssets(list);
        toast("Serial deleted");
        navigate("admin-serials");
      });
    }
  }

  /* Asset document store (export-compatible fieldops-asset-docs shape) */
  function getAssetDocsStore() {
    var store = storageGet(KEYS.assetDocs, null);
    if (!store || typeof store !== "object") {
      store = { byId: {}, bySerial: {} };
      storageSet(KEYS.assetDocs, store);
    }
    if (!store.byId) store.byId = {};
    if (!store.bySerial) store.bySerial = {};
    return store;
  }

  function saveAssetDocsStore(store) {
    storageSet(KEYS.assetDocs, store);
  }

  function ensureAssetDocBucket(asset) {
    var store = getAssetDocsStore();
    var id = asset.id || asset.serial;
    if (!store.byId[id]) store.byId[id] = {};
    if (asset.serial) store.bySerial[String(asset.serial)] = id;
    saveAssetDocsStore(store);
    return store.byId[id];
  }

  /** Resolve doc storage id — prefer bySerial map, then id, then serial (case-insensitive). */
  function resolveAssetDocIds(asset) {
    var store = getAssetDocsStore();
    var out = [];
    var seen = {};
    function add(id) {
      if (id == null || id === "") return;
      var k = String(id);
      if (seen[k]) return;
      seen[k] = true;
      out.push(k);
    }
    var serial = asset && asset.serial != null ? String(asset.serial) : "";
    if (serial && store.bySerial[serial]) add(store.bySerial[serial]);
    if (serial) {
      Object.keys(store.bySerial || {}).forEach(function (s) {
        if (String(s).toUpperCase() === serial.toUpperCase()) add(store.bySerial[s]);
      });
    }
    if (asset && asset.id) add(asset.id);
    if (serial) add(serial);
    /* also try uppercase serial keys */
    if (serial) add(serial.toUpperCase());
    return out;
  }

  function getModuleDocs(asset, moduleId) {
    var store = getAssetDocsStore();
    var ids = resolveAssetDocIds(asset);
    var mod = null;
    var i;
    for (i = 0; i < ids.length; i++) {
      var docs = store.byId[ids[i]];
      if (!docs || typeof docs !== "object") continue;
      if (docs[moduleId]) {
        mod = docs[moduleId];
        break;
      }
      /* legacy id: mtc → mtr (Material Test Report) */
      if (moduleId === "mtr" && docs.mtc) {
        mod = docs.mtc;
        break;
      }
    }
    if (!mod) return { current: null, archive: [] };
    return { current: mod.current || null, archive: Array.isArray(mod.archive) ? mod.archive : [] };
  }

  /** True when this serial has a current file in the module (link turns blue) */
  function serialModuleHasDocument(asset, moduleId) {
    if (!asset || !moduleId) return false;
    var bucket = getModuleDocs(asset, moduleId);
    return !!(bucket.current && (bucket.current.name || bucket.current.dataUrl || bucket.current.rev));
  }

  /**
   * Expiration status for a stored document current revision.
   * returns null | { label, css, expired, na }
   * Green (valid) if exp date is today or later; red if past.
   */
  function getDocExpirationStatus(doc) {
    if (!doc) return null;
    if (doc.na) {
      return { label: "Exp N/A", css: "doc-exp-na", expired: false, na: true };
    }
    var exp = (doc.expires || "").trim();
    if (!exp) return null;
    var expDay = String(exp).slice(0, 10);
    var today = todayISO().slice(0, 10);
    var expired = expDay < today;
    return {
      label: "Exp " + (formatDate(expDay) || expDay),
      css: expired ? "doc-exp-expired" : "doc-exp-valid",
      expired: expired,
      na: false,
      expires: expDay,
    };
  }

  function renderDocExpirationHtml(doc) {
    var st = getDocExpirationStatus(doc);
    if (!st) return "";
    return (
      '<span class="doc-exp-label ' +
      st.css +
      '" title="' +
      (st.na ? "No expiration" : st.expired ? "Past expiration" : "In date") +
      '">' +
      escapeHtml(st.label) +
      "</span>"
    );
  }

  /**
   * Convert a data: URL to a Blob (more reliable than window.open(dataUrl) for PDFs).
   */
  function dataUrlToBlob(dataUrl) {
    if (!dataUrl || typeof dataUrl !== "string") return null;
    try {
      var parts = dataUrl.split(",");
      if (parts.length < 2) return null;
      var meta = parts[0] || "";
      var payload = parts.slice(1).join(",");
      var isBase64 = /;base64/i.test(meta);
      var mimeMatch = meta.match(/^data:([^;,]*)/i);
      var mime = (mimeMatch && mimeMatch[1]) || "application/octet-stream";
      if (isBase64) {
        var binary = atob(payload);
        var len = binary.length;
        var bytes = new Uint8Array(len);
        var i;
        for (i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
        return new Blob([bytes], { type: mime || "application/octet-stream" });
      }
      return new Blob([decodeURIComponent(payload)], { type: mime || "application/octet-stream" });
    } catch (e) {
      return null;
    }
  }

  /**
   * Download / open a stored document. Uses Blob + object URL so large PDFs work
   * (raw data: hrefs and window.open(dataUrl) often fail in browsers).
   */
  function downloadStoredDocument(doc, opts) {
    opts = opts || {};
    if (!doc) {
      toast("No document to download", "error");
      return false;
    }
    if (!doc.dataUrl) {
      toast(
        (doc.name || "File") +
          " is listed but the file data is missing. Re-upload in Admin (large files can fail to save in browser storage).",
        "error"
      );
      return false;
    }
    var filename = doc.name || "document";
    var blob = dataUrlToBlob(doc.dataUrl);
    if (!blob) {
      /* last resort: try opening the data URL directly */
      try {
        window.open(doc.dataUrl, "_blank");
        return true;
      } catch (e) {
        toast("Could not read stored file — re-upload it", "error");
        return false;
      }
    }
    var url = URL.createObjectURL(blob);
    try {
      var a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.rel = "noopener";
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast("Downloading " + filename);
      setTimeout(function () {
        try {
          URL.revokeObjectURL(url);
        } catch (e2) {}
      }, 4000);
      return true;
    } catch (e3) {
      /* open in new tab as fallback */
      try {
        window.open(url, "_blank", "noopener");
        setTimeout(function () {
          try {
            URL.revokeObjectURL(url);
          } catch (e4) {}
        }, 60000);
        return true;
      } catch (e5) {
        toast("Download blocked by browser", "error");
        try {
          URL.revokeObjectURL(url);
        } catch (e6) {}
        return false;
      }
    }
  }

  /** Open admin-uploaded asset doc for a module (view-only). */
  function openAssetModuleDocument(asset, moduleId) {
    var bucket = getModuleDocs(asset, moduleId);
    var cur = bucket.current;
    if (cur) return downloadStoredDocument(cur);
    toast("No document on file for this module", "info");
    return false;
  }

  function nextDocRev(current) {
    if (!current || !current.rev) return "01";
    var n = parseInt(String(current.rev).replace(/\D/g, ""), 10);
    if (!isFinite(n)) return "01";
    var next = n + 1;
    return next < 10 ? "0" + next : String(next);
  }

  function viewAdminSerialDoc(main) {
    if (!requireAdminPage(main)) return;
    var serial = state.params.serial || "";
    var moduleId = state.params.module || "";
    var asset = findCardexRecord(serial);
    var mod = null;
    ADMIN_DOC_MODULES.forEach(function (m) {
      if (m.id === moduleId) mod = m;
    });
    if (!asset || !mod) {
      main.innerHTML =
        '<div class="empty-state"><h3>Document module not found</h3>' +
        '<button type="button" class="btn btn-primary" data-nav="admin-serials">Back</button></div>';
      $$("[data-nav]", main).forEach(function (b) {
        b.addEventListener("click", function () {
          navigate(b.getAttribute("data-nav"));
        });
      });
      return;
    }
    ensureAssetDocBucket(asset);
    var bucket = getModuleDocs(asset, moduleId);
    setBreadcrumbs([
      { label: "Home", nav: "home" },
      { label: "Admin", nav: "admin" },
      { label: "Serials", nav: "admin-serials" },
      {
        label: asset.serial,
        nav: "admin-serial-detail?serial=" + encodeURIComponent(asset.serial),
      },
      { label: mod.title },
    ]);

    var cur = bucket.current;
    var hasFileData = !!(cur && cur.dataUrl);
    main.innerHTML =
      '<div class="page-header"><div><h1 class="page-title">' +
      escapeHtml(mod.title) +
      "</h1>" +
      '<p class="page-subtitle">' +
      escapeHtml(asset.serial) +
      " — revision control &amp; upload</p></div>" +
      '<button type="button" class="btn btn-ghost" data-nav="admin-serial-detail" data-serial="' +
      escapeHtml(asset.serial) +
      '">← Serial detail</button></div>' +
      '<div class="panel"><div class="panel-body">' +
      '<h3 class="mt-0">Current revision</h3>' +
      (cur
        ? '<p class="mono">' +
          escapeHtml(cur.name) +
          " · rev " +
          escapeHtml(cur.rev) +
          (cur.expires ? " · exp " + escapeHtml(cur.expires) : cur.na ? " · exp N/A" : "") +
          (!hasFileData
            ? ' <span class="text-danger">· file data missing — re-upload</span>'
            : "") +
          "</p>" +
          (hasFileData
            ? '<p class="btn-group">' +
              '<button type="button" class="btn btn-primary btn-sm" id="btn-doc-download">Download file</button>' +
              '<button type="button" class="btn btn-secondary btn-sm" id="btn-doc-open">Open in new tab</button>' +
              "</p>"
            : '<p class="form-hint">This revision has no stored file bytes (browser storage may have been full). Upload again with a smaller file if needed (keep under ~1.5 MB).</p>')
        : '<p class="text-muted">No current file.</p>') +
      '<div class="doc-upload-box">' +
      '<div class="form-section-title">Upload new revision</div>' +
      '<div class="form-grid-3">' +
      '<label class="field"><span>File</span><input type="file" id="doc-file" class="form-control" /></label>' +
      '<label class="field"><span>Revision</span><input type="text" id="doc-rev" class="form-control" value="' +
      escapeHtml(nextDocRev(cur)) +
      '" /></label>' +
      '<label class="field"><span>Expiration</span><div class="btn-group" style="width:100%">' +
      '<input type="date" id="doc-exp" class="form-control" />' +
      '<button type="button" class="btn btn-ghost btn-sm" id="doc-exp-na">N/A</button></div></label>' +
      "</div>" +
      '<button type="button" class="btn btn-primary mt-2" id="btn-doc-upload">Upload &amp; Save</button>' +
      '<p class="form-hint">Saved in this browser only (localStorage). Prefer PDFs/images under ~1.5 MB so download works.</p>' +
      "</div>" +
      '<h3>Archive</h3>' +
      (bucket.archive && bucket.archive.length
        ? '<ul class="history-list">' +
          bucket.archive
            .map(function (a, ai) {
              return (
                "<li><span class=\"history-date\">" +
                escapeHtml(a.rev || "—") +
                "</span> " +
                escapeHtml(a.name || "") +
                (a.dataUrl
                  ? ' <button type="button" class="btn btn-sm btn-ghost" data-arch-dl="' +
                    ai +
                    '">Download</button>'
                  : ' <span class="text-muted">(no file data)</span>') +
                "</li>"
              );
            })
            .join("") +
          "</ul>"
        : '<p class="text-muted">No archived revisions.</p>') +
      "</div></div>";

    $$("[data-nav]", main).forEach(function (b) {
      b.addEventListener("click", function () {
        var route = b.getAttribute("data-nav");
        var sn = b.getAttribute("data-serial");
        navigate(route, sn ? { serial: sn } : {});
      });
    });

    var dlBtn = $("#btn-doc-download", main);
    if (dlBtn) {
      dlBtn.addEventListener("click", function () {
        downloadStoredDocument(cur);
      });
    }
    var openBtn = $("#btn-doc-open", main);
    if (openBtn) {
      openBtn.addEventListener("click", function () {
        if (!cur || !cur.dataUrl) {
          toast("No file data to open", "error");
          return;
        }
        var blob = dataUrlToBlob(cur.dataUrl);
        if (blob) {
          var u = URL.createObjectURL(blob);
          window.open(u, "_blank", "noopener");
          setTimeout(function () {
            try {
              URL.revokeObjectURL(u);
            } catch (e) {}
          }, 60000);
        } else {
          downloadStoredDocument(cur);
        }
      });
    }
    $$("[data-arch-dl]", main).forEach(function (b) {
      b.addEventListener("click", function () {
        var idx = parseInt(b.getAttribute("data-arch-dl"), 10);
        var arch = bucket.archive && bucket.archive[idx];
        downloadStoredDocument(arch);
      });
    });

    var naActive = false;
    var naBtn = $("#doc-exp-na", main);
    var expInput = $("#doc-exp", main);
    if (naBtn && expInput) {
      naBtn.addEventListener("click", function () {
        naActive = !naActive;
        expInput.disabled = naActive;
        if (naActive) expInput.value = "";
      });
    }

    $("#btn-doc-upload", main).addEventListener("click", function () {
      var fileInput = $("#doc-file", main);
      var revInput = $("#doc-rev", main);
      var file = fileInput && fileInput.files && fileInput.files[0];
      if (!file) {
        toast("Choose a file to upload", "error");
        return;
      }
      /* localStorage ~5MB total; base64 expands ~33% — warn above 1.5MB */
      if (file.size > 1.5 * 1024 * 1024) {
        if (
          !confirm(
            "This file is " +
              (file.size / 1024 / 1024).toFixed(1) +
              " MB. Browser storage is limited and the file may not save or download. Continue anyway?"
          )
        ) {
          return;
        }
      }
      var rev = ((revInput && revInput.value) || "").trim() || "01";
      var expires = naActive ? "" : ((expInput && expInput.value) || "");
      var reader = new FileReader();
      reader.onload = function () {
        try {
          var store = getAssetDocsStore();
          var id = asset.id || asset.serial;
          if (!store.byId[id]) store.byId[id] = {};
          if (asset.serial) store.bySerial[String(asset.serial)] = id;
          var bucket2 = store.byId[id][moduleId] || { current: null, archive: [] };
          if (!Array.isArray(bucket2.archive)) bucket2.archive = [];
          /* archive without embedding full dataUrl copies when possible to save space */
          if (bucket2.current) {
            var prev = deepClone(bucket2.current);
            bucket2.archive.unshift(prev);
            if (bucket2.archive.length > 10) bucket2.archive = bucket2.archive.slice(0, 10);
          }
          bucket2.current = {
            id: uid("doc"),
            name: file.name,
            rev: rev,
            uploadedAt: new Date().toISOString(),
            expires: naActive ? "" : expires,
            na: !!naActive,
            dataUrl: typeof reader.result === "string" ? reader.result : null,
            mime: file.type || "",
          };
          store.byId[id][moduleId] = bucket2;
          if (asset.serial && String(id) !== String(asset.serial)) {
            if (!store.byId[asset.serial]) store.byId[asset.serial] = {};
            store.byId[asset.serial][moduleId] = bucket2;
          }
          var ok = storageSet(KEYS.assetDocs, store);
          if (!ok) {
            toast(
              "Browser storage full — file was not saved. Use a smaller file (under ~1.5 MB) and try again.",
              "error"
            );
            return;
          }
          toast("Document saved — use Download file to get it");
          navigate("admin-serial-doc", { serial: asset.serial, module: moduleId });
        } catch (err) {
          var msg = err && err.name === "QuotaExceededError"
            ? "Browser storage full — file too large to save. Use a smaller PDF/image (under ~1.5 MB)."
            : "Could not save file: " + (err && err.message ? err.message : err);
          toast(msg, "error");
        }
      };
      reader.onerror = function () {
        toast("Failed to read file", "error");
      };
      reader.readAsDataURL(file);
    });
  }

  function renderAdminDuplicate(host) {
    host.innerHTML =
      "<h3>Duplicate &amp; Edit</h3>" +
      '<p class="text-muted">Copy an existing asset to a new serial. Duplicate serials are blocked.</p>' +
      '<div class="form-grid-2">' +
      '<label class="field"><span>Source serial</span><input type="text" id="dup-source" class="form-control" list="dup-serial-list" /></label>' +
      '<label class="field"><span>New serial</span><input type="text" id="dup-new" class="form-control" /></label>' +
      "</div>" +
      '<datalist id="dup-serial-list">' +
      getCardexCatalog()
        .map(function (a) {
          return '<option value="' + escapeHtml(a.serial) + '">';
        })
        .join("") +
      "</datalist>" +
      '<div class="btn-group mt-2">' +
      '<button type="button" class="btn btn-primary" id="dup-go">Load for edit</button>' +
      "</div>" +
      '<div id="dup-editor" class="mt-2" hidden></div>';

    $("#dup-go", host).addEventListener("click", function () {
      var src = ($("#dup-source", host).value || "").trim();
      var neu = ($("#dup-new", host).value || "").trim();
      if (!src || !neu) {
        toast("Both serials required", "error");
        return;
      }
      if (src.toUpperCase() === neu.toUpperCase()) {
        toast("New serial must be different", "error");
        return;
      }
      var rec = findCardexRecord(src);
      if (!rec) {
        toast("Source serial not found", "error");
        return;
      }
      if (findCardexRecord(neu)) {
        toast("New serial already exists — blocked", "error");
        return;
      }
      var copy = deepClone(rec);
      copy.serial = neu;
      copy.status = "In";
      var ed = $("#dup-editor", host);
      ed.hidden = false;
      var masters = loadMasters();
      ed.innerHTML =
        '<div class="panel panel-muted"><div class="panel-body">' +
        '<p class="form-note">Duplicating <code>' +
        escapeHtml(src) +
        "</code> → <code>" +
        escapeHtml(neu) +
        "</code></p>" +
        '<div class="form-grid-3">' +
        '<label class="field"><span>Serial</span><input type="text" id="de-serial" value="' +
        escapeHtml(neu) +
        '" readonly /></label>' +
        '<label class="field"><span>Item No</span><input type="text" id="de-itemNo" value="' +
        escapeHtml(copy.itemNo) +
        '" /></label>' +
        '<label class="field"><span>UOM</span><input type="text" id="de-uom" value="' +
        escapeHtml(copy.uom) +
        '" /></label>' +
        '<label class="field form-span-full"><span>Description</span><input type="text" id="de-description" value="' +
        escapeHtml(copy.description) +
        '" /></label>' +
        '<label class="field"><span>Category</span><select id="de-category">' +
        masters.categories
          .map(function (c) {
            return (
              '<option value="' +
              escapeHtml(c) +
              '"' +
              (copy.category === c ? " selected" : "") +
              ">" +
              escapeHtml(c) +
              "</option>"
            );
          })
          .join("") +
        '</select></label>' +
        '<label class="field"><span>Location</span><select id="de-location">' +
        masters.locations
          .map(function (c) {
            return (
              '<option value="' +
              escapeHtml(c) +
              '"' +
              (copy.location === c ? " selected" : "") +
              ">" +
              escapeHtml(c) +
              "</option>"
            );
          })
          .join("") +
        '</select></label>' +
        '<label class="field"><span>Connection</span><input type="text" id="de-connection" value="' +
        escapeHtml(copy.connection) +
        '" /></label>' +
        '<label class="field form-span-full"><span>Notes</span><textarea id="de-notes">' +
        escapeHtml(copy.notes || "") +
        "</textarea></label></div>" +
        '<div class="btn-group mt-2"><button type="button" class="btn btn-primary" id="de-save">Save new serial</button></div>' +
        "</div></div>";

      $("#de-save", ed).addEventListener("click", function () {
        var out = emptyAssetRecord();
        out.serial = $("#de-serial", ed).value.trim();
        out.itemNo = $("#de-itemNo", ed).value.trim();
        out.uom = $("#de-uom", ed).value.trim() || "JT";
        out.description = $("#de-description", ed).value.trim();
        out.category = $("#de-category", ed).value;
        out.location = $("#de-location", ed).value;
        out.connection = $("#de-connection", ed).value.trim();
        out.notes = $("#de-notes", ed).value.trim();
        out.status = "In";
        out.condition = copy.condition || "Serviceable";
        out.manufacturer = copy.manufacturer || "";
        if (findCardexRecord(out.serial)) {
          toast("Serial already exists — blocked", "error");
          return;
        }
        upsertAsset(out);
        toast("Created " + out.serial);
        state.adminTab = "serials";
        viewAdmin($("#main"));
      });
    });
  }

  function renderAdminScoreConfig(host) {
    var draft = loadScoreConfigDraft();
    var pub = loadPublishedScoreConfig();
    var sub = state.adminScoreSubtab || "categories";
    var dirty = JSON.stringify(draft.categories) !== JSON.stringify(pub.categories) ||
      JSON.stringify(draft.metrics) !== JSON.stringify(pub.metrics) ||
      JSON.stringify(draft.tiers) !== JSON.stringify(pub.tiers) ||
      JSON.stringify(draft.period) !== JSON.stringify(pub.period);

    function subBtn(key, label) {
      return (
        '<button type="button" class="tab' +
        (sub === key ? " active" : "") +
        '" data-ss-sub="' +
        key +
        '">' +
        escapeHtml(label) +
        "</button>"
      );
    }

    function weightSum(list) {
      var s = 0;
      (list || []).forEach(function (x) {
        if (x.active !== false) s += Number(x.weight) || 0;
      });
      return s;
    }

    var panel = "";
    if (sub === "categories") {
      var catSum = weightSum(draft.categories);
      panel =
        '<p class="form-hint">Active category weights should total 100. Engine re-normalizes if they do not. Current active sum: <strong>' +
        catSum +
        "%</strong>" +
        (catSum !== 100 ? ' <span class="text-danger">— will be normalized</span>' : "") +
        "</p>" +
        '<div class="table-wrap"><table class="table"><thead><tr>' +
        "<th>Order</th><th>Name</th><th>Weight %</th><th>Active</th><th></th></tr></thead><tbody>" +
        (draft.categories || [])
          .slice()
          .sort(function (a, b) {
            return (a.order || 0) - (b.order || 0);
          })
          .map(function (c, i, arr) {
            return (
              "<tr>" +
              '<td class="num-cell">' +
              '<button type="button" class="table-link" data-ss-cat-up="' +
              escapeHtml(c.id) +
              '"' +
              (i === 0 ? " disabled" : "") +
              ">↑</button> " +
              '<button type="button" class="table-link" data-ss-cat-dn="' +
              escapeHtml(c.id) +
              '"' +
              (i === arr.length - 1 ? " disabled" : "") +
              ">↓</button></td>" +
              '<td><input type="text" class="form-control" data-ss-cat-name="' +
              escapeHtml(c.id) +
              '" value="' +
              escapeHtml(c.name) +
              '" /></td>' +
              '<td><input type="number" class="form-control" min="0" max="100" step="1" data-ss-cat-w="' +
              escapeHtml(c.id) +
              '" value="' +
              escapeHtml(c.weight) +
              '" /></td>' +
              '<td><input type="checkbox" data-ss-cat-on="' +
              escapeHtml(c.id) +
              '"' +
              (c.active !== false ? " checked" : "") +
              " /></td>" +
              '<td><button type="button" class="table-link" data-ss-cat-del="' +
              escapeHtml(c.id) +
              '">Remove</button></td></tr>'
            );
          })
          .join("") +
        "</tbody></table></div>" +
        '<div class="master-add mt-2">' +
        '<input type="text" class="form-control" id="ss-cat-new" placeholder="New category name" />' +
        '<button type="button" class="btn btn-secondary" id="ss-cat-add">Add category</button></div>';
    } else if (sub === "metrics") {
      var catFilter = state.adminScoreMetricCat || ((draft.categories[0] && draft.categories[0].id) || "");
      state.adminScoreMetricCat = catFilter;
      var catOpts = (draft.categories || [])
        .map(function (c) {
          return (
            '<option value="' +
            escapeHtml(c.id) +
            '"' +
            (c.id === catFilter ? " selected" : "") +
            ">" +
            escapeHtml(c.name) +
            "</option>"
          );
        })
        .join("");
      var mets = (draft.metrics || []).filter(function (m) {
        return m.categoryId === catFilter;
      });
      var mSum = weightSum(mets);
      panel =
        '<div class="ss-cfg-toolbar">' +
        '<label class="field" style="max-width:280px;margin:0"><span>Category</span>' +
        '<select id="ss-met-cat" class="form-control">' +
        catOpts +
        "</select></label>" +
        '<p class="form-hint mb-0">In-category active weights sum: <strong>' +
        mSum +
        "%</strong>" +
        (mSum !== 100 ? ' <span class="text-danger">— will be normalized</span>' : "") +
        "</p></div>" +
        mets
          .slice()
          .sort(function (a, b) {
            return (a.order || 0) - (b.order || 0);
          })
          .map(function (m) {
            var hib = m.higherIsBetter !== false;
            var useDeduct = metricUsesDayDeductions(m);
            var bands = m.bands || [];
            var bandRows = bands
              .map(function (b, bi) {
                var prevTo = bi === 0 ? null : bands[bi - 1].upTo;
                var fromVal = prevTo == null || prevTo === "" ? 0 : Number(prevTo) + 1;
                var toVal = b.upTo;
                var pts = Number(b.points) || 0;
                var deduct = Math.max(0, Math.round((100 - pts) * 10) / 10);
                if (useDeduct) {
                  return (
                    '<div class="ss-band-row ss-deduct-row">' +
                    '<label class="field"><span>From (days)</span>' +
                    '<input type="number" class="form-control" data-ss-band-from="' +
                    escapeHtml(m.id) +
                    '" data-idx="' +
                    bi +
                    '" value="' +
                    escapeHtml(fromVal) +
                    '" /></label>' +
                    '<label class="field"><span>To (days)</span>' +
                    '<input type="number" class="form-control" data-ss-band-upto="' +
                    escapeHtml(m.id) +
                    '" data-idx="' +
                    bi +
                    '" placeholder="blank = +" value="' +
                    escapeHtml(toVal == null ? "" : toVal) +
                    '" /></label>' +
                    '<label class="field"><span>Points deducted</span>' +
                    '<input type="number" class="form-control" data-ss-band-deduct="' +
                    escapeHtml(m.id) +
                    '" data-idx="' +
                    bi +
                    '" value="' +
                    escapeHtml(deduct) +
                    '" /></label>' +
                    '<label class="field"><span>Score</span><div class="kv-value">' +
                    escapeHtml(pts) +
                    " pts</div></label>" +
                    '<button type="button" class="table-link" data-ss-band-del="' +
                    escapeHtml(m.id) +
                    '" data-idx="' +
                    bi +
                    '">Remove</button></div>'
                  );
                }
                return (
                  '<div class="ss-band-row">' +
                  '<input type="number" class="form-control" data-ss-band-upto="' +
                  escapeHtml(m.id) +
                  '" data-idx="' +
                  bi +
                  '" placeholder="Up to" value="' +
                  escapeHtml(b.upTo == null ? "" : b.upTo) +
                  '" />' +
                  '<input type="number" class="form-control" data-ss-band-pts="' +
                  escapeHtml(m.id) +
                  '" data-idx="' +
                  bi +
                  '" placeholder="Points" value="' +
                  escapeHtml(b.points) +
                  '" />' +
                  '<button type="button" class="table-link" data-ss-band-del="' +
                  escapeHtml(m.id) +
                  '" data-idx="' +
                  bi +
                  '">×</button></div>'
                );
              })
              .join("");
            var linBest = hib ? "inMax" : "inMin";
            var linWorst = hib ? "inMin" : "inMax";
            var ruleInner = "";
            if (m.method === "bands") {
              ruleInner =
                '<div class="ss-metric-rule">' +
                (useDeduct
                  ? "<strong>Days-late deductions</strong> (from 100 points). Blank “To” = that range and above (use for 30+)."
                  : "<strong>Bands</strong> — first matching “up to” wins; blank up-to = otherwise.") +
                bandRows +
                '<button type="button" class="btn btn-ghost btn-sm mt-1" data-ss-band-add="' +
                escapeHtml(m.id) +
                '">' +
                (useDeduct ? "Add day range" : "Add band") +
                "</button></div>";
            } else if (m.method === "linear" || m.method === "inverseLinear") {
              ruleInner =
                '<div class="ss-metric-rule"><div class="form-grid-3">' +
                '<label class="field"><span>' +
                (hib ? "Worst-case raw (0 pts)" : "Best-case raw (full pts)") +
                '</span><input type="number" class="form-control" data-ss-lin="' +
                escapeHtml(m.id) +
                '" data-k="inMin" value="' +
                escapeHtml(m.linear && m.linear.inMin) +
                '" /></label>' +
                '<label class="field"><span>' +
                (hib ? "Best-case raw (full pts)" : "Worst-case raw (0 pts)") +
                '</span><input type="number" class="form-control" data-ss-lin="' +
                escapeHtml(m.id) +
                '" data-k="inMax" value="' +
                escapeHtml(m.linear && m.linear.inMax) +
                '" /></label>' +
                '<label class="field"><span>Points at worst case</span><input type="number" class="form-control" data-ss-lin="' +
                escapeHtml(m.id) +
                '" data-k="outMin" value="' +
                escapeHtml(m.linear && m.linear.outMin) +
                '" /></label>' +
                '<label class="field"><span>Points at best case</span><input type="number" class="form-control" data-ss-lin="' +
                escapeHtml(m.id) +
                '" data-k="outMax" value="' +
                escapeHtml(m.linear && m.linear.outMax) +
                '" /></label></div></div>';
            } else if (m.method === "penaltyCount") {
              ruleInner =
                '<div class="ss-metric-rule"><div class="form-grid-3">' +
                '<label class="field"><span>Points off per item</span><input type="number" class="form-control" data-ss-pen="' +
                escapeHtml(m.id) +
                '" data-k="perItem" value="' +
                escapeHtml(m.penalty && m.penalty.perItem) +
                '" /></label>' +
                '<label class="field"><span>Max penalty</span><input type="number" class="form-control" data-ss-pen="' +
                escapeHtml(m.id) +
                '" data-k="cap" value="' +
                escapeHtml(m.penalty && m.penalty.cap) +
                '" /></label></div></div>';
            }
            return (
              '<div class="ss-metric-card ss-metric-cat-' +
              escapeHtml(m.categoryId || "other") +
              '">' +
              '<div class="ss-metric-card-head">' +
              '<label class="field" style="flex:1;margin:0"><span>Metric name</span>' +
              '<input type="text" class="form-control" data-ss-m-name="' +
              escapeHtml(m.id) +
              '" value="' +
              escapeHtml(m.name) +
              '" /></label>' +
              '<label class="field" style="width:7.5rem;margin:0"><span>Weight %</span>' +
              '<input type="number" class="form-control" data-ss-m-w="' +
              escapeHtml(m.id) +
              '" value="' +
              escapeHtml(m.weight) +
              '" /></label>' +
              '<label class="field" style="width:8rem;margin:0"><span>Active</span>' +
              '<select class="form-control" data-ss-m-on="' +
              escapeHtml(m.id) +
              '"><option value="1"' +
              (m.active !== false ? " selected" : "") +
              ">Active</option><option value='0'" +
              (m.active === false ? " selected" : "") +
              ">Inactive</option></select></label></div>" +
              '<div class="ss-metric-card-body">' +
              '<div class="form-grid-3">' +
              '<label class="field form-span-full"><span>Description</span>' +
              '<input type="text" class="form-control" data-ss-m-desc="' +
              escapeHtml(m.id) +
              '" value="' +
              escapeHtml(m.description) +
              '" /></label>' +
              '<label class="field"><span>Target</span>' +
              '<input type="text" class="form-control" data-ss-m-tgt="' +
              escapeHtml(m.id) +
              '" value="' +
              escapeHtml(m.target) +
              '" /></label>' +
              '<label class="field"><span>Unit</span>' +
              '<input type="text" class="form-control" data-ss-m-unit="' +
              escapeHtml(m.id) +
              '" value="' +
              escapeHtml(m.unit) +
              '" /></label>' +
              '<label class="field"><span>Data source</span>' +
              '<select class="form-control" data-ss-m-src="' +
              escapeHtml(m.id) +
              '">' +
              ["manual", "ncr-count", "ncr-repeat-count", "ncr-avg-days-to-close", "dt-vendor-otd", "dt-vendor-days-late", "ncr-open-count", "vendor-certs-text", "vendor-critical"]
                .map(function (s) {
                  return (
                    '<option value="' +
                    s +
                    '"' +
                    (m.sourceType === s ? " selected" : "") +
                    ">" +
                    sourceTypeLabel(s) +
                    "</option>"
                  );
                })
                .join("") +
              "</select></label>" +
              '<label class="field"><span>Scoring method</span>' +
              '<select class="form-control" data-ss-m-meth="' +
              escapeHtml(m.id) +
              '">' +
              ["bands", "linear", "inverseLinear", "penaltyCount", "boolean", "scale5", "manualPoints"]
                .map(function (s) {
                  return (
                    '<option value="' +
                    s +
                    '"' +
                    (m.method === s ? " selected" : "") +
                    ">" +
                    methodLabel(s) +
                    "</option>"
                  );
                })
                .join("") +
              "</select></label>" +
              '<label class="field"><span>Higher is better</span>' +
              '<select class="form-control" data-ss-m-hib="' +
              escapeHtml(m.id) +
              '"><option value="1"' +
              (hib ? " selected" : "") +
              ">Yes</option><option value='0'" +
              (!hib ? " selected" : "") +
              ">No</option></select></label></div>" +
              '<p class="ss-method-help">' +
              escapeHtml(methodHelpText(m.method, m)) +
              "</p>" +
              ruleInner +
              '<div class="mt-1"><button type="button" class="table-link" data-ss-m-del="' +
              escapeHtml(m.id) +
              '">Remove metric</button></div>' +
              "</div></div>"
            );
          })
          .join("") +
        '<button type="button" class="btn btn-secondary" id="ss-m-add">Add metric to this category</button>';
    } else if (sub === "tiers") {
      panel =
        '<p class="form-hint">Composite 0–100. Ranges should cover 0–100 without overlap.</p>' +
        '<div class="table-wrap"><table class="table"><thead><tr>' +
        "<th>Min</th><th>Max</th><th>Code</th><th>Label</th><th></th></tr></thead><tbody>" +
        (draft.tiers || [])
          .map(function (t) {
            return (
              "<tr>" +
              '<td><input type="number" class="form-control" data-ss-t-min="' +
              escapeHtml(t.id) +
              '" value="' +
              escapeHtml(t.min) +
              '" /></td>' +
              '<td><input type="number" class="form-control" data-ss-t-max="' +
              escapeHtml(t.id) +
              '" value="' +
              escapeHtml(t.max) +
              '" /></td>' +
              '<td><input type="text" class="form-control" data-ss-t-code="' +
              escapeHtml(t.id) +
              '" value="' +
              escapeHtml(t.code) +
              '" /></td>' +
              '<td><input type="text" class="form-control" data-ss-t-label="' +
              escapeHtml(t.id) +
              '" value="' +
              escapeHtml(t.label) +
              '" /></td>' +
              '<td><button type="button" class="table-link" data-ss-t-del="' +
              escapeHtml(t.id) +
              '">Remove</button></td></tr>'
            );
          })
          .join("") +
        "</tbody></table></div>" +
        '<button type="button" class="btn btn-secondary mt-2" id="ss-t-add">Add tier</button>';
    } else if (sub === "nccats") {
      var cats = draft.ncCategories || [];
      panel =
        '<p class="form-hint">These options appear on NCR create/edit as required <strong>Non-Conformance Category</strong>. Existing NCR values are kept if you remove an option later.</p>' +
        '<ul class="master-list">' +
        cats
          .map(function (c, i) {
            return (
              "<li><span>" +
              escapeHtml(c) +
              '</span><button type="button" class="btn btn-sm btn-ghost" data-ss-nccat-del="' +
              i +
              '">Remove</button></li>'
            );
          })
          .join("") +
        "</ul>" +
        '<div class="master-add mt-2">' +
        '<input type="text" class="form-control" id="ss-nccat-new" placeholder="New category" />' +
        '<button type="button" class="btn btn-secondary" id="ss-nccat-add">Add</button></div>';
    } else if (sub === "period") {
      var pt = (draft.period && draft.period.userDefault) || "12m";
      panel =
        '<p class="form-hint">This is only the <strong>default</strong> when a user opens Supplier Score. Users can switch Last 12 months, Last 6 months, Quarterly, or a custom date range on the score screen. Scoring rules and weights stay Admin-only.</p>' +
        '<label class="field" style="max-width:320px"><span>Default time period</span>' +
        '<select id="ss-period-type" class="form-control">' +
        '<option value="12m"' +
        (pt === "12m" ? " selected" : "") +
        ">Last 12 months (annual)</option>" +
        '<option value="6m"' +
        (pt === "6m" ? " selected" : "") +
        ">Last 6 months</option>" +
        '<option value="quarter"' +
        (pt === "quarter" ? " selected" : "") +
        ">Quarterly</option>" +
        "</select></label>";
    } else if (sub === "preview") {
      var preview = state.scorePreview;
      var rows = "";
      if (preview && preview.length) {
        rows = preview
          .map(function (p) {
            return (
              "<tr><td>" +
              escapeHtml(p.vendorName) +
              "</td><td class=\"num-cell\">" +
              formatScore(p.current) +
              "</td><td>" +
              escapeHtml(p.currentTier || "—") +
              '</td><td class="num-cell"><strong>' +
              formatScore(p.preview) +
              "</strong></td><td>" +
              escapeHtml(p.previewTier || "—") +
              "</td></tr>"
            );
          })
          .join("");
      }
      panel =
        '<p class="form-hint">Edits on this page are a <strong>draft</strong> until you publish. Supplier Score keeps showing the last published names, units, and scores until you apply them.</p>' +
        '<div class="btn-group mb-2">' +
        '<button type="button" class="btn btn-secondary" id="ss-preview-run">Run preview</button>' +
        '<button type="button" class="btn btn-primary" id="ss-publish-apply">Publish &amp; apply to Supplier Scores</button>' +
        '<button type="button" class="btn btn-ghost" id="ss-publish">Publish only</button>' +
        '<button type="button" class="btn btn-ghost" id="ss-discard">Discard draft</button></div>' +
        '<div class="table-wrap"><table class="table"><thead><tr>' +
        "<th>Vendor</th><th>Published score</th><th>Published tier</th><th>Draft score</th><th>Draft tier</th>" +
        "</tr></thead><tbody>" +
        (rows || '<tr><td colspan="5" class="table-empty">Run preview to compare existing suppliers.</td></tr>') +
        "</tbody></table></div>";
    } else {
      var log = loadScoreAudit();
      panel =
        '<div class="table-wrap"><table class="table"><thead><tr>' +
        "<th>When</th><th>Who</th><th>Action</th><th>Summary</th></tr></thead><tbody>" +
        (log.length
          ? log
              .map(function (e) {
                return (
                  "<tr><td>" +
                  escapeHtml(formatDateTime(e.at)) +
                  "</td><td>" +
                  escapeHtml(e.by) +
                  "</td><td>" +
                  escapeHtml(e.action) +
                  '</td><td class="wrap-cell">' +
                  escapeHtml(e.summary) +
                  "</td></tr>"
                );
              })
              .join("")
          : '<tr><td colspan="4" class="table-empty">No configuration changes yet.</td></tr>') +
        "</tbody></table></div>";
    }

    host.innerHTML =
      '<div class="flex-between mb-2" style="align-items:center;flex-wrap:wrap;gap:0.5rem">' +
      '<h3 style="margin:0">Supplier scoring configuration</h3>' +
      '<button type="button" class="btn btn-ghost btn-sm" id="ss-close-hub">← Back to Admin</button></div>' +
      '<p class="form-hint">Published v' +
      escapeHtml(pub.version) +
      (pub.publishedAt ? " · " + escapeHtml(formatDateTime(pub.publishedAt)) : "") +
      (dirty ? ' <span class="badge badge-out">Unpublished draft</span>' : ' <span class="badge badge-in">In sync</span>') +
      "</p>" +
      '<div class="tabs" role="tablist">' +
      subBtn("categories", "Categories") +
      subBtn("metrics", "Metrics") +
      subBtn("tiers", "Tiers") +
      subBtn("nccats", "NC categories") +
      subBtn("period", "Default period") +
      subBtn("preview", "Preview / Publish") +
      subBtn("audit", "Audit") +
      "</div>" +
      '<div class="ncr-tab-panel ss-cfg-body">' +
      panel +
      "</div>";

    function findCat(id) {
      var x = null;
      draft.categories.forEach(function (c) {
        if (c.id === id) x = c;
      });
      return x;
    }
    function findMet(id) {
      var x = null;
      draft.metrics.forEach(function (m) {
        if (m.id === id) x = m;
      });
      return x;
    }
    function persist(action, summary) {
      saveScoreConfigDraft(draft);
      if (action) appendScoreAudit(action, summary || "");
      renderAdminScoreConfig(host);
    }

    var closeHub = $("#ss-close-hub", host);
    if (closeHub) {
      closeHub.addEventListener("click", function () {
        state.adminTab = "hub";
        viewAdmin($("#main"));
      });
    }
    $$("[data-ss-sub]", host).forEach(function (b) {
      b.addEventListener("click", function () {
        state.adminScoreSubtab = b.getAttribute("data-ss-sub");
        renderAdminScoreConfig(host);
      });
    });

    $$("[data-ss-cat-name]", host).forEach(function (inp) {
      inp.addEventListener("change", function () {
        var c = findCat(inp.getAttribute("data-ss-cat-name"));
        if (c) c.name = inp.value.trim() || c.name;
        persist("edit-category", "Renamed category");
      });
    });
    $$("[data-ss-cat-w]", host).forEach(function (inp) {
      inp.addEventListener("change", function () {
        var c = findCat(inp.getAttribute("data-ss-cat-w"));
        if (c) c.weight = Number(inp.value) || 0;
        persist("edit-category", "Changed category weight");
      });
    });
    $$("[data-ss-cat-on]", host).forEach(function (inp) {
      inp.addEventListener("change", function () {
        var c = findCat(inp.getAttribute("data-ss-cat-on"));
        if (c) c.active = !!inp.checked;
        persist("edit-category", "Toggled category active");
      });
    });
    $$("[data-ss-cat-up]", host).forEach(function (b) {
      b.addEventListener("click", function () {
        var id = b.getAttribute("data-ss-cat-up");
        var list = draft.categories.slice().sort(function (a, x) {
          return (a.order || 0) - (x.order || 0);
        });
        var i;
        for (i = 1; i < list.length; i++) {
          if (list[i].id === id) {
            var tmp = list[i - 1].order;
            list[i - 1].order = list[i].order;
            list[i].order = tmp;
            break;
          }
        }
        persist("edit-category", "Reordered categories");
      });
    });
    $$("[data-ss-cat-dn]", host).forEach(function (b) {
      b.addEventListener("click", function () {
        var id = b.getAttribute("data-ss-cat-dn");
        var list = draft.categories.slice().sort(function (a, x) {
          return (a.order || 0) - (x.order || 0);
        });
        var i;
        for (i = 0; i < list.length - 1; i++) {
          if (list[i].id === id) {
            var tmp = list[i + 1].order;
            list[i + 1].order = list[i].order;
            list[i].order = tmp;
            break;
          }
        }
        persist("edit-category", "Reordered categories");
      });
    });
    $$("[data-ss-cat-del]", host).forEach(function (b) {
      b.addEventListener("click", function () {
        var id = b.getAttribute("data-ss-cat-del");
        if (!confirm("Remove this category? Its metrics stay in the draft until you delete them.")) return;
        draft.categories = draft.categories.filter(function (c) {
          return c.id !== id;
        });
        persist("edit-category", "Removed category");
      });
    });
    var addCat = $("#ss-cat-add", host);
    if (addCat) {
      addCat.addEventListener("click", function () {
        var name = (($("#ss-cat-new", host) && $("#ss-cat-new", host).value) || "").trim();
        if (!name) return;
        draft.categories.push({
          id: uid("scat"),
          name: name,
          weight: 0,
          active: true,
          order: draft.categories.length + 1,
        });
        persist("edit-category", "Added category " + name);
      });
    }

    var metCat = $("#ss-met-cat", host);
    if (metCat) {
      metCat.addEventListener("change", function () {
        state.adminScoreMetricCat = metCat.value;
        renderAdminScoreConfig(host);
      });
    }
    $$("[data-ss-m-name]", host).forEach(function (el) {
      el.addEventListener("change", function () {
        var m = findMet(el.getAttribute("data-ss-m-name"));
        if (m) m.name = el.value.trim() || m.name;
        persist("edit-metric", "Renamed metric");
      });
    });
    $$("[data-ss-m-desc]", host).forEach(function (el) {
      el.addEventListener("change", function () {
        var m = findMet(el.getAttribute("data-ss-m-desc"));
        if (m) m.description = el.value;
        persist("edit-metric", "Edited metric description");
      });
    });
    $$("[data-ss-m-w]", host).forEach(function (el) {
      el.addEventListener("change", function () {
        var m = findMet(el.getAttribute("data-ss-m-w"));
        if (m) m.weight = Number(el.value) || 0;
        persist("edit-metric", "Changed metric weight");
      });
    });
    $$("[data-ss-m-tgt]", host).forEach(function (el) {
      el.addEventListener("change", function () {
        var m = findMet(el.getAttribute("data-ss-m-tgt"));
        if (m) m.target = el.value;
        persist("edit-metric", "Changed metric target");
      });
    });
    $$("[data-ss-m-unit]", host).forEach(function (el) {
      el.addEventListener("change", function () {
        var m = findMet(el.getAttribute("data-ss-m-unit"));
        if (m) m.unit = el.value;
        persist("edit-metric", "Changed metric unit");
      });
    });
    $$("[data-ss-m-on]", host).forEach(function (el) {
      el.addEventListener("change", function () {
        var m = findMet(el.getAttribute("data-ss-m-on"));
        if (m) m.active = el.value === "1";
        persist("edit-metric", "Toggled metric active");
      });
    });
    $$("[data-ss-m-src]", host).forEach(function (el) {
      el.addEventListener("change", function () {
        var m = findMet(el.getAttribute("data-ss-m-src"));
        if (m) m.sourceType = el.value;
        persist("edit-metric", "Changed metric source");
      });
    });
    $$("[data-ss-m-meth]", host).forEach(function (el) {
      el.addEventListener("change", function () {
        var m = findMet(el.getAttribute("data-ss-m-meth"));
        if (m) m.method = el.value;
        persist("edit-metric", "Changed scoring method");
      });
    });
    $$("[data-ss-m-hib]", host).forEach(function (el) {
      el.addEventListener("change", function () {
        var m = findMet(el.getAttribute("data-ss-m-hib"));
        if (m) m.higherIsBetter = el.value === "1";
        persist("edit-metric", "Changed higher-is-better");
      });
    });
    $$("[data-ss-lin]", host).forEach(function (el) {
      el.addEventListener("change", function () {
        var m = findMet(el.getAttribute("data-ss-lin"));
        if (!m) return;
        if (!m.linear) m.linear = {};
        m.linear[el.getAttribute("data-k")] = Number(el.value);
        persist("edit-metric", "Changed linear rule");
      });
    });
    $$("[data-ss-pen]", host).forEach(function (el) {
      el.addEventListener("change", function () {
        var m = findMet(el.getAttribute("data-ss-pen"));
        if (!m) return;
        if (!m.penalty) m.penalty = {};
        m.penalty[el.getAttribute("data-k")] = Number(el.value);
        persist("edit-metric", "Changed penalty rule");
      });
    });
    $$("[data-ss-band-upto]", host).forEach(function (el) {
      el.addEventListener("change", function () {
        var m = findMet(el.getAttribute("data-ss-band-upto"));
        var idx = parseInt(el.getAttribute("data-idx"), 10);
        if (!m || !m.bands[idx]) return;
        m.bands[idx].upTo = el.value === "" ? null : Number(el.value);
        persist("edit-metric", "Changed band");
      });
    });
    $$("[data-ss-band-pts]", host).forEach(function (el) {
      el.addEventListener("change", function () {
        var m = findMet(el.getAttribute("data-ss-band-pts"));
        var idx = parseInt(el.getAttribute("data-idx"), 10);
        if (!m || !m.bands[idx]) return;
        m.bands[idx].points = Number(el.value) || 0;
        persist("edit-metric", "Changed band points");
      });
    });
    $$("[data-ss-band-deduct]", host).forEach(function (el) {
      el.addEventListener("change", function () {
        var m = findMet(el.getAttribute("data-ss-band-deduct"));
        var idx = parseInt(el.getAttribute("data-idx"), 10);
        if (!m || !m.bands[idx]) return;
        var deduct = Number(el.value);
        if (!isFinite(deduct)) deduct = 0;
        if (deduct < 0) deduct = 0;
        if (deduct > 100) deduct = 100;
        m.bands[idx].points = Math.round((100 - deduct) * 10) / 10;
        persist("edit-metric", "Changed days-late deduction");
      });
    });
    $$("[data-ss-band-add]", host).forEach(function (b) {
      b.addEventListener("click", function () {
        var m = findMet(b.getAttribute("data-ss-band-add"));
        if (!m) return;
        if (!m.bands) m.bands = [];
        m.bands.push({ upTo: null, points: 0 });
        persist("edit-metric", "Added band");
      });
    });
    $$("[data-ss-band-del]", host).forEach(function (b) {
      b.addEventListener("click", function () {
        var m = findMet(b.getAttribute("data-ss-band-del"));
        var idx = parseInt(b.getAttribute("data-idx"), 10);
        if (!m) return;
        m.bands.splice(idx, 1);
        persist("edit-metric", "Removed band");
      });
    });
    $$("[data-ss-m-del]", host).forEach(function (b) {
      b.addEventListener("click", function () {
        var id = b.getAttribute("data-ss-m-del");
        if (!confirm("Remove this metric?")) return;
        draft.metrics = draft.metrics.filter(function (m) {
          return m.id !== id;
        });
        persist("edit-metric", "Removed metric");
      });
    });
    var addM = $("#ss-m-add", host);
    if (addM) {
      addM.addEventListener("click", function () {
        var catId = state.adminScoreMetricCat || (draft.categories[0] && draft.categories[0].id) || "";
        draft.metrics.push({
          id: uid("smet"),
          categoryId: catId,
          name: "New metric",
          description: "",
          active: true,
          order: draft.metrics.length + 1,
          weight: 10,
          sourceType: "manual",
          inputKind: "scale5",
          method: "scale5",
          higherIsBetter: true,
          target: "",
          unit: "1–5",
          bands: [],
          linear: { inMin: 80, inMax: 100, outMin: 0, outMax: 100 },
          penalty: { perItem: 10, cap: 40 },
        });
        persist("edit-metric", "Added metric");
      });
    }

    $$("[data-ss-t-min]", host).forEach(function (el) {
      el.addEventListener("change", function () {
        draft.tiers.forEach(function (t) {
          if (t.id === el.getAttribute("data-ss-t-min")) t.min = Number(el.value);
        });
        persist("edit-tiers", "Changed tier min");
      });
    });
    $$("[data-ss-t-max]", host).forEach(function (el) {
      el.addEventListener("change", function () {
        draft.tiers.forEach(function (t) {
          if (t.id === el.getAttribute("data-ss-t-max")) t.max = Number(el.value);
        });
        persist("edit-tiers", "Changed tier max");
      });
    });
    $$("[data-ss-t-code]", host).forEach(function (el) {
      el.addEventListener("change", function () {
        draft.tiers.forEach(function (t) {
          if (t.id === el.getAttribute("data-ss-t-code")) t.code = el.value.trim() || t.code;
        });
        persist("edit-tiers", "Changed tier code");
      });
    });
    $$("[data-ss-t-label]", host).forEach(function (el) {
      el.addEventListener("change", function () {
        draft.tiers.forEach(function (t) {
          if (t.id === el.getAttribute("data-ss-t-label")) t.label = el.value.trim() || t.label;
        });
        persist("edit-tiers", "Changed tier label");
      });
    });
    $$("[data-ss-t-del]", host).forEach(function (b) {
      b.addEventListener("click", function () {
        var id = b.getAttribute("data-ss-t-del");
        draft.tiers = draft.tiers.filter(function (t) {
          return t.id !== id;
        });
        persist("edit-tiers", "Removed tier");
      });
    });
    var addT = $("#ss-t-add", host);
    if (addT) {
      addT.addEventListener("click", function () {
        draft.tiers.push({ id: uid("tier"), min: 0, max: 0, code: "new", label: "New tier" });
        persist("edit-tiers", "Added tier");
      });
    }
    var perSel = $("#ss-period-type", host);
    if (perSel) {
      perSel.addEventListener("change", function () {
        if (!draft.period) draft.period = {};
        draft.period.userDefault = perSel.value;
        draft.period.type = perSel.value === "quarter" ? "quarterly" : perSel.value === "6m" ? "rolling6" : "rolling12";
        persist("edit-period", "Set default period to " + perSel.value);
      });
    }
    var addNc = $("#ss-nccat-add", host);
    if (addNc) {
      addNc.addEventListener("click", function () {
        var v = (($("#ss-nccat-new", host) && $("#ss-nccat-new", host).value) || "").trim();
        if (!v) return;
        if (!draft.ncCategories) draft.ncCategories = [];
        if (draft.ncCategories.indexOf(v) !== -1) {
          toast("Already in list", "error");
          return;
        }
        draft.ncCategories.push(v);
        persist("edit-nc-category", "Added NC category " + v);
      });
    }
    $$("[data-ss-nccat-del]", host).forEach(function (b) {
      b.addEventListener("click", function () {
        var idx = parseInt(b.getAttribute("data-ss-nccat-del"), 10);
        if (!draft.ncCategories) return;
        var name = draft.ncCategories[idx];
        draft.ncCategories.splice(idx, 1);
        persist("edit-nc-category", "Removed NC category " + (name || ""));
      });
    });
    var runPrev = $("#ss-preview-run", host);
    if (runPrev) {
      runPrev.addEventListener("click", function () {
        var period = resolveScoreUserPeriod(state.scoreUserPeriod);
        state.scorePreview = loadVendors().map(function (v) {
          var live = latestScoreForVendor(v.id);
          var prev = evaluateVendorPeriod(v, period, draft, { commit: false, keepOverrides: true });
          return {
            vendorName: v.name,
            current: live ? live.composite : null,
            currentTier: live ? live.tierLabel : "—",
            preview: prev.composite,
            previewTier: prev.tierLabel,
          };
        });
        toast("Preview calculated (not published)");
        renderAdminScoreConfig(host);
      });
    }
    var pubBtn = $("#ss-publish", host);
    if (pubBtn) {
      pubBtn.addEventListener("click", function () {
        if (!confirm("Publish this scoring configuration? Existing supplier snapshots stay until you apply/recalculate.")) return;
        publishScoreConfig(draft);
        toast("Published. Open Supplier Score and click Refresh scores, or use Publish & apply.");
        state.scorePreview = null;
        renderAdminScoreConfig(host);
      });
    }
    var applyBtn = $("#ss-publish-apply", host);
    if (applyBtn) {
      applyBtn.addEventListener("click", function () {
        if (
          !confirm(
            "Publish this configuration and recalculate every supplier for the current score period? Older periods stay frozen."
          )
        ) {
          return;
        }
        publishScoreConfig(draft);
        var result = applyPublishedConfigToCurrentScores();
        toast(
          "Published v" +
            result.cfg.version +
            " and updated " +
            result.count +
            " supplier score(s) for " +
            result.period.key
        );
        state.scorePreview = null;
        renderAdminScoreConfig(host);
      });
    }
    var disc = $("#ss-discard", host);
    if (disc) {
      disc.addEventListener("click", function () {
        if (!confirm("Discard draft and reload the published configuration?")) return;
        saveScoreConfigDraft(loadPublishedScoreConfig());
        appendScoreAudit("discard", "Discarded scoring draft");
        state.scorePreview = null;
        toast("Draft discarded");
        renderAdminScoreConfig(host);
      });
    }
  }

  function viewSupplierScoreList(main) {
    setBreadcrumbs([
      { label: "Home", nav: "home" },
      { label: "Supplier Score" },
    ]);
    var cfg = loadPublishedScoreConfig();
    var period = resolveScoreUserPeriod(state.scoreUserPeriod);
    var f = state.scoreFilter || {};
    var vendors = loadVendors();
    var rowsData = vendors.map(function (v) {
      var snap = getScoreSnapshot(v.id, period.key) || latestScoreForVendor(v.id);
      return { vendor: v, snap: snap };
    });
    rowsData = rowsData.filter(function (row) {
      if (f.tier && (!row.snap || row.snap.tierCode !== f.tier)) return false;
      if (f.q) {
        var hay = (row.vendor.name + " " + (row.vendor.location || "")).toLowerCase();
        if (hay.indexOf(String(f.q).toLowerCase()) === -1) return false;
      }
      return true;
    });
    rowsData.sort(function (a, b) {
      var as = a.snap && a.snap.composite != null ? a.snap.composite : -1;
      var bs = b.snap && b.snap.composite != null ? b.snap.composite : -1;
      return bs - as;
    });
    var pageInfo = paginateList(rowsData, state.scorePage);
    state.scorePage = pageInfo.page;
    var pager = renderListPager(pageInfo);
    var tierOpts =
      '<option value="">All tiers</option>' +
      (cfg.tiers || [])
        .map(function (t) {
          return (
            '<option value="' +
            escapeHtml(t.code) +
            '"' +
            (f.tier === t.code ? " selected" : "") +
            ">" +
            escapeHtml(t.label) +
            "</option>"
          );
        })
        .join("");

    var catHeads = (cfg.categories || [])
      .filter(function (c) {
        return c.active !== false;
      })
      .sort(function (a, b) {
        return (a.order || 0) - (b.order || 0);
      });

    var rows = pageInfo.items
      .map(function (row) {
        var v = row.vendor;
        var s = row.snap;
        var catCells = catHeads
          .map(function (c) {
            var cs = null;
            if (s && s.categoryScores) {
              s.categoryScores.forEach(function (x) {
                if (x.categoryId === c.id) cs = x.score;
              });
            }
            return '<td class="num-cell">' + formatScore(cs) + "</td>";
          })
          .join("");
        return (
          '<tr class="row-clickable" data-ss-vendor="' +
          escapeHtml(v.id) +
          '">' +
          '<td class="wrap-cell"><strong>' +
          escapeHtml(v.name || "—") +
          "</strong></td>" +
          '<td class="wrap-cell">' +
          escapeHtml(v.location || "—") +
          "</td>" +
          '<td class="num-cell ss-score-cell">' +
          (s && s.composite != null ? "<strong>" + formatScore(s.composite) + "</strong>" : "—") +
          "</td>" +
          "<td>" +
          (s
            ? '<span class="badge ' +
              scoreTierBadgeClass(s.tierCode) +
              '">' +
              escapeHtml(s.tierLabel) +
              "</span>"
            : "—") +
          "</td>" +
          "<td class=\"mono\">" +
          escapeHtml(s && s.periodKey ? s.periodKey : "—") +
          "</td>" +
          catCells +
          "</tr>"
        );
      })
      .join("");

    main.innerHTML =
      '<div class="page-header"><div><h1 class="page-title">Supplier Score</h1>' +
      '<p class="page-subtitle">Composite 0–100 from published scoring v' +
      escapeHtml(cfg.version) +
      " · period <strong>" +
      escapeHtml(period.key) +
      "</strong> (" +
      escapeHtml(period.start) +
      " → " +
      escapeHtml(period.end) +
      ")</p></div>" +
      '<div class="btn-group">' +
      '<button type="button" class="btn btn-primary" id="ss-eval-all">Refresh scores from Admin config</button>' +
      '<button type="button" class="btn btn-ghost" data-nav="vendors">Vendors</button>' +
      "</div></div>" +
      renderScorePeriodBar() +
      '<div class="panel search-panel"><div class="panel-body"><div class="form-grid-3">' +
      '<label class="field"><span>Search</span><input type="text" id="ss-f-q" class="form-control" value="' +
      escapeHtml(f.q || "") +
      '" placeholder="Vendor name" /></label>' +
      '<label class="field"><span>Tier</span><select id="ss-f-tier" class="form-control">' +
      tierOpts +
      "</select></label></div>" +
      '<div class="search-actions"><button type="button" class="btn btn-primary" id="ss-search">Search</button></div></div></div>' +
      '<div class="results-bar"><span>' +
      pageInfo.total +
      " supplier(s)</span></div>" +
      pager +
      '<div class="table-wrap table-wrap-wide"><table class="table table-results"><thead><tr>' +
      "<th>Vendor</th><th>Location</th><th>Score</th><th>Tier</th><th>Period</th>" +
      catHeads
        .map(function (c) {
          return "<th>" + escapeHtml(c.name) + "</th>";
        })
        .join("") +
      "</tr></thead><tbody>" +
      (rows ||
        '<tr><td colspan="' +
          (5 + catHeads.length) +
          '" class="table-empty">No vendors yet. Add vendors first, then evaluate the period.</td></tr>') +
      "</tbody></table></div>" +
      pager;

    $$("[data-nav]", main).forEach(function (b) {
      b.addEventListener("click", function () {
        navigate(b.getAttribute("data-nav"));
      });
    });
    bindScorePeriodBar(main, function () {
      viewSupplierScoreList(main);
    });
    var searchBtn = $("#ss-search", main);
    if (searchBtn) {
      searchBtn.addEventListener("click", function () {
        state.scorePage = 1;
        state.scoreFilter = {
          q: ($("#ss-f-q", main).value || "").trim(),
          tier: ($("#ss-f-tier", main) && $("#ss-f-tier", main).value) || "",
        };
        viewSupplierScoreList(main);
      });
    }
    var evalBtn = $("#ss-eval-all", main);
    if (evalBtn) {
      evalBtn.addEventListener("click", function () {
        evaluateAllVendors(cfg, period, { commit: true, keepOverrides: true });
        toast("Evaluated " + vendors.length + " supplier(s) for " + period.key);
        viewSupplierScoreList(main);
      });
    }
    bindListPager(main, function (p) {
      state.scorePage = p;
      viewSupplierScoreList(main);
      window.scrollTo(0, 0);
    });
    $$("[data-ss-vendor]", main).forEach(function (row) {
      row.addEventListener("click", function () {
        navigate("supplier-score-detail", { vendorId: row.getAttribute("data-ss-vendor") });
      });
    });
  }

  function viewSupplierScoreDetail(main) {
    var vendorId = state.params.vendorId || state.params.id || "";
    var vendor = getVendor(vendorId);
    if (!vendor) {
      loadVendors().forEach(function (v) {
        if (String(v.id) === String(vendorId)) vendor = v;
      });
    }
    if (!vendor) {
      setBreadcrumbs([
        { label: "Home", nav: "home" },
        { label: "Supplier Score", nav: "supplier-score" },
        { label: "Not found" },
      ]);
      main.innerHTML =
        '<div class="empty-state"><h3>Vendor not found</h3>' +
        '<button type="button" class="btn btn-primary" data-nav="supplier-score">Back</button></div>';
      $$("[data-nav]", main).forEach(function (b) {
        b.addEventListener("click", function () {
          navigate(b.getAttribute("data-nav"));
        });
      });
      return;
    }

    var cfg = loadPublishedScoreConfig();
    var period = resolveScoreUserPeriod(state.scoreUserPeriod);

    var snap = getScoreSnapshot(vendor.id, period.key);
    if (!snap) snap = evaluateVendorPeriod(vendor, period, cfg, { commit: true, keepOverrides: true });

    var history = scoresForVendor(vendor.id);
    var expand = state.scoreExpandCat;

    setBreadcrumbs([
      { label: "Home", nav: "home" },
      { label: "Supplier Score", nav: "supplier-score" },
      { label: vendor.name },
    ]);

    var trend = history
      .slice(-12)
      .map(function (h) {
        var hgt = h.composite != null ? Math.max(8, h.composite) : 8;
        return (
          '<div class="ss-bar" title="' +
          escapeHtml(h.periodKey) +
          ": " +
          formatScore(h.composite) +
          '"><span style="height:' +
          hgt +
          '%"></span><em>' +
          escapeHtml(h.periodKey) +
          "</em></div>"
        );
      })
      .join("");

    var catRows = (snap.categoryScores || [])
      .map(function (c) {
        var open = expand === c.categoryId;
        var mets = (snap.metricScores || []).filter(function (m) {
          return m.categoryId === c.categoryId;
        });
        var metricHtml = open
          ? mets
              .map(function (m) {
                var input =
                  m.sourceType === "manual"
                    ? '<input type="text" class="form-control" data-ss-raw="' +
                      escapeHtml(m.metricId) +
                      '" value="' +
                      escapeHtml(m.rawValue == null ? "" : m.rawValue) +
                      '" />'
                    : escapeHtml(m.rawLabel);
                return (
                  "<tr>" +
                  '<td class="wrap-cell">' +
                  escapeHtml((publishedMetricById(m.metricId, cfg) || {}).name || m.name) +
                  (m.overridden ? ' <span class="badge badge-info">Override</span>' : "") +
                  "</td>" +
                  "<td>" +
                  escapeHtml(sourceTypeLabel((publishedMetricById(m.metricId, cfg) || {}).sourceType || m.sourceType)) +
                  "</td>" +
                  "<td>" +
                  input +
                  (((publishedMetricById(m.metricId, cfg) || {}).unit || m.unit)
                    ? ' <span class="text-muted">' +
                      escapeHtml((publishedMetricById(m.metricId, cfg) || {}).unit || m.unit) +
                      "</span>"
                    : "") +
                  "</td>" +
                  '<td class="num-cell">' +
                  formatScore(m.points) +
                  "</td>" +
                  '<td class="num-cell">' +
                  escapeHtml(m.weight) +
                  "%</td></tr>"
                );
              })
              .join("")
          : "";
        return (
          '<tr class="row-clickable" data-ss-expand="' +
          escapeHtml(c.categoryId) +
          '">' +
          "<td><strong>" +
          escapeHtml((publishedCategoryById(c.categoryId, cfg) || {}).name || c.name) +
          "</strong> " +
          (open ? "▾" : "▸") +
          "</td>" +
          '<td class="num-cell">' +
          escapeHtml(c.weight) +
          "%</td>" +
          '<td class="num-cell"><strong>' +
          formatScore(c.score) +
          "</strong></td></tr>" +
          (open
            ? '<tr class="ss-drill"><td colspan="3"><table class="table"><thead><tr>' +
              "<th>Metric</th><th>Source</th><th>Raw</th><th>Points</th><th>Wt</th></tr></thead><tbody>" +
              (metricHtml || '<tr><td colspan="5" class="table-empty">No metrics</td></tr>') +
              "</tbody></table>" +
              '<button type="button" class="btn btn-secondary btn-sm mt-1" id="ss-save-raw">Save metric values / recalc</button>' +
              "</td></tr>"
            : "")
        );
      })
      .join("");

    main.innerHTML =
      '<div class="page-header page-header-compact"><div><h1 class="page-title">' +
      escapeHtml(vendor.name) +
      " " +
      '<span class="ss-composite">' +
      formatScore(snap.composite) +
      '</span> <span class="badge ' +
      scoreTierBadgeClass(snap.tierCode) +
      '">' +
      escapeHtml(snap.tierLabel) +
      "</span></h1>" +
      '<p class="page-subtitle">' +
      escapeHtml(vendor.location || "") +
      " · showing published config v" +
      escapeHtml(cfg.version) +
      (String(snap.configVersion) !== String(cfg.version)
        ? ' · <span class="text-danger">this snapshot is v' +
          escapeHtml(snap.configVersion) +
          " — click Recalc to apply Admin changes</span>"
        : "") +
      "</p></div>" +
      '<div class="btn-group">' +
      '<button type="button" class="btn btn-ghost btn-sm" data-nav="vendors-detail?id=' +
      encodeURIComponent(vendor.id) +
      '">Vendor record</button>' +
      '<button type="button" class="btn btn-ghost btn-sm" data-nav="supplier-score">All scores</button>' +
      '<button type="button" class="btn btn-secondary btn-sm" id="ss-recalc">Recalc this period</button>' +
      "</div></div>" +
      renderScorePeriodBar() +
      '<div class="panel mb-2"><div class="panel-header"><h2 class="panel-title">Trend (saved periods)</h2></div>' +
      '<div class="panel-body"><div class="ss-trend">' +
      (trend || '<p class="form-hint">No history yet.</p>') +
      "</div></div></div>" +
      '<div class="panel mb-2"><div class="panel-header"><h2 class="panel-title">Category breakdown</h2></div>' +
      '<div class="table-wrap"><table class="table"><thead><tr>' +
      "<th>Category</th><th>Weight</th><th>Score</th></tr></thead><tbody>" +
      (catRows || '<tr><td colspan="3" class="table-empty">No categories</td></tr>') +
      "</tbody></table></div></div>" +
      '<div class="panel"><div class="panel-header"><h2 class="panel-title">Comments &amp; improvement plan</h2></div>' +
      '<div class="panel-body">' +
      '<label class="field form-span-full"><span>Comments</span>' +
      '<textarea id="ss-comments" class="form-control" rows="3">' +
      escapeHtml(snap.comments || "") +
      "</textarea></label>" +
      '<label class="field form-span-full mt-2"><span>Improvement plan' +
      (snap.tierCode === "conditional" || snap.tierCode === "probation" ? " (required for this tier)" : "") +
      "</span>" +
      '<textarea id="ss-plan" class="form-control" rows="4">' +
      escapeHtml(snap.improvementPlan || "") +
      "</textarea></label>" +
      '<button type="button" class="btn btn-primary mt-2" id="ss-save-notes">Save notes</button>' +
      "</div></div>";

    $$("[data-nav]", main).forEach(function (b) {
      b.addEventListener("click", function () {
        navigate(b.getAttribute("data-nav"));
      });
    });
    bindScorePeriodBar(main, function () {
      viewSupplierScoreDetail(main);
    });
    $$("[data-ss-expand]", main).forEach(function (row) {
      row.addEventListener("click", function () {
        var id = row.getAttribute("data-ss-expand");
        state.scoreExpandCat = state.scoreExpandCat === id ? null : id;
        viewSupplierScoreDetail(main);
      });
    });
    var recalc = $("#ss-recalc", main);
    if (recalc) {
      recalc.addEventListener("click", function () {
        evaluateVendorPeriod(vendor, period, cfg, { commit: true, keepOverrides: true });
        toast("Recalculated " + period.key);
        viewSupplierScoreDetail(main);
      });
    }
    var saveRaw = $("#ss-save-raw", main);
    if (saveRaw) {
      saveRaw.addEventListener("click", function () {
        $$("[data-ss-raw]", main).forEach(function (inp) {
          var mid = inp.getAttribute("data-ss-raw");
          (snap.metricScores || []).forEach(function (m) {
            if (m.metricId !== mid) return;
            var val = inp.value.trim();
            m.rawValue = val === "" ? null : isNaN(Number(val)) ? val : Number(val);
            m.overridden = true;
            m.overrideBy = state.adminAuthed ? ADMIN_USER : "user";
            m.overrideAt = nowISO();
            m.overrideMode = "raw";
            m.points = scoreMethodToPoints(
              (cfg.metrics || []).filter(function (x) {
                return x.id === mid;
              })[0] || { method: m.method },
              m.rawValue
            );
          });
        });
        /* rebuild category/composite from overridden metric points */
        var fakeVendorSnap = snap;
        (snap.categoryScores || []).forEach(function (c) {
          var mets = (snap.metricScores || []).filter(function (m) {
            return m.categoryId === c.categoryId;
          });
          var sumW = 0;
          mets.forEach(function (m) {
            sumW += Number(m.weight) || 0;
          });
          var pts = 0;
          mets.forEach(function (m) {
            var w = sumW ? (Number(m.weight) || 0) / sumW : 0;
            if (m.points != null) pts += m.points * w;
          });
          c.score = mets.length ? clampScore(pts) : null;
        });
        var catW = 0;
        (snap.categoryScores || []).forEach(function (c) {
          catW += Number(c.weight) || 0;
        });
        var comp = 0;
        (snap.categoryScores || []).forEach(function (c) {
          if (c.score == null) return;
          comp += c.score * (catW ? (Number(c.weight) || 0) / catW : 0);
        });
        snap.composite = clampScore(comp);
        var tier = tierForScore(cfg, snap.composite);
        snap.tierCode = tier.code;
        snap.tierLabel = tier.label;
        upsertScoreSnapshot(snap);
        toast("Metric values saved");
        viewSupplierScoreDetail(main);
      });
    }
    var saveNotes = $("#ss-save-notes", main);
    if (saveNotes) {
      saveNotes.addEventListener("click", function () {
        snap.comments = ($("#ss-comments", main) && $("#ss-comments", main).value) || "";
        snap.improvementPlan = ($("#ss-plan", main) && $("#ss-plan", main).value) || "";
        if ((snap.tierCode === "conditional" || snap.tierCode === "probation") && !String(snap.improvementPlan).trim()) {
          toast("Improvement plan is required for this tier", "error");
          return;
        }
        upsertScoreSnapshot(snap);
        toast("Notes saved");
      });
    }
  }

  function renderAdminMasters(host, focusKey) {
    var m = loadMasters();
    var titles = {
      categories: "Master Categories",
      connections: "Connection Types",
      locations: "Locations",
      descriptions: "Descriptions",
      customers: "Customers",
    };
    var keys = focusKey && titles[focusKey]
      ? [focusKey]
      : ["categories", "connections", "locations", "descriptions", "customers"];
    var heading = focusKey && titles[focusKey]
      ? titles[focusKey]
      : "Master lists";
    var descCat =
      state.adminDescCategory ||
      (m.categories && m.categories[0]) ||
      "Drill Pipe";
    if (m.categories && m.categories.indexOf(descCat) === -1) {
      descCat = m.categories[0] || descCat;
    }
    state.adminDescCategory = descCat;
    var descItems = getDescriptionsForCategory(descCat);

    host.innerHTML =
      '<div class="flex-between mb-2" style="align-items:center;flex-wrap:wrap;gap:0.5rem">' +
      "<h3 style=\"margin:0\">" +
      escapeHtml(heading) +
      "</h3>" +
      '<div class="btn-group">' +
      (focusKey
        ? '<button type="button" class="btn btn-ghost btn-sm" id="ml-show-all">All master lists</button>'
        : "") +
      '<button type="button" class="btn btn-ghost btn-sm" id="ml-close-hub">← Back to Admin</button>' +
      "</div></div>" +
      keys
        .map(function (key) {
          if (key === "descriptions") return descriptionsBlock();
          return masterBlock(key, titles[key], m[key] || []);
        })
        .join("");

    function masterBlock(key, title, items) {
      return (
        '<div class="panel mb-2" id="ml-panel-' +
        key +
        '"><div class="panel-header"><h2 class="panel-title">' +
        escapeHtml(title) +
        '</h2></div><div class="panel-body" style="padding-top:0.5rem">' +
        '<ul class="master-list" id="ml-' +
        key +
        '">' +
        items
          .map(function (item, i) {
            return (
              "<li><span>" +
              escapeHtml(item) +
              '</span><button type="button" class="btn btn-sm btn-ghost" data-ml="' +
              key +
              '" data-idx="' +
              i +
              '">Remove</button></li>'
            );
          })
          .join("") +
        "</ul>" +
        '<div class="master-add">' +
        '<input type="text" class="form-control" id="ml-add-' +
        key +
        '" placeholder="' +
        (key === "customers" ? "New customer" : "New value") +
        '" />' +
        '<button type="button" class="btn btn-secondary" data-ml-add="' +
        key +
        '">Add</button>' +
        "</div></div></div>"
      );
    }

    function descriptionsBlock() {
      var catOpts = (m.categories || [])
        .map(function (c) {
          return (
            '<option value="' +
            escapeHtml(c) +
            '"' +
            (c === descCat ? " selected" : "") +
            ">" +
            escapeHtml(c) +
            " (" +
            getDescriptionsForCategory(c).length +
            ")</option>"
          );
        })
        .join("");
      return (
        '<div class="panel mb-2" id="ml-panel-descriptions">' +
        '<div class="panel-header"><h2 class="panel-title">Descriptions by master category</h2></div>' +
        '<div class="panel-body" style="padding-top:0.5rem">' +
        '<p class="form-hint mb-2">Each description belongs to one master category. On a serial, choose the category first — only that category&rsquo;s descriptions appear.</p>' +
        '<label class="field mb-2"><span>Master category</span>' +
        '<select id="ml-desc-category" class="form-control">' +
        catOpts +
        "</select></label>" +
        '<ul class="master-list" id="ml-descriptions">' +
        (descItems.length
          ? descItems
              .map(function (item, i) {
                return (
                  "<li><span>" +
                  escapeHtml(item) +
                  '</span><button type="button" class="btn btn-sm btn-ghost" data-ml-desc-rm="' +
                  i +
                  '">Remove</button></li>'
                );
              })
              .join("")
          : '<li class="text-muted"><span>No descriptions for ' +
            escapeHtml(descCat) +
            " yet</span></li>") +
        "</ul>" +
        '<div class="master-add">' +
        '<input type="text" class="form-control" id="ml-add-descriptions" placeholder="New description for ' +
        escapeHtml(descCat) +
        '" />' +
        '<button type="button" class="btn btn-secondary" id="ml-add-desc-btn">Add</button>' +
        "</div></div></div>"
      );
    }

    var closeHub = $("#ml-close-hub", host);
    if (closeHub) {
      closeHub.addEventListener("click", function () {
        state.adminTab = "hub";
        state.adminMasterKey = null;
        viewAdmin($("#main"));
      });
    }
    var showAll = $("#ml-show-all", host);
    if (showAll) {
      showAll.addEventListener("click", function () {
        state.adminMasterKey = null;
        renderAdminMasters(host, null);
      });
    }

    var descCatSel = $("#ml-desc-category", host);
    if (descCatSel) {
      descCatSel.addEventListener("change", function () {
        state.adminDescCategory = descCatSel.value;
        renderAdminMasters(host, focusKey || null);
      });
    }
    var addDescBtn = $("#ml-add-desc-btn", host);
    if (addDescBtn) {
      addDescBtn.addEventListener("click", function () {
        var input = $("#ml-add-descriptions", host);
        var v = (input && input.value ? input.value : "").trim();
        if (!v) return;
        var masters = loadMasters();
        if (!masters.descriptionsByCategory) masters.descriptionsByCategory = {};
        if (!masters.descriptionsByCategory[descCat]) masters.descriptionsByCategory[descCat] = [];
        if (masters.descriptionsByCategory[descCat].indexOf(v) !== -1) {
          toast("Already in list for " + descCat, "error");
          return;
        }
        masters.descriptionsByCategory[descCat].push(v);
        saveMasters(masters);
        renderAdminMasters(host, focusKey || null);
      });
    }
    $$("[data-ml-desc-rm]", host).forEach(function (b) {
      b.addEventListener("click", function () {
        var idx = parseInt(b.getAttribute("data-ml-desc-rm"), 10);
        var masters = loadMasters();
        if (!masters.descriptionsByCategory || !masters.descriptionsByCategory[descCat]) return;
        masters.descriptionsByCategory[descCat].splice(idx, 1);
        saveMasters(masters);
        renderAdminMasters(host, focusKey || null);
      });
    });

    $$("[data-ml]", host).forEach(function (b) {
      b.addEventListener("click", function () {
        var key = b.getAttribute("data-ml");
        var idx = parseInt(b.getAttribute("data-idx"), 10);
        var masters = loadMasters();
        if (!Array.isArray(masters[key])) masters[key] = [];
        masters[key].splice(idx, 1);
        /* keep description map keys when a category is removed */
        if (key === "categories") {
          /* leave descriptions for removed cats so they can be reattached if category re-added */
        }
        saveMasters(masters);
        renderAdminMasters(host, focusKey || null);
      });
    });
    $$("[data-ml-add]", host).forEach(function (b) {
      b.addEventListener("click", function () {
        var key = b.getAttribute("data-ml-add");
        var input = $("#ml-add-" + key, host);
        var v = (input.value || "").trim();
        if (!v) return;
        var masters = loadMasters();
        if (!Array.isArray(masters[key])) masters[key] = [];
        if (masters[key].indexOf(v) !== -1) {
          toast("Already in list", "error");
          return;
        }
        masters[key].push(v);
        if (key === "categories") {
          if (!masters.descriptionsByCategory) masters.descriptionsByCategory = {};
          if (!masters.descriptionsByCategory[v]) masters.descriptionsByCategory[v] = [];
        }
        saveMasters(masters);
        renderAdminMasters(host, focusKey || null);
      });
    });
  }

  function renderAdminUsersRoles(host) {
    host.innerHTML =
      '<div class="flex-between mb-2" style="align-items:center;flex-wrap:wrap;gap:0.5rem">' +
      '<h3 style="margin:0">Users &amp; Roles</h3>' +
      '<button type="button" class="btn btn-ghost btn-sm" id="users-close-hub">← Back to Admin</button>' +
      "</div>" +
      '<p class="text-muted mb-2">Local demo auth. Full provisioning can be wired to a server later.</p>' +
      '<div class="admin-grid mb-2">' +
      '<div class="admin-card">' +
      "<h3>Users</h3>" +
      '<div class="table-wrap"><table class="table table-compact"><thead><tr>' +
      "<th>Username</th><th>Display name</th><th>Role</th><th>Status</th>" +
      "</tr></thead><tbody>" +
      "<tr><td class=\"mono\">admin</td><td>System Admin</td><td>Administrator</td>" +
      '<td><span class="badge badge-in">Active</span></td></tr>' +
      "</tbody></table></div>" +
      '<p class="admin-card-meta" style="margin-top:0.75rem">Demo login: admin / admin123</p>' +
      "</div>" +
      '<div class="admin-card">' +
      "<h3>Roles</h3>" +
      "<ul class=\"master-list\">" +
      "<li><span><strong>Administrator</strong> — full backend access</span></li>" +
      "<li><span><strong>Inventory</strong> — assets, ELs, DTs</span></li>" +
      "<li><span><strong>Read only</strong> — view catalogs only</span></li>" +
      "</ul>" +
      '<p class="admin-card-meta" style="margin-top:0.75rem">Role matrix editing — coming soon</p>' +
      "</div>" +
      "</div>";

    var closeHub = $("#users-close-hub", host);
    if (closeHub) {
      closeHub.addEventListener("click", function () {
        state.adminTab = "hub";
        viewAdmin($("#main"));
      });
    }
  }

  function renderAdminDocs(host) {
    seedDocsNcrIfNeeded();
    var docs = storageGet(KEYS.docs, []);
    host.innerHTML =
      "<h3>Document modules</h3>" +
      '<p class="text-muted">Basic upload stores metadata in localStorage (no real file server).</p>' +
      '<div class="doc-modules mb-2">' +
      DOC_MODULES.map(function (m) {
        return (
          '<div class="doc-module-card"><h4>' +
          escapeHtml(m.name) +
          "</h4><p>" +
          escapeHtml(m.desc) +
          "</p></div>"
        );
      }).join("") +
      "</div>" +
      '<div class="panel panel-muted mb-2"><div class="panel-body">' +
      '<div class="form-grid-2">' +
      '<label class="field"><span>Title</span><input type="text" id="doc-title" class="form-control" /></label>' +
      '<label class="field"><span>Module</span><select id="doc-module">' +
      DOC_MODULES.map(function (m) {
        return '<option value="' + escapeHtml(m.id) + '">' + escapeHtml(m.name) + "</option>";
      }).join("") +
      "</select></label>" +
      '<label class="field"><span>Revision</span><input type="text" id="doc-rev" class="form-control" value="A" /></label>' +
      '<label class="field"><span>File (optional)</span><input type="file" id="doc-file" class="form-control" /></label>' +
      "</div>" +
      '<button type="button" class="btn btn-primary mt-2" id="doc-add">Add document</button>' +
      "</div></div>" +
      '<div class="table-wrap"><table class="table table-compact"><thead><tr>' +
      "<th>Title</th><th>Module</th><th>Rev</th><th>Date</th><th>File</th><th></th>" +
      "</tr></thead><tbody>" +
      docs
        .map(function (d) {
          return (
            "<tr><td>" +
            escapeHtml(d.title) +
            "</td><td>" +
            escapeHtml(d.module) +
            "</td><td>" +
            escapeHtml(d.rev) +
            "</td><td>" +
            escapeHtml(formatDate(d.date)) +
            "</td><td>" +
            escapeHtml(d.fileName || "-") +
            '</td><td><button type="button" class="btn btn-sm btn-ghost" data-doc-del="' +
            escapeHtml(d.id) +
            '">Remove</button></td></tr>'
          );
        })
        .join("") +
      "</tbody></table></div>";

    $("#doc-add", host).addEventListener("click", function () {
      var title = ($("#doc-title", host).value || "").trim();
      if (!title) {
        toast("Title required", "error");
        return;
      }
      var fileInput = $("#doc-file", host);
      var fileName = fileInput.files && fileInput.files[0] ? fileInput.files[0].name : "";
      var list = storageGet(KEYS.docs, []);
      list.push({
        id: uid("doc"),
        title: title,
        module: $("#doc-module", host).value,
        rev: ($("#doc-rev", host).value || "A").trim(),
        date: todayISO(),
        status: "Active",
        fileName: fileName,
      });
      storageSet(KEYS.docs, list);
      toast("Document added");
      renderAdminDocs(host);
    });
    $$("[data-doc-del]", host).forEach(function (b) {
      b.addEventListener("click", function () {
        var id = b.getAttribute("data-doc-del");
        var list = storageGet(KEYS.docs, []).filter(function (d) {
          return d.id !== id;
        });
        storageSet(KEYS.docs, list);
        renderAdminDocs(host);
      });
    });
  }

  /* ========================================================================
   * Admin modal
   * ======================================================================== */
  function openAdminModal() {
    var modal = $("#admin-modal");
    if (!modal) return;
    modal.hidden = false;
    var err = $("#admin-error");
    if (err) err.hidden = true;
    var form = $("#admin-form");
    if (form) form.reset();
    var u = form && form.querySelector('[name="username"]');
    if (u) setTimeout(function () {
      u.focus();
    }, 50);
  }

  function closeAdminModal() {
    var modal = $("#admin-modal");
    if (modal) modal.hidden = true;
  }

  function bindAdminModal() {
    var modal = $("#admin-modal");
    if (!modal) return;
    $("#admin-modal-close").addEventListener("click", closeAdminModal);
    $("#admin-cancel").addEventListener("click", closeAdminModal);
    modal.addEventListener("click", function (e) {
      if (e.target === modal) closeAdminModal();
    });
    $("#admin-form").addEventListener("submit", function (e) {
      e.preventDefault();
      var fd = new FormData(e.target);
      var user = String(fd.get("username") || "").trim();
      var pass = String(fd.get("password") || "");
      if (user === ADMIN_USER && pass === ADMIN_PASS) {
        state.adminAuthed = true;
        closeAdminModal();
        toast("Admin signed in");
        navigate("admin");
      } else {
        var err = $("#admin-error");
        if (err) err.hidden = false;
      }
    });
  }

  /* ========================================================================
   * Clock & chrome bindings
   * ======================================================================== */
  function updateClock() {
    var el = $("#clock");
    if (!el) return;
    var d = new Date();
    el.textContent = d.toLocaleString();
  }

  function bindChrome() {
    $("#btn-home").addEventListener("click", function () {
      navigate("home");
    });
    $("#btn-theme").addEventListener("click", toggleTheme);
    $("#btn-admin").addEventListener("click", function () {
      if (state.adminAuthed) navigate("admin");
      else openAdminModal();
    });
    bindAdminModal();
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeAdminModal();
    });
  }

  /* ========================================================================
   * Init
   * ======================================================================== */
  function init() {
    try {
      importRecoveredDataIfNeeded(false);
    } catch (e) {
      console.error("[AtraOps] import recovered failed", e);
    }
    var theme = storageGet(KEYS.theme, "dark");
    if (typeof theme === "string") theme = theme.replace(/^"|"$/g, "");
    applyTheme(theme || "dark");
    seedEquipmentIfNeeded();
    try {
      repairInvalidVendorDtsWhileSerialOut();
    } catch (eRep) {}
    try {
      ensureUtilReferenceRentHistory();
    } catch (eUtil) {
      console.error("[AtraOps] util rent history seed failed", eUtil);
    }
    seedJobsIfNeeded();
    seedDocsNcrIfNeeded();
    bindChrome();
    setInterval(updateClock, 30000);
    updateClock();
    navigate("home");
    try {
      var elCount = (storageGet(KEYS.equipmentLists, []) || []).length;
      var asCount = (storageGet(KEYS.assets, []) || []).length;
      var footer = $("#clock");
      if (footer) {
        /* keep clock; toast once */
      }
      if (elCount || asCount) {
        toast("Loaded " + elCount + " equipment list(s), " + asCount + " asset(s)", "success");
      }
    } catch (e2) {}
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  /* expose for debugging */
  window.AtraOps = {
    navigate: navigate,
    loadPublishedScoreConfig: loadPublishedScoreConfig,
    evaluateAllVendors: evaluateAllVendors,
    findCardexRecord: findCardexRecord,
    getCardexCatalog: getCardexCatalog,
    loadAssets: loadAssets,
    loadEquipmentLists: loadEquipmentLists,
    loadDts: loadDts,
    loadJobs: loadJobs,
    getJob: getJob,
    getElsForJob: getElsForJob,
    reconcileSerialBillingStatus: reconcileSerialBillingStatus,
    getSerialOpenRentContext: getSerialOpenRentContext,
    isSerialOnRentForEl: isSerialOnRentForEl,
    loadNcrs: loadNcrs,
    getNcr: getNcr,
    emptyAssetRecord: emptyAssetRecord,
    importRecoveredDataIfNeeded: importRecoveredDataIfNeeded,
    reimportRecovered: function () {
      try { localStorage.removeItem(KEYS.migrated); } catch (e) {}
      importRecoveredDataIfNeeded(true);
      seedEquipmentIfNeeded();
      navigate("home");
      toast("Recovered data re-imported", "success");
    },
  };
})();
