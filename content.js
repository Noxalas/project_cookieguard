const snapshot = document.documentElement.outerHTML;

chrome.runtime.sendMessage({
    type: "DOM_SNAPSHOT",
    url: window.location.href,
    isTopFrame: window.top === window,
    html: snapshot
});
