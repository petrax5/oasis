/* Oasis Detailing Supplies — shared inbox module.
   Single source of truth for ALL inbox logic. Used by:
     - admin/index.html  (the Inbox tab, via a thin adapter in admin.js)
     - admin/inbox/index.html (the standalone inbox-only view)
   Covers: one merged New | Pending | Finished list (appointment requests +
   contact messages) with an All | Appointments | Contact type filter,
   status actions
   (mark as pending / finished / reopen), phone numbers (a Call / Message
   choice menu on all platforms), tappable address links (Apple Maps on
   iOS, Google Maps elsewhere), mailto: links, "marked as finished" date
   labels, and client-side 30-day auto-delete of finished items — for
   both appointment requests and contact messages.

   If migration 004 (status / finished_at columns) hasn't been run yet,
   the module probes for the `status` column on load: status actions
   degrade gracefully (legacy `read` flag + a toast telling the owner
   to run the migration) instead of throwing, and the Finished tab
   explains that the migration is pending.

   Usage: window.OasisInbox.init({ sb, el, onBadge, headerExtra })
     sb          Supabase client (required)
     el          container element to render into (required)
     onBadge(n)  optional: called with the count of "new" items
     headerExtra optional HTML rendered in a slim top bar above the tabs
                 (e.g. the "Open inbox view" button in the full admin)

   window.OasisInbox.util exposes the tiny generic helpers (esc, icon,
   toast, setBusy, showMsg, clearMsg, emptyState) for page chrome such
   as the standalone page header. */
