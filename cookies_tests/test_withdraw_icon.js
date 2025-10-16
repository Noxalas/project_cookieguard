

function findWithdrawButton() {
  const keywords = ["withdraw", "revoke", "manage consent", "cookie settings"];

  const elements = document.querySelectorAll("button, a, input[type='button']");

  for (const el of elements) {
    const text = el.textContent?.toLowerCase() || "";
    const aria = el.getAttribute("aria-label")?.toLowerCase() || "";
    const href = el.getAttribute("href")?.toLowerCase() || "";


    if (keywords.some(k => text.includes(k) || aria.includes(k) || href.includes(k))) {
      if (el.tagName.toLowerCase() === "a") {
        console.log("wightdraw link found", el.href || el);
      } else {
        console.log("Wthdraw button found");
      }
      return el;
    }
  }
  return null;
}

document.addEventListener("DOMContentLoaded", () => {
  const btn = findWithdrawButton();
  if (btn) {
    console.log("found witdrawl button")
  } else {
    console.log("No withdraw button detected.");
    // send msg fucntion
  }
});
