/* Book page count and KDP paperback spine estimator. Pure functions, no dependencies. */
(function (root) {
  "use strict";

  // Typical words per page for an 11 pt serif body font with standard margins.
  // These are rough industry rules of thumb, not KDP numbers. Users can override them.
  var TRIMS = {
    "5x8": { w: 5, h: 8, wordsPerPage: 250 },
    "5.25x8": { w: 5.25, h: 8, wordsPerPage: 265 },
    "5.5x8.5": { w: 5.5, h: 8.5, wordsPerPage: 290 },
    "6x9": { w: 6, h: 9, wordsPerPage: 330 },
    "7x10": { w: 7, h: 10, wordsPerPage: 430 },
    "8.5x11": { w: 8.5, h: 11, wordsPerPage: 600 }
  };

  var DENSITY = { airy: 0.85, standard: 1, dense: 1.15 };

  // KDP paperback paper thickness per page (inches) and widest allowed page range.
  // Source: KDP Paperback Submission Guidelines. Max pages also depend on trim size.
  var PAPERS = {
    white: { label: "Black ink, white paper", inPerPage: 0.002252, min: 24, max: 828 },
    cream: { label: "Black ink, cream paper", inPerPage: 0.0025, min: 24, max: 776 },
    premiumColor: { label: "Premium color", inPerPage: 0.002347, min: 24, max: 828 },
    standardColor: { label: "Standard color", inPerPage: 0.002252, min: 72, max: 600 }
  };

  var BLEED = 0.125; // inches, each outer edge
  var SPINE_TEXT_MIN_PAGES = 80; // KDP allows spine text only above 79 pages
  var MM = 25.4;

  function round(n, d) {
    var f = Math.pow(10, d);
    return Math.round(n * f) / f;
  }

  function toNumber(v, fallback) {
    var n = typeof v === "number" ? v : parseFloat(String(v == null ? "" : v).replace(/[,_\s]/g, ""));
    return isFinite(n) ? n : fallback;
  }

  function countWords(text) {
    if (!text) return 0;
    var m = String(text).trim().match(/\S+/g);
    return m ? m.length : 0;
  }

  function estimatePages(opts) {
    var words = Math.max(0, toNumber(opts.words, 0));
    var trim = TRIMS[opts.trim] || TRIMS["6x9"];
    var density = DENSITY[opts.density] || 1;
    var wpp = toNumber(opts.wordsPerPage, 0) > 0 ? toNumber(opts.wordsPerPage, 0) : trim.wordsPerPage * density;
    var chapters = Math.max(0, Math.floor(toNumber(opts.chapters, 0)));
    var front = Math.max(0, Math.floor(toNumber(opts.frontMatter, 6)));
    var back = Math.max(0, Math.floor(toNumber(opts.backMatter, 2)));
    var body = words / wpp;
    // Each chapter opening loses about half a page (sunk opening plus a short last page).
    var chapterWaste = chapters * 0.5;
    var raw = Math.ceil(body + chapterWaste) + front + back;
    var pages = raw % 2 === 0 ? raw : raw + 1; // printers count both sides, round up to even
    return { pages: pages, wordsPerPage: round(wpp, 1), bodyPages: round(body, 1) };
  }

  function spine(pages, paperKey) {
    var paper = PAPERS[paperKey] || PAPERS.white;
    var inches = pages * paper.inPerPage;
    return { inches: round(inches, 3), mm: round(inches * MM, 2) };
  }

  function coverSize(trimKey, spineInches) {
    var t = TRIMS[trimKey] || TRIMS["6x9"];
    var w = BLEED + t.w + spineInches + t.w + BLEED;
    var h = BLEED + t.h + BLEED;
    return { widthIn: round(w, 3), heightIn: round(h, 3), widthMm: round(w * MM, 1), heightMm: round(h * MM, 1) };
  }

  function checks(pages, paperKey) {
    var paper = PAPERS[paperKey] || PAPERS.white;
    var out = [];
    if (pages < paper.min) out.push("Below the KDP minimum of " + paper.min + " pages for " + paper.label.toLowerCase() + ".");
    if (pages > paper.max) out.push("Above the widest KDP limit of " + paper.max + " pages for " + paper.label.toLowerCase() + ". Consider a larger trim or splitting the book.");
    if (pages < SPINE_TEXT_MIN_PAGES) out.push("Under " + SPINE_TEXT_MIN_PAGES + " pages: KDP does not allow text on the spine.");
    return out;
  }

  function estimate(opts) {
    var trimKey = TRIMS[opts.trim] ? opts.trim : "6x9";
    var paperKey = PAPERS[opts.paper] ? opts.paper : "white";
    var p = estimatePages(Object.assign({}, opts, { trim: trimKey }));
    var s = spine(p.pages, paperKey);
    return {
      trim: trimKey,
      paper: paperKey,
      pages: p.pages,
      bodyPages: p.bodyPages,
      wordsPerPage: p.wordsPerPage,
      spine: s,
      cover: coverSize(trimKey, s.inches),
      spineText: p.pages >= SPINE_TEXT_MIN_PAGES,
      warnings: checks(p.pages, paperKey)
    };
  }

  var api = { TRIMS: TRIMS, PAPERS: PAPERS, DENSITY: DENSITY, countWords: countWords, estimatePages: estimatePages, spine: spine, coverSize: coverSize, checks: checks, estimate: estimate };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.BookEstimator = api;
})(this);
