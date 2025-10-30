async function ensureOffscreen() {
  const existing = await chrome.offscreen.hasDocument();
  console.log("Offscreen loaded:", existing);
  if (!existing) {
    await chrome.offscreen.createDocument({
      url: chrome.runtime.getURL("offscreen.html"),
      reasons: ["DOM_PARSER"],
      justification: "Analyze DOMs for GDPR violations.",
    });
  }
}

chrome.runtime.onMessage.addListener(async (msg) => {
  if (msg.type === "DOM_SNAPSHOT") {
    await ensureOffscreen();
    chrome.runtime.sendMessage({ type: "PROCESS_DOM", data: msg });
  } else if (msg.type === "GDPR_TEST_RESULT") {
    console.log(`Received GDPR test results! Trackers: ${msg.trackers}`);
  }
});
