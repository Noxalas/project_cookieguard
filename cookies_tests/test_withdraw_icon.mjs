export async function runCheck(doc) {
  const CHECK_NAME = "withdraw_icon"

  const keywords = [
    "withdraw",
    "revoke",
    "manage consent",
    "cookie settings",
    "manage cookies",
    "privacy settings",
    "consent settings"
  ];

  const isVisible = (el) => {
    const cs = el.ownerDocument.defaultView.getComputedStyle(el);
    return (
      cs.display !== "none" &&
      cs.visibility !== "hidden" &&
      cs.opacity !== "0" &&
      el.offsetWidth > 0 &&
      el.offsetHeight > 0
    );
  };

  const getDomPath = (el) => {
    try {
      const path = [];
      while (el && el.nodeType === Node.ELEMENT_NODE) {
        let selector = el.nodeName.toLowerCase();
        if (el.id) {
          selector += `#${el.id}`;
          path.unshift(selector);
          break;
        }
        if (el.classList.length > 0) {
          selector += "." + [...el.classList].join(".");
        }
        path.unshift(selector);
        el = el.parentElement;
      }
      return path.join(" > ");
    } catch {
      return null;
    }
  };

  const elements = document.querySelectorAll("button, a, input[type='button'], input[type='submit']");

  let match = null;

  for (const el of elements) {
    if (!isVisible(el)) continue;

    const text = (el.textContent || "").toLowerCase().trim();
    const aria = (el.getAttribute("aria-label") || "").toLowerCase().trim();
    const href = (el.getAttribute("href") || "").toLowerCase().trim();

    if (
      keywords.some(
        (keyword) => text.includes(keyword) || aria.includes(keyword) || href.includes(keyword)
      )
    ) {
      match = el;
      break;
    }
  }

  const result = {
    check: CHECK_NAME,
    passed: Boolean(match),
    message: match
      ? "Withdraw/consent management button or link detected."
      : "No withdraw/consent management option detected.",
    details: {
      found: Boolean(match),
      elementText: match ? (match.innerText || "").trim() : null,
      elementSelector: match ? getDomPath(match) : null,
      tagName: match ? match.tagName.toLowerCase() : null,
      href: match ? match.getAttribute("href") || null : null,
      ariaLabel: match ? match.getAttribute("aria-label") || null : null
    }
  };

  return result;
}

// document.addEventListener("DOMContentLoaded", () => {
//   const btn = findWithdrawButton();
//   if (btn) {
//     console.log("found witdrawl button");
//   } else {
//     console.log("No withdraw button detected.");
//     // send msg fucntion
//   }
// });
