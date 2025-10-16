function findCookieBannerAndTest() {
  const keywords = ["cookie", "consent", "overlay", "privacy", "gdpr"];
  const elements = document.querySelectorAll("div, section, dialog, aside");
  const MIN_WIDTH = 200;
  const MIN_HEIGHT = 50;

  // ---------- helpers ----------
  const toPx = (v) => (typeof v === "string" ? parseFloat(v) || 0 : v || 0);

  function getNumericFontWeight(weight) {
    if (!weight) return 400;
    if (/^(bold|bolder)$/i.test(weight)) return 700;
    if (/^(lighter|normal)$/i.test(weight)) return 400;
    const n = parseInt(weight, 10);
    return Number.isFinite(n) ? n : 400;
  }

  function isLargeText(fontSizePx, fontWeightStr) {
    const w = getNumericFontWeight(fontWeightStr);
    return fontSizePx >= 24 || (fontSizePx >= 18.66 && w >= 700);
  }

  function parseRGB(str) {
    const m = str.replace(/\s+/g, "").match(/rgba?\((\d+),(\d+),(\d+)(?:,([0-9.]+))?\)/i);
    if (!m) return null;
    return {
      r: parseInt(m[1], 10),
      g: parseInt(m[2], 10),
      b: parseInt(m[3], 10),
      a: m[4] === undefined ? 1 : parseFloat(m[4]),
    };
  }

  function srgbToLinear(c) {
    const cs = c / 255;
    return cs <= 0.03928 ? cs / 12.92 : Math.pow((cs + 0.055) / 1.055, 2.4);
  }

  function relLuminance({ r, g, b }) {
    return 0.2126 * srgbToLinear(r) + 0.7152 * srgbToLinear(g) + 0.0722 * srgbToLinear(b);
  }

  function contrastRatio(fg, bg) {
    const L1 = relLuminance(fg);
    const L2 = relLuminance(bg);
    return (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
  }

  function blendOver(fg, bg) {
    const a = fg.a;
    if (a === 1) return fg;
    return {
      r: a * fg.r + (1 - a) * bg.r,
      g: a * fg.g + (1 - a) * bg.g,
      b: a * fg.b + (1 - a) * bg.b,
      a: 1,
    };
  }

  function getEffectiveBackground(el) {
    const defaultBG = { r: 255, g: 255, b: 255, a: 1 };
    let bg = null;
    let node = el;
    while (node && node !== document.documentElement) {
      const cs = getComputedStyle(node);
      const bgColor = parseRGB(cs.backgroundColor);
      if (bgColor) {
        if (bgColor.a === 1 && !bg) {
          bg = bgColor;
          break;
        } else if (bgColor.a > 0) {
          const under = bg || defaultBG;
          bg = blendOver(bgColor, under);
          if (bg.a === 1) break;
        }
      }
      node = node.parentElement;
    }
    return bg || defaultBG;
  }

  function getTextNodesAndStyles(root) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT, null);
    const items = [];
    while (walker.nextNode()) {
      const el = walker.currentNode;
      const cs = getComputedStyle(el);
      if (cs.display === "none" || cs.visibility === "hidden") continue;
      if (!el.textContent || !el.textContent.trim()) continue;
      const hasChildrenElements = [...el.childNodes].some(n => n.nodeType === 1);
      if (hasChildrenElements && el.firstElementChild) continue;
      items.push({ el, cs });
    }
    return items;
  }

  function evaluateTextContrast(el) {
    const items = getTextNodesAndStyles(el);
    const bg = getEffectiveBackground(el);
    const results = [];

    for (const { el: node, cs } of items) {
      const color = parseRGB(cs.color);
      if (!color) continue;
      const effectiveFg = color.a < 1 ? blendOver(color, bg) : color;

      const ratio = contrastRatio(effectiveFg, bg);
      const fontSize = toPx(cs.fontSize);
      const large = isLargeText(fontSize, cs.fontWeight);
      const requiredAA = large ? 3.0 : 4.5;

      results.push({
        ratio,
        requiredAA,
        pass: ratio >= requiredAA,
      });
    }

    return results;
  }

  // ---------- find banner ----------
  const candidates = [];
  for (const el of elements) {
    const id = (el.id || "").toLowerCase();
    const classes = (el.className || "").toLowerCase();
    const text = (el.textContent || "").toLowerCase();
    let score = 0;
    for (const k of keywords) {
      if (id.includes(k)) score += 3;
      if (classes.includes(k)) score += 2;
      if (text.includes(k)) score += 1;
    }

    const cs = getComputedStyle(el);
    if (cs.display === "none" || cs.visibility === "hidden") continue;

    const rect = el.getBoundingClientRect();
    if (rect.width < MIN_WIDTH || rect.height < MIN_HEIGHT) continue;

    if (score > 0) candidates.push({ el, score });
  }

  if (!candidates.length) return 0;

  candidates.sort((a, b) => b.score - a.score);
  const banner = candidates[0].el;

  const rect = banner.getBoundingClientRect();
  const sizeOK = rect.width >= MIN_WIDTH && rect.height >= MIN_HEIGHT;
  const contrasts = evaluateTextContrast(banner);
  const total = contrasts.length;
  const passed = contrasts.filter(r => r.pass).length;

  let code;
  if (total === 0) code = 1; // no text to test = fail
  else if (passed === 0) code = 1; // all failed
  else if (passed / total < 0.4) code = 2; // fails most
  else if (passed / total < 1) code = 3; // fails some
  else code = sizeOK ? 4 : 3; // all pass but size too small => downgrade

  banner.style.outline = code === 4 ? "3px solid #27ae60" : "3px solid #e74c3c";
  banner.style.outlineOffset = "2px";

  console.log("Banner test result code:", code, "on element:", banner);
  return code;
}
