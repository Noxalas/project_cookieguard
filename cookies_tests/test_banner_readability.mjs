export async function runCheck(doc) {
  const CHECK_NAME = "banner_readability"

  const QUERY = "div, section, aside";
  const BLOCKED = ["cookieguard"]; // ignore the extension
  const MIN_W = 200;
  const MIN_H = 50;
  const MIN_BODY_PX = 14;
  const LARGE_BOLD_PX = 18.66;
  const LARGE_NORMAL_PX = 24;

  // Norwegian & related keywords commonly seen in banners
  const KEYWORDS = [
    "informasjonskapsler",
    "informasjonskapsel",
    "cookies",
    "samtykke",
    "personvern",
    "personvernerklæring",
    "gdpr",
    "vi bruker",
    "nettstedet bruker",
    "bruk av informasjonskapsler",
  ];

  // --- Helpers ---
  const toPx = v => (typeof v === "string" ? parseFloat(v) || 0 : v || 0);

  const getNumericFontWeight = w => {
    if (!w) return 400;
    if (/^(bold|bolder)$/i.test(w)) return 700;
    if (/^(lighter|normal)$/i.test(w)) return 400;
    const n = parseInt(w, 10);
    return Number.isFinite(n) ? n : 400;
  };

  const isLarge = (px, weight) =>
    px >= LARGE_NORMAL_PX ||
    (px >= LARGE_BOLD_PX && getNumericFontWeight(weight) >= 700);

  const parseRGB = (s) => {
    if (!s) return null;
    const m = s.replace(/\s+/g, "").match(/rgba?\((\d+),(\d+),(\d+)(?:,([0-9.]+))?\)/i);
    return m
      ? {
        r: +m[1],
        g: +m[2],
        b: +m[3],
        a: m[4] === undefined ? 1 : Math.max(0, Math.min(1, +m[4])),
      }
      : null;
  };

  const srgbToLinear = (c) => {
    const cs = c / 255;
    return cs <= 0.03928 ? cs / 12.92 : Math.pow((cs + 0.055) / 1.055, 2.4);
  };

  const luminance = ({ r, g, b }) =>
    0.2126 * srgbToLinear(r) +
    0.7152 * srgbToLinear(g) +
    0.0722 * srgbToLinear(b);

  const ratio = (fg, bg) => {
    const L1 = luminance(fg);
    const L2 = luminance(bg);
    return (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
  };

  const blend = (fg, bg) => {
    const a = fg.a ?? 1;
    if (a >= 1) return { r: fg.r, g: fg.g, b: fg.b, a: 1 };
    return {
      r: Math.round(a * fg.r + (1 - a) * bg.r),
      g: Math.round(a * fg.g + (1 - a) * bg.g),
      b: Math.round(a * fg.b + (1 - a) * bg.b),
      a: 1,
    };
  };

  const effectiveBackground = (el) => {
    const white = { r: 255, g: 255, b: 255, a: 1 };
    let acc = null,
      node = el;
    while (node && node !== document.documentElement) {
      const c = parseRGB(getComputedStyle(node).backgroundColor);
      if (c) {
        if (c.a === 1 && !acc) {
          acc = { r: c.r, g: c.g, b: c.b, a: 1 };
          break;
        }
        if (c.a > 0) {
          acc = blend(c, acc || white);
          if (acc.a === 1) break;
        }
      }
      node = node.parentElement;
    }
    return acc || white;
  };

  const leafTextElements = (root) => {
    const w = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT, null);
    const out = [];
    while (w.nextNode()) {
      const el = w.currentNode;
      const cs = getComputedStyle(el);
      if (cs.display === "none" || cs.visibility === "hidden") continue;
      const t = (el.textContent || "").trim();
      if (!t) continue;
      if (el.firstElementChild) continue; // skip containers
      out.push({ el, cs, text: t });
    }
    return out;
  };

  const getDomPath = el => {
    try {
      const parts = [];
      while (el && el.nodeType === 1) {
        let sel = el.nodeName.toLowerCase();
        if (el.id) {
          sel += `#${el.id}`;
          parts.unshift(sel);
          break;
        }
        if (el.classList.length) {
          sel += "." + [...el.classList].join(".");
        }
        parts.unshift(sel);
        el = el.parentElement;
      }
      return parts.join(" > ");
    } catch {
      return null;
    }
  };

  // --- Find site's banner (ignore CookieGuard) ---
  const els = doc.querySelectorAll(QUERY);
  const candidates = [];

  for (const el of els) {
    const cs = el.ownerDocument.defaultView.getComputedStyle(el);
    if (cs.display === "none" || cs.visibility === "hidden") continue;

    const id = (el.id || "").toLowerCase();
    const cls = (el.className || "").toLowerCase();
    const txt = (el.textContent || "").toLowerCase();

    // ignore extension UI
    if (BLOCKED.some((b) => id.includes(b) || cls.includes(b) || txt.includes(b)))
      continue;

    // keyword scoring (Norwegian-focused)
    let score = 0;
    for (const k of KEYWORDS) {
      if (id.includes(k)) score += 3;
      if (cls.includes(k)) score += 2;
      if (txt.includes(k)) score += 1;
    }
    if (score === 0) continue;

    const r = el.getBoundingClientRect();
    if (r.width < MIN_W || r.height < MIN_H) continue;

    candidates.push({ el, score });
  }

  if (!candidates.length) {
    return {
      check: CHECK_NAME,
      passed: false,
      message: "No cookie banner detected.",
      details: { noCandidates: true }
    };
  }

  candidates.sort((a, b) => b.score - a.score);
  const banner = candidates[0].el;

  const rect = banner.getBoundingClientRect();
  const sizeOK = rect.width >= MIN_W && rect.height >= MIN_H;

  const bg = effectiveBackground(banner);
  const texts = leafTextElements(banner);

  if (!texts.length) {
    return {
      check: CHECK_NAME,
      passed: false,
      message: "Banner has no readable text.",
      details: { textCount: 0 }
    };
  }

  const failures = [];

  for (const { el, cs } of texts) {
    const fgRaw = parseRGB(cs.color);
    if (!fgRaw) {
      failures.push({ reason: "unparseable_color", element: getDomPath(el) });
      continue;
    }

    const fg = fgRaw.a < 1 ? blend(fgRaw, bg) : fgRaw;
    const fpx = toPx(cs.fontSize);
    const large = isLarge(fpx, cs.fontWeight);
    const needed = large ? 3.0 : 4.5;

    if (!large && fpx < MIN_BODY_PX) {
      failures.push({
        reason: "font_too_small",
        element: getDomPath(el),
        fontSize: fpx
      });
      continue;
    }

    const cr = ratio(fg, bg);
    if (cr < needed) {
      failures.push({
        reason: "contrast_fail",
        element: getDomPath(el),
        contrastRatio: cr,
        required: needed
      });
    }
  }

  const passed = failures.length === 0 && sizeOK;

  return {
    check: CHECK_NAME,
    passed,
    severity: [4, 3],
    message: passed
      ? "Banner readability meets WCAG-like thresholds."
      : "Banner readability violations detected.",
  };
}

// Usage:
// checkNorwegianCookieBannerReadability();

// document.addEventListener("DOMContentLoaded", () => {
//   console.log(checkNorwegianCookieBannerReadability());
// });
