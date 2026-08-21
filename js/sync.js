/**
 * AtraOps — server state sync.
 *
 * The database is where the data lives. This fills the browser's localStorage
 * from it on load and pushes editor changes back, because app.js reads and
 * writes localStorage synchronously in ~80 places and can't talk to Postgres
 * itself. The browser copy is a cache, never a source.
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
  var APP_SRC = "js/app.js?v=20260818-score-apply-config";
  var FLUSH_DELAY = 1500;
  var PREFIX = "fieldops-";

  var nativeSetItem = window.localStorage.setItem.bind(window.localStorage);
  var dirty = Object.create(null);
  var flushTimer = null;
  var isEditor = false;

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
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ value: value }),
      }).catch(function (err) {
        console.warn("[sync] push failed", key, err);
      });
    });
  }

  function enableEditorSync() {
    isEditor = true;
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
    console.info("[sync] editor mode — changes publish to the server");
  }

  /* ---------- boot ---------- */

  function startApp(afterBoot) {
    var s = document.createElement("script");
    s.src = APP_SRC;
    /* Wait until app.js has finished its own startup before listening for
       writes. app.js generates demo records when it finds empty storage, and
       those must never be mistaken for something a person typed and published
       over the real dataset. */
    s.onload = s.onerror = function () {
      setTimeout(afterBoot, 0);
    };
    document.body.appendChild(s);
  }

  function seed() {
    var forceReset = /[?&]reset=1/.test(window.location.search);
    if (forceReset) clearLocalData();

    /* Returning users keep their own sandbox; only a fresh or reset browser
       pulls the published dataset. */
    if (!forceReset && hasLocalData()) return Promise.resolve();

    return fetch(API, { headers: { Accept: "application/json" }, credentials: "same-origin" })
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
        /* Offline or unreachable. The app starts empty rather than falling
           back to an embedded snapshot — better a visibly empty screen than
           stale data that looks live and gets published over the real set. */
      });
  }

  function boot() {
    var editor = false;

    function run() {
      startApp(function () {
        if (editor) enableEditorSync();
      });
    }

    /* Role comes from the session cookie, so nothing sensitive lives in the
       browser and revoking an account takes effect immediately. */
    fetch("/api/me", { headers: { Accept: "application/json" }, credentials: "same-origin" })
      .then(function (r) {
        return r.ok ? r.json() : null;
      })
      .catch(function () {
        return null;
      })
      .then(function (me) {
        editor = !!(me && me.role === "editor");
        return seed();
      })
      .then(run, run);
  }

  boot();
})();
