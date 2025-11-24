chrome.runtime.onMessage.addListener((msg, sender) => {
  if (!sender.tab || !sender.tab.id) return;

  if (msg.type === "TEST_RUN_STARTED") {
    console.log("DOM ready, starting tests on tab:", sender.tab.id);

    chrome.tabs.sendMessage(sender.tab.id, {
      type: "RUN_TESTS"
    });

    chrome.storage.local.set({ ["latestResults"]: [] });
    return;
  }

  if (msg.type === "GDPR_TEST_RESULT") {
    chrome.storage.local.get(["latestResults"], (data) => {
      const arr = data["latestResults"] || [];
      arr.push(msg.payload);

      chrome.storage.local.set({ ["latestResults"]: arr });
    });
  }
});
