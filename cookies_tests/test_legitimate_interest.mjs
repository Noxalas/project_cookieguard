// Test for legitimate interest cookies
export async function runCheck(doc) {
  const CHECK_NAME = "legitimate_interest";

  const LEGITIMATE_INTEREST_KEYWORDS = [
    "legitimate interest",
    "legitime interesser",
    "berettiget interesse",
    "legitimate purposes",
    "business purposes",
  ];

  const PURPOSE_KEYWORDS = [
    "analytics",
    "marketing",
    "advertising",
    "personalization",
    "security",
    "fraud prevention",
  ];

  const OBJECTION_KEYWORDS = [
    "object",
    "opt out",
    "reject",
    "decline",
    "withdraw",
    "revoke"
  ];

  const docText = (doc.body?.innerText || "").toLowerCase();

  const hasExplanation = LEGITIMATE_INTEREST_KEYWORDS.some((kw) => docText.includes(kw));
  const hasClearPurposes = PURPOSE_KEYWORDS.some((kw) =>
    docText.includes(kw)
  );

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

  const actionableElements = doc.querySelectorAll(
    "button, a, input[type='button'], input[type='submit']"
  );

  let objectionElement = null;

  for (const el of actionableElements) {
    const text = (el.innerText || "").toLowerCase().trim();
    if (!isVisible(el)) continue;

    if (OBJECTION_KEYWORDS.some((kw) => text.includes(kw))) {
      objectionElement = el;
      break;
    }
  }

  const hasObjection = Boolean(objectionElement);

  const checks = [hasExplanation, hasObjection, hasClearPurposes];
  const score = (checks.filter(Boolean).length / checks.length) * 100;

  const result = {
    check: CHECK_NAME,
    passed: score >= 66,
    message:
      score >= 66
        ? "Legitimate interest information appears adequately presented."
        : "Legitimate interest information appears incomplete.",
    score,
    details: {
      hasExplanation,
      hasClearPurposes,
      hasObjectionOption: hasObjection,
      objectionElementText: hasObjection
        ? objectionElement.innerText.trim()
        : null,
      objectionElementSelector: hasObjection
        ? getDomPath(objectionElement)
        : null
    }
  };

  return result;
}
