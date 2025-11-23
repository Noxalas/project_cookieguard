chrome.runtime.onMessage.addListener((msg, sender) => {
  if (msg.type === "DOM_READY") {
    console.log("Dom ready.");
    chrome.tabs.sendMessage(sender.tab.id, {
      type: "RUN_TESTS"
    });
  }

  if (msg.type === "GDPR_TEST_RESULT") {
    console.log("Test result:", msg.result);
  }
});
