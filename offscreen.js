// Dynamically import modules and run their checks on successful document load.
// TODO: Delay running the detectors so that the cookie form can load.

let detectors = [];
let testsLoaded = false;

async function loadTests() {
  if (testsLoaded) return;

  const modulePaths = [
    //"cookies_tests/test_pre_ticked_checkbox.mjs",
    //"cookies_tests/test_no_reject_button.mjs",
    "cookies_tests/test_banner_readability.mjs",
    "cookies_tests/test_layering.mjs",
    "cookies_tests/test_withdraw_icon.mjs",
    "cookies_tests/test_legitimate_interest.mjs",
  ];

  detectors = await Promise.all(
    modulePaths.map((path) => import(chrome.runtime.getURL(path)))
  );

  testsLoaded = true;
}

async function runTests(doc) {
  for (const detector of detectors) {
    if (typeof detector.runCheck === "function") {
      const result = await detector.runCheck();
      console.log(`${result.check} result:`, result);
      return result;
    } else {
      console.warn("Module missing runCheck() function:", detector);
      return null;
    }
  }
}

console.log("Loaded offscreen doc!");

chrome.runtime.onMessage.addListener(async (msg) => {
  if (msg.type === "PROCESS_DOM") {
    const { html, url } = msg.data;
    const doc = new DOMParser().parseFromString(msg.data.html, "text/html");

    console.log("Doing stuff with the doc! ", msg);
    if (detectors.length <= 0) {
      await loadTests();
    }
    console.log(detectors);
    const results = await runTests(doc);

    chrome.runtime.sendMessage({
      type: "GDPR_TEST_RESULT",
      url,
      result: results,
    });
  }
});
