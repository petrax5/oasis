/* Oasis i18n — UI chrome in English + Spanish.
   How it works:
   - Every translatable UI string lives in I18N below (en + es).
   - Static HTML marks strings with data-i18n="key" (text),
     data-i18n-ph="key" (placeholder), data-i18n-aria="key" (aria-label),
     data-i18n-title="key" (title). Optional data-i18n-vars='{"k":1}' fills {k}.
   - First visit: language auto-detects from the device (navigator.language).
     The choice is remembered in localStorage; the ES/EN button toggles it.
   - Product names, package details, reviews, hours and other CMS content
     stay in the language they were entered in — only the site chrome translates.
   Loaded before script.js on every page. */
(function () {
  "use strict";

  var I18N = {
    en: {
      skip: "Skip to main content",
      brand_tag: "Detailing Supplies",
      brand_home_aria: "Oasis Detailing Supplies Inc \u2014 home",
      nav_aria: "Main navigation",
      nav_services: "Services",
      nav_shop: "Shop",
      nav_water: "Water Station",
      nav_reviews: "Reviews",
      nav_contact: "Contact",
      open_menu: "Open menu",
      close_menu: "Close menu",
      switch_to_es: "Switch to Spanish",
      switch_to_en: "Switch to English",
      foot_follow: "Follow us",
      foot_review_h: "Enjoyed your visit?",
      leave_review: "Leave us a review",
      rights: "Oasis Detailing Supplies Inc \u2014 All rights reserved.",
      credit_prefix: "Service photos provided by",
      new_tab: "(opens in new tab)",
      call_prefix: "Call ",
      get_directions: "Get Directions",
      contact_us: "Contact us",
      call_us: "Call us",

      title_index: "Oasis Detailing Supplies Inc | Auto Detailing Supplies & Services in Orange, CA",
      hero_eyebrow: "Family-owned in Orange, CA",
      hero_h1: "Auto Detailing Supplies & Services",
      hero_sub: "Professional detailing, quality supplies, and honest prices \u2014 trusted by drivers and detailers across Orange County for years.",
      trust_aria: "Why choose Oasis",
      trust_5star: "5-Star Rated",
      trust_family: "Family Owned",
      open_now: "Open now \u00B7 closes {time}",
      closed_opens: "Closed \u00B7 opens {when} at {time}",
      when_today: "today",
      when_tomorrow: "tomorrow",
      day_0: "Sunday", day_1: "Monday", day_2: "Tuesday", day_3: "Wednesday",
      day_4: "Thursday", day_5: "Friday", day_6: "Saturday",
      services_kicker: "What we do",
      services_h: "Our Services",
      services_sub: "Detailing services and pro-grade supplies \u2014 in the shop or at your door.",
      book_now: "Book Now",
      shop_kicker: "Brands we carry",
      shop_h: "Shop by Brand",
      shop_sub: "The pro brands detailers ask for \u2014 all on our shelves.",
      shop_all: "Shop all brands",
      delivery_b: "Delivery available",
      delivery_t: "\u2014 free home delivery within 5 miles of the store on purchases of $75 or more.",
      delivery_c: "Call or visit the store.",
      water_kicker: "Open 24/7",
      water_h: "Spot-Free Water Fill Station",
      see_how: "See How",
      reviews_kicker: "Customer reviews",
      reviews_h: "What Our Customers Say",
      hours_kicker: "Visit us",
      hours_h: "Store Hours",
      hours_aria: "Store hours",
      about_kicker: "Our story",
      about_h: "Meet Joe & Angel",
      about_facts_aria: "Oasis facts",
      stat_est: "Established",
      stat_exp: "Of detailing experience",
      stat_family: "Family owned & operated",

      title_shop: "Shop Products | Oasis Detailing Supplies Inc",
      shop_h1: "Shop Our Products",
      shop_loading: "Loading the shelf lineup\u2026",
      policy_b: "We don\u2019t sell online:",
      policy_t1: "see something you like?",
      policy_call: "Call us",
      policy_t2: "and we\u2019ll set it aside for pickup.",
      pick_brand: "Pick a brand to browse its products \u2014 every photo shows the product and its price.",
      photos_soon: "Photos coming soon",
      products_count: { one: "{count} product", other: "{count} products" },
      select_thumb: "\u2014 select a thumbnail to enlarge it.",
      all_brands: "\u2190 All brands",
      brands_aria: "Brands",
      show_photo: "Show photo {k} of {name}",
      product_photos: "{name} product photos",
      prev_thumbs: "Show previous thumbnails",
      next_thumbs: "Show next thumbnails",
      empty_brand: "Nothing listed under {name} yet \u2014 call {phone} to ask what\u2019s in stock.",

      title_services: "Services & Packages | Oasis Detailing Supplies Inc",
      svc_kicker: "Detailing Services \u00B7 Orange, CA",
      svc_h1: "Packages for every car, priced by size",
      svc_sub: "From an express ceramic wash to full paint correction \u2014 pick a package below, then request your appointment. All work is done in our Orange shop.",
      see_packages: "See packages",
      steps_h: "How booking works",
      step1_h: "Pick a package",
      step1_p: "Choose the service level your car needs. Every package is priced by vehicle size.",
      step2_h: "Request a time",
      step2_p: "Send the appointment form below with the date and time that work for you.",
      step3_h: "We confirm",
      step3_p: "We\u2019ll confirm your appointment \u2014 or call us now to book right away.",
      pkgs_h: "Detailing packages",
      pkgs_sub: "Three service levels, six packages \u2014 pick the one your car needs.",
      cat_express: "Express wash",
      cat_express_sub: "A thorough wash, inside and out \u2014 the quick refresh.",
      cat_detail: "Detail packages",
      cat_detail_sub: "Complete interior and exterior detailing, step by step.",
      cat_premium: "Paint correction & ceramic coating",
      cat_premium_sub: "Machine polishing and long-term paint protection.",
      coupon_note: "Discount coupons are available in-store \u2014 mention them when you book.",
      appt_h: "Make an appointment",
      appt_sub: "Fill this out and we\u2019ll confirm your time.",
      appt_s1: "We confirm your date and time.",
      appt_s2: "We come to you \u2014 detailing done at your home or location.",
      appt_s3: "Mention any coupon when you book \u2014 it\u2019s honored in-store.",
      areas_h: "Areas we serve",
      f_name: "Full name",
      f_phone: "Phone",
      f_email: "Email",
      f_address: "Address",
      f_which: "Which package?",
      f_select: "Select a package",
      f_date: "Date",
      f_time: "Time",
      f_msg: "Your message",
      f_optional: "(optional)",
      f_msgph: "Anything we should know? Gate codes, parking, pet hair, stains...",
      request_appt: "Request appointment",
      pkg_num: "Package #",
      starting_at: "Starting at",
      size_car: "Car",
      size_suv: "SUV",
      size_truck: "Truck",
      whats_included: "What\u2019s included",
      book_pkg: "Book this package",
      appt_ok: "Thank you, {name}! Your request for {pkg} has been received \u2014 we\u2019ll call you to confirm. To reach us right now, call 1-800-916-4731.",
      appt_soon: "Thank you, {name}! Your request for {pkg} has been received. This form will be connected soon \u2014 to confirm right now, call 1-800-916-4731.",

      title_contact: "Contact Us | Oasis Detailing Supplies Inc",
      contact_h1: "Contact Us",
      contact_sub: "See something you like? Call us and we\u2019ll set it aside for pickup.",
      ways_aria: "Ways to reach us",
      call_us_h: "Call us",
      visit_h: "Visit the store",
      get_dir_arrow: "Get directions \u2192",
      hours_h: "Hours",
      d_mon_thu: "Monday \u2013 Thursday",
      d_fri: "Friday",
      d_sat: "Saturday",
      d_sun: "Sunday",
      d_closed: "Closed",
      send_h: "Send us a message",
      about_legend: "What\u2019s this about?",
      topic_product: "Product question",
      topic_pickup: "Set aside for pickup",
      topic_services: "Detailing services",
      topic_water: "Water station",
      topic_other: "Something else",
      send_message: "Send message",
      contact_ok: "Thank you! Your message has been sent \u2014 we\u2019ll get back to you soon. For anything urgent, call us at 1-800-916-4731.",
      contact_soon: "Thank you! This form will be connected to the store\u2019s email soon \u2014 for now, please call us at 1-800-916-4731."
    },
    es: {
      skip: "Saltar al contenido principal",
      brand_tag: "Productos de Detailing",
      brand_home_aria: "Oasis Detailing Supplies Inc \u2014 inicio",
      nav_aria: "Navegaci\u00F3n principal",
      nav_services: "Servicios",
      nav_shop: "Tienda",
      nav_water: "Estaci\u00F3n de Agua",
      nav_reviews: "Rese\u00F1as",
      nav_contact: "Contacto",
      open_menu: "Abrir men\u00FA",
      close_menu: "Cerrar men\u00FA",
      switch_to_es: "Cambiar a espa\u00F1ol",
      switch_to_en: "Cambiar a ingl\u00E9s",
      foot_follow: "S\u00EDguenos",
      foot_review_h: "\u00BFTe gust\u00F3 tu visita?",
      leave_review: "D\u00E9janos una rese\u00F1a",
      rights: "Oasis Detailing Supplies Inc \u2014 Todos los derechos reservados.",
      credit_prefix: "Fotos de servicio por cortes\u00EDa de",
      new_tab: "(se abre en una pesta\u00F1a nueva)",
      call_prefix: "Llama al ",
      get_directions: "C\u00F3mo Llegar",
      contact_us: "Cont\u00E1ctanos",
      call_us: "Ll\u00E1manos",

      title_index: "Oasis Detailing Supplies Inc | Productos y Servicios de Detailing en Orange, CA",
      hero_eyebrow: "Negocio familiar en Orange, CA",
      hero_h1: "Productos y Servicios de Detailing Automotriz",
      hero_sub: "Detailing profesional, productos de calidad y precios honestos \u2014 la confianza de conductores y detailers en todo el Condado de Orange.",
      trust_aria: "Por qu\u00E9 elegir Oasis",
      trust_5star: "5 Estrellas",
      trust_family: "Negocio Familiar",
      open_now: "Abierto ahora \u00B7 cierra a las {time}",
      closed_opens: "Cerrado \u00B7 abre {when} a las {time}",
      when_today: "hoy",
      when_tomorrow: "ma\u00F1ana",
      day_0: "domingo", day_1: "lunes", day_2: "martes", day_3: "mi\u00E9rcoles",
      day_4: "jueves", day_5: "viernes", day_6: "s\u00E1bado",
      services_kicker: "Lo que hacemos",
      services_h: "Nuestros Servicios",
      services_sub: "Servicios de detailing y productos profesionales \u2014 en la tienda o a domicilio.",
      book_now: "Reservar Ahora",
      shop_kicker: "Marcas que manejamos",
      shop_h: "Compra por Marca",
      shop_sub: "Las marcas profesionales que piden los detailers \u2014 todas en nuestros estantes.",
      shop_all: "Ver todas las marcas",
      delivery_b: "Entrega disponible",
      delivery_t: "\u2014 entrega a domicilio gratis dentro de 5 millas de la tienda en compras de $75 o m\u00E1s.",
      delivery_c: "Ll\u00E1manos o visita la tienda.",
      water_kicker: "Abierto 24/7",
      water_h: "Estaci\u00F3n de Agua Sin Manchas",
      see_how: "Ver C\u00F3mo",
      reviews_kicker: "Rese\u00F1as de clientes",
      reviews_h: "Lo Que Dicen Nuestros Clientes",
      hours_kicker: "Vis\u00EDtanos",
      hours_h: "Horario de Tienda",
      hours_aria: "Horario de la tienda",
      about_kicker: "Nuestra historia",
      about_h: "Conoce a Joe y Angel",
      about_facts_aria: "Datos de Oasis",
      stat_est: "Establecido en",
      stat_exp: "De experiencia en detailing",
      stat_family: "Negocio 100% familiar",

      title_shop: "Productos | Oasis Detailing Supplies Inc",
      shop_h1: "Nuestros Productos",
      shop_loading: "Cargando los productos\u2026",
      policy_b: "No vendemos en l\u00EDnea:",
      policy_t1: "\u00BFves algo que te guste?",
      policy_call: "Ll\u00E1manos",
      policy_t2: "y te lo apartamos para recoger.",
      pick_brand: "Elige una marca para ver sus productos \u2014 cada foto muestra el producto y su precio.",
      photos_soon: "Fotos pr\u00F3ximamente",
      products_count: { one: "{count} producto", other: "{count} productos" },
      select_thumb: "\u2014 selecciona una miniatura para ampliarla.",
      all_brands: "\u2190 Todas las marcas",
      brands_aria: "Marcas",
      show_photo: "Ver foto {k} de {name}",
      product_photos: "Fotos de productos de {name}",
      prev_thumbs: "Mostrar miniaturas anteriores",
      next_thumbs: "Mostrar miniaturas siguientes",
      empty_brand: "A\u00FAn no hay productos de {name} \u2014 llama al {phone} para preguntar qu\u00E9 hay disponible.",

      title_services: "Servicios y Paquetes | Oasis Detailing Supplies Inc",
      svc_kicker: "Servicios de Detailing \u00B7 Orange, CA",
      svc_h1: "Paquetes para cada auto, con precios por tama\u00F1o",
      svc_sub: "Desde un lavado cer\u00E1mico expr\u00E9s hasta correcci\u00F3n total de pintura \u2014 elige un paquete y solicita tu cita. Todo el trabajo se hace en nuestra tienda de Orange.",
      see_packages: "Ver paquetes",
      steps_h: "C\u00F3mo funciona la reserva",
      step1_h: "Elige un paquete",
      step1_p: "Elige el nivel de servicio que tu auto necesita. Cada paquete tiene precio seg\u00FAn el tama\u00F1o del veh\u00EDculo.",
      step2_h: "Solicita un horario",
      step2_p: "Env\u00EDa el formulario de abajo con la fecha y hora que prefieras.",
      step3_h: "Confirmamos",
      step3_p: "Confirmaremos tu cita \u2014 o ll\u00E1manos ahora para reservar de inmediato.",
      pkgs_h: "Paquetes de detailing",
      pkgs_sub: "Tres niveles de servicio, seis paquetes \u2014 elige el que tu auto necesita.",
      cat_express: "Lavado expr\u00E9s",
      cat_express_sub: "Un lavado completo, por dentro y por fuera \u2014 el retoque r\u00E1pido.",
      cat_detail: "Paquetes de detailing",
      cat_detail_sub: "Detailing interior y exterior completo, paso a paso.",
      cat_premium: "Correcci\u00F3n de pintura y cer\u00E1mico",
      cat_premium_sub: "Pulido a m\u00E1quina y protecci\u00F3n duradera para la pintura.",
      coupon_note: "Hay cupones de descuento en la tienda \u2014 menci\u00F3nalos al reservar.",
      appt_h: "Haz una cita",
      appt_sub: "Completa esto y confirmaremos tu horario.",
      appt_s1: "Confirmamos tu fecha y hora.",
      appt_s2: "Vamos a donde est\u00E9s \u2014 el detailing se hace en tu casa o tu ubicaci\u00F3n.",
      appt_s3: "Menciona tu cup\u00F3n al reservar \u2014 se respeta en la tienda.",
      areas_h: "\u00C1reas que servimos",
      f_name: "Nombre completo",
      f_phone: "Tel\u00E9fono",
      f_email: "Correo electr\u00F3nico",
      f_address: "Direcci\u00F3n",
      f_which: "\u00BFQu\u00E9 paquete?",
      f_select: "Selecciona un paquete",
      f_date: "Fecha",
      f_time: "Hora",
      f_msg: "Tu mensaje",
      f_optional: "(opcional)",
      f_msgph: "\u00BFAlgo que debamos saber? C\u00F3digos de port\u00F3n, estacionamiento, pelo de mascota, manchas...",
      request_appt: "Solicitar cita",
      pkg_num: "Paquete n.\u00BA ",
      starting_at: "Desde",
      size_car: "Auto",
      size_suv: "SUV",
      size_truck: "Camioneta",
      whats_included: "Qu\u00E9 incluye",
      book_pkg: "Reservar este paquete",
      appt_ok: "\u00A1Gracias, {name}! Recibimos tu solicitud de {pkg} \u2014 te llamaremos para confirmar. Para comunicarte ahora mismo, llama al 1-800-916-4731.",
      appt_soon: "\u00A1Gracias, {name}! Recibimos tu solicitud de {pkg}. Este formulario se conectar\u00E1 pronto \u2014 para confirmar ahora mismo, llama al 1-800-916-4731.",

      title_contact: "Cont\u00E1ctanos | Oasis Detailing Supplies Inc",
      contact_h1: "Cont\u00E1ctanos",
      contact_sub: "\u00BFViste algo que te guste? Ll\u00E1manos y te lo apartamos para recoger.",
      ways_aria: "Formas de contactarnos",
      call_us_h: "Ll\u00E1manos",
      visit_h: "Visita la tienda",
      get_dir_arrow: "C\u00F3mo llegar \u2192",
      hours_h: "Horario",
      d_mon_thu: "Lunes \u2013 jueves",
      d_fri: "Viernes",
      d_sat: "S\u00E1bado",
      d_sun: "Domingo",
      d_closed: "Cerrado",
      send_h: "Env\u00EDanos un mensaje",
      about_legend: "\u00BFDe qu\u00E9 se trata?",
      topic_product: "Pregunta de producto",
      topic_pickup: "Apartar para recoger",
      topic_services: "Servicios de detailing",
      topic_water: "Estaci\u00F3n de agua",
      topic_other: "Otro asunto",
      send_message: "Enviar mensaje",
      contact_ok: "\u00A1Gracias! Tu mensaje fue enviado \u2014 te responderemos pronto. Para algo urgente, ll\u00E1manos al 1-800-916-4731.",
      contact_soon: "\u00A1Gracias! Este formulario se conectar\u00E1 pronto al correo de la tienda \u2014 por ahora, por favor ll\u00E1manos al 1-800-916-4731."
    }
  };

  var LANG_KEY = "oasis_lang";

  function detectLang() {
    try {
      var saved = localStorage.getItem(LANG_KEY);
      if (saved === "es" || saved === "en") return saved;
      var nav = (navigator.languages && navigator.languages[0]) || navigator.language || "";
      if (/^es/i.test(nav)) return "es";
    } catch (e) {}
    return "en";
  }

  var oasisLang = detectLang();

  /* Translate a key. vars fills {placeholders}; {one,other} picks plural by vars.count. */
  function t(key, vars) {
    var table = I18N[oasisLang] || {};
    var val = table[key] != null ? table[key] : I18N.en[key];
    if (val == null) return key;
    if (typeof val === "object") {
      var n = vars && vars.count;
      val = (n === 1 ? val.one : val.other) || val.other || val.one || key;
    }
    if (vars) {
      val = String(val).replace(/\{(\w+)\}/g, function (m, k) {
        return vars[k] != null ? vars[k] : m;
      });
    }
    return val;
  }

  function readVars(el) {
    var raw = el.getAttribute("data-i18n-vars");
    if (!raw) return null;
    try { return JSON.parse(raw); } catch (e) { return null; }
  }

  function paintToggle() {
    var btn = document.getElementById("langToggle");
    if (!btn) return;
    var toEs = oasisLang !== "es";
    btn.textContent = toEs ? "ES" : "EN";
    btn.setAttribute("aria-label", t(toEs ? "switch_to_es" : "switch_to_en"));
    btn.setAttribute("lang", toEs ? "es" : "en");
  }

  function applyI18n() {
    document.documentElement.setAttribute("lang", oasisLang);

    /* Dynamic sections (shop, packages) re-render in the new language first;
       the DOM scan below then picks up their data-i18n attributes. */
    if (typeof window.__oasisRetranslate === "function") {
      try { window.__oasisRetranslate(); } catch (e) { /* never break the toggle */ }
    }
    var nodes = document.querySelectorAll("[data-i18n]");
    for (var i = 0; i < nodes.length; i++) {
      nodes[i].textContent = t(nodes[i].getAttribute("data-i18n"), readVars(nodes[i]));
    }
    var phs = document.querySelectorAll("[data-i18n-ph]");
    for (var p = 0; p < phs.length; p++) {
      phs[p].setAttribute("placeholder", t(phs[p].getAttribute("data-i18n-ph"), readVars(phs[p])));
    }
    var arias = document.querySelectorAll("[data-i18n-aria]");
    for (var a = 0; a < arias.length; a++) {
      arias[a].setAttribute("aria-label", t(arias[a].getAttribute("data-i18n-aria"), readVars(arias[a])));
    }
    var titles = document.querySelectorAll("[data-i18n-title]");
    for (var ti = 0; ti < titles.length; ti++) {
      titles[ti].setAttribute("title", t(titles[ti].getAttribute("data-i18n-title"), readVars(titles[ti])));
    }
    paintToggle();
    /* The open-now pill is rendered by script.js — refresh it in the new language. */
    if (typeof updateOpenStatus === "function" && window.__oasisHours) {
      try { updateOpenStatus(window.__oasisHours); } catch (e) {}
    }
  }

  function oasisSetLang(lang, persist) {
    if (lang !== "es" && lang !== "en") lang = "en";
    oasisLang = lang;
    if (persist !== false) {
      try { localStorage.setItem(LANG_KEY, lang); } catch (e) {}
    }
    applyI18n();
  }

  function oasisGetLang() { return oasisLang; }

  /* Expose for script.js */
  window.t = t;
  window.oasisSetLang = oasisSetLang;
  window.oasisGetLang = oasisGetLang;
  window.applyI18n = applyI18n;

  /* Paint static HTML immediately (scripts run at end of body, DOM is ready). */
  applyI18n();

  /* Wire the toggle once the button exists (it does — script is at end of body). */
  var toggle = document.getElementById("langToggle");
  if (toggle) {
    toggle.addEventListener("click", function () {
      oasisSetLang(oasisLang === "es" ? "en" : "es");
    });
  } else {
    document.addEventListener("DOMContentLoaded", function () {
      var b = document.getElementById("langToggle");
      if (b) b.addEventListener("click", function () {
        oasisSetLang(oasisLang === "es" ? "en" : "es");
      });
    });
  }
})();
