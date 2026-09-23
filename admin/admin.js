/* Oasis Detailing Supplies — custom admin UI (Supabase backend).
   Vanilla JS, no build step. Authenticated writes only. */
(function () {
  "use strict";

  var app = document.getElementById("app");
  var cfg = window.OASIS_CONFIG || {};
  var READY = !!(
    cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY &&
    cfg.SUPABASE_URL.indexOf("YOUR-PROJECT") === -1 &&
    cfg.SUPABASE_ANON_KEY.indexOf("YOUR-ANON-KEY") === -1
  );

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  /* ---------- icons ---------- */
  function icon(name, cls) {
    return '<svg class="ic' + (cls ? " " + cls : "") + '" aria-hidden="true" focusable="false">' +
      '<use href="#' + name + '"></use></svg>';
  }
  var TAB_ICONS = { products: "i-tag", packages: "i-box", reviews: "i-chat", settings: "i-sliders", activity: "i-activity", inbox: "i-inbox", theme: "i-theme" };

  /* ---------- toast (aria-live success notices) ---------- */
  function toast(msg) {
    var root = document.getElementById("toasts");
    var t = document.createElement("div");
    t.className = "toast";
    t.innerHTML = icon("i-check") + "<span>" + esc(msg) + "</span>";
    root.appendChild(t);
    requestAnimationFrame(function () { t.classList.add("show"); });
    setTimeout(function () {
      t.classList.remove("show");
      setTimeout(function () { t.remove(); }, 300);
    }, 4000);
  }

  /* ---------- confirm dialog (replaces window.confirm) ---------- */
  function confirmDialog(opts) {
    return new Promise(function (resolve) {
      var root = document.getElementById("modal-root");
      var prevFocus = document.activeElement;
      root.innerHTML =
        '<div class="modal-overlay">' +
        '<div class="modal" role="alertdialog" aria-modal="true" aria-labelledby="modal-title" aria-describedby="modal-desc">' +
        "<h2 id=\"modal-title\">" + esc(opts.title) + "</h2>" +
        "<p id=\"modal-desc\">" + esc(opts.body) + "</p>" +
        '<div class="modal-actions">' +
        '<button type="button" class="btn" data-cancel>Cancel</button>' +
        '<button type="button" class="btn danger-solid" data-ok>' + esc(opts.confirmLabel || "Delete") + "</button>" +
        "</div></div></div>";
      var overlay = root.firstElementChild;
      function close(val) {
        root.innerHTML = "";
        document.removeEventListener("keydown", onKey, true);
        if (prevFocus && prevFocus.focus) { try { prevFocus.focus(); } catch (e) {} }
        resolve(val);
      }
      function onKey(e) { if (e.key === "Escape") close(false); }
      document.addEventListener("keydown", onKey, true);
      overlay.addEventListener("mousedown", function (e) { if (e.target === overlay) close(false); });
      overlay.querySelector("[data-cancel]").addEventListener("click", function () { close(false); });
      var okBtn = overlay.querySelector("[data-ok]");
      okBtn.addEventListener("click", function () { close(true); });
      okBtn.focus();
    });
  }

  /* ---------- busy button state ---------- */
  function setBusy(btnEl, busy, busyLabel) {
    if (busy) {
      if (btnEl.dataset.label === undefined) btnEl.dataset.label = btnEl.innerHTML;
      btnEl.disabled = true;
      btnEl.setAttribute("aria-busy", "true");
      btnEl.innerHTML = '<span class="spinner" aria-hidden="true"></span><span>' + esc(busyLabel) + "</span>";
    } else {
      btnEl.disabled = false;
      btnEl.removeAttribute("aria-busy");
      if (btnEl.dataset.label !== undefined) {
        btnEl.innerHTML = btnEl.dataset.label;
        delete btnEl.dataset.label;
      }
    }
  }

  /* ---------- inline field errors ---------- */
  function fieldError(input, msg) {
    clearFieldError(input);
    input.setAttribute("aria-invalid", "true");
    var p = document.createElement("p");
    p.className = "field-err";
    p.id = input.id + "-err";
    p.innerHTML = icon("i-alert") + "<span>" + esc(msg) + "</span>";
    input.setAttribute("aria-describedby", p.id);
    input.insertAdjacentElement("afterend", p);
  }
  function clearFieldError(input) {
    input.removeAttribute("aria-invalid");
    input.removeAttribute("aria-describedby");
    var old = document.getElementById(input.id + "-err");
    if (old) old.remove();
  }
  function requireValue(input, label) {
    clearFieldError(input);
    if (input.value.trim() === "") {
      fieldError(input, label + " is required.");
      input.focus();
      return false;
    }
    return true;
  }

  /* ---------- inline message boxes ---------- */
  function showMsg(box, text, ok) {
    box.className = "msg show " + (ok ? "ok" : "err");
    box.setAttribute("role", ok ? "status" : "alert");
    box.textContent = text;
    if (!ok) box.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }
  function clearMsg(box) {
    box.className = "msg";
    box.removeAttribute("role");
    box.textContent = "";
  }
  function loadingBox(text) {
    return '<div class="loading-box" role="status"><span class="spinner" aria-hidden="true"></span><span>' +
      esc(text) + "</span></div>";
  }
  function emptyState(ic, title, text, btnLabel, btnId) {
    return '<div class="empty">' + icon(ic) +
      "<h3>" + esc(title) + "</h3><p>" + esc(text) + "</p>" +
      (btnLabel ? '<button type="button" class="btn primary" id="' + btnId + '">' +
        icon("i-plus") + esc(btnLabel) + "</button>" : "") +
      "</div>";
  }

  function btn(label, cls, attrs, ic) {
    return '<button type="button" class="btn ' + (cls || "") + '"' +
      (attrs || "") + ">" + (ic ? icon(ic) : "") + esc(label) + "</button>";
  }

  if (!READY) {
    app.innerHTML =
      '<div class="notice"><h2>Admin not configured yet</h2>' +
      "<p>The site owner still needs to connect this admin panel to Supabase. " +
      "Once <code>js/config.js</code> has the real project URL and anon key, " +
      "reload this page to sign in.</p></div>";
    return;
  }

  var sb = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);

  /* ---------- shared data helpers (unchanged behavior) ---------- */

  async function uploadPhoto(bucket, file) {
    var safe = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
    var path = Date.now() + "-" + safe;
    var res = await sb.storage.from(bucket).upload(path, file, { upsert: true });
    if (res.error) throw res.error;
    return sb.storage.from(bucket).getPublicUrl(path).data.publicUrl;
  }

  async function ordered(table, cols) {
    // newest first; fall back to id desc if created_at is absent
    var q = await sb.from(table).select(cols || "*").order("created_at", { ascending: false });
    if (q.error && /created_at/.test(q.error.message || "")) {
      return sb.from(table).select(cols || "*").order("id", { ascending: false });
    }
    return q;
  }

  /* ---------- change log (recent changes + undo) ---------- */

  var ENTITY_TABLE = { product: "products", package: "packages", settings: "site_settings", social_link: "social_links" };
  var ENTITY_TAB = { product: "products", package: "packages", settings: "settings", social_link: "settings" };
  var ENTITY_NAME = { product: "Product", package: "Package", settings: "Setting", social_link: "Social link" };

  // comparison: null / undefined / "" all count as empty
  function cmpVal(v) {
    if (v === null || v === undefined) return "";
    if (typeof v === "object") return JSON.stringify(v);
    return String(v);
  }
  function dispVal(v) {
    var s = cmpVal(v).trim();
    if (s === "") return "\u2014";
    return s.length > 120 ? s.slice(0, 117) + "\u2026" : s;
  }
  // friendlier display for structured fields
  function dispField(entity, key, v) {
    if (key === "includes" && Array.isArray(v)) {
      v = v.map(function (i) { return i.text; }).join(", ");
    } else if (key === "hours" && Array.isArray(v)) {
      v = v.map(function (h) { return (h.days || "") + " " + (h.time || ""); }).join("; ");
    }
    return dispVal(v);
  }

  // best-effort: never rejects, never breaks a save
  function logChange(e) {
    return sb.from("change_log").insert({
      user_email: session && session.user ? session.user.email : null,
      entity: e.entity,
      entity_label: e.entity_label || null,
      record_id: e.record_id != null ? String(e.record_id) : null,
      action: e.action,
      field_name: e.field || null,
      old_value: e.old_value != null ? String(e.old_value).slice(0, 500) : null,
      new_value: e.new_value != null ? String(e.new_value).slice(0, 500) : null,
      old_row: e.old_row || null,
      new_row: e.new_row || null
    }).then(function () {}, function () {});
  }

  function settingLabel(key) {
    var found = null;
    SETTING_GROUPS.forEach(function (g) {
      g[1].forEach(function (f) { if (f[0] === key) found = f[1]; });
    });
    if (found) return found;
    if (key === "hours") return "Hours";
    if (key === "logo_url") return "Logo";
    if (key === "theme") return "Theme";
    return key;
  }

  function fieldLabel(entity, key) {
    var maps = {
      product: { name: "Name", note: "Note", brand: "Brand", initials: "Initials", photo: "Photo" },
      package: { number: "Number", name: "Name", category: "Category", price_car: "Price \u2014 car", price_suv: "Price \u2014 SUV", price_truck: "Price \u2014 truck", coupon: "Coupon", includes: "Includes" },
      social_link: { name: "Name", url: "URL", icon: "Icon" },
      review: { name: "Name", quote: "Review" }
    };
    if (entity === "settings") return settingLabel(key);
    return (maps[entity] && maps[entity][key]) || key;
  }

  function timeAgo(ts) {
    var d = Date.now() - new Date(ts).getTime();
    if (d < 0) d = 0;
    var m = Math.floor(d / 60000);
    if (m < 1) return "just now";
    if (m < 60) return m + "m ago";
    var h = Math.floor(m / 60);
    if (h < 24) return h + "h ago";
    var days = Math.floor(h / 24);
    if (days < 7) return days + "d ago";
    return new Date(ts).toLocaleDateString();
  }

  function changeLine(e) {
    var label = esc(e.entity_label || ENTITY_NAME[e.entity] || e.entity);
    var sub, oldV, newV, newGone;
    if (e.action === "create") {
      sub = "New " + esc((ENTITY_NAME[e.entity] || e.entity).toLowerCase());
      oldV = null;
      newV = e.entity_label || ENTITY_NAME[e.entity] || e.entity;
      newGone = false;
    } else if (e.action === "delete") {
      sub = "Deleted";
      oldV = e.old_value;
      newV = null;
      newGone = true;
    } else {
      sub = esc(fieldLabel(e.entity, e.field_name));
      oldV = e.old_value;
      newV = e.new_value;
      newGone = false;
    }
    var oldInner = (oldV == null || String(oldV).trim() === "")
      ? '<span class="chg-val chg-none">\u2014</span>'
      : '<span class="chg-val">' + esc(oldV) + "</span>";
    var newInner;
    if (newGone) {
      newInner = '<span class="chg-val chg-none">Deleted</span>';
    } else {
      newInner = (newV == null || String(newV).trim() === "")
        ? '<span class="chg-val chg-none">\u2014</span>'
        : '<span class="chg-val">' + esc(newV) + "</span>";
    }
    return '<div class="chg-head"><strong>' + label + "</strong>" +
      '<span class="chg-field">' + sub + "</span></div>" +
      '<div class="chg-diff">' +
      '<div class="chg-col chg-old"><span class="chg-cap">Before</span>' + oldInner + "</div>" +
      '<div class="chg-div" aria-hidden="true"></div>' +
      '<div class="chg-col chg-new"><span class="chg-cap">After</span>' + newInner + "</div>" +
      "</div>";
  }

  function changeText(e) {
    var label = e.entity_label || ENTITY_NAME[e.entity] || e.entity;
    if (e.action === "create") return label + " added";
    if (e.action === "delete") return label + " deleted";
    return label + " \u00b7 " + fieldLabel(e.entity, e.field_name) +
      ": (before) " + (e.old_value || "\u2014") + " \u2192 " + (e.new_value || "\u2014");
  }

  function kv(k, v) { var o = {}; o[k] = v; return o; }

  // inverse of a logged change; returns an error string or null. Never logs.
  async function undoChange(e) {
    var table = ENTITY_TABLE[e.entity];
    if (!table) return "This kind of change can't be undone.";
    var r = null;
    try {
      if (e.action === "update") {
        if (!e.old_row || !e.field_name || !(e.field_name in e.old_row)) {
          return "No previous value was saved for this change.";
        }
        r = await sb.from(table).update(kv(e.field_name, e.old_row[e.field_name])).eq("id", e.record_id);
      } else if (e.action === "delete") {
        if (!e.old_row) return "No previous data was saved for this change.";
        r = await sb.from(table).insert(e.old_row);
      } else if (e.action === "create") {
        r = await sb.from(table).delete().eq("id", e.record_id);
      } else {
        return "This kind of change can't be undone.";
      }
    } catch (err) {
      return (err && err.message) || "Undo failed.";
    }
    if (r && r.error) return r.error.message || "Undo failed.";
    return null;
  }

  async function renderActivity() {
    var el = document.getElementById("tab-activity");
    el.innerHTML =
      '<div class="toolbar"><div><h2 class="section-title">Recent changes</h2>' +
      '<p class="page-sub">The last few edits, with one-tap undo.</p></div></div>' +
      '<div class="msg" id="act-msg"></div>' +
      '<div id="act-list">' + loadingBox("Loading recent changes\u2026") + "</div>";

    var box = document.getElementById("act-list");
    var res = await sb.from("change_log").select("*")
      .order("created_at", { ascending: false }).limit(10);
    if (res.error) {
      box.innerHTML = emptyState("i-activity", "Activity log not ready",
        "The database needs one small update first \u2014 run supabase/migrations/002_change_log.sql in the Supabase SQL editor, then come back here.");
      return;
    }
    var rows = res.data || [];
    if (!rows.length) {
      box.innerHTML = emptyState("i-activity", "No changes yet",
        "Edits you make in Products, Packages, or Settings will show up here with an undo button.");
      return;
    }
    box.innerHTML = rows.map(function (e) {
      var undone = !!e.undone;
      return '<article class="item-card change-card' + (undone ? " is-undone" : "") + '">' +
        '<div class="item-main"><div class="change-line">' + changeLine(e) + "</div>" +
        '<div class="item-sub">' + esc(timeAgo(e.created_at)) +
        (e.user_email ? " \u00b7 " + esc(e.user_email) : "") +
        ' \u00b7 <span class="entity-tag">' + esc(ENTITY_NAME[e.entity] || e.entity) + "</span></div></div>" +
        '<div class="item-actions">' +
        (undone
          ? '<span class="pill pill-undone">Undone</span>'
          : btn("Undo", "small", ' data-undo="' + esc(e.id) + '" aria-label="Undo: ' + esc(changeText(e)) + '"', "i-undo")) +
        "</div></article>";
    }).join("");

    box.addEventListener("click", async function (ev) {
      var b = ev.target.closest("[data-undo]");
      if (!b) return;
      var entry = rows.find(function (r) { return String(r.id) === b.dataset.undo; });
      if (!entry || entry.undone) return;
      var ok = await confirmDialog({
        title: "Undo this change?",
        body: changeText(entry) + " \u2014 the previous value will be restored.",
        confirmLabel: "Undo"
      });
      if (!ok) return;
      setBusy(b, true, "Undoing\u2026");
      var err = await undoChange(entry);
      if (err) {
        setBusy(b, false);
        showMsg(document.getElementById("act-msg"), err, false);
        return;
      }
      await sb.from("change_log").update({ undone: true }).eq("id", entry.id);
      entry.undone = true;
      toast("Change undone.");
      var tab = ENTITY_TAB[entry.entity];
      if (tab) loaded[tab] = false;
      if (entry.entity === "settings" && entry.field_name === "theme") loaded.theme = false;
      loaded.activity = false;
      renderActivity();
    });
  }


  /* ---------- theme ---------- */

  var THEME_COLORS = [
    ["accent", "Accent", "Buttons, badges"],
    ["navy", "Navy", "Header, footer"],
    ["dark", "Dark", "Hero overlay"],
    ["page", "Page background", ""],
    ["card", "Card background", ""],
    ["text", "Text", ""],
    ["muted", "Muted text", ""],
    ["line", "Borders", ""]
  ];

  // Mirrors the admin :root defaults exactly, so applying the default
  // "Oasis" theme is a visual no-op.
  var DEFAULT_THEME_COLORS = {
    accent: "#c2410c", navy: "#1e293b", dark: "#0f172a", page: "#f1f5f9",
    card: "#ffffff", text: "#334155", muted: "#475569", line: "#e2e8f0"
  };

  function defaultThemeData() {
    return {
      active: "oasis",
      themes: {
        oasis: { name: "Oasis", builtin: true, colors: Object.assign({}, DEFAULT_THEME_COLORS) },
        midnight: { name: "Midnight Garage", builtin: true, colors: { accent: "#f59e0b", navy: "#0b0f19", dark: "#05070d", page: "#111827", card: "#1f2937", text: "#f9fafb", muted: "#9ca3af", line: "#374151" } },
        track: { name: "Track Red", builtin: true, colors: { accent: "#dc2626", navy: "#1e293b", dark: "#0f172a", page: "#f8fafc", card: "#ffffff", text: "#0f172a", muted: "#475569", line: "#e2e8f0" } },
        arctic: { name: "Arctic Foam", builtin: true, colors: { accent: "#0284c7", navy: "#0c4a6e", dark: "#082f49", page: "#f0f9ff", card: "#ffffff", text: "#0f172a", muted: "#64748b", line: "#d7e3f0" } },
        dune: { name: "Desert Dune", builtin: true, colors: { accent: "#b45309", navy: "#292019", dark: "#1c1410", page: "#faf6ef", card: "#fffdf8", text: "#292019", muted: "#8a7a66", line: "#e8ddc9" } }
      }
    };
  }

  function toHex6(v) {
    var s = String(v == null ? "" : v).trim();
    var m = /^#([0-9a-fA-F]{3})$/.exec(s);
    if (m) return "#" + m[1].split("").map(function (ch) { return ch + ch; }).join("").toLowerCase();
    if (/^#[0-9a-fA-F]{6}$/.test(s)) return s.toLowerCase();
    return "#000000";
  }

  function isHex(v) {
    var s = String(v == null ? "" : v).trim();
    return /^#[0-9a-fA-F]{3}$/.test(s) || /^#[0-9a-fA-F]{6}$/.test(s);
  }

  // tolerate missing / partial theme data
  function normalizeThemeData(raw) {
    var d = defaultThemeData();
    var themes = {};
    Object.keys(d.themes).forEach(function (id) { themes[id] = d.themes[id]; });
    if (raw && typeof raw === "object") {
      var removed = raw._removed || [];
      if (raw.themes && typeof raw.themes === "object") {
        Object.keys(raw.themes).forEach(function (id) {
          var t = raw.themes[id] || {};
          var base = themes[id] || { name: id };
          themes[id] = {
            name: String(t.name || base.name || id),
            builtin: !!(base.builtin || t.builtin),
            colors: Object.assign({}, DEFAULT_THEME_COLORS, base.colors || {}, t.colors || {})
          };
        });
      }
      removed.forEach(function (id) { delete themes[id]; });
      if (Object.keys(themes).length) {
        d.themes = themes;
        d.active = (raw.active && themes[raw.active]) ? raw.active : (themes[d.active] ? d.active : Object.keys(themes)[0]);
      }
      if (removed.length) d._removed = removed;
    }
    return d;
  }

  function themeDesc(d) {
    var t = d.themes[d.active];
    return 'Theme "' + (t ? t.name : d.active) + '"';
  }

  /* ---------- live admin theming: the active theme recolors this panel ---------- */
  function hexRgb(h) {
    h = toHex6(h);
    return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
  }
  function mixHex(a, b, t) { // t=0 -> a, t=1 -> b
    var ra = hexRgb(a), rb = hexRgb(b);
    var m = ra.map(function (v, i) { return Math.round(v + (rb[i] - v) * t); });
    return "#" + m.map(function (v) { return ("0" + v.toString(16)).slice(-2); }).join("");
  }
  function relLum(h) {
    var c = hexRgb(h).map(function (v) {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  }
  function onColor(h) { // readable text on a background: white or near-black
    return relLum(toHex6(h)) > 0.35 ? "#0f172a" : "#ffffff";
  }

  function applyAdminTheme(colors) {
    var c = Object.assign({}, DEFAULT_THEME_COLORS, colors || {});
    var accentDark = mixHex(c.accent, "#000000", 0.2);
    var root = document.documentElement.style;
    root.setProperty("--accent", toHex6(c.accent));
    root.setProperty("--navy", toHex6(c.navy));
    root.setProperty("--navy-deep", toHex6(c.dark));
    root.setProperty("--bg", toHex6(c.page));
    root.setProperty("--card", toHex6(c.card));
    root.setProperty("--line", toHex6(c.line));
    root.setProperty("--ink", toHex6(c.text));
    root.setProperty("--muted", toHex6(c.muted));
    root.setProperty("--accent-dark", accentDark);
    root.setProperty("--accent-soft", mixHex(c.accent, "#ffffff", 0.88));
    root.setProperty("--on-navy", onColor(c.navy));
    root.setProperty("--on-navy-deep", onColor(c.dark));
    root.setProperty("--on-navy-muted", relLum(toHex6(c.dark)) > 0.35 ? "#475569" : "#cbd5e1");
    root.setProperty("--on-accent", onColor(accentDark));
  }

  async function applySavedAdminTheme() { // boot: paint panel with saved theme; never throws
    try {
      var r = await sb.from("site_settings").select("theme").eq("id", 1).maybeSingle();
      if (r.error || !r.data) return;
      var d = normalizeThemeData(r.data.theme);
      var t = d.themes[d.active];
      if (t) applyAdminTheme(t.colors);
    } catch (e) { /* keep default look */ }
  }

  function themeIdFor(name) {
    var slug = String(name).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    if (!slug) slug = "theme";
    return slug + "-" + Date.now().toString(36);
  }

  async function renderTheme() {
    var el = document.getElementById("tab-theme");
    el.innerHTML =
      '<div class="toolbar"><div><h2 class="section-title">Theme</h2>' +
      '<p class="page-sub">Pick a look, or tweak its colors. The theme styles this admin panel; putting it on the website comes later.</p></div>' +
      btn("New theme", "primary", ' id="theme-add"', "i-plus") + "</div>" +
      '<div class="msg" id="theme-msg"></div>' +
      '<div id="theme-list">' + loadingBox("Loading themes\u2026") + "</div>" +
      '<div id="theme-editor"></div>';

    var msgBox = document.getElementById("theme-msg");
    var listBox = document.getElementById("theme-list");

    // migration probe: does the theme column exist yet?
    var probe = await sb.from("site_settings").select("theme").eq("id", 1).maybeSingle();
    if (probe.error) {
      var pmsg = (probe.error.message || "") + " " + (probe.error.code || "");
      if (/does not exist|42703/.test(pmsg)) {
        listBox.innerHTML = emptyState("i-theme", "Theme storage not ready",
          "The database needs one small update first \u2014 run supabase/migrations/003_theme.sql in the Supabase SQL editor, then come back here.");
        return;
      }
      listBox.innerHTML = "";
      showMsg(msgBox, probe.error.message, false);
      return;
    }

    var sRes = await sb.from("site_settings").select("*").eq("id", 1).maybeSingle();
    if (sRes.error) {
      listBox.innerHTML = "";
      showMsg(msgBox, sRes.error.message, false);
      return;
    }
    var s = sRes.data || {};
    var data = normalizeThemeData(s.theme);

    async function persistTheme(next, oldDesc, newDesc) {
      var before = Object.assign({}, s);
      var up = await sb.from("site_settings").upsert({ id: 1, theme: next }, { onConflict: "id" });
      if (up.error) throw up.error;
      var after = Object.assign({}, before, { theme: next });
      s = after;
      data = normalizeThemeData(next);
      applyAdminTheme((data.themes[data.active] || {}).colors);
      await logChange({
        entity: "settings", entity_label: "Site settings", record_id: "1",
        action: "update", field: "theme", old_value: oldDesc, new_value: newDesc,
        old_row: before, new_row: after
      });
    }

    function renderList() {
      var ids = Object.keys(data.themes);
      listBox.innerHTML = ids.map(function (id) {
        var t = data.themes[id];
        var isActive = id === data.active;
        var sw = THEME_COLORS.map(function (c) {
          return '<span class="swatch" style="background:' + esc(t.colors[c[0]]) + '" title="' + esc(c[1]) + '"></span>';
        }).join("");
        var locked = isActive || ids.length === 1;
        var delTitle = isActive ? "The active theme can't be deleted" : (ids.length === 1 ? "You need at least one theme" : "Delete this theme");
        return '<article class="item-card theme-card' + (isActive ? " is-active" : "") + '">' +
          '<div class="item-main"><div class="item-title">' + esc(t.name) +
          (isActive ? ' <span class="pill pill-active">Active</span>' : "") + "</div>" +
          '<div class="swatches" aria-hidden="true">' + sw + "</div></div>" +
          '<div class="item-actions">' +
          (isActive ? "" : btn("Use this theme", "small", ' data-use="' + esc(id) + '"')) +
          btn("Edit colors", "small", ' data-edit="' + esc(id) + '"', "i-edit") +
          btn("Delete", "small danger-outline", ' data-del="' + esc(id) + '" title="' + esc(delTitle) + '"' +
            (locked ? " disabled" : ""), "i-trash") +
          "</div></article>";
      }).join("");
    }

    function openEditor(id) {
      var t = data.themes[id];
      if (!t) return;
      var ed = document.getElementById("theme-editor");
      ed.innerHTML =
        '<div class="card"><h3 class="section-title">Edit colors \u2014 ' + esc(t.name) + "</h3>" +
        '<div class="msg" id="te-msg"></div>' +
        '<div class="field"><label for="te-name">Theme name</label>' +
        '<input type="text" id="te-name" value="' + esc(t.name) + '" maxlength="60" /></div>' +
        '<div class="grid">' +
        THEME_COLORS.map(function (c) {
          var v = t.colors[c[0]] || "#000000";
          return '<div class="color-row">' +
            '<span class="color-swatch" id="te-sw-' + c[0] + '" style="background:' + esc(v) + '"></span>' +
            '<span class="color-info"><span class="color-label">' + esc(c[1]) + "</span>" +
            (c[2] ? '<span class="hint">' + esc(c[2]) + "</span>" : "") + "</span>" +
            '<input type="color" id="te-pick-' + c[0] + '" value="' + esc(toHex6(v)) + '" aria-label="' + esc(c[1]) + ' color picker" />' +
            '<input type="text" class="hex-input" id="te-' + c[0] + '" value="' + esc(v) + '" maxlength="7" spellcheck="false" autocomplete="off" aria-label="' + esc(c[1]) + ' hex value" />' +
            "</div>";
        }).join("") + "</div>" +
        '<div class="form-row" style="margin-top:14px">' +
        '<button type="button" class="btn primary" id="te-save">' + icon("i-check") + "Save theme</button>" +
        '<button type="button" class="btn" id="te-cancel">Cancel</button>' +
        "</div></div>";
      ed.scrollIntoView({ block: "start", behavior: "smooth" });

      THEME_COLORS.forEach(function (c) {
        var pick = document.getElementById("te-pick-" + c[0]);
        var hex = document.getElementById("te-" + c[0]);
        var sw = document.getElementById("te-sw-" + c[0]);
        pick.addEventListener("input", function () {
          hex.value = pick.value;
          sw.style.background = pick.value;
          hex.removeAttribute("aria-invalid");
        });
        hex.addEventListener("input", function () {
          if (isHex(hex.value.trim())) {
            pick.value = toHex6(hex.value.trim());
            sw.style.background = hex.value.trim();
            hex.removeAttribute("aria-invalid");
          }
        });
      });

      document.getElementById("te-cancel").addEventListener("click", function () { ed.innerHTML = ""; });
      document.getElementById("te-save").addEventListener("click", async function () {
        var mbox = document.getElementById("te-msg");
        clearMsg(mbox);
        var name = document.getElementById("te-name").value.trim();
        if (!name) { showMsg(mbox, "Give the theme a name.", false); document.getElementById("te-name").focus(); return; }
        var colors = {}, badKey = null;
        THEME_COLORS.forEach(function (c) {
          var v = document.getElementById("te-" + c[0]).value.trim();
          if (isHex(v)) colors[c[0]] = v;
          else if (badKey === null) badKey = c[0];
        });
        if (badKey !== null) {
          var badEl = document.getElementById("te-" + badKey);
          badEl.setAttribute("aria-invalid", "true");
          badEl.focus();
          showMsg(mbox, "One color isn't a valid hex value \u2014 use #rgb or #rrggbb.", false);
          return;
        }
        var saveBtn = document.getElementById("te-save");
        setBusy(saveBtn, true, "Saving\u2026");
        try {
          var next = JSON.parse(JSON.stringify(data));
          var oldDesc = themeDesc(data);
          next.themes[id] = { name: name, colors: colors };
          await persistTheme(next, oldDesc, themeDesc(next) + " (colors updated)");
          toast("Theme saved.");
          ed.innerHTML = "";
          renderList();
        } catch (err) {
          setBusy(saveBtn, false);
          showMsg(mbox, (err && err.message) || "Save failed.", false);
        }
      });
    }

    listBox.addEventListener("click", async function (ev) {
      var useBtn = ev.target.closest("[data-use]");
      var editBtn = ev.target.closest("[data-edit]");
      var delBtn = ev.target.closest("[data-del]");
      if (useBtn) {
        var uid = useBtn.dataset.use;
        setBusy(useBtn, true, "Applying\u2026");
        try {
          var oldDesc = themeDesc(data);
          var next = JSON.parse(JSON.stringify(data));
          next.active = uid;
          await persistTheme(next, oldDesc, themeDesc(next));
          toast("Theme applied.");
          renderList();
        } catch (err) {
          setBusy(useBtn, false);
          showMsg(msgBox, (err && err.message) || "Could not apply the theme.", false);
        }
        return;
      }
      if (editBtn) { openEditor(editBtn.dataset.edit); return; }
      if (delBtn) {
        if (delBtn.disabled) return;
        var did = delBtn.dataset.del;
        var dt = data.themes[did];
        if (!dt) return;
        var ok = await confirmDialog({
          title: 'Delete "' + dt.name + '"?',
          body: "Its colors will be gone for good.",
          confirmLabel: "Delete"
        });
        if (!ok) return;
        setBusy(delBtn, true, "Deleting\u2026");
        try {
          var n2 = JSON.parse(JSON.stringify(data));
          var od = themeDesc(data);
          delete n2.themes[did];
          if (dt.builtin) {
            n2._removed = n2._removed || [];
            if (n2._removed.indexOf(did) < 0) n2._removed.push(did);
          }
          await persistTheme(n2, od, themeDesc(n2) + ' ("' + dt.name + '" deleted)');
          toast("Theme deleted.");
          document.getElementById("theme-editor").innerHTML = "";
          renderList();
        } catch (err) {
          setBusy(delBtn, false);
          showMsg(msgBox, (err && err.message) || "Could not delete the theme.", false);
        }
      }
    });

    document.getElementById("theme-add").addEventListener("click", function () {
      var ed = document.getElementById("theme-editor");
      ed.innerHTML =
        '<div class="card"><h3 class="section-title">New theme</h3>' +
        '<p class="page-sub">Starts as a copy of "' + esc(data.themes[data.active].name) + '" \u2014 tweak its colors after creating it.</p>' +
        '<div class="msg" id="tn-msg"></div>' +
        '<div class="field"><label for="tn-name">Theme name</label>' +
        '<input type="text" id="tn-name" placeholder="e.g. Sunset" maxlength="60" /></div>' +
        '<div class="form-row" style="margin-top:14px">' +
        '<button type="button" class="btn primary" id="tn-create">' + icon("i-check") + "Create theme</button>" +
        '<button type="button" class="btn" id="tn-cancel">Cancel</button>' +
        "</div></div>";
      ed.scrollIntoView({ block: "start", behavior: "smooth" });
      var nameEl = document.getElementById("tn-name");
      nameEl.focus();
      document.getElementById("tn-cancel").addEventListener("click", function () { ed.innerHTML = ""; });
      document.getElementById("tn-create").addEventListener("click", async function () {
        var mbox = document.getElementById("tn-msg");
        clearMsg(mbox);
        var name = nameEl.value.trim();
        if (!name) { showMsg(mbox, "Give the theme a name.", false); nameEl.focus(); return; }
        var nid = themeIdFor(name);
        var createBtn = document.getElementById("tn-create");
        setBusy(createBtn, true, "Creating\u2026");
        try {
          var next = JSON.parse(JSON.stringify(data));
          next.themes[nid] = { name: name, colors: Object.assign({}, data.themes[data.active].colors) };
          await persistTheme(next, themeDesc(data), 'Theme "' + name + '" added');
          toast("Theme created.");
          renderList();
          openEditor(nid);
        } catch (err) {
          setBusy(createBtn, false);
          showMsg(mbox, (err && err.message) || "Could not create the theme.", false);
        }
      });
    });

    renderList();
  }

  /* ---------- auth ---------- */

  var session = null;

  function renderLogin() {
    app.innerHTML =
      '<div class="login-wrap"><div class="login-card">' +
      '<div class="login-brand">' +
      '<img src="../images/logo.png" alt="" />' +
      "<h1>Oasis Detailing Supplies</h1><p>Store admin</p></div>" +
      '<div class="login-body">' +
      "<h2>Sign in</h2>" +
      '<p class="page-sub">Use your admin email and password.</p>' +
      '<div class="msg" id="login-msg"></div>' +
      '<form id="login-form" class="grid" novalidate>' +
      '<div class="field"><label for="login-email">Email address <span class="req" aria-hidden="true">*</span></label>' +
      '<input type="email" id="login-email" required placeholder="you@example.com" autocomplete="username" /></div>' +
      '<div class="field"><label for="login-password">Password <span class="req" aria-hidden="true">*</span></label>' +
      '<div class="pw-wrap"><input type="password" id="login-password" required autocomplete="current-password" />' +
      '<button type="button" class="pw-toggle" id="pw-toggle" aria-label="Show password" aria-pressed="false">' +
      icon("i-eye") + "</button></div></div>" +
      '<button type="submit" class="btn primary block" id="login-submit">Sign in</button>' +
      "</form></div></div></div>";

    var pwInput = document.getElementById("login-password");
    document.getElementById("pw-toggle").addEventListener("click", function () {
      var show = pwInput.type === "password";
      pwInput.type = show ? "text" : "password";
      this.setAttribute("aria-label", show ? "Hide password" : "Show password");
      this.setAttribute("aria-pressed", show ? "true" : "false");
      this.innerHTML = icon(show ? "i-eye-off" : "i-eye");
      pwInput.focus();
    });

    document.getElementById("login-form").addEventListener("submit", async function (e) {
      e.preventDefault();
      var mbox = document.getElementById("login-msg");
      clearMsg(mbox);
      var emailEl = document.getElementById("login-email");
      var ok = requireValue(emailEl, "Email address") && requireValue(pwInput, "Password");
      if (!ok) return;
      var submitBtn = document.getElementById("login-submit");
      setBusy(submitBtn, true, "Signing in…");
      var res = await sb.auth.signInWithPassword({
        email: emailEl.value.trim(),
        password: pwInput.value
      });
      if (res.error) {
        setBusy(submitBtn, false);
        showMsg(mbox, res.error.message, false);
      }
      // on success, onAuthStateChange renders the shell
    });
    document.getElementById("login-email").focus();
  }

  /* ---------- shell ---------- */

  var TABS = [
    ["products", "Products"],
    ["packages", "Packages"],
    ["reviews", "Reviews"],
    ["settings", "Settings"],
    ["activity", "Activity"],
    ["inbox", "Inbox"],
    ["theme", "Theme"]
  ];
  var loaded = {};

  function tabButtons() {
    return TABS.map(function (t, i) {
      return '<button type="button" class="tab' + (i === 0 ? " active" : "") + '" data-tab="' + t[0] + '"' +
        (i === 0 ? ' aria-current="page"' : "") + ">" +
        icon(TAB_ICONS[t[0]]) + '<span class="tab-label">' + t[1] + "</span>" +
        (t[0] === "inbox" ? '<span class="tab-badge" data-badge hidden></span>' : "") +
        "</button>";
    }).join("");
  }

  function renderShell() {
    app.innerHTML =
      '<header class="appbar"><div class="appbar-inner">' +
      '<div class="brand"><img src="../images/logo.png" alt="" class="brand-logo" />' +
      '<div class="brand-text"><strong>Oasis Admin</strong><span>Detailing Supplies</span></div></div>' +
      '<div class="userbox"><span class="user-email">' + esc(session.user.email) + "</span>" +
      '<button type="button" class="icon-btn" id="logout">' + icon("i-logout") + "<span>Log out</span></button></div>" +
      "</div></header>" +
      '<nav class="tabs tabs-top" aria-label="Admin sections">' + tabButtons() + "</nav>" +
      '<main class="panels">' +
      TABS.map(function (t, i) {
        return '<section id="tab-' + t[0] + '" aria-label="' + t[1] + '"' +
          (i === 0 ? "" : ' hidden') + "></section>";
      }).join("") + "</main>" +
      '<nav class="tabs tabs-bottom" aria-label="Admin sections">' + tabButtons() + "</nav>";

    document.getElementById("logout").addEventListener("click", async function () {
      var ok = await confirmDialog({
        title: "Log out?",
        body: "You will need your email and password to sign back in.",
        confirmLabel: "Log out"
      });
      if (!ok) return;
      await sb.auth.signOut();
      window.location.reload();
    });

    app.querySelectorAll("[data-tab]").forEach(function (b) {
      b.addEventListener("click", function () { activateTab(b.dataset.tab); });
    });

    activateTab("products");
    applySavedAdminTheme();
  }

  function activateTab(name) {
    app.querySelectorAll("[data-tab]").forEach(function (b) {
      var on = b.dataset.tab === name;
      b.classList.toggle("active", on);
      if (on) b.setAttribute("aria-current", "page");
      else b.removeAttribute("aria-current");
    });
    TABS.forEach(function (t) {
      var sec = document.getElementById("tab-" + t[0]);
      if (t[0] === name) sec.removeAttribute("hidden");
      else sec.setAttribute("hidden", "");
    });
    openTab(name);
  }

  function setInboxBadge(n) {
    app.querySelectorAll("[data-badge]").forEach(function (b) {
      b.textContent = n > 99 ? "99+" : String(n);
      b.hidden = n === 0;
    });
  }

  function openTab(name) {
    if (loaded[name]) return;
    loaded[name] = true;
    if (name === "products") renderProducts();
    else if (name === "packages") renderPackages();
    else if (name === "reviews") renderReviews();
    else if (name === "settings") renderSettings();
    else if (name === "activity") renderActivity();
    else if (name === "inbox") renderInbox();
    else if (name === "theme") renderTheme();
  }

  // Smart money input: Joe types "20" -> stored as "$20 coupon available".
  // Idempotent: "$20 coupon available" stays as-is, never doubles up.
  function normCoupon(v) {
    var s = String(v == null ? "" : v).trim();
    if (!s) return null;
    var num = s.replace(/\$/g, " ").replace(/coupons?/gi, " ")
      .replace(/available/gi, " ").replace(/\boff\b/gi, " ")
      .replace(/\s+/g, " ").trim();
    if (/^[\d,]+(\.\d{1,2})?$/.test(num)) {
      var n = parseFloat(num.replace(/,/g, ""));
      if (!isNaN(n)) return "$" + n.toLocaleString("en-US", { maximumFractionDigits: 2 }) + " coupon available";
    }
    return s;
  }

  // "99" / "$99" -> "$99.00". Unparseable input passes through untouched.
  function normPrice(v) {
    var s = String(v == null ? "" : v).trim();
    if (!s) return null;
    var num = s.replace(/\$/g, "").replace(/,/g, "").trim();
    if (/^\d+(\.\d{1,2})?$/.test(num)) {
      var n = parseFloat(num);
      if (!isNaN(n)) return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    return s;
  }

  /* ---------- products ---------- */

  var editingProduct = null, brandNames = [], brandLogos = {}, prodRows = [];
  var prodBrand = null, prodQuery = ""; // null = brand list; "" = No brand; name = brand view

  async function renderProducts() {
    var el = document.getElementById("tab-products");
    el.innerHTML =
      '<div class="toolbar"><div id="prod-head"></div>' +
      '<div class="toolbar-actions">' +
      '<div class="search-box">' + icon("i-search") +
      '<input type="search" id="prod-search" placeholder="Search" aria-label="Search brands and products" value="' + esc(prodQuery) + '" /></div>' +
      btn("Add product", "primary", ' id="prod-add"', "i-plus") + "</div></div>" +
      '<div class="msg" id="prod-msg"></div>' +
      '<div id="prod-list">' + loadingBox("Loading products…") + "</div>" +
      '<div id="prod-form-wrap"></div>';

    document.getElementById("prod-add").addEventListener("click", startAddProduct);
    document.getElementById("prod-search").addEventListener("input", function () {
      prodQuery = this.value;
      renderProdView();
    });

    var res = await sb.from("products").select("*").order("brand").order("name");
    if (res.error) {
      document.getElementById("prod-list").innerHTML = "";
      showMsg(document.getElementById("prod-msg"), res.error.message, false);
      return;
    }
    prodRows = res.data || [];

    // brand datalist cache
    try {
      var b = await sb.from("brands").select("name,photo").order("name");
      if (!b.error && b.data) {
        brandNames = b.data.map(function (x) { return x.name; });
        brandLogos = {};
        b.data.forEach(function (x) { brandLogos[x.name] = x.photo || ""; });
      } else throw new Error("fallback");
    } catch (e) {
      brandNames = Array.from(new Set(prodRows.map(function (p) { return p.brand; }).filter(Boolean)));
      brandLogos = {};
    }

    document.getElementById("prod-list").addEventListener("click", async function (e) {
      var bo = e.target.closest("[data-brand-open]");
      if (bo) {
        prodBrand = bo.getAttribute("data-brand-open");
        prodQuery = "";
        document.getElementById("prod-search").value = "";
        document.getElementById("prod-form-wrap").innerHTML = "";
        renderProdView();
        return;
      }
      var lgb = e.target.closest("[data-brand-logo]");
      if (lgb) { openBrandLogoEditor(lgb.getAttribute("data-brand-logo")); return; }
      var bdb = e.target.closest("[data-brand-del]");
      if (bdb) {
        var bname = bdb.getAttribute("data-brand-del");
        var bn = prodRows.filter(function (p) { return (p.brand || "") === bname; }).length;
        var body = bn === 0
          ? "\u201C" + bname + "\u201D will be removed from the brand list. This can't be undone."
          : "\u201C" + bname + "\u201D is used by " + bn + (bn === 1 ? " product" : " products") +
            ". Delete it anyway? " + (bn === 1 ? "That product" : "Those products") +
            " will be moved to \u201CNo brand\u201D. This can't be undone.";
        var okb = await confirmDialog({ title: "Delete brand?", body: body, confirmLabel: "Delete" });
        if (!okb) return;
        setBusy(bdb, true, "Deleting\u2026");
        var delB = await sb.from("brands").delete().eq("name", bname);
        if (delB.error) {
          setBusy(bdb, false);
          showMsg(document.getElementById("prod-msg"), delB.error.message, false);
          return;
        }
        if (bn > 0) {
          // No FK on products.brand — reassign to "No brand" ("") so nothing is orphaned.
          var un = await sb.from("products").update({ brand: "" }).eq("brand", bname);
          if (un.error) {
            setBusy(bdb, false);
            showMsg(document.getElementById("prod-msg"), un.error.message, false);
            return;
          }
        }
        brandNames = brandNames.filter(function (x) { return x !== bname; });
        delete brandLogos[bname];
        await logChange({ entity: "brand", entity_label: bname, action: "delete", old_value: bname });
        toast("Brand deleted.");
        loaded.products = false;
        renderProducts();
        return;
      }
      var eb = e.target.closest("[data-edit]");
      var db = e.target.closest("[data-del]");
      if (eb) {
        var found = prodRows.find(function (p) { return String(p.id) === eb.dataset.edit; });
        editingProduct = found || null;
        renderProductForm();
      } else if (db) {
        var ok = await confirmDialog({
          title: "Delete product?",
          body: "“" + db.dataset.name + "” will be removed from the website. This can't be undone.",
          confirmLabel: "Delete"
        });
        if (!ok) return;
        setBusy(db, true, "Deleting…");
        var delRow = prodRows.find(function (r) { return String(r.id) === db.dataset.del; }) || null;
        var d = await sb.from("products").delete().eq("id", db.dataset.del);
        if (d.error) {
          setBusy(db, false);
          showMsg(document.getElementById("prod-msg"), d.error.message, false);
        } else {
          await logChange({ entity: "product",
            entity_label: delRow ? delRow.name : db.dataset.name,
            record_id: db.dataset.del, action: "delete", old_row: delRow });
          toast("Product deleted.");
          loaded.products = false;
          renderProducts();
        }
      }
    });

    renderProdView();
  }

  function startAddProduct() {
    editingProduct = null;
    renderProductForm(prodBrand || null);
  }

  // Brand groups for the browse-by-brand view: every known brand (even with
  // zero products) plus a "No brand" group for unbranded products.
  function prodGroups() {
    var map = {};
    prodRows.forEach(function (p) {
      var bn = p.brand || "";
      if (!map[bn]) map[bn] = { name: bn, count: 0, photo: null };
      map[bn].count++;
      if (!map[bn].photo && p.photo) map[bn].photo = p.photo;
    });
    var names = brandNames.slice();
    Object.keys(map).forEach(function (bn) {
      if (bn && names.indexOf(bn) < 0) names.push(bn);
    });
    names.sort(function (a, b2) { return a.localeCompare(b2); });
    var groups = names.map(function (n) {
      var gr = map[n] || { name: n, count: 0, photo: null };
      gr.logo = brandLogos[n] || "";
      return gr;
    });
    if (map[""]) groups.push(map[""]);
    return groups;
  }

  function brandTileHtml(g) {
    var label = g.name || "No brand";
    var countTxt = g.count === 0 ? "No products yet" : g.count === 1 ? "1 product" : g.count + " products";
    // "No brand" is not a real brand row — it can't be deleted.
    var del = g.name
      ? '<button type="button" class="brand-tile-del" data-brand-del="' + esc(g.name) + '"' +
        ' aria-label="Delete brand ' + esc(label) + '">' + icon("i-trash") + "</button>"
      : "";
    var logoBtn = g.name
      ? '<button type="button" class="brand-tile-logo" data-brand-logo="' + esc(g.name) + '"' +
        ' aria-label="Edit logo for ' + esc(label) + '">' + icon("i-edit") + "</button>"
      : "";
    return '<div class="brand-tile">' +
      '<button type="button" class="brand-tile-open" data-brand-open="' + esc(g.name) + '"' +
      ' aria-label="' + esc(label + ", " + countTxt) + '">' +
      ((g.logo || g.photo)
        ? '<img class="thumb brand-thumb" src="' + esc(g.logo || g.photo) + '" alt="" loading="lazy" />'
        : '<span class="brand-tile-icon" aria-hidden="true">' + icon("i-tag") + "</span>") +
      '<span class="brand-tile-main"><span class="brand-tile-name">' + esc(label) + "</span>" +
      '<span class="brand-tile-count">' + esc(countTxt) + "</span></span>" +
      icon("i-chev", "chev-right") + "</button>" + del + logoBtn + "</div>";
  }

  // Brand logo editor: preview + upload + paste-link + remove. Uploads go to
  // the site-assets bucket; the public URL is saved on brands.photo, which is
  // what the homepage Shop by Brand tiles show.
  function openBrandLogoEditor(bname) {
    var root = document.getElementById("modal-root");
    var prevFocus = document.activeElement;
    var cur = brandLogos[bname] || "";
    var uid = "bl" + Date.now();
    root.innerHTML =
      '<div class="modal-overlay">' +
      '<div class="modal" role="dialog" aria-modal="true" aria-labelledby="' + uid + '-title">' +
      '<h2 id="' + uid + '-title">Brand logo</h2>' +
      '<p class="page-sub">\u201C' + esc(bname) + '\u201D \u2014 this logo shows on the homepage Shop by Brand tiles.</p>' +
      '<p class="msg" id="' + uid + '-msg"></p>' +
      '<div class="img-card">' +
      '<div class="img-card-preview">' +
      '<img id="' + uid + '-preview" src="' + esc(cur) + '" alt="Brand logo preview"' + (cur ? "" : " hidden") + " />" +
      '<div class="img-empty" id="' + uid + '-empty"' + (cur ? " hidden" : "") + ">" +
      icon("i-upload", "img-empty-icon") + "<span>No logo yet</span></div></div>" +
      '<p class="file-name" id="' + uid + '-filename" hidden></p>' +
      '<div class="img-card-actions">' +
      '<input type="file" id="' + uid + '-file" class="file-sr" accept="image/*" aria-label="Upload brand logo" />' +
      '<label class="btn accent" for="' + uid + '-file">' + icon("i-upload") + "<span>Upload image</span></label>" +
      '<button type="button" class="btn danger-outline" id="' + uid + '-remove"' + (cur ? "" : " hidden") +
      ' aria-label="Remove brand logo">' + icon("i-trash") + "<span>Remove</span></button>" +
      "</div>" +
      '<details class="img-url"><summary>Or paste a link</summary>' +
      '<input type="url" id="' + uid + '-url" value="' + esc(cur) + '" placeholder="https://" inputmode="url" ' +
      'aria-label="Brand logo image URL" /></details>' +
      "</div>" +
      '<div class="modal-actions">' +
      '<button type="button" class="btn" data-cancel>Cancel</button>' +
      '<button type="button" class="btn primary" data-ok>Save logo</button>' +
      "</div></div></div>";
    var overlay = root.firstElementChild;
    var msgEl = document.getElementById(uid + "-msg");
    var fi = document.getElementById(uid + "-file");
    var nameEl = document.getElementById(uid + "-filename");
    var prev = document.getElementById(uid + "-preview");
    var empty = document.getElementById(uid + "-empty");
    var urlInput = document.getElementById(uid + "-url");
    var removeBtn = document.getElementById(uid + "-remove");
    var saveBtn = overlay.querySelector("[data-ok]");
    var picked = null, cleared = false;
    function showEmpty(show) { empty.hidden = show; prev.hidden = show; removeBtn.hidden = show; }
    function close() {
      root.innerHTML = "";
      document.removeEventListener("keydown", onKey, true);
      if (prevFocus && prevFocus.focus) { try { prevFocus.focus(); } catch (e) {} }
    }
    function onKey(e) { if (e.key === "Escape") close(); }
    document.addEventListener("keydown", onKey, true);
    overlay.addEventListener("mousedown", function (e) { if (e.target === overlay) close(); });
    overlay.querySelector("[data-cancel]").addEventListener("click", close);
    fi.addEventListener("change", function () {
      picked = fi.files[0] || null;
      if (picked) {
        cleared = false;
        nameEl.textContent = "Selected: " + picked.name;
        nameEl.hidden = false;
        if (prev._objUrl) URL.revokeObjectURL(prev._objUrl);
        prev._objUrl = URL.createObjectURL(picked);
        prev.src = prev._objUrl;
        urlInput.value = "";
        showEmpty(false);
      }
    });
    urlInput.addEventListener("input", function () {
      picked = null; fi.value = ""; nameEl.hidden = true; cleared = false;
      var v = urlInput.value.trim();
      if (v) { prev.src = v; showEmpty(false); } else showEmpty(true);
    });
    removeBtn.addEventListener("click", function () {
      picked = null; cleared = true; fi.value = ""; nameEl.hidden = true;
      if (prev._objUrl) { URL.revokeObjectURL(prev._objUrl); prev._objUrl = null; }
      prev.removeAttribute("src");
      urlInput.value = "";
      showEmpty(true);
    });
    saveBtn.addEventListener("click", async function () {
      setBusy(saveBtn, true, "Saving\u2026");
      try {
        var newUrl = cleared ? "" : (picked ? await uploadPhoto("site-assets", picked) : urlInput.value.trim());
        var up = await sb.from("brands").update({ photo: newUrl }).eq("name", bname);
        if (up.error) throw up.error;
        brandLogos[bname] = newUrl;
        await logChange({ entity: "brand", entity_label: bname, action: "update", field: "photo", old_value: cur, new_value: newUrl });
        close();
        toast("Brand logo saved.");
        loaded.products = false;
        renderProducts();
      } catch (err) {
        setBusy(saveBtn, false);
        showMsg(msgEl, (err && err.message) || "Could not save the logo.", false);
      }
    });
    saveBtn.focus();
  }

  function productCardHtml(p) {
    return '<article class="item-card">' +
      (p.photo ? '<img class="thumb" src="' + esc(p.photo) + '" alt="" loading="lazy" />' : "") +
      '<div class="item-main"><div class="item-title">' + esc(p.name) + "</div>" +
      (p.note ? '<div class="item-sub">' + esc(p.note) + "</div>" : "") + "</div>" +
      '<div class="item-actions">' +
      btn("Edit", "small", ' data-edit="' + esc(p.id) + '"', "i-edit") +
      btn("Delete", "small danger-outline", ' data-del="' + esc(p.id) + '" data-name="' + esc(p.name) + '"', "i-trash") +
      "</div></article>";
  }

  function wireEmptyAdd() {
    var b = document.getElementById("prod-empty-add");
    if (b) b.addEventListener("click", startAddProduct);
  }

  function renderProdView() {
    var head = document.getElementById("prod-head");
    var list = document.getElementById("prod-list");
    if (!head || !list) return;
    var q = prodQuery.trim().toLowerCase();
    function matches(s) { return !q || String(s || "").toLowerCase().indexOf(q) >= 0; }

    if (prodBrand === null) {
      head.innerHTML =
        '<h2 class="section-title">Products</h2>' +
        '<p class="page-sub">Choose a brand to see and edit its products.</p>';
      var groups = prodGroups().filter(function (g) { return matches(g.name || "No brand"); });
      if (!groups.length) {
        list.innerHTML = q
          ? emptyState("i-tag", "No brands match", "Nothing matches “" + prodQuery.trim() + "”.", null, null)
          : emptyState("i-tag", "No products yet",
              "Add your first product and it will show up in the shop on the website.",
              "Add product", "prod-empty-add");
        wireEmptyAdd();
      } else {
        list.innerHTML = '<div class="brand-grid">' + groups.map(brandTileHtml).join("") + "</div>";
      }
      return;
    }

    var known = prodGroups().map(function (g) { return g.name; });
    if (known.indexOf(prodBrand) < 0) { prodBrand = null; renderProdView(); return; }
    var bname = prodBrand || "No brand";
    var items = prodRows.filter(function (p) {
      return (p.brand || "") === prodBrand && (matches(p.name) || matches(p.note));
    });
    head.innerHTML =
      '<button type="button" class="btn small" id="prod-back">' + icon("i-chev", "chev-left") + "All brands</button>" +
      '<h2 class="section-title">' + esc(bname) + "</h2>" +
      '<p class="page-sub">' + items.length + (items.length === 1 ? " product" : " products") + "</p>";
    document.getElementById("prod-back").addEventListener("click", function () {
      prodBrand = null;
      prodQuery = "";
      document.getElementById("prod-search").value = "";
      document.getElementById("prod-form-wrap").innerHTML = "";
      renderProdView();
    });
    if (!items.length) {
      list.innerHTML = q
        ? emptyState("i-tag", "No matches", "No products in " + bname + " match “" + prodQuery.trim() + "”.", null, null)
        : emptyState("i-tag", "No products in " + bname + " yet",
            "Add the first product for this brand.", "Add product", "prod-empty-add");
      wireEmptyAdd();
    } else {
      list.innerHTML = items.map(productCardHtml).join("");
    }
  }


    function openBrandPicker() {
    var hidden = document.getElementById("pf-brand");
    var nameEl = document.getElementById("pf-brand-name");
    var btn = document.getElementById("pf-brand-btn");
    var root = document.getElementById("modal-root");
    var current = hidden.value;

    function optionHtml(n) {
      var sel = n === current;
      return '<button type="button" class="brand-option' + (sel ? " selected" : "") + '" data-brand="' + esc(n) + '"' +
        (sel ? ' aria-current="true"' : "") + ">" +
        "<span>" + esc(n) + "</span>" +
        (sel ? '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6L9 17l-5-5"/></svg>' : "") +
        "</button>";
    }
    var listHtml = brandNames.length
      ? brandNames.map(optionHtml).join("")
      : '<p class="msg show">No brands yet — create the first one below.</p>';

    root.innerHTML =
      '<div class="modal-overlay">' +
      '<div class="modal brand-modal" role="dialog" aria-modal="true" aria-labelledby="brand-modal-title">' +
      '<h2 id="brand-modal-title">Choose a brand</h2>' +
      '<div class="brand-list">' + listHtml + "</div>" +
      '<div class="brand-new" hidden>' +
      '<label for="brand-new-name">New brand name</label>' +
      '<div class="brand-new-row">' +
      '<input type="text" id="brand-new-name" placeholder="e.g. Chemical Guys" autocomplete="off" />' +
      '<button type="button" class="btn" id="brand-new-create">Create</button>' +
      "</div>" +
      '<p class="msg" id="brand-new-err"></p>' +
      "</div>" +
      '<div class="modal-actions">' +
      '<button type="button" class="btn" data-close>Cancel</button>' +
      '<button type="button" class="btn" id="brand-new-toggle">New brand</button>' +
      "</div></div></div>";

    var overlay = root.firstElementChild;
    function close() {
      root.innerHTML = "";
      document.removeEventListener("keydown", onKey, true);
      if (btn && btn.focus) { try { btn.focus(); } catch (e) {} }
    }
    function onKey(e) { if (e.key === "Escape") close(); }
    document.addEventListener("keydown", onKey, true);
    overlay.addEventListener("mousedown", function (e) { if (e.target === overlay) close(); });
    overlay.querySelector("[data-close]").addEventListener("click", close);

    function choose(name) {
      hidden.value = name;
      nameEl.textContent = name;
      close();
    }
    var opts = overlay.querySelectorAll("[data-brand]");
    for (var i = 0; i < opts.length; i++) {
      (function (b) { b.addEventListener("click", function () { choose(b.getAttribute("data-brand")); }); })(opts[i]);
    }

    var newBox = overlay.querySelector(".brand-new");
    var toggle = overlay.querySelector("#brand-new-toggle");
    var nameInput = overlay.querySelector("#brand-new-name");
    var errEl = overlay.querySelector("#brand-new-err");
    toggle.addEventListener("click", function () {
      var show = newBox.hidden;
      newBox.hidden = !show;
      toggle.textContent = show ? "Close" : "New brand";
      clearMsg(errEl);
      if (show) nameInput.focus();
    });

    overlay.querySelector("#brand-new-create").addEventListener("click", async function () {
      var v = nameInput.value.trim();
      clearMsg(errEl);
      if (!v) { showMsg(errEl, "Type a brand name first.", false); return; }
      if (brandNames.some(function (n) { return n.toLowerCase() === v.toLowerCase(); })) {
        showMsg(errEl, "That brand already exists — pick it from the list.", false);
        return;
      }
      var createBtn = overlay.querySelector("#brand-new-create");
      setBusy(createBtn, true, "Creating\u2026");
      try {
        var ins = await sb.from("brands").insert({ name: v }).select("name").single();
        if (ins.error) throw ins.error;
        brandNames.push(ins.data.name);
        brandLogos[ins.data.name] = "";
        brandNames.sort(function (a, b2) { return a.localeCompare(b2); });
        toast("Brand created.");
        choose(ins.data.name);
      } catch (err) {
        setBusy(createBtn, false);
        showMsg(errEl, (err && err.message) || "Could not create the brand.", false);
      }
    });
  }

function renderProductForm(presetBrand) {
    var p = editingProduct || {};
    if (!p.id && presetBrand) p.brand = presetBrand;
    var wrap = document.getElementById("prod-form-wrap");
    wrap.innerHTML =
      '<div class="card"><h3 class="section-title">' + (p.id ? "Edit product" : "Add product") + "</h3>" +
      '<div class="msg" id="prod-form-msg"></div>' +
      '<form id="prod-form" class="grid" novalidate>' +
      '<div class="field"><label for="pf-name">Name <span class="req" aria-hidden="true">*</span></label>' +
      '<input type="text" id="pf-name" required value="' + esc(p.name) + '" /></div>' +
      '<div class="field"><label for="pf-note">Note / size</label>' +
      '<input type="text" id="pf-note" value="' + esc(p.note) + '" placeholder="e.g. 16 oz" /></div>' +
      '<div class="cols2">' +
      '<div class="field"><label id="pf-brand-label">Brand</label>' +
      '<input type="hidden" id="pf-brand" value="' + esc(p.brand || "") + '" />' +
      '<button type="button" class="brand-picker-btn" id="pf-brand-btn" aria-haspopup="dialog" aria-labelledby="pf-brand-label pf-brand-name">' +
      '<span id="pf-brand-name">' + esc(p.brand || "Select a brand") + "</span>" +
      '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 15l-6-6-6 6"/></svg>' +
      "</button></div>" +
      '<div class="field"><label for="pf-initials">Initials</label>' +
      '<input type="text" id="pf-initials" value="' + esc(p.initials) + '" /></div>' +
      "</div>" +
      '<div class="field"><label for="pf-photo">Photo URL</label>' +
      '<input type="url" id="pf-photo" value="' + esc(p.photo) + '" placeholder="https://" inputmode="url" />' +
      '<span class="hint">Paste a link, or upload a new photo below.</span></div>' +
      '<div class="divider" aria-hidden="true">or</div>' +
      '<div class="field"><label for="pf-file">Upload a photo</label>' +
      '<input type="file" id="pf-file" accept="image/*" />' +
      '<p class="file-name" id="pf-filename" hidden></p></div>' +
      '<img class="preview-img" id="pf-preview" src="' + esc(p.photo || "") + '" alt="Product photo preview"' +
      (p.photo ? "" : ' hidden') + " />" +
      '<div class="form-row">' +
      '<button type="submit" class="btn primary" id="prod-save">' + icon("i-check") + "Save product</button>" +
      '<button type="button" class="btn" id="prod-cancel">Cancel</button>' +
      "</div></form></div>";

    wrap.scrollIntoView({ block: "start", behavior: "smooth" });

    var fileInput = document.getElementById("pf-file");
    fileInput.addEventListener("change", function () {
      var f = fileInput.files[0];
      var nameEl = document.getElementById("pf-filename");
      var prev = document.getElementById("pf-preview");
      if (f) {
        nameEl.textContent = "Selected: " + f.name;
        nameEl.hidden = false;
        prev.src = URL.createObjectURL(f);
        prev.hidden = false;
        document.getElementById("pf-photo").value = "";
      } else {
        nameEl.hidden = true;
        if (!p.photo) prev.hidden = true;
      }
    });

    document.getElementById("prod-cancel").addEventListener("click", function () {
      wrap.innerHTML = "";
    });

    document.getElementById("pf-brand-btn").addEventListener("click", openBrandPicker);

    document.getElementById("prod-form").addEventListener("submit", async function (e) {
      e.preventDefault();
      var mbox = document.getElementById("prod-form-msg");
      clearMsg(mbox);
      var nameEl = document.getElementById("pf-name");
      if (!requireValue(nameEl, "Product name")) return;
      var saveBtn = document.getElementById("prod-save");
      setBusy(saveBtn, true, "Saving…");
      var payload = {
        name: nameEl.value.trim(),
        note: document.getElementById("pf-note").value.trim() || null,
        brand: document.getElementById("pf-brand").value.trim() || null,
        initials: document.getElementById("pf-initials").value.trim() || null
      };
      var file = fileInput.files[0];
      try {
        if (file) {
          payload.photo = await uploadPhoto("product-images", file);
        } else if (document.getElementById("pf-photo").value.trim()) {
          payload.photo = document.getElementById("pf-photo").value.trim();
        } else {
          payload.photo = null;
        }
        var before = p.id ? Object.assign({}, editingProduct || {}) : null;
        var res = p.id
          ? await sb.from("products").update(payload).eq("id", p.id)
          : await sb.from("products").insert(payload).select();
        if (res.error) throw res.error;
        if (p.id && before) {
          var after = Object.assign({}, before, payload);
          await Promise.all(["name", "note", "brand", "initials", "photo"].map(function (k) {
            if (cmpVal(before[k]) === cmpVal(after[k])) return null;
            return logChange({ entity: "product", entity_label: after.name, record_id: p.id,
              action: "update", field: k, old_value: dispField("product", k, before[k]),
              new_value: dispField("product", k, after[k]), old_row: before, new_row: after });
          }).filter(Boolean));
        } else if (res.data && res.data[0]) {
          var newRow = res.data[0];
          await logChange({ entity: "product", entity_label: newRow.name, record_id: newRow.id,
            action: "create", new_row: newRow });
        }
        toast(p.id ? "Product updated." : "Product added.");
        editingProduct = null;
        prodBrand = payload.brand || "";
        setTimeout(function () { loaded.products = false; renderProducts(); }, 500);
      } catch (err) {
        setBusy(saveBtn, false);
        showMsg(mbox, err.message || "Save failed.", false);
      }
    });
  }

  /* ---------- packages ---------- */

  var editingPackage = null;

  async function renderPackages() {
    var el = document.getElementById("tab-packages");
    el.innerHTML =
      '<div class="toolbar"><div><h2 class="section-title">Packages</h2>' +
      '<p class="page-sub">Service packages and prices on the website.</p></div>' +
      btn("Add package", "primary", ' id="pkg-add"', "i-plus") + "</div>" +
      '<div class="msg" id="pkg-msg"></div>' +
      '<div id="pkg-list">' + loadingBox("Loading packages…") + "</div>" +
      '<div id="pkg-form-wrap"></div>';

    function startAdd() { editingPackage = null; renderPackageForm(); }
    document.getElementById("pkg-add").addEventListener("click", startAdd);

    var res = await sb.from("packages").select("*").order("number");
    if (res.error) {
      document.getElementById("pkg-list").innerHTML = "";
      showMsg(document.getElementById("pkg-msg"), res.error.message, false);
      return;
    }
    var rows = res.data || [];
    var list = document.getElementById("pkg-list");
    if (!rows.length) {
      list.innerHTML = emptyState("i-box", "No packages yet",
        "Add your first service package and it will show up on the website.",
        "Add package", "pkg-empty-add");
      document.getElementById("pkg-empty-add").addEventListener("click", startAdd);
    } else {
      list.innerHTML = rows.map(function (p) {
        return '<article class="item-card"><div class="item-main">' +
          '<div class="item-title">' + esc(p.name) +
          ' <span class="item-sub">#' + esc(p.number) + " · " + esc(p.category) + "</span></div>" +
          '<div class="item-sub">Car ' + esc(p.price_car) + " · SUV " + esc(p.price_suv) + " · Truck " + esc(p.price_truck) +
          (p.coupon ? " · Coupon: " + esc(p.coupon) : "") + "</div></div>" +
          '<div class="item-actions">' +
          btn("Edit", "small", ' data-edit="' + esc(p.id) + '"', "i-edit") +
          btn("Delete", "small danger-outline", ' data-del="' + esc(p.id) + '" data-name="' + esc(p.name) + '"', "i-trash") +
          "</div></article>";
      }).join("");
    }

    list.addEventListener("click", async function (e) {
      var eb = e.target.closest("[data-edit]");
      var db = e.target.closest("[data-del]");
      if (eb) {
        editingPackage = rows.find(function (p) { return String(p.id) === eb.dataset.edit; }) || null;
        renderPackageForm();
      } else if (db) {
        var ok = await confirmDialog({
          title: "Delete package?",
          body: "\u201C" + db.dataset.name + "\u201D will be removed from the website. This can't be undone.",
          confirmLabel: "Delete"
        });
        if (!ok) return;
        setBusy(db, true, "Deleting…");
        var delRow = rows.find(function (r) { return String(r.id) === db.dataset.del; }) || null;
        var d = await sb.from("packages").delete().eq("id", db.dataset.del);
        if (d.error) {
          setBusy(db, false);
          showMsg(document.getElementById("pkg-msg"), d.error.message, false);
        } else {
          await logChange({ entity: "package",
            entity_label: delRow ? delRow.name : db.dataset.name,
            record_id: db.dataset.del, action: "delete", old_row: delRow });
          toast("Package deleted.");
          loaded.packages = false;
          renderPackages();
        }
      }
    });
  }

  function renderPackageForm() {
    var p = editingPackage || {};
    var inc = Array.isArray(p.includes) ? p.includes.map(function (i) { return i.text; }).join("\n") : "";
    var cats = ["express", "detail", "premium"];
    var wrap = document.getElementById("pkg-form-wrap");
    wrap.innerHTML =
      '<div class="pkg-split">' +
      '<div class="card pkg-form-card"><h3 class="section-title">' + (p.id ? "Edit package" : "Add package") + "</h3>" +
      '<div class="msg" id="pkg-form-msg"></div>' +
      '<form id="pkg-form" class="grid" novalidate>' +
      '<div class="cols2">' +
      '<div class="field"><label for="pk-id">ID / slug <span class="req" aria-hidden="true">*</span></label>' +
      '<input type="text" id="pk-id" required ' + (p.id ? "disabled" : "") +
      ' value="' + esc(p.id) + '" placeholder="express-wash" />' +
      (p.id ? '<span class="hint">The ID can\u2019t be changed after creation.</span>' : "") + "</div>" +
      '<div class="field"><label for="pk-number">Number</label>' +
      '<input type="number" id="pk-number" value="' + esc(p.number) + '" /></div>' +
      "</div>" +
      '<div class="field"><label for="pk-name">Name <span class="req" aria-hidden="true">*</span></label>' +
      '<input type="text" id="pk-name" required value="' + esc(p.name) + '" /></div>' +
      '<div class="field"><label for="pk-cat">Category</label>' +
      '<select id="pk-cat">' + cats.map(function (c) {
        return '<option value="' + c + '"' + (p.category === c ? " selected" : "") + ">" +
          c.charAt(0).toUpperCase() + c.slice(1) + "</option>";
      }).join("") + "</select></div>" +
      '<div class="cols3">' +
      '<div class="field"><label for="pk-car">Price — car</label>' +
      '<input type="text" id="pk-car" value="' + esc(p.price_car) + '" inputmode="decimal" /></div>' +
      '<div class="field"><label for="pk-suv">Price — SUV</label>' +
      '<input type="text" id="pk-suv" value="' + esc(p.price_suv) + '" inputmode="decimal" /></div>' +
      '<div class="field"><label for="pk-truck">Price — truck</label>' +
      '<input type="text" id="pk-truck" value="' + esc(p.price_truck) + '" inputmode="decimal" /></div>' +
      "</div>" +
      '<p class="hint">Type just the number for prices \u2014 99 becomes $99.00.</p>' +
      '<div class="field"><label for="pk-coupon">Coupon</label>' +
      '<input type="text" id="pk-coupon" value="' + esc(p.coupon) + '" placeholder="e.g. 20" inputmode="decimal" />' +
      '<span class="hint">Just type the amount, e.g. 20 \u2014 it shows as \u201C$20 coupon available\u201D on the site.</span></div>' +
      '<div class="field"><label for="pk-includes">Includes</label>' +
      '<textarea id="pk-includes" placeholder="One item per line">' + esc(inc) + "</textarea>" +
      '<span class="hint">One item per line — each line becomes a bullet on the website.</span></div>' +
      '<div class="form-row">' +
      '<button type="submit" class="btn primary" id="pkg-save">' + icon("i-check") + "Save package</button>" +
      '<button type="button" class="btn" id="pkg-cancel">Cancel</button>' +
      "</div></form></div>" +
      '<div class="pkg-preview-col"><div class="pkg-preview-head">' + icon("i-eye") + "<span>Preview</span></div>" +
      '<div id="pkg-preview" aria-live="polite"></div></div>' +
      "</div>";

    wrap.scrollIntoView({ block: "start", behavior: "smooth" });

    document.getElementById("pkg-cancel").addEventListener("click", function () {
      wrap.innerHTML = "";
    });

    /* live preview: right column mirrors the public site's package card */
    function readPkgDraft() {
      var lines = document.getElementById("pk-includes").value
        .split("\n").map(function (l) { return l.trim(); }).filter(Boolean);
      return {
        number: document.getElementById("pk-number").value.trim(),
        name: document.getElementById("pk-name").value.trim(),
        category: document.getElementById("pk-cat").value,
        price_car: normPrice(document.getElementById("pk-car").value) || "",
        price_suv: normPrice(document.getElementById("pk-suv").value) || "",
        price_truck: normPrice(document.getElementById("pk-truck").value) || "",
        coupon: normCoupon(document.getElementById("pk-coupon").value) || "",
        includes: lines
      };
    }

    /* Category section headings, exactly as on the public Services page. */
    var PKG_CAT_SECTIONS = {
      express: { title: "Express wash", sub: "A thorough wash, inside and out \u2014 the quick refresh.", grid: "packages-grid packages-grid--single" },
      detail: { title: "Detail packages", sub: "Complete interior and exterior detailing, step by step.", grid: "packages-grid" },
      premium: { title: "Paint correction & ceramic coating", sub: "Machine polishing and long-term paint protection.", grid: "packages-grid packages-grid--duo" }
    };

    /* Live preview: the draft package rendered with the public site's exact
       card markup (same structure and classes as packageCard() in the site's
       script.js), inside the site's category section. Styled by the scoped
       .pkg-site rules in admin.css - what Joe sees here is what customers see
       on the Services page. Empty draft fields show muted placeholders. */
    function previewPackageCard(d) {
      var cls = "package-card" +
        (d.category === "express" ? " package-card--wide" : "") +
        (d.category === "premium" ? " package-card--premium" : "");
      var dash = "\u2014";
      var price = function (v) { return v ? esc(v) : dash; };
      var badge = d.coupon
        ? '<p class="pkg-badge">' + esc(d.coupon) + "</p>"
        : ""; // no coupon text -> no badge at all, like the site
      var prices = '<ul class="pkg-prices">' +
        "<li><span>Car</span><span>" + price(d.price_car) + "</span></li>" +
        "<li><span>SUV</span><span>" + price(d.price_suv) + "</span></li>" +
        "<li><span>Truck</span><span>" + price(d.price_truck) + "</span></li></ul>";
      var includes = d.includes.length
        ? d.includes.map(function (it) { return "<li>" + esc(it) + "</li>"; }).join("")
        : '<li class="pkg-draft-muted">No items listed yet.</li>';
      var inclBlock = '<h5 class="pkg-includes-title">What&rsquo;s included</h5>' +
        '<ul class="pkg-includes">' + includes + "</ul>";
      var button = '<button class="btn btn-call pkg-cta" type="button" disabled title="Preview only">Book this package</button>';
      var head = '<p class="pkg-num">Package #' + (d.number ? esc(d.number) : "\u2013") + "</p>" +
        '<h4 class="pkg-name">' + (d.name ? esc(d.name) : '<span class="pkg-draft-empty">Package name</span>') + "</h4>" +
        '<p class="pkg-from"><span>Starting at</span>' + price(d.price_car) + "</p>";
      if (d.category === "express") {
        return '<article class="' + cls + '"><div class="pkg-main">' +
          head + prices + badge + button +
          '</div><div class="pkg-side">' + inclBlock + "</div></article>";
      }
      return '<article class="' + cls + '">' +
        head + prices + inclBlock + badge + button + "</article>";
    }

    function renderPkgPreview() {
      var box = document.getElementById("pkg-preview");
      if (!box) return;
      var d = readPkgDraft();
      var sec = PKG_CAT_SECTIONS[d.category] || PKG_CAT_SECTIONS.detail;
      box.innerHTML = '<div class="pkg-site">' +
        '<h3 class="pkg-cat">' + sec.title + "</h3>" +
        '<p class="pkg-cat-sub">' + sec.sub + "</p>" +
        '<div class="' + sec.grid + '">' + previewPackageCard(d) + "</div></div>";
    }

    document.getElementById("pkg-form").addEventListener("input", renderPkgPreview);
    document.getElementById("pkg-form").addEventListener("change", renderPkgPreview);
    renderPkgPreview();

    document.getElementById("pkg-form").addEventListener("submit", async function (e) {
      e.preventDefault();
      var mbox = document.getElementById("pkg-form-msg");
      clearMsg(mbox);
      var idEl = document.getElementById("pk-id");
      var nameEl = document.getElementById("pk-name");
      var valid = requireValue(nameEl, "Package name");
      if (!p.id) valid = requireValue(idEl, "ID / slug") && valid;
      if (!valid) return;
      var saveBtn = document.getElementById("pkg-save");
      setBusy(saveBtn, true, "Saving…");
      var num = document.getElementById("pk-number").value;
      var payload = {
        number: num === "" ? null : Number(num),
        name: nameEl.value.trim(),
        category: document.getElementById("pk-cat").value,
        price_car: normPrice(document.getElementById("pk-car").value),
        price_suv: normPrice(document.getElementById("pk-suv").value),
        price_truck: normPrice(document.getElementById("pk-truck").value),
        coupon: normCoupon(document.getElementById("pk-coupon").value),
        includes: document.getElementById("pk-includes").value
          .split("\n").map(function (l) { return l.trim(); })
          .filter(Boolean).map(function (t) { return { text: t }; })
      };
      try {
        var before = p.id ? Object.assign({}, editingPackage || {}) : null;
        var res = p.id
          ? await sb.from("packages").update(payload).eq("id", p.id)
          : await sb.from("packages").insert(Object.assign({ id: idEl.value.trim() }, payload)).select();
        if (res.error) throw res.error;
        if (p.id && before) {
          var after = Object.assign({}, before, payload);
          await Promise.all(["number", "name", "category", "price_car", "price_suv", "price_truck", "coupon", "includes"].map(function (k) {
            if (cmpVal(before[k]) === cmpVal(after[k])) return null;
            return logChange({ entity: "package", entity_label: after.name, record_id: p.id,
              action: "update", field: k, old_value: dispField("package", k, before[k]),
              new_value: dispField("package", k, after[k]), old_row: before, new_row: after });
          }).filter(Boolean));
        } else if (res.data && res.data[0]) {
          var newRow = res.data[0];
          await logChange({ entity: "package", entity_label: newRow.name, record_id: newRow.id,
            action: "create", new_row: newRow });
        }
        toast(p.id ? "Package updated." : "Package added.");
        editingPackage = null;
        setTimeout(function () { loaded.packages = false; renderPackages(); }, 500);
      } catch (err) {
        setBusy(saveBtn, false);
        showMsg(mbox, err.message || "Save failed.", false);
      }
    });
  }

  /* ---------- reviews ---------- */

  var reviewRows = [];

  async function renderReviews() {
    var el = document.getElementById("tab-reviews");
    el.innerHTML =
      '<div class="toolbar"><div>' +
      '<h2 class="section-title">Reviews</h2>' +
      '<p class="page-sub">These show in the reviews loop on the homepage.</p></div>' +
      '<div class="toolbar-actions"><button type="button" class="btn primary" id="rev-add">' +
      icon("i-plus") + "<span>Add review</span></button></div></div>" +
      '<p class="msg" id="rev-msg"></p>' +
      '<div id="rev-list"><p class="page-sub">Loading\u2026</p></div>';
    document.getElementById("rev-add").addEventListener("click", function () { openReviewEditor(null); });
    var res;
    try {
      res = await sb.from("testimonials").select("*").order("name");
      if (res.error) throw res.error;
    } catch (e) {
      showMsg(document.getElementById("rev-msg"), "Could not load reviews: " + ((e && e.message) || String(e)), false);
      document.getElementById("rev-list").innerHTML = "";
      return;
    }
    reviewRows = res.data || [];
    paintReviewList();
  }

  function paintReviewList() {
    var list = document.getElementById("rev-list");
    if (!list) return;
    if (!reviewRows.length) {
      list.innerHTML = emptyState("i-chat", "No reviews yet",
        "Add your first review and it will show up in the homepage loop.",
        "Add review", "rev-empty-add");
      document.getElementById("rev-empty-add").addEventListener("click", function () { openReviewEditor(null); });
      return;
    }
    list.innerHTML = reviewRows.map(function (r) {
      return '<div class="card review-row" data-id="' + esc(r.id) + '">' +
        '<div class="review-row-main"><strong>' + esc(r.name) + "</strong>" +
        "<p>" + esc(r.quote) + "</p></div>" +
        '<div class="review-row-actions">' +
        '<button type="button" class="icon-btn" data-edit aria-label="Edit review">' + icon("i-edit") + "</button>" +
        '<button type="button" class="icon-btn" data-del aria-label="Delete review">' + icon("i-trash") + "</button>" +
        "</div></div>";
    }).join("");
    Array.prototype.forEach.call(list.querySelectorAll(".review-row"), function (card) {
      var id = card.getAttribute("data-id");
      var row = null;
      reviewRows.forEach(function (r) { if (String(r.id) === id) row = r; });
      card.querySelector("[data-edit]").addEventListener("click", function () { openReviewEditor(row); });
      card.querySelector("[data-del]").addEventListener("click", function () { deleteReview(row); });
    });
  }

  function openReviewEditor(row) {
    var root = document.getElementById("modal-root");
    var prevFocus = document.activeElement;
    var uid = "rv" + Date.now();
    var isNew = !row;
    root.innerHTML =
      '<div class="modal-overlay">' +
      '<div class="modal" role="dialog" aria-modal="true" aria-labelledby="' + uid + '-title">' +
      '<h2 id="' + uid + '-title">' + (isNew ? "Add review" : "Edit review") + "</h2>" +
      '<div class="field"><label for="' + uid + '-name">Name <span class="req" aria-hidden="true">*</span></label>' +
      '<input type="text" id="' + uid + '-name" value="' + esc(isNew ? "" : row.name) + '" maxlength="80" autocomplete="off" /></div>' +
      '<div class="field"><label for="' + uid + '-quote">Review <span class="req" aria-hidden="true">*</span></label>' +
      '<textarea id="' + uid + '-quote" rows="4" maxlength="600">' + esc(isNew ? "" : row.quote) + "</textarea></div>" +
      '<p class="msg" id="' + uid + '-msg"></p>' +
      '<div class="modal-actions">' +
      '<button type="button" class="btn" data-cancel>Cancel</button>' +
      '<button type="button" class="btn primary" data-ok>' + (isNew ? "Add review" : "Save changes") + "</button>" +
      "</div></div></div>";
    var overlay = root.firstElementChild;
    var msgEl = document.getElementById(uid + "-msg");
    var nameEl = document.getElementById(uid + "-name");
    var quoteEl = document.getElementById(uid + "-quote");
    var saveBtn = overlay.querySelector("[data-ok]");
    function close() {
      root.innerHTML = "";
      document.removeEventListener("keydown", onKey, true);
      if (prevFocus && prevFocus.focus) { try { prevFocus.focus(); } catch (e) {} }
    }
    function onKey(e) { if (e.key === "Escape") close(); }
    document.addEventListener("keydown", onKey, true);
    overlay.addEventListener("mousedown", function (e) { if (e.target === overlay) close(); });
    overlay.querySelector("[data-cancel]").addEventListener("click", close);
    async function onSave() {
      var name = nameEl.value.trim();
      var quote = quoteEl.value.trim();
      nameEl.setAttribute("aria-invalid", name ? "false" : "true");
      quoteEl.setAttribute("aria-invalid", quote ? "false" : "true");
      if (!name || !quote) {
        showMsg(msgEl, "Name and review text are both required.", false);
        (name ? quoteEl : nameEl).focus();
        return;
      }
      saveBtn.disabled = true;
      try {
        var res;
        if (isNew) {
          res = await sb.from("testimonials").insert({ name: name, quote: quote }).select().single();
          if (res.error) throw res.error;
          reviewRows.push(res.data);
          logChange({ entity: "review", entity_label: name, record_id: res.data.id, action: "create", new_row: res.data });
          toast("Review added.");
        } else {
          res = await sb.from("testimonials").update({ name: name, quote: quote }).eq("id", row.id).select().single();
          if (res.error) throw res.error;
          var oldRow = { name: row.name, quote: row.quote };
          row.name = name; row.quote = quote;
          logChange({ entity: "review", entity_label: name, record_id: row.id, action: "update", old_row: oldRow, new_row: { name: name, quote: quote } });
          toast("Review saved.");
        }
        reviewRows.sort(function (a, b) { return String(a.name).localeCompare(String(b.name)); });
        close();
        paintReviewList();
      } catch (e) {
        showMsg(msgEl, "Could not save: " + ((e && e.message) || String(e)), false);
        saveBtn.disabled = false;
      }
    }
    saveBtn.addEventListener("click", onSave);
    setTimeout(function () { nameEl.focus(); }, 50);
  }

  async function deleteReview(row) {
    if (!row) return;
    var ok = await confirmDialog({
      title: "Delete this review?",
      body: "\u201C" + row.quote.slice(0, 140) + (row.quote.length > 140 ? "\u2026" : "") + "\u201D \u2014 " + row.name + " will be removed from the website. This can't be undone.",
      confirmLabel: "Delete"
    });
    if (!ok) return;
    var res = await sb.from("testimonials").delete().eq("id", row.id);
    if (res.error) {
      showMsg(document.getElementById("rev-msg"), "Could not delete: " + res.error.message, false);
      return;
    }
    reviewRows = reviewRows.filter(function (r) { return String(r.id) !== String(row.id); });
    logChange({ entity: "review", entity_label: row.name, record_id: row.id, action: "delete", old_row: { name: row.name, quote: row.quote } });
    toast("Review deleted.");
    paintReviewList();
  }

  /* ---------- settings ---------- */

  // plain-language section descriptions shown under each legend (Joe-friendly)
  var GROUP_DESC = {
    "Shop info": "The basics about your shop \u2014 shown on the homepage and contact page.",
    "Hours": "When you\u2019re open. Shown in the contact section of the website.",
    "Phones": "Your phone numbers. Visitors tap them to call you.",
    "Page text": "Short bits of text used in different spots around the site.",
    "Images": "Your logo and the big background photos.",
    "Social links": "Buttons that link to your social media pages."
  };

  // fields: [db key, label, type, hint]. Type "hidden" renders a hidden input
  // (kept so the save payload and change log keys stay identical).
  var SETTING_GROUPS = [
    ["Shop info", [
      ["about_text", "About text", "textarea", "Shows in Our Story on the homepage. Blank lines start a new paragraph."],
      ["address", "Address", "text", "Shows in the contact section and at the top of the page."],
      ["address_line", "Footer line", "text", "One short line at the very bottom of every page."]
    ]],
    ["Hours", []],
    ["Phones", [
      ["phone1", "Phone number", "text", "The tap-to-call link is made from this number automatically."],
      ["phone2", "Second phone number", "text", "Optional. Leave blank if you only have one number."],
      ["phone1_href", "Phone 1 link", "hidden"],
      ["phone2_href", "Phone 2 link", "hidden"]
    ]],
    ["Page text", [
      ["water_text", "Water station text", "textarea", "Shows in the water station section on the homepage."],
      ["verse_text", "Bible verse", "textarea", "Shows in the footer, above the address line."],
      ["verse_cite", "Verse reference", "text", "Example: Acts 16:31. Shows right under the verse."],
      ["copyright_text", "Copyright line", "text", "Shows at the very bottom of every page."]
    ]],
    ["Images", [
      ["hero_van", "Hero van image", "text"],
      ["hero_bg", "Hero background image", "text"],
      ["water_bg", "Water section background image", "text"]
    ]]
  ];

  async function renderSettings() {
    var el = document.getElementById("tab-settings");
    el.innerHTML =
      '<div class="toolbar"><div><h2 class="section-title">Site Settings</h2>' +
      '<p class="page-sub">Words, phones, and links shown across the website.</p></div></div>' +
      '<div class="msg" id="set-msg"></div>' +
      '<div id="set-body">' + loadingBox("Loading settings…") + "</div>";
    var body = document.getElementById("set-body");

    var sRes = await sb.from("site_settings").select("*").eq("id", 1).maybeSingle();
    var slRes = await sb.from("social_links").select("*").order("name");
    if (sRes.error) {
      body.innerHTML = "";
      showMsg(document.getElementById("set-msg"), sRes.error.message, false);
      return;
    }
    var s = sRes.data || {};
    // hero_van column arrives via a one-line migration; until it runs, the
    // card stays hidden and the site keeps the default van photo.
    var hasVanCol = false;
    try {
      var vanProbe = await sb.from("site_settings").select("hero_van").limit(1);
      hasVanCol = !vanProbe.error;
    } catch (e) { hasVanCol = false; }
    var socials = (slRes.error || !slRes.data) ? [] : slRes.data;

    var hoursText = Array.isArray(s.hours)
      ? s.hours.map(function (h) { return h.days + " | " + h.time; }).join("\n") : "";

    function textField(key, label, type, hint) {
      var val = esc(s[key]);
      var input = type === "textarea"
        ? '<textarea id="sf-' + key + '">' + val + "</textarea>"
        : '<input type="text" id="sf-' + key + '" value="' + val + '" />';
      return '<div class="field"><label for="sf-' + key + '">' + esc(label) + "</label>" + input +
        (hint ? '<span class="hint">' + hint + "</span>" : "") + "</div>";
    }

    // polished image card: big preview (or dashed empty state), styled upload
    // button, remove button, and a collapsed "Or paste a link" URL toggle
    function imgUpload(key, label, url) {
      var has = !!url;
      return '<div class="img-card" id="sf-' + key + '-card">' +
        '<p class="img-card-title">' + esc(label) + "</p>" +
        '<div class="img-card-preview">' +
        '<img id="sf-' + key + '-preview" src="' + esc(url || "") + '" alt="' + esc(label) + ' preview"' +
        (has ? "" : " hidden") + " />" +
        '<div class="img-empty" id="sf-' + key + '-empty"' + (has ? " hidden" : "") + ">" +
        icon("i-upload", "img-empty-icon") + "<span>No image yet</span></div></div>" +
        '<p class="file-name" id="sf-' + key + '-filename" hidden></p>' +
        '<div class="img-card-actions">' +
        '<input type="file" id="sf-' + key + '-file" class="file-sr" accept="image/*" aria-label="Upload ' + esc(label) + '" />' +
        '<label class="btn accent" for="sf-' + key + '-file">' + icon("i-upload") + "<span>Upload image</span></label>" +
        '<button type="button" class="btn danger-outline img-remove" id="sf-' + key + '-remove"' +
        (has ? "" : " hidden") + ' aria-label="Remove ' + esc(label) + '">' + icon("i-trash") + "<span>Remove</span></button>" +
        "</div>" +
        '<details class="img-url"><summary>Or paste a link</summary>' +
        '<input type="url" id="sf-' + key + '" value="' + esc(url || "") + '" placeholder="https://" inputmode="url" ' +
        'aria-label="' + esc(label) + ' image URL" /></details>' +
        "</div>";
    }

    // wire card: file pick -> filename + live preview; URL typing -> live preview;
    // remove button clears everything. File wins over URL at submit time.
    function wireImgUpload(key, url) {
      var fi = document.getElementById("sf-" + key + "-file");
      var nameEl = document.getElementById("sf-" + key + "-filename");
      var prev = document.getElementById("sf-" + key + "-preview");
      var empty = document.getElementById("sf-" + key + "-empty");
      var urlInput = document.getElementById("sf-" + key);
      var removeBtn = document.getElementById("sf-" + key + "-remove");
      function showEmpty(show) {
        empty.hidden = show;
        prev.hidden = show;
        removeBtn.hidden = show;
      }
      function clearObjUrl() {
        if (prev._objUrl) { URL.revokeObjectURL(prev._objUrl); prev._objUrl = null; }
      }
      fi.addEventListener("change", function () {
        var f = fi.files[0];
        if (f) {
          nameEl.textContent = "Selected: " + f.name;
          nameEl.hidden = false;
          clearObjUrl();
          prev._objUrl = URL.createObjectURL(f);
          prev.src = prev._objUrl;
          showEmpty(false);
          if (urlInput) urlInput.value = "";
        } else {
          nameEl.hidden = true;
          if (!url) showEmpty(true);
        }
      });
      if (urlInput) urlInput.addEventListener("input", function () {
        fi.value = ""; // URL takes precedence over a pending file pick
        nameEl.hidden = true;
        clearObjUrl();
        var v = urlInput.value.trim();
        if (v) { prev.src = v; showEmpty(false); }
        else showEmpty(true);
      });
      if (removeBtn) removeBtn.addEventListener("click", function () {
        fi.value = "";
        nameEl.hidden = true;
        clearObjUrl();
        prev.removeAttribute("src");
        if (urlInput) urlInput.value = "";
        showEmpty(true);
      });
      return fi;
    }

    body.innerHTML =
      '<form id="set-form" novalidate>' +
      SETTING_GROUPS.map(function (g) {
        var fields = g[1].map(function (f) {
        if (g[0] === "Images" && (f[0] === "hero_bg" || f[0] === "water_bg" || f[0] === "hero_van")) return "";
        if (f[2] === "hidden") return '<input type="hidden" id="sf-' + f[0] + '" value="' + esc(s[f[0]] || "") + '" />';
        return textField(f[0], f[1], f[2], f[3]);
      }).join("");
        if (g[0] === "Hours") {
          fields += '<div class="field"><label for="sf-hours">Store hours</label>' +
            '<textarea id="sf-hours" rows="5" placeholder="Mon \u2013 Thu | 7:30am \u2013 5pm">' + esc(hoursText) + "</textarea>" +
            '<span class="hint">One line per day range: the days, then <code>|</code>, then the time.<br>Example: <code>Mon \u2013 Thu | 7:30am \u2013 5pm</code></span>' +
            '<div class="hours-preview" id="hours-preview" aria-live="polite"></div></div>';
        }
        if (g[0] === "Images") {
          fields += '<div class="img-cards">' +
            imgUpload("logo", "Logo", s.logo_url) +
            (hasVanCol ? imgUpload("hero_van", "Hero van image", s.hero_van)
              : '<input type="hidden" id="sf-hero_van" value="" />') +
            imgUpload("hero_bg", "Hero background image", s.hero_bg) +
            imgUpload("water_bg", "Water section background image", s.water_bg) +
            "</div>" +
            (hasVanCol ? "" : '<p class="hint">The hero van image needs a one-line database update first — run ' +
              "<code>alter table site_settings add column if not exists hero_van text;</code> " +
              "in the Supabase SQL editor, then reload this page.</p>");
        }
        return '<fieldset class="form-section"><legend>' + esc(g[0]) + "</legend>" +
          (GROUP_DESC[g[0]] ? '<p class="sec-desc">' + GROUP_DESC[g[0]] + "</p>" : "") +
          '<div class="grid">' + fields + "</div></fieldset>";
      }).join("") +
      '<fieldset class="form-section"><legend>Social links</legend>' +
      '<p class="sec-desc">' + GROUP_DESC["Social links"] + "</p>" +
      '<div id="social-rows"></div>' +
      btn("Add social link", "small", ' id="social-add"', "i-plus") +
      '<p class="hint">Pick the icon that matches the network. Choose \u201cCustom filename\u2026\u201d only if you uploaded your own icon to <code>images/</code>.</p>' +
      "</fieldset>" +
      '<div class="set-savebar" id="set-savebar"><span class="save-state">' +
      '<span class="save-dot" aria-hidden="true"></span><span id="set-savestate-text">All changes saved</span></span>' +
      '<button type="submit" class="btn primary" id="set-save">' +
      icon("i-check") + "Save settings</button></div></form>";

    var rowsBox = document.getElementById("social-rows");
    // known icons (filenames in images/); anything else falls back to "Custom filename"
    var SOCIAL_ICONS = [
      ["images/social-facebook.png", "Facebook"],
      ["images/social-instagram.png", "Instagram"],
      ["images/social-tiktok.png", "TikTok"],
      ["images/social-youtube.png", "YouTube"],
      ["images/social-yelp.png", "Yelp"]
    ];
    function addSocialRow(row) {
      row = row || {};
      var cur = row.icon || "";
      var isCustom = !!cur && !SOCIAL_ICONS.some(function (o) { return o[0] === cur; });
      var opts = SOCIAL_ICONS.map(function (o) {
        return '<option value="' + o[0] + '"' + (o[0] === cur ? " selected" : "") + ">" + o[1] + "</option>";
      }).join("") + '<option value="__custom"' + (isCustom ? " selected" : "") + ">Custom filename\u2026</option>";
      var div = document.createElement("div");
      div.className = "social-row";
      div.innerHTML =
        '<input type="text" placeholder="Name (e.g. Facebook)" aria-label="Social link name" value="' + esc(row.name) + '" data-k="name" />' +
        '<input type="url" placeholder="URL" aria-label="Social link URL" value="' + esc(row.url) + '" data-k="url" inputmode="url" />' +
        '<div class="social-icon-wrap">' +
        '<select data-k="icon-select" aria-label="Social link icon">' + opts + "</select>" +
        '<input type="text" class="social-icon-custom" placeholder="e.g. social-x.png" aria-label="Custom icon filename" value="' + (isCustom ? esc(cur) : "") + '"' + (isCustom ? "" : " hidden") + " />" +
        '<input type="hidden" data-k="icon" value="' + esc(cur) + '" />' +
        "</div>" +
        '<button type="button" class="btn small danger-outline" data-remove aria-label="Remove this social link">' +
        icon("i-trash") + "</button>";
      var sel = div.querySelector('[data-k="icon-select"]');
      var customInput = div.querySelector(".social-icon-custom");
      var hiddenIcon = div.querySelector('[data-k="icon"]');
      function syncIcon() {
        if (sel.value === "__custom") { customInput.hidden = false; hiddenIcon.value = customInput.value.trim(); }
        else { customInput.hidden = true; hiddenIcon.value = sel.value; }
      }
      sel.addEventListener("change", syncIcon);
      customInput.addEventListener("input", syncIcon);
      syncIcon();
      div.querySelector("[data-remove]").addEventListener("click", function () { div.remove(); markDirty(); });
      rowsBox.appendChild(div);
    }
    socials.forEach(addSocialRow);
    document.getElementById("social-add").addEventListener("click", function () { addSocialRow(null); markDirty(); });

    // hours live preview: shows how each line will look, flags lines missing the "|"
    var hoursInput = document.getElementById("sf-hours");
    var hoursPrev = document.getElementById("hours-preview");
    function renderHoursPreview() {
      var lines = hoursInput.value.split("\n").map(function (l) { return l.trim(); }).filter(Boolean);
      if (!lines.length) { hoursPrev.innerHTML = '<p class="hint">Nothing yet \u2014 add a line above.</p>'; return; }
      hoursPrev.innerHTML = '<p class="hours-preview-title">How it will look:</p><ul>' +
        lines.map(function (l) {
          var parts = l.split("|");
          var days = (parts[0] || "").trim(), time = (parts[1] || "").trim();
          if (!days || !time) return '<li class="hours-bad">' + esc(l) + ' <span>\u2014 this line needs a <code>|</code> between the days and the time</span></li>';
          return "<li><strong>" + esc(days) + "</strong> " + esc(time) + "</li>";
        }).join("") + "</ul>";
    }
    hoursInput.addEventListener("input", renderHoursPreview);
    renderHoursPreview();

    // dirty tracking for the sticky save bar
    var savebar = document.getElementById("set-savebar");
    var saveStateText = document.getElementById("set-savestate-text");
    function markDirty() {
      savebar.classList.add("is-dirty");
      saveStateText.textContent = "Unsaved changes";
    }
    function markClean() {
      savebar.classList.remove("is-dirty");
      saveStateText.textContent = "All changes saved";
    }
    document.getElementById("set-form").addEventListener("input", markDirty);
    document.getElementById("set-form").addEventListener("change", markDirty);

    var logoFileInput = wireImgUpload("logo", s.logo_url);
    var heroFileInput = wireImgUpload("hero_bg", s.hero_bg);
    var waterFileInput = wireImgUpload("water_bg", s.water_bg);
    var vanFileInput = hasVanCol ? wireImgUpload("hero_van", s.hero_van) : null;

    document.getElementById("set-form").addEventListener("submit", async function (e) {
      e.preventDefault();
      var mbox = document.getElementById("set-msg");
      clearMsg(mbox);
      var saveBtn = document.getElementById("set-save");
      setBusy(saveBtn, true, "Saving…");
      try {
        // tap-to-call links are derived from the display numbers (same rule as the site)
        function telHref(num) {
          var d = String(num || "").replace(/\D/g, "");
          if (!d) return "";
          return "+" + (d.length === 10 ? "1" + d : d);
        }
        document.getElementById("sf-phone1_href").value = telHref(document.getElementById("sf-phone1").value);
        document.getElementById("sf-phone2_href").value = telHref(document.getElementById("sf-phone2").value);
        var payload = { id: 1 };
        SETTING_GROUPS.forEach(function (g) {
          g[1].forEach(function (f) {
            var v = document.getElementById("sf-" + f[0]).value.trim();
            payload[f[0]] = v === "" ? null : v;
          });
        });
        payload.hours = document.getElementById("sf-hours").value
          .split("\n").map(function (l) { return l.trim(); }).filter(Boolean)
          .map(function (l) {
            var parts = l.split("|");
            return { days: (parts[0] || "").trim(), time: (parts[1] || "").trim() };
          });
        var logoFile = logoFileInput.files[0];
        if (logoFile) {
          payload.logo_url = await uploadPhoto("site-assets", logoFile);
        } else {
          var lu = document.getElementById("sf-logo").value.trim();
          payload.logo_url = lu === "" ? null : lu;
        }
        var heroFile = heroFileInput.files[0];
        if (heroFile) payload.hero_bg = await uploadPhoto("site-assets", heroFile);
        var waterFile = waterFileInput.files[0];
        if (waterFile) payload.water_bg = await uploadPhoto("site-assets", waterFile);
        if (hasVanCol && vanFileInput) {
          var vanFile = vanFileInput.files[0];
          if (vanFile) payload.hero_van = await uploadPhoto("site-assets", vanFile);
        } else {
          delete payload.hero_van;
        }
        var up = await sb.from("site_settings").upsert(payload, { onConflict: "id" });
        if (up.error) throw up.error;

        var rows = Array.from(rowsBox.querySelectorAll(".social-row")).map(function (r) {
          return {
            name: r.querySelector('[data-k="name"]').value.trim(),
            url: r.querySelector('[data-k="url"]').value.trim() || null,
            icon: r.querySelector('[data-k="icon"]').value.trim() || null
          };
        }).filter(function (r) { return r.name; });
        var del = await sb.from("social_links").delete().not("id", "is", null);
        if (del.error) throw del.error;
        var newSocials = [];
        if (rows.length) {
          var ins = await sb.from("social_links").insert(rows).select();
          if (ins.error) throw ins.error;
          newSocials = ins.data || [];
        }
        var jobs = [];
        var setKeys = [];
        SETTING_GROUPS.forEach(function (g) { g[1].forEach(function (f) { setKeys.push(f[0]); }); });
        setKeys.push("hours", "logo_url");
        var newSettingsRow = Object.assign({}, s, payload);
        setKeys.forEach(function (k) {
          if (cmpVal(s[k]) === cmpVal(payload[k])) return;
          jobs.push(logChange({ entity: "settings", entity_label: "Site settings", record_id: "1",
            action: "update", field: k, old_value: dispField("settings", k, s[k]),
            new_value: dispField("settings", k, payload[k]), old_row: s, new_row: newSettingsRow }));
        });
        var oldByName = {}, newByName = {};
        socials.forEach(function (r) { oldByName[r.name] = r; });
        newSocials.forEach(function (r) { newByName[r.name] = r; });
        Object.keys(oldByName).forEach(function (name) {
          var o = oldByName[name], n = newByName[name];
          if (!n) {
            jobs.push(logChange({ entity: "social_link", entity_label: name, record_id: o.id,
              action: "delete", old_row: o }));
          } else {
            ["url", "icon"].forEach(function (k) {
              if (cmpVal(o[k]) === cmpVal(n[k])) return;
              jobs.push(logChange({ entity: "social_link", entity_label: name, record_id: n.id,
                action: "update", field: k, old_value: dispVal(o[k]), new_value: dispVal(n[k]),
                old_row: o, new_row: n }));
            });
          }
        });
        Object.keys(newByName).forEach(function (name) {
          if (!oldByName[name]) {
            var n2 = newByName[name];
            jobs.push(logChange({ entity: "social_link", entity_label: name, record_id: n2.id,
              action: "create", new_row: n2 }));
          }
        });
        await Promise.all(jobs);
        s = newSettingsRow;
        socials = newSocials;
        markClean();
        toast("Settings saved.");
        mbox.scrollIntoView({ block: "nearest", behavior: "smooth" });
      } catch (err) {
        showMsg(mbox, err.message || "Save failed.", false);
      } finally {
        setBusy(saveBtn, false);
      }
    });
  }

  /* ---------- inbox (shared module: admin/inbox.js) ----------
     Thin adapter: all inbox logic lives in window.OasisInbox. */

  function renderInbox() {
    window.OasisInbox.init({
      sb: sb,
      el: document.getElementById("tab-inbox"),
      onBadge: setInboxBadge,
      headerExtra:
        '<a class="btn small" href="inbox/" target="_blank" rel="noopener">' +
        icon("i-external") + "Open inbox view</a>"
    });
  }

  /* ---------- boot ---------- */

  // The standalone inbox view (/admin/inbox/) redirects here with ?next=inbox
  // when the visitor isn't signed in. After auth, send them back there.
  function maybeRedirectNext() {
    try {
      if (new URLSearchParams(window.location.search).get("next") === "inbox") {
        window.location.replace("inbox/");
        return true;
      }
    } catch (e) {}
    return false;
  }

  sb.auth.getSession().then(function (res) {
    session = res.data.session;
    if (session) { if (!maybeRedirectNext()) renderShell(); }
    else renderLogin();
  });

  sb.auth.onAuthStateChange(function (_event, s) {
    session = s;
    if (s) { if (maybeRedirectNext()) return; loaded = {}; renderShell(); }
    else renderLogin();
  });
})();