(function () {
  "use strict";

  /* ---------- tiny generic helpers ---------- */

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function icon(name, cls) {
    return '<svg class="ic' + (cls ? " " + cls : "") + '" aria-hidden="true" focusable="false">' +
      '<use href="#' + name + '"></use></svg>';
  }

  function toast(msg) {
    var root = document.getElementById("toasts");
    if (!root) return;
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

  function emptyState(ic, title, text, btnLabel, btnId) {
    return '<div class="empty"><span class="empty-icon">' + icon(ic) + "</span>" +
      "<h3>" + esc(title) + "</h3><p>" + esc(text) + "</p>" +
      (btnLabel ? '<button type="button" class="btn primary" id="' + btnId + '">' +
        icon("i-plus") + esc(btnLabel) + "</button>" : "") +
      "</div>";
  }

  /* ---------- phone: Call / Message menu on every platform ---------- */
  /* Phone numbers render as buttons opening a small Call / Message menu
     (one shared popup, so only one can be open at a time). Tapping a
     number always offers the choice — it never dials directly. */

  var IS_IOS = (function () {
    if (typeof navigator === "undefined") return false;
    var ua = navigator.userAgent || "";
    var plat = navigator.platform || "";
    return /iPad|iPhone|iPod/.test(ua) ||
      (plat === "MacIntel" && navigator.maxTouchPoints > 1);
  })();

  var telMenuEl = null;
  var telMenuOpener = null;

  function telMenuCSS() {
    if (document.getElementById("oasis-telmenu-css")) return;
    var st = document.createElement("style");
    st.id = "oasis-telmenu-css";
    st.textContent =
      ".inbox-tel{background:none;border:0;padding:4px 0;margin:0;font:inherit;color:inherit;" +
      "cursor:pointer;text-align:left;min-height:44px;-webkit-tap-highlight-color:transparent}" +
      ".inbox-telmenu{position:fixed;z-index:9999;min-width:220px;max-width:calc(100vw - 32px);" +
      "background:#fff;border:1px solid #e2e8f0;border-radius:16px;" +
      "box-shadow:0 16px 40px rgba(15,23,42,.22);padding:6px}" +
      ".inbox-telmenu-num{display:block;padding:8px 12px 4px;color:#475569;" +
      "font-size:12px;font-weight:700;letter-spacing:.3px}" +
      ".inbox-telmenu-item{display:flex;align-items:center;gap:10px;min-height:48px;" +
      "padding:10px 12px;border-radius:10px;color:#0f172a;text-decoration:none;" +
      "font-weight:700;font-size:16px}" +
      ".inbox-telmenu-item .ic{width:20px;height:20px;color:#9b340a}" +
      ".inbox-telmenu-item:hover,.inbox-telmenu-item:focus-visible{background:#f8fafc;outline:none}" +
      ".inbox-telmenu-item+.inbox-telmenu-item{margin-top:2px}";
    document.head.appendChild(st);
  }

  function ensureTelMenu() {
    if (telMenuEl) return telMenuEl;
    telMenuCSS();
    telMenuEl = document.createElement("div");
    telMenuEl.className = "inbox-telmenu";
    telMenuEl.setAttribute("role", "menu");
    telMenuEl.hidden = true;
    telMenuEl.innerHTML =
      '<span class="inbox-telmenu-num" id="oasis-telmenu-num"></span>' +
      '<a class="inbox-telmenu-item" role="menuitem" id="oasis-telmenu-call">' +
      icon("i-phone") + "<span>Call</span></a>" +
      '<a class="inbox-telmenu-item" role="menuitem" id="oasis-telmenu-sms">' +
      icon("i-chat") + "<span>Message</span></a>";
    document.body.appendChild(telMenuEl);
    telMenuEl.addEventListener("click", function () { closeTelMenu(false); });
    document.addEventListener("pointerdown", function (e) {
      if (telMenuEl && !telMenuEl.hidden &&
          !telMenuEl.contains(e.target) &&
          !(e.target.closest && e.target.closest(".inbox-tel"))) {
        closeTelMenu(false);
      }
    }, true);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && telMenuEl && !telMenuEl.hidden) closeTelMenu(true);
    });
    return telMenuEl;
  }

  function closeTelMenu(refocus) {
    if (!telMenuEl || telMenuEl.hidden) return;
    telMenuEl.hidden = true;
    if (refocus && telMenuOpener && document.contains(telMenuOpener)) telMenuOpener.focus();
    telMenuOpener = null;
  }

  function openTelMenu(btn) {
    var menu = ensureTelMenu();
    var digits = btn.getAttribute("data-digits") || "";
    if (!digits) return;
    menu.querySelector("#oasis-telmenu-num").textContent = btn.textContent.trim();
    menu.querySelector("#oasis-telmenu-call").href = "tel:" + digits;
    menu.querySelector("#oasis-telmenu-sms").href = "sms:" + digits;
    telMenuOpener = btn;
    menu.hidden = false;
    var r = btn.getBoundingClientRect();
    var mw = menu.offsetWidth, mh = menu.offsetHeight;
    var left = Math.max(8, Math.min(r.left, window.innerWidth - mw - 8));
    var top = r.bottom + 6;
    if (top + mh > window.innerHeight - 8) top = Math.max(8, r.top - mh - 6);
    menu.style.left = left + "px";
    menu.style.top = top + "px";
  }

  function toggleTelMenu(btn) {
    if (telMenuEl && !telMenuEl.hidden && telMenuOpener === btn) {
      closeTelMenu(false);
      return;
    }
    openTelMenu(btn);
  }

  /* ---------- inbox ---------- */

  // [value, label, icon]
  var INBOX_FILTERS = [["new", "New", "i-inbox"], ["pending", "Pending", "i-clock"], ["finished", "Finished", "i-check"]];
  var INBOX_TYPES = [["appt", "Appointments", "i-cal"], ["msg", "Contact", "i-chat"]];

  function createInbox(o) {
    var sb = o.sb;
    var el = o.el;
    var onBadge = typeof o.onBadge === "function" ? o.onBadge : function () {};
    var headerExtra = o.headerExtra || "";
    // Filters persist across re-renders of the same container.
    // The type filter is per status tab: each of new/pending/finished
    // remembers its own selection ("all" = no filtering, both kinds shown).
    var inboxFilter = el.getAttribute("data-inbox-filter") || "new";
    var inboxTypes = { new: "all", pending: "all", finished: "all" };
    try {
      var savedTypes = JSON.parse(el.getAttribute("data-inbox-types") || "{}") || {};
      ["new", "pending", "finished"].forEach(function (k) {
        if (savedTypes[k] === "appt" || savedTypes[k] === "msg") inboxTypes[k] = savedTypes[k];
      });
    } catch (e) { /* corrupt cache: start unfiltered */ }
    function typeFor(status) { return inboxTypes[status] || "all"; }
    function saveTypes() {
      el.setAttribute("data-inbox-types", JSON.stringify(inboxTypes));
    }

    // Does migration 004's `status` column exist? Probed once per page
    // load; null = not probed yet.
    var hasStatus = null;
    async function checkStatusColumn() {
      if (hasStatus !== null) return hasStatus;
      try {
        var probes = await Promise.all([
          sb.from("appointments").select("status").limit(1),
          sb.from("contact_messages").select("status").limit(1)
        ]);
        hasStatus = !probes.some(function (p) {
          return p.error && /column/i.test(p.error.message || "");
        });
      } catch (e) {
        hasStatus = true; // probe failed for another reason: try the full write path
      }
      return hasStatus;
    }

    async function ordered(table, cols) {
      // newest first; fall back to id desc if created_at is absent
      var q = await sb.from(table).select(cols || "*").order("created_at", { ascending: false });
      if (q.error && /created_at/.test(q.error.message || "")) {
        return sb.from(table).select(cols || "*").order("id", { ascending: false });
      }
      return q;
    }

    // Status of one inbox row. Prefers the `status` column added by migration
    // 004; falls back to the legacy `read` flag when it hasn't been run yet.
    function inboxStatus(item) {
      if (item && item.status) return item.status;
      return item && item.read ? "read" : "new";
    }

    // The "New" tab holds everything still active (new + read).
    function inboxBucket(item) {
      var s = inboxStatus(item);
      return s === "pending" ? "pending" : s === "finished" ? "finished" : "new";
    }

    function fmtDate(iso) {
      if (!iso) return "";
      var d = new Date(iso);
      return isNaN(d.getTime()) ? "" : d.toLocaleDateString("en-US",
        { weekday: "long", month: "long", day: "numeric", year: "numeric" });
    }

    // Appointment form submits date as "YYYY-MM-DD" and time as "HH:MM" (24h).
    // Parse the date as a LOCAL date (not UTC midnight) so the weekday is right.
    function fmtApptDate(s) {
      if (!s) return "";
      var str = String(s).trim();
      var m = /^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(str);
      var d = m ? new Date(+m[1], +m[2] - 1, +m[3]) : new Date(str);
      if (isNaN(d.getTime())) return str;
      var opts = { weekday: "long", month: "long", day: "numeric", year: "numeric" };
      return d.toLocaleDateString("en-US", opts);
    }

    function fmtApptTime(s) {
      if (!s) return "";
      var t = String(s).trim();
      if (/[ap]\.?m\.?/i.test(t)) return t; // already has a meridiem
      var m = /^(\d{1,2}):(\d{2})(?::\d{2})?$/.exec(t);
      if (!m || +m[1] > 23 || +m[2] > 59) return t;
      var h = +m[1], ap = h >= 12 ? "PM" : "AM";
      h = h % 12; if (h === 0) h = 12;
      return h + ":" + m[2] + " " + ap;
    }

    function telHref(phone) {
      var digits = String(phone || "").replace(/[^\d+]/g, "");
      return digits ? "tel:" + digits : "";
    }

    // Phone numbers always open the Call / Message menu — tapping never
    // dials directly. Display formatting is unchanged.
    function linkTel(phone) {
      var digits = String(phone || "").replace(/[^\d+]/g, "");
      if (!digits) return esc(phone || "");
      return '<button type="button" class="inbox-link inbox-tel" data-digits="' + esc(digits) +
        '" aria-haspopup="menu" aria-label="Call or message ' + esc(phone) + '">' + esc(phone) + "</button>";
    }

    function linkMail(email) {
      return email
        ? '<a class="inbox-link" href="mailto:' + esc(email) + '">' + esc(email) + "</a>"
        : "";
    }

    // Addresses open Apple Maps on iOS, Google Maps elsewhere.
    function mapHref(address) {
      if (!address || !String(address).trim()) return "";
      var q = encodeURIComponent(String(address).trim());
      return IS_IOS
        ? "https://maps.apple.com/?q=" + q
        : "https://www.google.com/maps/search/?api=1&query=" + q;
    }

    // package_id is a slug like "interior-supreme" — display it readably.
    function fmtPackage(pid) {
      if (!pid) return "";
      return String(pid).replace(/[-_]+/g, " ")
        .replace(/\b\w/g, function (c) { return c.toUpperCase(); });
    }

    function inboxField(label, value, href) {
      if (value === undefined || value === null || String(value).trim() === "") return "";
      var v;
      if (href && href.indexOf("tel:") === 0) {
        v = linkTel(value); // button opening the Call / Message menu
      } else if (href && href.indexOf("http") === 0) {
        v = '<a class="inbox-link" href="' + esc(href) + '" target="_blank" rel="noopener">' +
          esc(value) + "</a>";
      } else {
        v = href
          ? '<a class="inbox-link" href="' + esc(href) + '">' + esc(value) + "</a>"
          : esc(value);
      }
      return '<div class="inbox-field"><span class="inbox-field-label">' + esc(label) +
        "</span><span>" + v + "</span></div>";
    }

    // Quick-contact chips at the top of the expanded detail view:
    // Call/Text opens the choice menu (never dials directly), the rest
    // are direct links. 44px targets for thumbs.
    function quickChips(kind, row) {
      var chips = [];
      var digits = String(row.phone || "").replace(/[^\d+]/g, "");
      if (digits) {
        chips.push('<button type="button" class="inbox-chip inbox-tel" data-digits="' +
          esc(digits) + '" aria-haspopup="menu">' + icon("i-phone") +
          "<span>Call / Text</span></button>");
      }
      if (row.email) {
        chips.push('<a class="inbox-chip" href="mailto:' + esc(row.email) + '">' +
          icon("i-mail") + "<span>Email</span></a>");
      }
      if (kind === "appt") {
        var mh = mapHref(row.address);
        if (mh) {
          chips.push('<a class="inbox-chip" href="' + esc(mh) + '" target="_blank" rel="noopener">' +
            icon("i-pin") + "<span>Directions</span></a>");
        }
      }
      return chips.length ? '<div class="inbox-quick">' + chips.join("") + "</div>" : "";
    }

    // Write a status change. When migration 004 (status / finished_at
    // columns) hasn't been run yet, the probe above returns false and we
    // degrade: best-effort legacy `read` write, no throw, and the caller
    // shows the "run the migration" toast.
    async function setInboxStatus(table, id, act) {
      if (!hasStatus) {
        var legacy = await sb.from(table).update({ read: true }).eq("id", id);
        return { needsMigration: true, error: legacy.error || null };
      }
      var status = act === "reopen" ? "pending" : act; // pending | finished
      var patch = { status: status };
      patch.finished_at = status === "finished" ? new Date().toISOString() : null;
      var r = await sb.from(table).update(patch).eq("id", id);
      if (r.error && /column/i.test(r.error.message || "")) {
        hasStatus = false; // column vanished mid-session: degrade from here on
        var legacy2 = await sb.from(table).update({ read: true }).eq("id", id);
        return { needsMigration: true, error: legacy2.error || null };
      }
      return r;
    }
    var ACT_TOAST = {
      pending: "Moved to pending.",
      finished: "Marked as finished.",
      reopen: "Reopened — moved to pending."
    };

    function inboxActions(st) {
      function b(act, label, cls, ic) {
        return '<button type="button" class="btn small ' + (cls || "") + '" data-act="' + act + '">' +
          icon(ic || "i-check") + esc(label) + "</button>";
      }
      var h;
      if (st === "finished") {
        h = b("reopen", "Reopen", "", "i-undo");
      } else if (st === "pending") {
        h = b("finished", "Mark as finished", "accent");
      } else {
        h = b("pending", "Mark as pending", "", "i-clock") +
          b("finished", "Mark as finished", "accent");
      }
      return '<div class="inbox-actions">' + h + "</div>";
    }

    function inboxPill(item, st) {
      if (st === "new") return '<span class="pill pill-new">' + icon("i-inbox") + "<span>New</span></span>";
      if (st === "pending") return '<span class="pill pill-pending">' + icon("i-clock") + "<span>Pending</span></span>";
      if (st === "finished") {
        var d = fmtDate(item.finished_at);
        return '<span class="pill pill-finished">' + icon("i-check") + "<span>Finished" +
          (d ? " · " + esc(d) : "") + "</span></span>";
      }
      return "";
    }

    function inboxCard(kind, item, headSubHtml, fieldsHtml, message) {
      var st = inboxStatus(item);
      var title = kind === "appt"
        ? esc(item.name || "") + (item.package_id ? " — " + esc(fmtPackage(item.package_id)) : "")
        : esc(item.name || "") + (item.topic ? " — " + esc(item.topic) : "");
      var kindIcon = kind === "appt" ? "i-cal" : "i-chat";
      var kindName = kind === "appt" ? "Appointment request" : "Contact message";
      return '<article class="inbox-card kind-' + kind +
        (st === "finished" ? " is-finished" : "") + '" data-kind="' + kind +
        '" data-id="' + item.id + '">' +
        '<div class="inbox-head" role="button" tabindex="0" aria-expanded="false">' +
        '<span class="inbox-kind" aria-hidden="true">' + icon(kindIcon) +
        '<span class="sr-only">' + kindName + "</span></span>" +
        '<span class="inbox-head-text"><span class="inbox-title">' + title + "</span>" +
        (headSubHtml ? '<span class="inbox-sub">' + headSubHtml + "</span>" : "") + "</span>" +
        '<span class="inbox-head-side">' + inboxPill(item, st) + icon("i-chev", "chev") + "</span></div>" +
        '<div class="inbox-details" hidden>' + quickChips(kind, item) + fieldsHtml +
        (message ? '<p class="inbox-message">' + esc(message) + "</p>" : "") +
        inboxActions(st) + "</div></article>";
    }

    function apptCard(a) {
      var sub = [
        [fmtApptDate(a.date), fmtApptTime(a.time)].filter(Boolean).join(" · "),
        a.phone ? linkTel(a.phone) : ""
      ].filter(Boolean).join(" · ");
      var fields =
        inboxField("Name", a.name) +
        inboxField("Package", fmtPackage(a.package_id)) +
        inboxField("Date", fmtApptDate(a.date)) +
        inboxField("Time", fmtApptTime(a.time)) +
        inboxField("Phone", a.phone, telHref(a.phone)) +
        inboxField("Email", a.email, a.email ? "mailto:" + a.email : "") +
        inboxField("Address", a.address, mapHref(a.address));
      return inboxCard("appt", a, sub, fields, a.message);
    }

    function msgCard(c) {
      var sub = [linkMail(c.email), c.phone ? linkTel(c.phone) : ""].filter(Boolean).join(" · ");
      var fields =
        inboxField("Name", c.name) +
        inboxField("Topic", c.topic) +
        inboxField("Phone", c.phone, telHref(c.phone)) +
        inboxField("Email", c.email, c.email ? "mailto:" + c.email : "");
      return inboxCard("msg", c, sub, fields, c.message);
    }

    async function render() {
      // Know whether migration 004's columns exist before touching rows.
      await checkStatusColumn();

      // No server cron: finished items older than 30 days are deleted here,
      // client-side, every time the inbox loads.
      var cutoff = new Date(Date.now() - 30 * 864e5).toISOString();
      var purgeErr = "";
      for (var pi = 0; pi < 2; pi++) {
        var ptable = pi ? "contact_messages" : "appointments";
        var pdel = await sb.from(ptable).delete()
          .eq("status", "finished").lt("finished_at", cutoff);
        if (pdel.error && !/column/i.test(pdel.error.message || "")) purgeErr = pdel.error.message;
      }

      var aRes = await ordered("appointments");
      var cRes = await ordered("contact_messages");

      // One merged list: both kinds tagged, newest first.
      var items = [];
      (aRes.data || []).forEach(function (r) { items.push({ kind: "appt", row: r }); });
      (cRes.data || []).forEach(function (r) { items.push({ kind: "msg", row: r }); });
      items.sort(function (x, y) {
        var xc = x.row.created_at, yc = y.row.created_at;
        if (xc && yc) return xc < yc ? 1 : xc > yc ? -1 : 0;
        return (y.row.id || 0) - (x.row.id || 0);
      });

      // Counts: each status tab respects its OWN type filter; the type
      // tabs respect the current status tab.
      var statusCounts = { new: 0, pending: 0, finished: 0 };
      var typeCounts = { appt: 0, msg: 0 };
      var newTotal = 0;
      var curType = typeFor(inboxFilter);
      items.forEach(function (it) {
        var b = inboxBucket(it.row);
        var bt = typeFor(b);
        if (bt === "all" || bt === it.kind) statusCounts[b]++;
        if (b === inboxFilter) typeCounts[it.kind]++;
        if (b === "new") newTotal++;
      });

      var list = items.filter(function (it) {
        return inboxBucket(it.row) === inboxFilter &&
          (curType === "all" || it.kind === curType);
      });

      var EMPTY = {
        new: ["No new requests", "New appointment requests and messages from the website will show up here."],
        pending: ["Nothing pending", "Items you set aside will wait here."],
        finished: ["Nothing finished yet",
          "Resolved items land here, and are deleted 30 days after finishing."]
      };

      function emptyFor(filterName) {
        if (filterName === "finished" && hasStatus === false) {
          return ["Pending/Finished not enabled yet",
            "Run supabase/migrations/004_inbox_status.sql in the Supabase SQL Editor to enable the Pending and Finished tabs."];
        }
        return EMPTY[filterName];
      }

      el.innerHTML =
        (headerExtra
          ? '<div class="inbox-topbar"><div class="toolbar-actions">' +
            headerExtra + "</div></div>"
          : "") +
        '<div class="msg" id="in-msg"></div>' +
        '<div class="inbox-tabs" role="tablist" aria-label="Filter by status">' +
        INBOX_FILTERS.map(function (f) {
          var on = inboxFilter === f[0];
          return '<button type="button" role="tab" class="inbox-tab' + (on ? " active" : "") +
            '" data-infilter="' + f[0] + '" aria-selected="' + on + '">' +
            icon(f[2]) + "<span>" + esc(f[1]) + '</span> <span class="count">' +
            statusCounts[f[0]] + "</span></button>";
        }).join("") + "</div>" +
        '<div class="inbox-subfilter">' +
        '<div class="inbox-tabs inbox-type-tabs" role="tablist" aria-label="Filter by type">' +
        INBOX_TYPES.map(function (t) {
          var on = curType === t[0];
          return '<button type="button" role="tab" class="inbox-tab type-' + t[0] + (on ? " active" : "") +
            '" data-intype="' + t[0] + '" aria-selected="' + on + '">' +
            icon(t[2]) + "<span>" + esc(t[1]) + '</span> <span class="count">' +
            typeCounts[t[0]] + "</span></button>";
        }).join("") + "</div></div>" +
        '<div id="in-items">' +
        (list.length
          ? list.map(function (it) {
              return it.kind === "appt" ? apptCard(it.row) : msgCard(it.row);
            }).join("")
          : emptyState("i-inbox", emptyFor(inboxFilter)[0], emptyFor(inboxFilter)[1])) +
        "</div>";

      var msgBox = document.getElementById("in-msg");
      if (purgeErr) showMsg(msgBox, "Auto-cleanup: " + purgeErr, false);
      var loadErr = (aRes.error && aRes.error.message) || (cRes.error && cRes.error.message);
      if (loadErr) showMsg(msgBox, loadErr, false);

      // All inbox clicks (wired once; innerHTML is rebuilt on every render).
      if (!el.dataset.inboxWired) {
        el.dataset.inboxWired = "1";
        el.addEventListener("click", function (e) {
          var f = e.target.closest("[data-infilter]");
          if (f && f.dataset.infilter !== inboxFilter) {
            inboxFilter = f.dataset.infilter;
            el.setAttribute("data-inbox-filter", inboxFilter);
            render();
            return;
          }
          var tp = e.target.closest("[data-intype]");
          if (tp) {
            var k = tp.dataset.intype;
            // Toggle: clicking the active tab turns filtering off for this
            // status tab. Other status tabs keep their own selection.
            inboxTypes[inboxFilter] = (inboxTypes[inboxFilter] === k) ? "all" : k;
            saveTypes();
            render();
            return;
          }
          var card = e.target.closest("#in-items [data-id]");
          if (!card) return;
          var box = document.getElementById("in-msg");
          var table = card.dataset.kind === "appt" ? "appointments" : "contact_messages";
          var actBtn = e.target.closest("[data-act]");
          if (actBtn) {
            e.stopPropagation();
            (async function () {
              var act = actBtn.getAttribute("data-act");
              setBusy(actBtn, true, "Saving…");
              var r = await setInboxStatus(table, card.dataset.id, act);
              setBusy(actBtn, false);
              if (r.error) {
                showMsg(box, r.error.message, false);
              } else if (r.needsMigration) {
                toast("Run 004_inbox_status.sql in Supabase to enable Pending/Finished.");
                render();
              } else {
                toast(ACT_TOAST[act] || "Saved.");
                render();
              }
            })();
            return;
          }
          var telBtn = e.target.closest(".inbox-tel");
          if (telBtn) { e.stopPropagation(); toggleTelMenu(telBtn); return; }
          if (e.target.closest("a")) return; // mailto: / maps links — let the browser handle them
          var headEl = e.target.closest(".inbox-head");
          if (headEl) {
            var det = card.querySelector(".inbox-details");
            var open = det.hidden;
            det.hidden = !open;
            headEl.setAttribute("aria-expanded", open ? "true" : "false");
          }
        });
        el.addEventListener("keydown", function (e) {
          var t = e.target;
          if (t && t.classList && t.classList.contains("inbox-head") &&
              (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            t.click();
          }
        });
      }

      onBadge(newTotal);
    }

    render();
  }

  window.OasisInbox = {
    init: function (opts) {
      if (!opts || !opts.sb || !opts.el) return;
      createInbox(opts);
    },
    util: {
      esc: esc,
      icon: icon,
      toast: toast,
      setBusy: setBusy,
      showMsg: showMsg,
      clearMsg: clearMsg,
      emptyState: emptyState
    }
  };
})();
