/**
 * AtraOps — server state sync.
 *
 * Loads BEFORE app.js and deliberately boots it by hand at the end, because
 * the server copy has to be in localStorage before app.js reads it.
 *
 * Two roles share this file:
 *
 *   Visitors (no token) — seed their browser from the server once, then work
 *   entirely locally. Nothing they do is uploaded, so every demo starts from
 *   the same clean dataset no matter what the last person clicked.
 *
 *   The editor (token in the URL) — same seeding, but every save is also
 *   pushed to the server, so typing into the site is all it takes to update
 *   what visitors see. No export step.
 *
 * app.js is untouched by design: this wraps localStorage.setItem instead, so
 * ongoing edits to app.js can't collide with the sync layer.
 */
(function () {
  "use strict";

  var API = "/api/state";
  var TOKEN_KEY = "atraops-editor-token"; /* not fieldops-*, so it never syncs */
  var APP_SRC = "js/app.js?v=20260818-score-apply-config";
  var FLUSH_DELAY = 1500;
  var PREFIX = "fieldops-";

  var nativeSetItem = window.localStorage.setItem.bind(window.localStorage);
  var dirty = Object.create(null);
  var flushTimer = null;

  /* ---------- editor token ---------- */

  function readToken() {
    var m = /[#&]editor=([^&]+)/.exec(window.location.hash || "");
    if (m) {
      var t = decodeURIComponent(m[1]);
      try {
        nativeSetItem(TOKEN_KEY, t);
      } catch (e) {}
      /* Strip it from the address bar so it isn't shouldered or pasted around. */
      history.replaceState(null, "", window.location.pathname + window.location.search);
      return t;
    }
    try {
      return window.localStorage.getItem(TOKEN_KEY) || "";
    } catch (e) {
      return "";
    }
  }

  var token = readToken();
  var isEditor = !!token;

  /* ---------- seeding ---------- */

  function hasLocalData() {
    try {
      for (var i = 0; i < localStorage.length; i++) {
        if ((localStorage.key(i) || "").indexOf(PREFIX) === 0) return true;
      }
    } catch (e) {}
    return false;
  }

  function clearLocalData() {
    var doomed = [];
    for (var i = 0; i < localStorage.length; i++) {
      var k = localStorage.key(i) || "";
      if (k.indexOf(PREFIX) === 0) doomed.push(k);
    }
    doomed.forEach(function (k) {
      localStorage.removeItem(k);
    });
  }

  function seedFrom(payload) {
    var data = (payload && payload.data) || {};
    var n = 0;
    Object.keys(data).forEach(function (k) {
      if (k.indexOf(PREFIX) !== 0) return;
      var v = data[k];
      if (v === null || v === undefined) return;
      try {
        nativeSetItem(k, typeof v === "string" ? v : JSON.stringify(v));
        n++;
      } catch (e) {}
    });
    return n;
  }

  /* ---------- pushing ---------- */

  function queue(key) {
    dirty[key] = true;
    if (flushTimer) clearTimeout(flushTimer);
    flushTimer = setTimeout(flush, FLUSH_DELAY);
  }

  function flush() {
    flushTimer = null;
    var keys = Object.keys(dirty);
    dirty = Object.create(null);
    keys.forEach(function (key) {
      var raw;
      try {
        raw = localStorage.getItem(key);
      } catch (e) {
        return;
      }
      if (raw === null) return;
      var value;
      try {
        value = JSON.parse(raw);
      } catch (e) {
        value = raw; /* plain strings like the theme */
      }
      fetch(API + "/" + encodeURIComponent(key), {
        method: "PUT",
        headers: { "Content-Type": "application/json", "X-Editor-Token": token },
        body: JSON.stringify({ value: value }),
      }).catch(function (err) {
        console.warn("[sync] push failed", key, err);
      });
    });
  }

  if (isEditor) {
    window.localStorage.setItem = function (key, value) {
      var result = nativeSetItem(key, value);
      if (typeof key === "string" && key.indexOf(PREFIX) === 0) queue(key);
      return result;
    };
    /* Don't lose the last edit if the tab closes mid-debounce. */
    window.addEventListener("beforeunload", function () {
      if (flushTimer) {
        clearTimeout(flushTimer);
        flush();
      }
    });
  }

  /* ---------- boot ---------- */

  function startApp() {
    var s = document.createElement("script");
    s.src = APP_SRC;
    document.body.appendChild(s);
  }

  function boot() {
    var forceReset = /[?&]reset=1/.test(window.location.search);
    if (forceReset) clearLocalData();

    /* Returning visitors keep their own sandbox; only a fresh or reset
       browser pulls the published dataset. */
    if (!forceReset && hasLocalData()) return startApp();

    fetch(API, { headers: { Accept: "application/json" } })
      .then(function (r) {
        return r.ok ? r.json() : null;
      })
      .then(function (payload) {
        if (payload) {
          var n = seedFrom(payload);
          if (n) console.info("[sync] seeded " + n + " keys from server");
        }
      })
      .catch(function () {
        /* Offline, or opened straight off disk — app.js falls back to the
           embedded recovered-data.js seed on its own. */
      })
      .then(startApp, startApp);
  }

  if (isEditor) console.info("[sync] editor mode — changes publish to the server");
  boot();
})();
