const test = require("node:test");
const assert = require("node:assert/strict");
const E = require("../calc.js");

test("counts words", () => {
  assert.equal(E.countWords(""), 0);
  assert.equal(E.countWords("  one two\nthree  "), 3);
});

test("KDP spine formula: 300 pages white = 0.676 in", () => {
  assert.equal(E.spine(300, "white").inches, 0.676);
  assert.equal(E.spine(200, "cream").inches, 0.5);
  assert.equal(E.spine(100, "premiumColor").inches, 0.235);
});

test("page count rounds up to an even number", () => {
  const r = E.estimatePages({ words: 330, trim: "6x9", frontMatter: 0, backMatter: 0, chapters: 0 });
  assert.equal(r.pages, 2);
  const r2 = E.estimatePages({ words: 660, trim: "6x9", frontMatter: 0, backMatter: 0, chapters: 0 });
  assert.equal(r2.pages, 2);
});

test("80k words on 6x9 standard lands near 260 pages", () => {
  const r = E.estimate({ words: 80000, trim: "6x9", paper: "white", chapters: 20, frontMatter: 6, backMatter: 2 });
  // 80000/330 = 242.4 -> +10 chapter waste -> 253 + 8 = 261 -> 262
  assert.equal(r.pages, 262);
  assert.equal(r.spine.inches, 0.59);
  assert.equal(r.spineText, true);
  assert.deepEqual(r.warnings, []);
});

test("custom words per page overrides trim default", () => {
  const r = E.estimatePages({ words: 10000, trim: "5x8", wordsPerPage: 500, frontMatter: 0, backMatter: 0 });
  assert.equal(r.pages, 20);
  assert.equal(r.wordsPerPage, 500);
});

test("density changes words per page", () => {
  const airy = E.estimatePages({ words: 50000, trim: "5.5x8.5", density: "airy" });
  const dense = E.estimatePages({ words: 50000, trim: "5.5x8.5", density: "dense" });
  assert.ok(airy.pages > dense.pages);
});

test("full cover wrap size includes bleed and spine", () => {
  const c = E.coverSize("6x9", 0.676);
  assert.equal(c.widthIn, 12.926);
  assert.equal(c.heightIn, 9.25);
});

test("warnings for too short, no spine text, too long", () => {
  const short = E.estimate({ words: 2000, trim: "6x9", paper: "white", frontMatter: 0, backMatter: 0 });
  assert.ok(short.warnings.some(w => w.includes("minimum")));
  assert.ok(short.warnings.some(w => w.includes("spine")));
  assert.equal(short.spineText, false);
  const long = E.estimate({ words: 300000, trim: "5x8", paper: "cream" });
  assert.ok(long.warnings.some(w => w.includes("776")));
  const color = E.estimate({ words: 15000, trim: "6x9", paper: "standardColor" });
  assert.ok(color.warnings.some(w => w.includes("72")));
});

test("bad input falls back safely", () => {
  const r = E.estimate({ words: "12,000", trim: "nope", paper: "nope" });
  assert.equal(r.trim, "6x9");
  assert.equal(r.paper, "white");
  assert.ok(r.pages > 24);
});
