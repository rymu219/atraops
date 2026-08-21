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
    receivingReports: PREFIX + "receiving-reports-v1",
    rrSeq: PREFIX + "rr-seq",
    docs: PREFIX + "docs-v1",
    ncrs: PREFIX + "ncrs-v1",
    cardexHistory: PREFIX + "cardex-history-v1",
    locations: PREFIX + "locations",
    categories: PREFIX + "master-categories",
    connections: PREFIX + "connection-types",
    descriptions: PREFIX + "descriptions",
    descriptionsByCategory: PREFIX + "descriptions-by-category",
    rackBin: PREFIX + "rack-bin",
    assetDocs: PREFIX + "asset-docs",
    migrated: PREFIX + "migrated-v4",
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
    { id: "cardex", title: "Inventory", desc: "Serial lookup, location & category search, asset details", route: "cardex", icon: "▣" },
    { id: "tickets", title: "Tickets", desc: "Delivery tickets and receiving tickets / reports", route: "tickets", icon: "☰" },
    { id: "equipment", title: "Equipment List", desc: "Rental orders, serials, well transfer, DTs", route: "equipment", icon: "⚙" },
    { id: "documents", title: "Documents", desc: "Controlled document library (demo)", route: "documents", icon: "📄" },
    { id: "ncr", title: "NCR", desc: "Non-conformance reports (demo)", route: "ncr", icon: "⚠" },
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
    ticketsFilter: {},
    ticketsResults: null,
    ticketsMode: "hub", /* hub | delivery | receiving */
    elFilter: { status: "Open" },
    elResults: null,
    elTab: "header",
    elDraft: null,
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
            onRent: s.onRent != null ? !!s.onRent : !!(s.status === "Out" || ln.onRentAt),
            onRentAt: s.onRentAt || ln.onRentAt || ln.onRentDate || "",
            lastDtId: s.lastDtId || ln.lastDtId || "",
          };
        }
        return {
          serial: String(s || ""),
          location: "",
          onRent: !!(ln.onRentAt || ln.lastDtId),
          onRentAt: ln.onRentAt || ln.onRentDate || "",
          lastDtId: ln.lastDtId || "",
        };
      });
    } else if (typeof ln.serials === "string" && ln.serials.trim()) {
      serials = ln.serials.split(/[,;\n]+/).map(function (s) {
        return {
          serial: s.trim(),
          location: "",
          onRent: !!(ln.onRentAt || ln.lastDtId),
          onRentAt: ln.onRentAt || ln.onRentDate || "",
          lastDtId: ln.lastDtId || "",
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
    var lines = (d.lines || []).map(function (ln) {
      var serial = ln.serial || "";
      if (!serial && ln.serials) serial = typeof ln.serials === "string" ? ln.serials : (ln.serials[0] && (ln.serials[0].serial || ln.serials[0])) || "";
      if (!serial && ln.assets && ln.assets[0]) serial = ln.assets[0].serial || "";
      return {
        itemNo: ln.itemNo != null ? String(ln.itemNo) : "",
        serial: serial,
        description: ln.description || (ln.assets && ln.assets[0] && ln.assets[0].description) || "",
        uom: ln.uom || "EA",
        qty: ln.qty != null ? ln.qty : 1,
        unitPrice: ln.unitPrice || ln.minAmt || "",
        amount: ln.amount || ln.minAmt || "",
        minDays: ln.minDays || "",
        minAmt: ln.minAmt || "",
        addAmt: ln.addAmt || "",
      };
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
        description: (dln && dln.description) || "",
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
      };
    }
    /* merge dedicated keys from recovered app */
    var locs = storageGet(KEYS.locations, null);
    var cats = storageGet(KEYS.categories, null);
    var conns = storageGet(KEYS.connections, null);
    var descs = storageGet(KEYS.descriptions, null);
    if (Array.isArray(locs) && locs.length) m.locations = uniqStrings((m.locations || []).concat(locs));
    if (Array.isArray(cats) && cats.length) m.categories = uniqStrings((m.categories || []).concat(cats));
    if (Array.isArray(conns) && conns.length) m.connections = uniqStrings((m.connections || []).concat(conns));
    if (Array.isArray(descs) && descs.length) m.descriptions = uniqStrings((m.descriptions || []).concat(descs));
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

  function appendCardexHistory(serial, event, detail) {
    var all = storageGet(KEYS.cardexHistory, {});
    var key = String(serial).toUpperCase();
    if (!all[key]) all[key] = [];
    all[key].unshift({
      date: new Date().toISOString(),
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
    } catch (e) {}
    seq += 1;
    if (seq < 51000) seq = 51000;
    storageSet(KEYS.jobSeq, seq);
    return String(seq);
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

    if (Array.isArray(lists) && lists.length) {
      storageSet(KEYS.equipmentLists, lists.map(normalizeEquipmentList));
    }
    if (Array.isArray(dts) && dts.length) {
      storageSet(KEYS.equipmentDts, dts.map(normalizeDt).filter(Boolean));
    }
    if (Array.isArray(assets) && assets.length) {
      storageSet(KEYS.assets, assets.map(normalizeAsset));
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
    var lists = storageGet(KEYS.equipmentLists, []);
    if (lists && lists.length) {
      storageSet(KEYS.equipmentLists, lists.map(normalizeEquipmentList));
    }
    var dts = storageGet(KEYS.equipmentDts, []);
    if (dts && dts.length) {
      storageSet(KEYS.equipmentDts, dts.map(normalizeDt).filter(Boolean));
    }
    var assets = storageGet(KEYS.assets, null) || storageGet(KEYS.assetsLegacy, []);
    if (assets && assets.length) {
      storageSet(KEYS.assets, assets.map(normalizeAsset));
    }
    enforceOneElPerSerial();
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
      upsertAsset(rec);
    }
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
   * DT shows on an EL only if it was created from that EL.
   * Primary: EL.dtLedger (written by Create DT). Never infer from serial ownership.
   */
  function dtBelongsToEl(d, el) {
    if (!d || !el) return false;
    var ledger = elDtLedgerIdSet(el);
    var no = formatDtNo(d.dtNo || d.id);
    if (Object.keys(ledger).length > 0) {
      return !!(
        ledger[String(d.id || "")] ||
        ledger[String(d.dtNo || "")] ||
        ledger[no]
      );
    }
    /* Empty ledger: only match permanent create-time field (never remapped elId alone) */
    if (d.createdOnElId != null && d.createdOnElId !== "") {
      return (
        String(d.createdOnElId) === String(el.id) ||
        String(d.createdOnElId) === String(el.elNo)
      );
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

  /** Open print dialog (Save as PDF) via hidden iframe — works on file:// */
  function printHtmlDocument(title, bodyInnerHtml) {
    var html =
      "<!DOCTYPE html><html><head><meta charset=\"utf-8\"><title>" +
      escapeHtml(title) +
      "</title><style>" +
      "body{font-family:Segoe UI,Arial,sans-serif;color:#111;margin:24px;font-size:12px;background:#fff}" +
      "h1{font-size:18px;margin:0 0 4px} .sub{color:#555;margin:0 0 16px}" +
      "table{width:100%;border-collapse:collapse;margin-top:12px}" +
      "th,td{border:1px solid #ccc;padding:6px 8px;text-align:left;vertical-align:top}" +
      "th{background:#f3f3f3}" +
      ".meta{display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px 16px;margin-bottom:12px}" +
      ".meta span{display:block;color:#666;font-size:10px;text-transform:uppercase;letter-spacing:.03em}" +
      ".meta strong{font-size:12px;font-weight:600}" +
      ".total{text-align:right;margin-top:10px;font-weight:700;font-size:13px}" +
      "@media print{body{margin:12mm}}" +
      "</style></head><body>" +
      bodyInnerHtml +
      "</body></html>";
    try {
      var prev = document.getElementById("atraops-print-frame");
      if (prev && prev.parentNode) prev.parentNode.removeChild(prev);
      var iframe = document.createElement("iframe");
      iframe.id = "atraops-print-frame";
      iframe.setAttribute("aria-hidden", "true");
      iframe.style.cssText =
        "position:fixed;right:0;bottom:0;width:0;height:0;border:0;opacity:0;pointer-events:none";
      document.body.appendChild(iframe);
      var idoc = iframe.contentDocument || (iframe.contentWindow && iframe.contentWindow.document);
      if (!idoc) throw new Error("No print frame document");
      idoc.open();
      idoc.write(html);
      idoc.close();
      var win = iframe.contentWindow;
      setTimeout(function () {
        try {
          if (win) {
            win.focus();
            win.print();
          }
        } catch (e2) {
          toast("Print failed — try another browser", "error");
        }
      }, 200);
      toast("Print dialog opened — choose Save as PDF if needed");
    } catch (e) {
      toast("Could not open print: " + (e && e.message ? e.message : e), "error");
    }
  }

  /**
   * Asset history from DTs (Out) and RRs (In) for a serial.
   * Columns: Ticket, Date, Ship To, Ship From, Out, In
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
      /* DT Out: from store → to Customer · Rig */
      var shipTo = formatCustomerRig(resolveCustomer(dt, el), resolveRig(dt, el));
      var shipFrom = resolveStore(el, asset, dt) || "—";
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
      /* RR In: from Customer · Rig → to store */
      var shipTo = resolveStore(el, asset, dt) || "—";
      var shipFrom = formatCustomerRig(
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
        { id: "NCR-1001", title: "Thread damage on pin end", serial: "789012", status: "Open", severity: "Minor", date: "2026-03-01", owner: "QA Desk" },
        { id: "NCR-1002", title: "Missing hardband segment", serial: "DP-3344", status: "Closed", severity: "Major", date: "2026-01-18", owner: "Yard Lead" },
        { id: "NCR-1003", title: "OD wear beyond tolerance", serial: "HW-4401", status: "In Review", severity: "Minor", date: "2026-04-05", owner: "Inspection" },
      ]);
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

  function navigate(route, params) {
    if (!route) route = "home";
    var parts = String(route).split("?");
    var name = parts[0];
    var p = params ? deepClone(params) : {};
    if (parts[1]) {
      parts[1].split("&").forEach(function (pair) {
        var kv = pair.split("=");
        if (kv[0]) p[decodeURIComponent(kv[0])] = decodeURIComponent(kv[1] || "");
      });
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
    cardex: viewCardex,
    "cardex-results": viewCardexResults,
    "cardex-details": viewCardexDetails,
    "cardex-history": viewCardexHistory,
    "cardex-docs": viewCardexDocs,
    tickets: viewTickets,
    "tickets-delivery": viewTicketsDelivery,
    "tickets-receiving": viewTicketsReceiving,
    "tickets-results": viewTicketsResults,
    "tickets-receive": viewTicketsReceive,
    "tickets-rr": viewReceivingReport,
    equipment: viewEquipmentSearch,
    "equipment-new": viewEquipmentNew,
    "equipment-order": viewEquipmentOrder,
    "equipment-dt": viewEquipmentDt,
    documents: viewDocuments,
    ncr: viewNcr,
    admin: viewAdmin,
    "admin-serials": viewAdminSerials,
    "admin-serial-detail": viewAdminSerialDetail,
    "admin-serial-doc": viewAdminSerialDoc,
  };

  function render() {
    var main = $("#main");
    if (!main) return;
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
          '<button type="button" class="module-card" data-module-id="' +
          escapeHtml(m.id) +
          '" data-route="' +
          escapeHtml(m.route) +
          '">' +
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
      '<h1 class="page-title home-title">Modules</h1>' +
      "</div>" +
      '<div class="modules-grid" id="modules-grid">' +
      cards +
      "</div>";

    $$(".module-card", main).forEach(function (card) {
      card.removeAttribute("draggable");
      card.addEventListener("click", function () {
        navigate(card.getAttribute("data-route"));
      });
    });
  }

  function bindHomeDrag(main) {
    var grid = $("#modules-grid", main);
    if (!grid) return;
    var dragId = null;

    $$(".module-card", grid).forEach(function (card) {
      card.addEventListener("dragstart", function (e) {
        dragId = card.getAttribute("data-module-id");
        card.classList.add("dragging");
        e.dataTransfer.effectAllowed = "move";
        try {
          e.dataTransfer.setData("text/plain", dragId);
        } catch (err) {}
      });
      card.addEventListener("dragend", function () {
        card.classList.remove("dragging");
        $$(".module-card", grid).forEach(function (c) {
          c.classList.remove("drag-over");
        });
        dragId = null;
      });
      card.addEventListener("dragover", function (e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        card.classList.add("drag-over");
      });
      card.addEventListener("dragleave", function () {
        card.classList.remove("drag-over");
      });
      card.addEventListener("drop", function (e) {
        e.preventDefault();
        card.classList.remove("drag-over");
        var from = dragId || e.dataTransfer.getData("text/plain");
        var to = card.getAttribute("data-module-id");
        if (!from || !to || from === to) return;
        var order = getHomeOrder();
        var fi = order.indexOf(from);
        var ti = order.indexOf(to);
        if (fi < 0 || ti < 0) return;
        order.splice(fi, 1);
        order.splice(ti, 0, from);
        saveHomeOrder(order);
        viewHome(main);
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
      '<nav class="cardex-subnav" aria-label="Inventory links">' +
      '<button type="button" class="cardex-subnav-link" data-nav="home">Home</button>' +
      '<span class="cardex-subnav-sep">|</span>' +
      '<button type="button" class="cardex-subnav-link" id="cardex-link-util" title="Coming soon">Daily Utilization</button>' +
      "</nav></div>" +
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

    var util = $("#cardex-link-util", main);
    if (util) {
      util.addEventListener("click", function () {
        toast("Daily Utilization — not built yet", "info");
      });
    }

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
      "<th>Date</th>" +
      "<th>Ship To</th>" +
      "<th>Ship From</th>" +
      "<th>Out</th>" +
      "<th>In</th>" +
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
                escapeHtml(h.shipTo || "—") +
                "</td>" +
                '<td class="wrap-cell">' +
                escapeHtml(h.shipFrom || "—") +
                "</td>" +
                '<td class="num-cell">' +
                escapeHtml(h.out || "") +
                "</td>" +
                '<td class="num-cell">' +
                escapeHtml(h.in || "") +
                "</td>" +
                "</tr>"
              );
            })
            .join("")
        : '<tr><td colspan="6" class="table-empty">No DT or RR history for this serial yet.</td></tr>') +
      "</tbody></table></div>" +
      '<p class="form-hint mt-2">Ticket = DT or RR with number. Ship To / Ship From use <strong>Customer and Rig</strong> (or store) — never Well. <strong>Out</strong> = DT qty/UOM; <strong>In</strong> = RR qty/UOM.</p>';

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
    setBreadcrumbs([
      { label: "Home", nav: "home" },
      { label: "Tickets" },
    ]);
    state.ticketsMode = "hub";
    var openCount = 0;
    var recvReady = 0;
    loadDts().forEach(function (d) {
      refreshDtReceiveStatus(d);
      if (!dtIsFullyReceived(d)) {
        openCount += 1;
        recvReady += 1;
      }
    });

    main.innerHTML =
      '<div class="page-header"><div><h1 class="page-title">Tickets</h1>' +
      '<p class="page-subtitle">Choose Delivery Tickets or Receiving Tickets</p></div></div>' +
      '<div class="admin-grid tickets-hub-grid">' +
      '<button type="button" class="admin-card admin-card-featured tickets-hub-card" data-nav="tickets-delivery">' +
      "<h3>Delivery Tickets</h3>" +
      "<p>Search and open delivery tickets by EL / order, customer, or ship date. Print with or without pricing.</p>" +
      '<div class="admin-card-meta">' +
      openCount +
      " open DT(s) awaiting full receive</div>" +
      '<span class="doc-module-open-cta">Open Delivery Tickets →</span></button>' +
      '<button type="button" class="admin-card admin-card-featured tickets-hub-card" data-nav="tickets-receiving">' +
      "<h3>Receiving Tickets</h3>" +
      "<p>Receive tools back In — all tools or selected tools. Search open and closed DTs.</p>" +
      '<div class="admin-card-meta">' +
      recvReady +
      " DT(s) with outstanding tools</div>" +
      '<span class="doc-module-open-cta">Open Receiving Tickets →</span></button>' +
      "</div>";

    $$("[data-nav]", main).forEach(function (b) {
      b.addEventListener("click", function () {
        navigate(b.getAttribute("data-nav"));
      });
    });
  }

  function renderTicketsSearchForm(main, mode) {
    var isRecv = mode === "receiving";
    var f = state.ticketsFilter || {};
    var title = isRecv ? "Receiving Tickets" : "Delivery Tickets";
    var sub = isRecv
      ? "Search open or closed DTs. Receive all tools or selected tools — DT stays open until everything is received. Receiving reports (RR#) only appear on the EL after you receive tools."
      : "Search DTs by EL / order number, customer, or ship date range.";

    setBreadcrumbs([
      { label: "Home", nav: "home" },
      { label: "Tickets", nav: "tickets" },
      { label: title },
    ]);

    main.innerHTML =
      '<div class="page-header"><div><h1 class="page-title">' +
      title +
      "</h1>" +
      '<p class="page-subtitle">' +
      sub +
      "</p></div>" +
      '<button type="button" class="btn btn-ghost" data-nav="tickets">← Tickets</button></div>' +
      '<div class="panel search-panel"><div class="panel-body">' +
      '<div class="form-grid-3">' +
      '<label class="field"><span>EL / Order No</span>' +
      '<input type="text" id="tk-order" class="form-control" value="' +
      escapeHtml(f.orderNo || "") +
      '" placeholder="RO-2026-0841 or EL-…" /></label>' +
      '<label class="field"><span>Customer</span>' +
      '<input type="text" id="tk-customer" class="form-control" value="' +
      escapeHtml(f.customer || "") +
      '" placeholder="Customer name" /></label>' +
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
      (isRecv
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
        : "") +
      "</div>" +
      '<div class="search-actions">' +
      '<button type="button" class="btn btn-primary" id="tk-search">Search</button>' +
      '<button type="button" class="btn btn-ghost" id="tk-clear">Clear</button>' +
      '<button type="button" class="btn btn-secondary" id="tk-all">Show all</button>' +
      "</div></div></div>";

    $$("[data-nav]", main).forEach(function (b) {
      b.addEventListener("click", function () {
        navigate(b.getAttribute("data-nav"));
      });
    });

    function runSearch(showAll) {
      var orderNo = ($("#tk-order", main).value || "").trim().toLowerCase();
      var customer = ($("#tk-customer", main).value || "").trim().toLowerCase();
      var dtNo = ($("#tk-dtno", main).value || "").trim().toLowerCase();
      var from = $("#tk-from", main).value;
      var to = $("#tk-to", main).value;
      var statusEl = $("#tk-status", main);
      var status = statusEl ? statusEl.value : isRecv ? "open" : "all";
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
        if (!showAll) {
          if (orderNo) {
            var hay = ((d.orderNo || "") + " " + (d.elNo || "") + " " + (d.elId || "")).toLowerCase();
            if (hay.indexOf(orderNo) === -1) return false;
          }
          if (customer && String(d.customer || d.company || "").toLowerCase().indexOf(customer) === -1) {
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
      navigate("tickets-results");
    }

    $("#tk-search", main).addEventListener("click", function () {
      runSearch(false);
    });
    $("#tk-all", main).addEventListener("click", function () {
      runSearch(true);
    });
    $("#tk-clear", main).addEventListener("click", function () {
      state.ticketsFilter = {};
      if (isRecv) viewTicketsReceiving(main);
      else viewTicketsDelivery(main);
    });
  }

  function viewTicketsDelivery(main) {
    state.ticketsMode = "delivery";
    renderTicketsSearchForm(main, "delivery");
  }

  function viewTicketsReceiving(main) {
    state.ticketsMode = "receiving";
    /* ensure phantom RRs are gone before search UI loads */
    migrateReceivingReportsClean();
    renderTicketsSearchForm(main, "receiving");
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
    var backNav = isRecv ? "tickets-receiving" : "tickets-delivery";
    /* Results are always delivery tickets — never receiving-report records */
    var results = (state.ticketsResults || []).filter(function (d) {
      if (!d || typeof d !== "object") return false;
      if (d.rrLabel != null && d.rrNo != null && !d.dtNo && !d.lines) return false;
      return true;
    });
    state.ticketsResults = results;
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
      '<p class="page-subtitle">' +
      results.length +
      (isRecv
        ? " result(s) — select a row to receive tools"
        : " delivery ticket(s)") +
      "</p></div>" +
      '<div class="btn-group">' +
      '<button type="button" class="btn btn-ghost" data-nav="' +
      backNav +
      '">New search</button>' +
      '<button type="button" class="btn btn-ghost" data-nav="tickets">Tickets hub</button>' +
      "</div></div>" +
      '<div class="table-wrap"><table class="table"><thead><tr>' +
      "<th>DT No</th><th>Ship Date</th><th>Receive status</th><th>EL Order No</th><th>Customer</th><th>Well</th><th>Job No</th>" +
      (isRecv ? "<th></th>" : "") +
      "</tr></thead><tbody>" +
      (results.length
        ? results
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
          (isRecv ? "8" : "7") +
          '" class="table-empty">' +
          (isRecv ? "No tickets match your filters." : "No delivery tickets match your filters.") +
          "</td></tr>") +
      "</tbody></table></div>";

    $$("[data-nav]", main).forEach(function (b) {
      b.addEventListener("click", function () {
        navigate(b.getAttribute("data-nav"));
      });
    });
    $$("[data-dt-row]", main).forEach(function (row) {
      row.addEventListener("click", function (e) {
        if (e.target.closest && (e.target.closest("[data-el]") || e.target.closest("[data-recv]"))) {
          return;
        }
        var id = row.getAttribute("data-dt-row");
        if (isRecv) navigate("tickets-receive", { id: id });
        else navigate("equipment-dt", { id: id });
      });
    });
    $$("[data-recv]", main).forEach(function (b) {
      b.addEventListener("click", function (e) {
        e.stopPropagation();
        navigate("tickets-receive", { id: b.getAttribute("data-recv") });
      });
    });
    $$("[data-el]", main).forEach(function (b) {
      b.addEventListener("click", function (e) {
        e.stopPropagation();
        navigate("equipment-order", { id: b.getAttribute("data-el") });
      });
    });
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
      '<button type="button" class="btn btn-ghost" data-nav="tickets-receiving">← Receiving search</button>' +
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
      { label: rr ? "RR " + rr.rrLabel : "RR" },
    ]);
    if (!rr) {
      main.innerHTML =
        '<div class="empty-state"><h3>Receiving report not found</h3>' +
        '<button type="button" class="btn btn-primary" data-nav="tickets">Back</button></div>';
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
      '<button type="button" class="btn btn-ghost" data-nav="tickets">Tickets</button>' +
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
      '<button type="button" class="btn btn-ghost" id="el-clear">Clear</button>' +
      "</div></div></div>" +
      '<div id="el-results-host"></div>';

    function doSearch() {
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

    $("#el-search", main).addEventListener("click", doSearch);
    $("#el-clear", main).addEventListener("click", function () {
      state.elFilter = { status: "Open" };
      state.elResults = null;
      viewEquipmentSearch(main);
    });
    $$("[data-nav]", main).forEach(function (b) {
      b.addEventListener("click", function () {
        navigate(b.getAttribute("data-nav"));
      });
    });

    /* auto-run with current filter */
    doSearch();
  }

  function renderElResults(host, list) {
    if (!host) return;
    host.innerHTML =
      '<div class="results-bar"><span>' +
      list.length +
      " EL(s)</span></div>" +
      '<div class="table-wrap"><table class="table"><thead><tr>' +
      "<th>EL No</th><th>Status</th><th>Company</th><th>Well</th><th>Rig</th><th>Job No</th><th>Sales</th><th>Location</th><th>Created</th>" +
      "</tr></thead><tbody>" +
      (list.length
        ? list
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
                escapeHtml(el.jobNo || "—") +
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
      "</tbody></table></div>";

    $$("tr[data-el]", host).forEach(function (row) {
      row.addEventListener("click", function () {
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
  }

  /* ========================================================================
   * EQUIPMENT — new / order
   * ======================================================================== */
  function viewEquipmentNew(main) {
    var el = emptyEquipmentList();
    el.elNo = nextElNo();
    el.id = el.elNo;
    el.jobNo = nextJobNo();
    el.orderNo = el.elNo; /* legacy sync for older DT/RR fields */
    el.createdAt = nowISO();
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
      escapeHtml(el.jobNo || "—") +
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
    function cell(label, val) {
      return (
        "<div class=\"el-ro-cell\"><span class=\"kv-label\">" +
        escapeHtml(label) +
        '</span><div class="kv-value">' +
        escapeHtml(val || "—") +
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
      cell("Job No", el.jobNo) +
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
        var block = getSerialDtBlock(s.serial, s);
        var onRent = block.blocked;
        if (!onRent) availableCount += 1;
        /* Status flag after serial: ON RENT (same style) OR IN STORENAME when location flagged */
        var statusFlag = "";
        if (onRent) {
          statusFlag = ' <span class="on-rent-badge">ON RENT</span>';
        } else if (mismatch && assetLoc) {
          statusFlag =
            ' <span class="on-rent-badge in-store-badge">IN ' +
            escapeHtml(String(assetLoc).toUpperCase()) +
            "</span>";
        } else if (mismatch) {
          statusFlag = " ⚠";
        }
        return (
          '<button type="button" class="chip chip-serial' +
          (mismatch ? " chip-mismatch" : "") +
          (onRent ? " chip-on-rent" : "") +
          '" data-serial="' +
          escapeHtml(s.serial) +
          '" title="' +
          escapeHtml(
            (mismatch
              ? "Location mismatch: serial is IN " +
                String(assetLoc).toUpperCase() +
                " — EL header store is " +
                headerLoc +
                ". "
              : "") +
              (onRent
                ? "Cannot DT again — already Out / on rent" + block.via
                : "Available for DT")
          ) +
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
    var checkTitle = noDtAvailable
      ? "All serials on this line are already Out / on rent — cannot DT again"
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
   * Serial cannot go on a new DT if already Out / on rent (no double charge).
   * Returns { blocked: bool, reason: string, via: string }
   */
  function getSerialDtBlock(serial, sObj) {
    var sn = String(serial || (sObj && sObj.serial) || "").trim();
    if (!sn) return { blocked: true, reason: "empty", via: "" };
    if (sObj && sObj.onRent) {
      return {
        blocked: true,
        reason: "on_rent",
        via: sObj.lastDtId ? " already on rent via " + sObj.lastDtId : " already on rent",
      };
    }
    var asset = findCardexRecord(sn);
    if (asset && String(asset.status || "").toLowerCase() === "out") {
      return {
        blocked: true,
        reason: "out",
        via: asset.lastDeliveryTicket
          ? " inventory Out (last DT " + asset.lastDeliveryTicket + ")"
          : " inventory status Out",
      };
    }
    return { blocked: false, reason: "", via: "" };
  }

  function isSerialBlockedForDt(serial, sObj) {
    return getSerialDtBlock(serial, sObj).blocked;
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
        var block = getSerialDtBlock(s.serial, s);
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
        description: ln.description,
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
          escapeHtml(ln.description || "—") +
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

    var extraHdr = [
      ["DT No", dtLabel],
      ["Receive status", recvLabel],
    ];
    if (fullyRecv) extraHdr.push(["Fully received", formatDate(dt.completedAt)]);

    main.innerHTML =
      '<div class="dt-sheet">' +
      '<div class="dt-sheet-header">' +
      "<div><h1 class=\"page-title mono\">DT-" +
      escapeHtml(dtLabel) +
      "</h1>" +
      '<p class="page-subtitle">Delivery Ticket · same header as EL ' +
      escapeHtml(hdr.orderNo || hdr.elNo || "—") +
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
      '<span class="text-muted" style="font-size:0.75rem">From equipment list</span></div>' +
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
        return (
          "<tr>" +
          "<td>" +
          escapeHtml(ln.itemNo || String(i + 1)) +
          "</td>" +
          "<td>" +
          escapeHtml(ln.serial || "") +
          "</td>" +
          "<td>" +
          escapeHtml(ln.description || "") +
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
    printHtmlDocument(title, body);
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
        return (
          "<tr><td>" +
          escapeHtml(ln.serial || "") +
          "</td><td>" +
          escapeHtml(ln.description || "") +
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
    printHtmlDocument(title, body);
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
   * Documents & NCR
   * ======================================================================== */
  function viewDocuments(main) {
    seedDocsNcrIfNeeded();
    setBreadcrumbs([
      { label: "Home", nav: "home" },
      { label: "Documents" },
    ]);
    var docs = storageGet(KEYS.docs, []);

    main.innerHTML =
      '<div class="page-header"><div><h1 class="page-title">Document Management</h1>' +
      '<p class="page-subtitle">Controlled documents (demo list).</p></div></div>' +
      '<div class="doc-modules mb-3">' +
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
      '<div class="table-wrap"><table class="table"><thead><tr>' +
      "<th>Title</th><th>Module</th><th>Rev</th><th>Date</th><th>Status</th>" +
      "</tr></thead><tbody>" +
      docs
        .map(function (d) {
          var mod = DOC_MODULES.filter(function (m) {
            return m.id === d.module;
          })[0];
          return (
            "<tr><td class=\"wrap-cell\">" +
            escapeHtml(d.title) +
            "</td><td>" +
            escapeHtml(mod ? mod.name : d.module) +
            "</td><td>" +
            escapeHtml(d.rev) +
            "</td><td>" +
            escapeHtml(formatDate(d.date)) +
            '</td><td><span class="badge badge-success">' +
            escapeHtml(d.status) +
            "</span></td></tr>"
          );
        })
        .join("") +
      "</tbody></table></div>";
  }

  function viewNcr(main) {
    seedDocsNcrIfNeeded();
    setBreadcrumbs([
      { label: "Home", nav: "home" },
      { label: "NCR" },
    ]);
    var ncrs = storageGet(KEYS.ncrs, []);

    main.innerHTML =
      '<div class="page-header"><div><h1 class="page-title">Non-Conformance Reports</h1>' +
      '<p class="page-subtitle">Demo NCR tracking list.</p></div></div>' +
      '<div class="table-wrap"><table class="table"><thead><tr>' +
      "<th>NCR No</th><th>Title</th><th>Serial</th><th>Severity</th><th>Status</th><th>Date</th><th>Owner</th>" +
      "</tr></thead><tbody>" +
      ncrs
        .map(function (n) {
          var sev =
            n.severity === "Major" ? "badge-danger" : n.severity === "Critical" ? "badge-danger" : "badge-warn";
          var st =
            n.status === "Open" ? "badge-warn" : n.status === "Closed" ? "badge-closed" : "badge-info";
          return (
            "<tr>" +
            '<td class="mono">' +
            escapeHtml(n.id) +
            '</td><td class="wrap-cell">' +
            escapeHtml(n.title) +
            '</td><td class="mono"><button type="button" class="table-link" data-serial="' +
            escapeHtml(n.serial) +
            '">' +
            escapeHtml(n.serial) +
            "</button></td>" +
            '<td><span class="badge ' +
            sev +
            '">' +
            escapeHtml(n.severity) +
            '</span></td><td><span class="badge ' +
            st +
            '">' +
            escapeHtml(n.status) +
            "</span></td><td>" +
            escapeHtml(formatDate(n.date)) +
            "</td><td>" +
            escapeHtml(n.owner) +
            "</td></tr>"
          );
        })
        .join("") +
      "</tbody></table></div>";

    $$("[data-serial]", main).forEach(function (b) {
      b.addEventListener("click", function () {
        navigate("cardex-details", { serial: b.getAttribute("data-serial") });
      });
    });
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
      "fieldops-assets",
      "fieldops-assets-v1",
      "fieldops-asset-docs",
      "fieldops-rack-bin",
      "fieldops-masters-v1",
      "fieldops-equipment-lists-v5",
      "fieldops-equipment-dts-v2",
      "fieldops-equipment-dt-seq",
      "fieldops-docs-v1",
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
      app: "AtraOps",
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
    a.download = "AtraOps-backend-" + stamp + ".json";
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
      '<div class="admin-card"><h3>Users &amp; Roles</h3><p>Manage admin users, roles, and access permissions.</p>' +
      '<button type="button" class="btn btn-secondary" data-admin-tab="users">Open Users &amp; Roles →</button></div>' +
      '<div class="admin-card"><h3>Doc modules (library)</h3><p>DMS-style document library entries.</p>' +
      '<button type="button" class="btn btn-secondary" data-admin-tab="docs">Open docs →</button></div>' +
      "</div>" +
      /* Master Lists box — four direct links */
      '<div class="panel master-lists-panel mb-2">' +
      '<div class="panel-header flex-between"><h2 class="panel-title mb-0">Master Lists</h2>' +
      '<span class="text-muted">Shared dropdown sources</span></div>' +
      '<div class="panel-body">' +
      '<div class="master-lists-grid">' +
      masterListBtn("categories", "Master Categories", catN) +
      masterListBtn("connections", "Connection Types", connN) +
      masterListBtn("locations", "Locations", locN, true) +
      masterListBtn("descriptions", "Descriptions", descN) +
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
                "Import will replace local AtraOps backend data (assets, lists, ELs, DTs, documents). Continue?"
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

  function renderAdminMasters(host, focusKey) {
    var m = loadMasters();
    var titles = {
      categories: "Master Categories",
      connections: "Connection Types",
      locations: "Locations",
      descriptions: "Descriptions",
    };
    var keys = focusKey && titles[focusKey]
      ? [focusKey]
      : ["categories", "connections", "locations", "descriptions"];
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
        '" placeholder="New value" />' +
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
    findCardexRecord: findCardexRecord,
    getCardexCatalog: getCardexCatalog,
    loadAssets: loadAssets,
    loadEquipmentLists: loadEquipmentLists,
    loadDts: loadDts,
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
