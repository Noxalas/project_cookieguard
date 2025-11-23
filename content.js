function findCookieBanner() {
    const selectors = [
        "[id*='cookie']",
        "[class*='cookie']",
        "[id*='consent']",
        "[class*='consent']",
        "[aria-label*='cookie']",
        "[aria-label*='consent']",
        "[role='dialog']",
        "[aria-label*='dialog']",
    ];

    for (const sel of selectors) {
        const el = document.querySelector(sel);
        if (el && el.offsetHeight > 0) {
            return el;
        }
    }
    return null;
}

chrome.runtime.sendMessage({ type: "DOM_READY" });
chrome.runtime.onMessage.addListener(async (msg) => {
    if (msg.type === "RUN_TESTS") {


        const testModules = [
            "cookies_tests/test_banner_readability.mjs",
            "cookies_tests/test_no_reject_button.mjs",
            "cookies_tests/test_withdraw_icon.mjs",
            "cookies_tests/test_legitimate_interest.mjs"
        ];

        for (const path of testModules) {
            const mod = await import(chrome.runtime.getURL(path));
            const result = await mod.runCheck(document); // real DOM

            chrome.runtime.sendMessage({
                type: "GDPR_TEST_RESULT",
                result
            });
        }
    }
});
