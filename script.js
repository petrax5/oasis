// ---- Mobile nav ----
var navToggle = document.getElementById('navToggle');
var mainNav = document.getElementById('mainNav');
function setNavOpen(open) {
  if (!mainNav) return;
  mainNav.classList.toggle('open', open);
  if (navToggle) {
    navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    navToggle.setAttribute('aria-label', T(open ? 'close_menu' : 'open_menu'));
    navToggle.setAttribute('data-i18n-aria', open ? 'close_menu' : 'open_menu');
  }
}
if (navToggle && mainNav) {
  navToggle.addEventListener('click', function () {
    setNavOpen(!mainNav.classList.contains('open'));
  });
  document.querySelectorAll('.main-nav a').forEach(function (a) {
    a.addEventListener('click', function () {
      setNavOpen(false);
    });
  });
  // Escape closes the menu and returns focus to the toggle
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && mainNav.classList.contains('open')) {
      setNavOpen(false);
      navToggle.focus();
    }
  });
  // Tapping anywhere outside the header dismisses the menu
  document.addEventListener('click', function (e) {
    if (mainNav.classList.contains('open') && !e.target.closest('.site-header')) {
      setNavOpen(false);
    }
  });
}

// ---- Smooth scroll ----
document.querySelectorAll('a[href^="#"]').forEach(function (a) {
  a.addEventListener('click', function (e) {
    var target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// ---- Editable content ----
// Sections below are rendered from content/*.json.
// If the JSON files can't be fetched (e.g. local file preview), the built-in
// defaults below are used instead, so the page never renders empty.
var DEFAULT_CONTENT = {
  settings: {
    phone1: "1-800-916-4731", phone1_href: "+18009164731",
    phone2: "714-363-3556", phone2_href: "+17143633556",
    address: "223 S Tustin St, Orange, CA 92866",
    hours: [
      { days: "Monday – Thursday", time: "7:30 AM – 5:00 PM" },
      { days: "Friday", time: "7:00 AM – 5:00 PM" },
      { days: "Saturday", time: "7:30 AM – 4:00 PM" },
      { days: "Sunday", time: "Closed" }
    ],
    water_text: "Available 24/7 — bring your jugs and fill up with spot-free water any time, day or night. No mineral spots, no water stains, unlike tap water. Our regulars fill up here for every car wash.",
    about_text: "Oasis Detailing Supplies is a family-owned business run by Joe and Angel. Known for honest advice — never selling you what you don't need — and for treating every car like their own.\n\nEstablished in 2005, Oasis started as an auto detailing service trusted all over Southern California — today, our store carries the same professional-grade products we've used on clients' vehicles for 18 years. Founded by three brothers and 100% family owned and operated, we stand on one simple principle: quality work at great prices.\n\nAsk around Orange County: our customers drive from miles away, and they keep coming back.",
    verse_cite: "Acts 16:31",
    copyright_text: "Oasis Detailing Supplies Inc \u2014 All rights reserved.",
    address_line: "Oasis Detailing Supplies Inc \u00b7 223 S Tustin St, Orange, CA 92866"
  },
  social: [
    { name: "Facebook", url: "https://www.facebook.com/oasisdetailingsupplies/", icon: "images/social-facebook.png" },
    { name: "Instagram", url: "https://www.instagram.com/oasisdetailingsuppliesinc/", icon: "images/social-instagram.png" },
    { name: "TikTok", url: "https://www.tiktok.com/@oasisdetailingsupplies", icon: "images/social-tiktok.png" },
    { name: "YouTube", url: "https://www.youtube.com/channel/UCeRoeXyDPKfJQIlPRWvPkFg", icon: "images/social-youtube.png" },
    { name: "Yelp", url: "https://www.yelp.com/biz/oasis-detailing-supplies-orange-3", icon: "images/social-yelp.png" }
  ],
  brands: [
    { name: "EDC", tagline: "Oasis professional line", initials: "EDC" },
    { name: "Super Slick Gloss", tagline: "Oasis professional line", initials: "SSG" },
    { name: "Viper Dressing", tagline: "Oasis professional line — tires & trim", initials: "VD" },
    { name: "BDC Multipurpose Cleaner", tagline: "Oasis professional line", initials: "BDC" },
    { name: "Meguiar's", tagline: "Available in-store", initials: "MEG" },
    { name: "Sonax", tagline: "Available in-store", initials: "SON" },
    { name: "Finish Renu", tagline: "Available in-store", initials: "FR" },
    { name: "Dinowax", tagline: "Available in-store", initials: "DINO" },
    { name: "Max Shine", tagline: "Available in-store", initials: "MS" },
  ],
  testimonials: [
    { quote: "I drove all the way from Encino to Orange County just to get a special service for my vehicle at Oasis Detailing Supplies and I can honestly say it was worth every mile and penny.", name: "Leonel F." },
    { quote: "Didn't try to sell me stuff I didn't need, but gave me exactly what I needed. Very friendly service. Customer for life.", name: "Walter V." },
    { quote: "Hardest working guy in the business. Beautiful results. Worth it every time!", name: "Kenny G." }
  ]
,
  products: [],
  theme: {
    navy: "#1e293b", navy_deep: "#0f172a", ink: "#334155", muted: "#475569",
    bg: "#ffffff", bg_alt: "#f1f5f9", line: "#e2e8f0",
    accent: "#c2410c", accent_dark: "#9a3412", accent_bright: "#ea580c",
    ring: "#2563eb"
  },
  packages:[{id:"ceramic-soap-wash",number:"1",name:"Ceramic Soap Wash",category:"express",price_car:"$99.00",price_suv:"$109.00",price_truck:"$109.00",coupon:"",includes:[{text:"Interior / Exterior"},{text:"Ceramic Wash"},{text:"Vacuum"},{text:"Interior cleaner"},{text:"Spray Wax"},{text:"Dash Board Cleaning"},{text:"Windows Cleaning"},{text:"Luxury Tire Dressing"}]},{id:"interior-supreme",number:"2",name:"Interior Supreme Detail",category:"detail",price_car:"$299.00",price_suv:"$349.00",price_truck:"$349.00",coupon:"$50 OFF coupon available",includes:[{text:"Premium Interior Detail"},{text:"Vacuum"},{text:"Shampoo"},{text:"Conditioner"},{text:"Exterior Ceramic Wash"},{text:"Dash Board Cleaning"},{text:"Windows Cleaning"},{text:"Spray Wax"},{text:"Luxury Tire Dressing"}]},{id:"exterior-supreme",number:"3",name:"Exterior Supreme Detail",category:"detail",price_car:"$299.00",price_suv:"$349.00",price_truck:"$349.00",coupon:"$50 OFF coupon available",includes:[{text:"Interior / Exterior Ceramic Wash"},{text:"Vacuum"},{text:"Conditioner"},{text:"Interior Cleaning"},{text:"Clay Bar"},{text:"Hand Wax"},{text:"Polish"},{text:"Windows Cleaning"},{text:"Luxury Tire Dressing"}]},{id:"full-supreme",number:"4",name:"Full Supreme Detail",category:"detail",price_car:"$449.00",price_suv:"$499.00",price_truck:"$499.00",coupon:"$75 OFF coupon available",includes:[{text:"Full Detail Interior / Exterior"},{text:"Ceramic Wash"},{text:"Vacuum"},{text:"Shampoo"},{text:"Conditioner"},{text:"Clay Bar"},{text:"Hand Wax"},{text:"Polish"},{text:"Luxury Tire Dressing"}]},{id:"paint-correction",number:"5",name:"Paint Correction",category:"premium",price_car:"$799.00",price_suv:"$999.00",price_truck:"$1,199.00",coupon:"",includes:[{text:"Spot Water Remove"},{text:"Ultimate Compound"},{text:"Supreme Ceramic wash"},{text:"Clay Bar"},{text:"Polish"},{text:"Hand Wax"},{text:"Interior Cleaner"},{text:"Conditioner"},{text:"Luxury Tire Dressing"}]},{id:"premium-ceramic",number:"6",name:"Premium Ceramic Coating",category:"premium",price_car:"$849.00",price_suv:"$1,199.00",price_truck:"$1,399.00",coupon:"$100 / $150 / $200 OFF coupons available",includes:[{text:"Supreme Ceramic wash"},{text:"Supreme Interior Detail"},{text:"Paint Correction"},{text:"Conditioner"},{text:"Clay Bar"},{text:"Hand Wax"},{text:"Paint Disinfectant"},{text:"Premium Ceramic Coating"},{text:"Luxury Tire Dressing"}]}]
};

function esc(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// i18n: translate a UI-chrome key (js/i18n.js must load before this file).
// Falls back to the key itself if the i18n script failed to load.
function T(key, vars) {
  return (typeof t === "function") ? t(key, vars) : key;
}

// The tap-to-call link is derived from the displayed number, so editing the
// number (in either editor) automatically fixes the link too.
function setPhone(id, number, prefixKey) {
  var el = document.getElementById(id);
  if (el && number) {
    var digits = String(number).replace(/\D/g, "");
    el.setAttribute("href", "tel:+" + (digits.length === 10 ? "1" + digits : digits));
    // contact cards keep a nested <strong>; plain links just hold text
    var strong = el.querySelector("strong");
    if (strong) strong.textContent = number;
    else el.textContent = (prefixKey ? T(prefixKey) : "") + number;
  }
}

// Static "Call <number>" buttons marked with data-i18n-phone keep their
// translated prefix across language toggles.
function paintPhoneButtons() {
  document.querySelectorAll("[data-i18n-phone]").forEach(function (a) {
    a.textContent = T("call_prefix") + a.getAttribute("data-i18n-phone");
  });
}

// ---- Shop: brand index + brand detail (Shopify-style photo rail) ----
// The nav "Shop" link opens the brand index; each brand gets its own page at
// shop.html#brand=<slug> with a horizontally scrollable photo rail.
// Brands are data-driven: the shop brand list is the union of the brand names
// in content/brands.json and the brand values used by products, so a brand
// added in the editor gets its tile, page, and product assignments with no
// code changes. Slugs stay stable for existing brands ("Meguiar's" -> meguiars).
function slugify(name) {
  return String(name || "").toLowerCase().replace(/['\u2019]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}
// Shop Brands is the single source of truth: a product only appears on the
// site when its brand exists here. Deleting a brand hides its products
// (they stay in Products, so re-adding the brand brings them back).
function shopBrands(c) {
  var seen = {}, list = [];
  (c.brands || []).forEach(function (b) {
    var clean = String(b.name || "").trim();
    var key = clean.toLowerCase();
    if (!key || seen[key]) return;
    seen[key] = true;
    list.push({ slug: slugify(clean), name: clean, brand: clean });
  });
  return list;
}
var lastContent = null;

var GALLERY = { slug: "", idx: 0 };
var GALLERY_KEY_HANDLER = null;
var CHEV_UP = '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 15l-6-6-6 6"/></svg>';
var CHEV_DOWN = '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';

function shopHashState() {
  var m = (location.hash || "").match(/#brand=([a-z0-9-]+)(?:\/(\d+))?/);
  if (!m) return { slug: "", idx: 0 };
  return { slug: m[1], idx: m[2] ? parseInt(m[2], 10) : 0 };
}

function brandProducts(products, brand) {
  var want = String(brand || "").trim().toLowerCase();
  return (products || []).filter(function (p) { return String(p.brand || "").trim().toLowerCase() === want; });
}

// First available product photo for a brand — used as the brand tile preview
// when the brand has no dedicated photo of its own (e.g. brands created in
// the admin UI). Returns "" when the brand has no products with photos.
function firstBrandProductPhoto(products, brand) {
  var items = brandProducts(products, brand);
  for (var k = 0; k < items.length; k++) {
    if (items[k].photo) return items[k].photo;
  }
  return "";
}

function thumbHTML(pdt, k, active) {
  var inner = pdt.photo
    ? '<img loading="lazy" src="' + esc(pdt.photo) + '" alt="">'
    : '<span class="thumb-initials" aria-hidden="true">' + esc(pdt.initials || pdt.name) + '</span>';
  return '<button type="button" class="thumb' + (active ? " is-active" : "") + '"' +
    (active ? ' aria-current="true"' : "") +
    ' data-idx="' + k + '" aria-label="' + esc(T("show_photo", { k: k + 1, name: pdt.name })) + '">' + inner + "</button>";
}

// Re-render the shop grid with a single 180ms container fade (no per-item
// stagger). Used for brand-filter changes and language toggles; the initial
// page-load render stays instant (no motion-on-mount).
function renderShopSwap(c) {
  var app = document.getElementById("shopApp");
  var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!app || reduced) { renderShop(c); return; }
  app.style.transition = "none";
  app.style.opacity = "0";
  renderShop(c);
  void app.offsetWidth;
  app.style.transition = "opacity 180ms ease-out";
  app.style.opacity = "1";
  window.setTimeout(function () { app.style.transition = ""; }, 240);
}

function renderShop(c) {
  var app = document.getElementById("shopApp");
  if (!app) return;
  var products = c.products || [];
  var st = shopHashState();
  var BRANDS = shopBrands(c);
  var brand = null;
  for (var i = 0; i < BRANDS.length; i++) {
    if (BRANDS[i].slug === st.slug) brand = BRANDS[i];
  }

  if (!brand) {
    var cards = BRANDS.map(function (b) {
      var items = brandProducts(products, b.brand);
      var withPhoto = null;
      for (var k = 0; k < items.length; k++) {
        if (items[k].photo) { withPhoto = items[k]; break; }
      }
      var img = withPhoto
        ? '<div class="brand-photo"><img loading="lazy" src="' + esc(withPhoto.photo) + '" alt="' + esc(b.name) + '"></div>'
        : '<div class="brand-photo"><img src="images/logo.png" alt="' + esc(b.name) + '"></div>';
      var n = items.length;
      var countText = n === 0 ? T("photos_soon") : T("products_count", { count: n });
      var countAttr = n === 0
        ? 'data-i18n="photos_soon"'
        : 'data-i18n="products_count" data-i18n-vars=\'{"count":' + n + "}'";
      return '<a class="brand-card" href="shop.html#brand=' + b.slug + '" aria-label="' + esc(b.name) + " — " + esc(countText) + '">' +
        img + "<h3>" + esc(b.name) + "</h3><p><span " + countAttr + ">" + esc(countText) + "</span></p></a>";
    }).join("");
    app.innerHTML =
      '<h1 id="shopHeading" data-i18n="shop_h">Shop by Brand</h1>' +
      '<p class="section-sub" data-i18n="pick_brand">Pick a brand to browse its products — every photo shows the product and its price.</p>' +
      '<div class="brand-grid">' + cards + "</div>";
    return;
  }

  var items = brandProducts(products, brand.brand);
  var idx = items.length ? Math.max(0, Math.min(st.idx || 0, items.length - 1)) : 0;
  var chips = BRANDS.map(function (b) {
    var active = b.slug === brand.slug;
    return '<a class="brand-chip' + (active ? " is-active" : "") + '"' +
      (active ? ' aria-current="true"' : "") +
      ' href="shop.html#brand=' + b.slug + '">' + esc(b.name) + "</a>";
  }).join("");
  var body = items.length
    ? '<div class="gallery">' +
      '<div class="thumb-col">' +
       '<button type="button" class="thumb-nav thumb-prev" data-dir="-1" data-i18n-aria="prev_thumbs" aria-label="Show previous thumbnails">' + CHEV_UP + "</button>" +
      '<div class="thumb-strip" id="thumbStrip" aria-label="' + esc(T("product_photos", { name: brand.name })) + '">' +
      items.map(function (pdt, k) { return thumbHTML(pdt, k, k === idx); }).join("") +
      "</div>" +
      '<button type="button" class="thumb-nav thumb-next" data-dir="1" data-i18n-aria="next_thumbs" aria-label="Show next thumbnails">' + CHEV_DOWN + "</button>" +
      "</div>" +
      '<div class="gallery-main" aria-live="polite" aria-atomic="true">' +
      '<div class="main-photo" id="mainPhoto"></div>' +
      '<h2 class="main-name" id="mainName"></h2>' +
      '<p class="main-note" id="mainNote"></p>' +
      "</div>" +
      "</div>"
    : '<p class="empty-state">' + T("empty_brand", {
        name: esc(brand.name),
        phone: '<a href="tel:+18009164731">1-800-916-4731</a>'
      }) + "</p>";
  app.innerHTML =
    '<p class="shop-back"><a href="shop.html#brands" data-i18n="all_brands">\u2190 All brands</a></p>' +
    '<div class="brand-chips" role="navigation" data-i18n-aria="brands_aria" aria-label="Brands">' + chips + "</div>" +
    '<h1 id="shopHeading">' + esc(brand.name) + "</h1>" +
    '<p class="section-sub"><span data-i18n="products_count" data-i18n-vars=\'{"count":' + items.length + "}'\'>" +
    esc(T("products_count", { count: items.length })) +
    '</span><span data-i18n="select_thumb"> — select a thumbnail to enlarge it.</span></p>' +
    body;
  wireGallery(brand, items);
  syncGallery(brand, items, idx, false);
}

function mainPhotoHTML(pdt) {
  if (pdt.photo) {
    return '<img src="' + esc(pdt.photo) + '" alt="' + esc(pdt.name) + (pdt.note ? " — " + esc(pdt.note) : "") + '" fetchpriority="high">';
  }
  return '<div class="main-initials" role="img" aria-label="' + esc(pdt.name) + '">' + esc(pdt.initials || pdt.name) + "</div>";
}

// Crossfade the gallery's main photo: the incoming photo is stacked over the
// current one, faded in over 180ms ease-out, then committed as the static
// content (so the resting DOM matches a plain swap exactly).
function crossfadePhoto(photo, html) {
  photo._xfade = (photo._xfade || 0) + 1;
  var token = photo._xfade;
  var stale = photo.querySelector(".main-photo-xfade");
  if (stale) stale.remove();
  var layer = document.createElement("div");
  layer.className = "main-photo-xfade";
  layer.setAttribute("aria-hidden", "true");
  layer.innerHTML = html;
  photo.appendChild(layer);
  void layer.offsetWidth;
  layer.classList.add("is-in");
  window.setTimeout(function () {
    if (photo._xfade !== token) return;
    photo.innerHTML = html;
  }, 200);
}

function syncGallery(brand, items, idx, push, animate) {
  if (!items.length) return;
  idx = Math.max(0, Math.min(idx, items.length - 1));
  GALLERY = { slug: brand.slug, idx: idx };
  var pdt = items[idx];
  var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var photo = document.getElementById("mainPhoto");
  var name = document.getElementById("mainName");
  var note = document.getElementById("mainNote");
  if (photo) {
    var html = mainPhotoHTML(pdt);
    // 180ms ease-out crossfade on pointer-initiated thumb clicks only.
    // Keyboard-initiated swaps (arrow keys) and reduced-motion stay instant.
    if (animate && !reduced && photo.firstElementChild) {
      crossfadePhoto(photo, html);
    } else {
      photo.innerHTML = html;
    }
  }
  if (name) name.textContent = pdt.name;
  if (note) note.textContent = pdt.note || "";
  var strip = document.getElementById("thumbStrip");
  if (strip) {
    var thumbs = strip.querySelectorAll(".thumb");
    for (var k = 0; k < thumbs.length; k++) {
      var on = k === idx;
      thumbs[k].classList.toggle("is-active", on);
      if (on) {
        thumbs[k].setAttribute("aria-current", "true");
        if (thumbs[k].scrollIntoView) thumbs[k].scrollIntoView({ block: "nearest", inline: "nearest", behavior: reduced ? "auto" : "smooth" });
      } else {
        thumbs[k].removeAttribute("aria-current");
      }
    }
  }
  if (push && window.history && history.replaceState) {
    history.replaceState(null, "", "#brand=" + brand.slug + "/" + idx);
  }
}

function wireGallery(brand, items) {
  var strip = document.getElementById("thumbStrip");
  if (!strip) return;
  var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  strip.addEventListener("click", function (e) {
    var btn = e.target && e.target.closest ? e.target.closest(".thumb") : null;
    if (btn) syncGallery(brand, items, parseInt(btn.getAttribute("data-idx"), 10), true, true);
  });
  if (GALLERY_KEY_HANDLER) document.removeEventListener("keydown", GALLERY_KEY_HANDLER);
  GALLERY_KEY_HANDLER = function (e) {
    if (!document.getElementById("thumbStrip")) return;
    var t = e.target;
    if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT" || t.isContentEditable)) return;
    var next = null;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = GALLERY.idx + 1;
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = GALLERY.idx - 1;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = items.length - 1;
    if (next !== null) {
      e.preventDefault();
      syncGallery(brand, items, next, true);
    }
  };
  document.addEventListener("keydown", GALLERY_KEY_HANDLER);
  var navs = document.querySelectorAll(".thumb-nav");
  for (var n = 0; n < navs.length; n++) {
    (function (btn) {
      btn.addEventListener("click", function () {
        var dir = parseInt(btn.getAttribute("data-dir"), 10);
        var t = strip.querySelector(".thumb");
        var step = (t ? t.offsetHeight : 80) + 12;
        var horizontal = window.getComputedStyle(strip).flexDirection === "row";
        if (horizontal) strip.scrollBy({ left: dir * step, behavior: reduced ? "auto" : "smooth" });
        else strip.scrollBy({ top: dir * step, behavior: reduced ? "auto" : "smooth" });
      });
    })(navs[n]);
  }
  // Swipe left/right on the large photo to move through images.
  // Only predominantly horizontal swipes count, so vertical page
  // scrolling is never hijacked. Goes through syncGallery so the
  // counter, thumbnail highlight and deep-link stay in sync.
  var main = document.getElementById("mainPhoto");
  if (main) {
    var swipeX = 0, swipeY = 0, swiping = false;
    main.addEventListener("touchstart", function (e) {
      if (e.touches && e.touches.length === 1) {
        swipeX = e.touches[0].clientX;
        swipeY = e.touches[0].clientY;
        swiping = true;
      } else {
        swiping = false;
      }
    }, { passive: true });
    main.addEventListener("touchend", function (e) {
      if (!swiping) return;
      swiping = false;
      var t = e.changedTouches && e.changedTouches[0];
      if (!t) return;
      var dx = t.clientX - swipeX, dy = t.clientY - swipeY;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
        syncGallery(brand, items, GALLERY.idx + (dx < 0 ? 1 : -1), true);
      }
    }, { passive: true });
  }
}

// ---- Services page: packages render from content/packages.json ----
function packageCard(p) {
  var cls = "package-card" +
    (p.category === "express" ? " package-card--wide" : "") +
    (p.category === "premium" ? " package-card--premium" : "");
  var badge = p.coupon
    ? '<p class="pkg-badge">' + esc(p.coupon) + "</p>"
    : ""; // no coupon text -> no badge at all
  var prices =
    '<ul class="pkg-prices">' +
    "<li><span data-i18n=\"size_car\">Car</span><span>" + esc(p.price_car) + "</span></li>" +
    "<li><span data-i18n=\"size_suv\">SUV</span><span>" + esc(p.price_suv) + "</span></li>" +
    "<li><span data-i18n=\"size_truck\">Truck</span><span>" + esc(p.price_truck) + "</span></li>" +
    "</ul>";
  var includes = (p.includes || []).map(function (it) {
    return "<li>" + esc(it.text) + "</li>";
  }).join("");
  var button = '<button class="btn btn-call pkg-cta" type="button" data-book-package="' +
    esc(p.id) + '" data-i18n="book_pkg">Book this package</button>';
  var head =
    '<p class="pkg-num"><span data-i18n="pkg_num">Package #</span>' + esc(p.number) + "</p>" +
    '<h4 class="pkg-name">' + esc(p.name) + "</h4>" +
    '<p class="pkg-from"><span data-i18n="starting_at">Starting at</span>' + esc(p.price_car) + "</p>";
  if (p.category === "express") {
    return '<article class="' + cls + '"><div class="pkg-main">' +
      head + prices + badge + button +
      '</div><div class="pkg-side">' +
      '<h5 class="pkg-includes-title" data-i18n="whats_included">What&rsquo;s included</h5>' +
      '<ul class="pkg-includes">' + includes + "</ul>" +
      "</div></article>";
  }
  return '<article class="' + cls + '">' +
    head + prices +
    '<h5 class="pkg-includes-title" data-i18n="whats_included">What&rsquo;s included</h5>' +
    '<ul class="pkg-includes">' + includes + "</ul>" +
    badge + button + "</article>";
}

function renderPackages(c) {
  var pkgs = c.packages || [];
  var onPage = false;
  ["express", "detail", "premium"].forEach(function (cat) {
    var sec = document.querySelector('[data-pkg-section="' + cat + '"]');
    var grid = document.querySelector('[data-pkg-cat="' + cat + '"]');
    if (!sec || !grid) return;
    onPage = true;
    var items = pkgs.filter(function (p) { return p.category === cat; });
    grid.innerHTML = items.map(packageCard).join("");
    sec.hidden = items.length === 0; // hide a category left with no packages
  });
  if (!onPage) return;
  var sel = document.getElementById("appt-package");
  if (sel) {
    sel.innerHTML = '<option value="" disabled selected data-i18n="f_select">Select a package</option>' +
      pkgs.map(function (p) {
        return '<option value="' + esc(p.id) + '">' + esc(p.name) +
          " (" + esc(T("pkg_num")) + esc(p.number) + ")</option>";
      }).join("");
  }
}

// ---- Theme colors (admin Theme tab -> site_settings.theme, else content/theme.json) ----
// Every color on the site comes from a CSS variable, so the owner's palette
// applies everywhere: headers, buttons, text, backgrounds, photo overlays.
// ---- Supabase theme picker -> site palette ----
// The admin's Theme tab stores {active, themes:{id:{name, colors:{
// accent, navy, dark, page, card, text, muted, line}}}} in
// site_settings.theme. This maps those 8 keys onto the site's own palette
// keys, which applyTheme then paints onto :root. Derived shades keep
// buttons, hovers and alternating sections harmonious for any theme.
function hexToRgb(h) {
  h = String(h || "").replace("#", "");
  if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  var n = parseInt(h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function rgbToHex(r, g, b) {
  function p(v) { v = Math.max(0, Math.min(255, Math.round(v))); var s = v.toString(16); return s.length < 2 ? "0" + s : s; }
  return "#" + p(r) + p(g) + p(b);
}
function mixHex(h1, h2, t) { // t=0 -> h1, t=1 -> h2
  var a = hexToRgb(h1), b = hexToRgb(h2);
  return rgbToHex(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t);
}
function relLum(h) {
  var c = hexToRgb(h).map(function (v) {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}
function mapThemeColors(c) {
  var accent = c.accent, page = c.page, text = c.text;
  return {
    accent: accent,
    accent_dark: mixHex(accent, "#000000", 0.20),
    accent_bright: mixHex(accent, "#ffffff", 0.30),
    on_accent: relLum(accent) > 0.35 ? "#0f172a" : "#ffffff",
    navy: c.navy,
    navy_deep: c.dark,
    ink: text,
    muted: c.muted,
    bg: page,
    bg_alt: mixHex(page, text, 0.055),
    card: c.card,
    line: c.line
    // ring keeps the CSS default (focus visibility) and is never themed
  };
}
var THEME_KEYS = ["accent", "navy", "dark", "page", "card", "text", "muted", "line"];
function supabaseTheme(db) {
  // Active admin-picked theme mapped to site palette keys, or null when
  // missing/invalid so the file theme is used instead. Never throws.
  try {
    var t = db && db.settings && db.settings.theme;
    if (!t || typeof t !== "object") return null;
    var themes = t.themes || {};
    var active = themes[t.active] || themes.oasis || null;
    var colors = active && active.colors;
    if (!colors) return null;
    for (var i = 0; i < THEME_KEYS.length; i++) {
      if (!/^#[0-9a-fA-F]{6}$/.test(colors[THEME_KEYS[i]] || "")) return null;
    }
    return mapThemeColors(colors);
  } catch (e) { return null; }
}

function applyTheme(t) {
  if (!t) return;
  var root = document.documentElement;
  var map = {
    navy: "--navy", navy_deep: "--navy-deep", ink: "--ink", muted: "--muted",
    bg: "--bg", bg_alt: "--bg-alt", line: "--line",
    accent: "--accent", accent_dark: "--accent-dark", accent_bright: "--accent-bright",
    on_accent: "--on-accent", card: "--card",
    ring: "--ring"
  };
  Object.keys(map).forEach(function (k) {
    if (t[k]) root.style.setProperty(map[k], t[k]);
  });
  var mt = document.querySelector('meta[name="theme-color"]');
  if (mt && t.navy_deep) mt.setAttribute("content", t.navy_deep);
}

// Persist the applied palette so the inline <head> pre-paint script can
// apply it before first paint on the next visit (kills the default-theme
// flash). Only called for real themes (Supabase admin pick or
// content/theme.json), never the built-in default. A corrupt cache can't
// break the page: readers re-validate every value.
function cacheTheme(t) {
  try {
    if (t && typeof t === "object") localStorage.setItem("oasis-theme-cache", JSON.stringify(t));
  } catch (e) {}
}

function cachedTheme() {
  // The palette the <head> script pre-painted, or null. Used as the initial
  // theme so the first renderAll() doesn't flash back to the built-in
  // default while Supabase loads.
  try {
    var t = JSON.parse(localStorage.getItem("oasis-theme-cache") || "null");
    if (t && typeof t === "object" &&
        /^#[0-9a-fA-F]{6}$/.test(t.navy || "") &&
        /^#[0-9a-fA-F]{6}$/.test(t.accent || "")) return t;
  } catch (e) {}
  return null;
}

function renderAll(c) {
  applyTheme(c.theme);
  var s = c.settings || {};

  setPhone("topPhone1", s.phone1);
  setPhone("topPhone2", s.phone2);
  setPhone("heroCallBtn", s.phone1, "call_prefix");
  paintPhoneButtons();
  window.__oasisPhones = { phone1: s.phone1, phone2: s.phone2 };
  setPhone("shopPhoneLink", s.phone1);
  setPhone("contactPhone1", s.phone1);
  setPhone("contactPhone2", s.phone2); setPhone("hoursCall", s.phone1);

  var addr = document.getElementById("contactAddress");
  if (addr && s.address) addr.textContent = s.address;
  var topAddr = document.getElementById("topAddress");
  if (topAddr && s.address) {
    topAddr.textContent = s.address;
    topAddr.setAttribute("data-address", s.address);
    wireDirectionsLink(topAddr);
  }
  var f = c.footer || {};
  var fv = document.getElementById("footVerse");
  if (fv && f.verse_text) fv.textContent = "\u201C" + f.verse_text + "\u201D";
  var fvc = document.getElementById("footVerseCite");
  if (fvc && f.verse_cite) fvc.textContent = f.verse_cite;
  var fcr = document.getElementById("footCopyright");
  if (fcr && f.copyright_text) fcr.textContent = f.copyright_text;
  var fal = document.getElementById("footAddressLine");
  if (fal && f.address_line) fal.textContent = f.address_line;

  var hoursList = document.getElementById("hoursList");
  if (hoursList && s.hours) {
    var todayIdx;
    try { todayIdx = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' })).getDay(); }
    catch (e) { todayIdx = new Date().getDay(); }
    hoursList.innerHTML = s.hours.map(function (h, i) {
      var p = "content/settings.json:hours." + i;
      var isToday = expandDays(h.days).indexOf(todayIdx) !== -1;
      return '<div class="hours-row' + (isToday ? " today" : "") + '" role="row"><span role="cell">' + esc(h.days) + '</span><span role="cell">' + esc(h.time) + '</span></div>';
    }).join("");
  }
  window.__oasisHours = s.hours;
  updateOpenStatus(s.hours);

  var water = document.getElementById("waterText");
  if (water && s.water_text) water.textContent = s.water_text;
  var aboutCopy = document.getElementById("aboutCopy");
  if (aboutCopy && s.about_text) {
    // blank lines in the About text start a new paragraph (first = lead,
    // last = closer); the text stays editable from the admin settings page.
    var paras = s.about_text.split(/\n\s*\n/).map(function (x) { return x.trim(); })
      .filter(function (x) { return !!x; });
    aboutCopy.innerHTML = "";
    paras.forEach(function (txt, i) {
      var p = document.createElement("p");
      if (i === 0) p.className = "about-lead";
      if (i === paras.length - 1 && paras.length > 1) p.className = "about-closer";
      p.textContent = txt;
      aboutCopy.appendChild(p);
    });
  }

  // Editable photo backgrounds (Site Settings → hero_bg / water_bg).
  // A dark navy overlay keeps the white text readable; empty = default navy.
  // The photo's brightness is measured and light photos flip the section to
  // navy text + light overlay (dark photos keep white text).
  function photoIsLight(url, cb) {
    var img = new Image();
    img.onload = function () {
      try {
        var n = 24, c = document.createElement("canvas");
        c.width = n; c.height = n;
        var x = c.getContext("2d", { willReadFrequently: true });
        x.drawImage(img, 0, 0, n, n);
        var d = x.getImageData(0, 0, n, n).data, lum = 0;
        for (var i = 0; i < d.length; i += 4) {
          lum += (0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2]) / 255;
        }
        cb(lum / (d.length / 4) > 0.62);
      } catch (e) { cb(false); }
    };
    img.onerror = function () { cb(false); };
    img.src = url;
  }
  function applyPhotoBg(el, url) {
    el.classList.add("has-photo-bg");
    el.style.setProperty("--bg-photo", "url('" + url.replace(/'/g, "%27") + "')");
    photoIsLight(url, function (light) { if (light) el.classList.add("bg-light"); });
  }
  var heroSec = document.querySelector("main .hero");
  if (heroSec && s.hero_bg) applyPhotoBg(heroSec, s.hero_bg);
  var waterSec = document.querySelector("main .water");
  if (waterSec && s.water_bg) applyPhotoBg(waterSec, s.water_bg);

  // Editable hero van photo (Site Settings → hero van image).
  // Empty = the default van photo bundled with the site.
  var vanImg = document.querySelector("main .hero-van");
  if (vanImg && s.hero_van) vanImg.src = s.hero_van;

  var sg = document.getElementById("servicesGrid");
  if (sg && c.services) {
    sg.innerHTML = c.services.map(function (sv) {
      var tag = sv.tag ? '<p class="svc-tag">' + esc(sv.tag) + '</p>' : '';
      var photo = sv.photo
        ? '<div class="svc-photo" style="background-image:url(\'' + esc(sv.photo) + '\')" aria-hidden="true"></div>'
        : '';
      var inner = photo +
        '<div class="svc-body">' + tag +
        '<h3>' + esc(sv.title) + '</h3>' +
        '<p>' + esc(sv.description) + '</p></div>';
      var cls = 'svc-card' + (sv.photo ? '' : ' svc-card--nophoto');
      // Whole card is the link when a URL is set.
      return sv.cta_url
        ? '<a class="' + cls + '" href="' + esc(sv.cta_url) + '" aria-label="' + esc(sv.title) + '">' + inner + '</a>'
        : '<article class="' + cls + '">' + inner + '</article>';
    }).join("");
  }

  var sl = document.getElementById("socialLinks");
  if (sl && c.social) {
    sl.innerHTML = c.social.map(function (s) {
      var img = s.icon
        ? '<img src="' + esc(s.icon) + '" alt="' + esc(s.name) + '" loading="lazy">'
        : esc(s.name);
      return '<a href="' + esc(s.url) + '" target="_blank" rel="noopener" aria-label="' + esc(s.name) + ' (opens in new tab)">' + img + '</a>';
    }).join("");
  }

  var bg = document.getElementById("brandGrid");
  if (bg && c.brands) {
    // Homepage shows only these featured brands (names match the Supabase
    // brands table, case-insensitive). To feature or unfeature a brand,
    // edit this list.
    var FEATURED_BRANDS = ["meguiar's", "sonax", "dinowax", "max shine"];
    var homeBrands = c.brands.filter(function (b) {
      return FEATURED_BRANDS.indexOf(String(b.name || "").trim().toLowerCase()) !== -1;
    });
    if (!homeBrands.length) homeBrands = c.brands;
    bg.innerHTML = homeBrands.map(function (b) {
      var p = "content/brands.json:items." + c.brands.indexOf(b);
      // Tile preview: the brand's own photo wins; otherwise fall back to the
      // first photo among that brand's products (covers brands created in the
      // admin, which have no dedicated tile image); otherwise keep the
      // existing initials placeholder.
      var tilePhoto = b.photo || firstBrandProductPhoto(c.products, b.name);
      // Homepage tiles are brand logos: always show the whole logo, never crop.
      var photoCls = "brand-photo brand-photo--logo";
      var photo = tilePhoto
        ? '<div class="' + photoCls + '"><img src="' + esc(tilePhoto) + '" alt="' + esc(b.name) + '"></div>'
        : '<div class="' + photoCls + '" aria-label="' + esc(b.name) + ' photo coming soon">' + esc(b.initials || b.name) + '</div>';
      var bhref = "shop.html#brand=" + slugify(b.name);
      return '<a class="brand-card" href="' + bhref + '" aria-label="' + esc(b.name) + ' — see products">' + photo + '<h3>' + esc(b.name) + '</h3><p>' + esc(b.tagline || "") + '</p></a>';
    }).join("");
  }


  lastContent = c;
  renderShop(c);
  renderPackages(c);

  var tg = document.getElementById("testimonialsGrid");
  if (tg && c.testimonials) {
    // Reviews marquee: the cards flow right-to-left in a seamless loop.
    // Manage reviews in the admin Reviews tab (Supabase testimonials table);
    // content/testimonials.json is only the offline fallback. The loop duration scales automatically.
    var reviewCards = c.testimonials.map(function (t, i) {
      var p = "content/testimonials.json:items." + i;
      return '<div class="card review"><div class="stars" aria-hidden="true"><svg class="icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2l2.9 6.26L21.5 9.3l-4.75 4.87L17.8 21 12 17.77 6.2 21l1.05-6.83L2.5 9.3l6.6-1.04L12 2z"/></svg><svg class="icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2l2.9 6.26L21.5 9.3l-4.75 4.87L17.8 21 12 17.77 6.2 21l1.05-6.83L2.5 9.3l6.6-1.04L12 2z"/></svg><svg class="icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2l2.9 6.26L21.5 9.3l-4.75 4.87L17.8 21 12 17.77 6.2 21l1.05-6.83L2.5 9.3l6.6-1.04L12 2z"/></svg><svg class="icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2l2.9 6.26L21.5 9.3l-4.75 4.87L17.8 21 12 17.77 6.2 21l1.05-6.83L2.5 9.3l6.6-1.04L12 2z"/></svg><svg class="icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2l2.9 6.26L21.5 9.3l-4.75 4.87L17.8 21 12 17.77 6.2 21l1.05-6.83L2.5 9.3l6.6-1.04L12 2z"/></svg></div><p class="quote">' + esc(t.quote) + '</p><cite>' + esc(t.name) + '</cite></div>';
    }).join("");
    var reviewSet = '<div class="reviews-set">' + reviewCards + '</div>';
    var reviewSetHidden = '<div class="reviews-set" aria-hidden="true">' + reviewCards + '</div>';
    tg.innerHTML = '<div class="reviews-track">' + reviewSet + reviewSetHidden + reviewSetHidden + "</div>";
    tg.style.setProperty("--reviews-duration", (c.testimonials.length * 8) + "s");
  }
}

// Bump CONTENT_VERSION whenever a file under content/ changes, so browsers
// never keep serving a stale cached copy of the JSON.
var CONTENT_VERSION = "20260922f";
function fetchJSON(path) {
  return fetch(path + "?v=" + CONTENT_VERSION).then(function (r) {
    if (!r.ok) throw new Error("missing " + path);
    return r.json();
  });
}

// ---- Open-now status pill ----
// Derives "Open now · closes 5 PM" / "Closed · opens tomorrow at 7:30 AM"
// from the editable store hours, in store-local time (America/Los_Angeles).
// The pill is computed at render time from the hours data.
var DAY_INDEX = { sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6 };
var DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function parseTimeToMin(t) {
  var m = String(t).trim().match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)$/i);
  if (!m) return null;
  var h = parseInt(m[1], 10) % 12;
  if (/pm/i.test(m[3])) h += 12;
  return h * 60 + (m[2] ? parseInt(m[2], 10) : 0);
}

function fmtTime(mins) {
  var h = Math.floor(mins / 60), m = mins % 60;
  var ap = h >= 12 ? 'PM' : 'AM';
  h = h % 12; if (h === 0) h = 12;
  return h + (m ? ':' + String(m).padStart(2, '0') : '') + ' ' + ap;
}

function expandDays(label) {
  var parts = String(label).toLowerCase().split(/\s*[–—-]\s*/);
  var days = [];
  if (parts.length === 2 && DAY_INDEX[parts[0]] != null && DAY_INDEX[parts[1]] != null) {
    var d = DAY_INDEX[parts[0]];
    while (true) {
      days.push(d);
      if (d === DAY_INDEX[parts[1]]) break;
      d = (d + 1) % 7;
    }
  } else if (DAY_INDEX[parts[0]] != null) {
    days.push(DAY_INDEX[parts[0]]);
  }
  return days;
}

function updateOpenStatus(hours) {
  var el = document.getElementById('openStatus');
  if (!el || !hours || !hours.length) return;
  var now;
  try {
    now = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }));
  } catch (e) {
    now = new Date();
  }
  var today = now.getDay();
  var nowMin = now.getHours() * 60 + now.getMinutes();
  var schedule = {}; // dayIndex -> {open, close} | null when closed
  hours.forEach(function (h) {
    var t = String(h.time || '').trim();
    var entry = null;
    if (t.toLowerCase() !== 'closed') {
      var range = t.split(/\s*[–—-]\s*/);
      if (range.length === 2) {
        var o = parseTimeToMin(range[0]), c = parseTimeToMin(range[1]);
        if (o != null && c != null) entry = { open: o, close: c };
      }
    }
    expandDays(h.days).forEach(function (d) { schedule[d] = entry; });
  });
  var text = '', isClosed = true;
  var todayHrs = schedule[today];
  if (todayHrs && nowMin >= todayHrs.open && nowMin < todayHrs.close) {
    text = T("open_now", { time: fmtTime(todayHrs.close) });
    isClosed = false;
  } else {
    for (var i = 0; i < 8; i++) {
      var d = (today + i) % 7;
      var e = schedule[d];
      if (!e) continue;
      if (i === 0 && nowMin >= e.close) continue; // today's hours already passed
      var when = i === 0 ? T("when_today") : i === 1 ? T("when_tomorrow") : T("day_" + d);
      text = T("closed_opens", { when: when, time: fmtTime(e.open) });
      break;
    }
    if (!text) return; // unparseable schedule — leave the pill hidden
  }
  el.innerHTML = '<span class="dot" aria-hidden="true"></span>' + esc(text);
  el.classList.toggle('closed', isClosed);
  el.hidden = false;
}

// Re-render language-dependent dynamic content when the visitor toggles
// languages (called by js/i18n.js applyI18n before it rescans the DOM).
window.__oasisRetranslate = function () {
  if (!lastContent) return;
  renderShopSwap(lastContent);
  renderPackages(lastContent);
  var ph = window.__oasisPhones || {};
  setPhone("topPhone1", ph.phone1);
  setPhone("topPhone2", ph.phone2);
  setPhone("heroCallBtn", ph.phone1, "call_prefix");
  setPhone("shopPhoneLink", ph.phone1);
  setPhone("contactPhone1", ph.phone1);
  setPhone("contactPhone2", ph.phone2);
  setPhone("hoursCall", ph.phone1);
  paintPhoneButtons();
  if (window.__oasisHours) updateOpenStatus(window.__oasisHours);
};

// ---- Content loading: Supabase first, JSON files as per-section fallback ----
// Priority per section: Supabase (via OasisDB.loadAll) -> content/*.json ->
// built-in DEFAULT_CONTENT. Theme prefers the admin-picked Supabase theme
// (site_settings.theme), then content/theme.json, then the built-in default.
function hasSection(v, isObject) {
  if (v == null) return false;
  if (isObject) return Object.keys(v).length > 0;
  return Array.isArray(v) && v.length > 0;
}

function jsonOrFallback(path, pick, fallback) {
  return fetchJSON(path).then(pick, function () { return fallback; });
}

function loadContent() {
  // Paint the built-in defaults immediately so the page never appears empty,
  // then refresh with fresher data when it arrives. The initial theme comes
  // from the cache (already pre-painted in <head>) so there's no flash back
  // to the built-in default while Supabase loads.
  var initialTheme = cachedTheme();
  renderAll(initialTheme ? Object.assign({}, DEFAULT_CONTENT, { theme: initialTheme }) : DEFAULT_CONTENT);

  var dbReady = typeof window.OasisDB !== "undefined" && window.OasisDB.isConfigured();
  var dbPromise = dbReady
    ? Promise.race([
        window.OasisDB.loadAll(),
        new Promise(function (_, reject) {
          setTimeout(function () { reject(new Error("db race timeout")); }, 7000);
        })
      ]).then(function (c) { return c; }, function () { return null; })
    : Promise.resolve(null);

  dbPromise.then(function (db) {
    // A section falls back to its JSON file when Supabase is off, when
    // loadAll failed, or when Supabase returned nothing usable for it.
    // themeIsReal tracks whether the resolved theme came from a real source
    // (Supabase admin pick or content/theme.json) rather than the built-in
    // default; only real themes are cached for the pre-paint head script.
    var themeIsReal = false;
    function fromDB(key) { return db ? db[key] : undefined; }
    function need(key, isObject) { return !hasSection(fromDB(key), isObject); }
    function resolve(key, path, pick, isObject) {
      if (!need(key, isObject)) return Promise.resolve(fromDB(key));
      return jsonOrFallback(path, pick, DEFAULT_CONTENT[key]);
    }

    Promise.all([
      resolve("settings", "content/settings.json", function (j) { return j; }, true),
      resolve("services", "content/services.json", function (j) { return j.items; }),
      resolve("brands", "content/brands.json", function (j) { return j.items; }),
      resolve("testimonials", "content/testimonials.json", function (j) { return j.items; }),
      resolve("products", "content/products.json", function (j) { return j.items; }),
      resolve("packages", "content/packages.json", function (j) { return j.items; }),
      resolve("social", "content/social.json", function (j) { return j.items; }),
      resolve("footer", "content/footer.json", function (j) { return j; }, true),
      // Theme: the admin-picked Supabase theme wins when present and valid;
      // otherwise the file theme, otherwise the built-in default.
      (function () {
        var st = supabaseTheme(db);
        if (st) { themeIsReal = true; return Promise.resolve(st); }
        return jsonOrFallback("content/theme.json", function (j) { themeIsReal = true; return j; }, DEFAULT_CONTENT.theme);
      })()
    ]).then(function (parts) {
      if (themeIsReal) cacheTheme(parts[8]);
      renderAll({
        settings: parts[0],
        services: parts[1],
        brands: parts[2],
        testimonials: parts[3],
        products: parts[4],
        packages: parts[5],
        social: parts[6],
        footer: parts[7],
        theme: parts[8]
      });
    });
  });
}

document.addEventListener("DOMContentLoaded", loadContent);

// ---- Directions links: open the visitor's default map app ----
function mapsUrl(query) {
  var q = encodeURIComponent(query);
  var ua = navigator.userAgent || "";
  var isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  if (isIOS) return "https://maps.apple.com/?q=" + q;
  if (/Android/.test(ua)) return "geo:0,0?q=" + q;
  return "https://www.google.com/maps/search/?api=1&query=" + q;
}
function wireDirectionsLink(a) {
  var addr = a.getAttribute("data-address");
  if (!addr) return;
  var url = mapsUrl(addr);
  a.setAttribute("href", url);
  if (url.indexOf("https://www.google.com/maps") === 0) {
    a.setAttribute("target", "_blank");
    a.setAttribute("rel", "noopener");
  } else {
    // Opens the native map app, not a new browser tab.
    a.removeAttribute("target");
    a.removeAttribute("rel");
    var note = a.querySelector(".visually-hidden");
    if (note && note.parentNode) note.parentNode.removeChild(note);
  }
}
document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll("a.js-directions").forEach(function (a) { wireDirectionsLink(a); });
  var y = document.getElementById("footYear");
  if (y) y.textContent = String(new Date().getFullYear());
});

window.addEventListener("hashchange", function () {
  if (document.getElementById("shopApp") && lastContent) {
    renderShopSwap(lastContent);
    var h = document.getElementById("shopHeading");
    if (h) h.scrollIntoView();
  }
});

// ---- Contact form (demo until wired to a form/email service) ----
(function () {
  var form = document.getElementById("contactForm");
  if (!form) return;
  function showThankYou(ok) {
    var status = document.getElementById("formStatus");
    if (status) {
      status.textContent = T(ok ? "contact_ok" : "contact_soon");
      status.classList.add("success");
    }
    form.reset();
  }
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var checked = form.querySelector('input[name="topic"]:checked');
    var payload = {
      name: (document.getElementById("cf-name") || {}).value || "",
      phone: (document.getElementById("cf-phone") || {}).value || "",
      email: (document.getElementById("cf-email") || {}).value || "",
      topic: checked ? checked.value : "",
      message: (document.getElementById("cf-message") || {}).value || ""
    };
    if (typeof window.OasisDB !== "undefined" && window.OasisDB.isConfigured()) {
      window.OasisDB.submitMessage(payload).then(function (r) {
        showThankYou(r && r.ok);
      });
    } else {
      showThankYou(false);
    }
  });
})();

// ---- Appointment form (demo until wired to a form/email service) ----
(function () {
  var form = document.getElementById("appointmentForm");
  if (!form) return;
  var dateInput = document.getElementById("appt-date");
  if (dateInput) {
    var today = new Date();
    var mm = String(today.getMonth() + 1);
    if (mm.length < 2) mm = "0" + mm;
    var dd = String(today.getDate());
    if (dd.length < 2) dd = "0" + dd;
    dateInput.min = today.getFullYear() + "-" + mm + "-" + dd;
  }
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var nameEl = document.getElementById("appt-name");
    var pkgEl = document.getElementById("appt-package");
    var name = nameEl ? nameEl.value : "there";
    var pkgName = pkgEl && pkgEl.selectedIndex >= 0 ? pkgEl.options[pkgEl.selectedIndex].text : "your selected package";
    function showThankYou(ok) {
      var status = document.getElementById("apptStatus");
      if (status) {
        status.textContent = ok
          status.textContent = T(ok ? "appt_ok" : "appt_soon", { name: name, pkg: pkgName });
      }
      form.reset();
    }
    var payload = {
      name: (document.getElementById("appt-name") || {}).value || "",
      phone: (document.getElementById("appt-phone") || {}).value || "",
      email: (document.getElementById("appt-email") || {}).value || "",
      address: (document.getElementById("appt-address") || {}).value || "",
      package: pkgEl ? pkgEl.value : "",
      date: (document.getElementById("appt-date") || {}).value || "",
      time: (document.getElementById("appt-time") || {}).value || "",
      message: (document.getElementById("appt-message") || {}).value || ""
    };
    if (typeof window.OasisDB !== "undefined" && window.OasisDB.isConfigured()) {
      window.OasisDB.submitAppointment(payload).then(function (r) {
        showThankYou(r && r.ok);
      });
    } else {
      showThankYou(false);
    }
  });
})();

// ---- "Book this package" buttons: preselect package + jump to form ----
// Delegated: package cards render from JSON after this script loads.
document.addEventListener("click", function (e) {
  var btn = e.target && e.target.closest ? e.target.closest("[data-book-package]") : null;
  if (!btn) return;
  var pkgSelect = document.getElementById("appt-package");
  var appt = document.getElementById("appointment");
  if (!pkgSelect || !appt) return;
  pkgSelect.value = btn.getAttribute("data-book-package");
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  // Touch devices: land on the form itself and don't auto-focus (focusing
  // would pop the virtual keyboard over the form). Desktop keeps section
  // scroll + focus, which works fine with a physical keyboard.
  var coarse = window.matchMedia && window.matchMedia("(pointer: coarse)").matches;
  var target = (coarse && document.getElementById("appointmentForm")) || appt;
  target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  if (!coarse) {
    var nameField = document.getElementById("appt-name");
    if (nameField) nameField.focus({ preventScroll: true });
  }
});
