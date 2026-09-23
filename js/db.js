// Oasis Detailing Supplies — Supabase data layer.
//
// Vanilla JS, no build step. Depends on:
//   1. the @supabase/supabase-js CDN script (global `supabase`), and
//   2. js/config.js (window.OASIS_CONFIG).
// Both are loaded before this file in the HTML pages.
//
// Exposes: window.OasisDB = { isConfigured(), loadAll(),
//                             submitAppointment(o), submitMessage(o) }
(function () {
  var cfg = window.OASIS_CONFIG || {};
  var client = null;

  function isConfigured() {
    // Both the CDN library and real config values must be present.
    // The anon key check matters: until the owner pastes a real key,
    // config.js still holds the placeholder and the DB must stay off.
    return (
      typeof window.supabase !== "undefined" &&
      window.supabase !== null &&
      !!cfg.SUPABASE_URL &&
      cfg.SUPABASE_URL.indexOf("YOUR-PROJECT") === -1 &&
      !!cfg.SUPABASE_ANON_KEY &&
      cfg.SUPABASE_ANON_KEY.indexOf("YOUR-ANON-KEY") === -1
    );
  }

  function getClient() {
    if (!isConfigured()) return null;
    if (!client) client = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);
    return client;
  }

  function withTimeout(promise, ms) {
    return Promise.race([
      promise,
      new Promise(function (_, reject) {
        setTimeout(function () { reject(new Error("Supabase request timed out")); }, ms);
      })
    ]);
  }

  // Fetch all 7 content tables (+ the single site_settings row) in parallel,
  // with a 5s overall timeout. Returns an object shaped EXACTLY like
  // script.js's content object:
  //   { settings, services, brands, testimonials, products, packages, social, footer }
  // where settings is the flattened site_settings row (minus id) and footer
  // carries { verse_text, verse_cite, copyright_text, address_line }.
  // hours (jsonb [{days,time}]) and includes (jsonb [{text}]) arrive as plain
  // arrays, matching the JSON-file shapes script.js already renders.
  // On any failure the promise rejects — script.js falls back to the
  // content/*.json files, so the page never breaks.
  function loadAll() {
    var sb = getClient();
    if (!sb) return Promise.reject(new Error("Supabase is not configured"));
    return withTimeout(
      Promise.all([
        sb.from("site_settings").select("*").eq("id", 1).single(),
        sb.from("services").select("*"),
        sb.from("brands").select("*"),
        sb.from("testimonials").select("*"),
        sb.from("products").select("*"),
        sb.from("packages").select("*"),
        sb.from("social_links").select("*")
      ]),
      5000
    ).then(function (results) {
      var row = results[0] && results[0].data;
      if (!row) throw new Error("site_settings row is missing");
      var settings = {};
      Object.keys(row).forEach(function (k) {
        if (k !== "id") settings[k] = row[k];
      });
      return {
        settings: settings,
        services: (results[1] && results[1].data) || [],
        brands: (results[2] && results[2].data) || [],
        testimonials: (results[3] && results[3].data) || [],
        products: (results[4] && results[4].data) || [],
        packages: (results[5] && results[5].data) || [],
        social: (results[6] && results[6].data) || [],
        footer: {
          verse_text: row.verse_text,
          verse_cite: row.verse_cite,
          copyright_text: row.copyright_text,
          address_line: row.address_line
        }
      };
    });
  }

  function submitAppointment(o) {
    var sb = getClient();
    if (!sb) return Promise.resolve({ ok: false, error: "Supabase is not configured" });
    o = o || {};
    return sb.from("appointments").insert([{
      name: o.name || null,
      phone: o.phone || null,
      email: o.email || null,
      address: o.address || null,
      package_id: o.package || null,
      date: o.date || null,
      time: o.time || null,
      message: o.message || null
    }]).then(
      function (res) {
        if (res && res.error) return { ok: false, error: String(res.error.message || res.error) };
        return { ok: true };
      },
      function (err) { return { ok: false, error: String((err && err.message) || err) }; }
    );
  }

  function submitMessage(o) {
    var sb = getClient();
    if (!sb) return Promise.resolve({ ok: false, error: "Supabase is not configured" });
    o = o || {};
    return sb.from("contact_messages").insert([{
      name: o.name || null,
      phone: o.phone || null,
      email: o.email || null,
      topic: o.topic || null,
      message: o.message || null
    }]).then(
      function (res) {
        if (res && res.error) return { ok: false, error: String(res.error.message || res.error) };
        return { ok: true };
      },
      function (err) { return { ok: false, error: String((err && err.message) || err) }; }
    );
  }

  window.OasisDB = {
    isConfigured: isConfigured,
    loadAll: loadAll,
    submitAppointment: submitAppointment,
    submitMessage: submitMessage
  };
})();
